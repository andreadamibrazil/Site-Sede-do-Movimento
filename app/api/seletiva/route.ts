import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { createServiceClient } from "@/lib/supabase/server";
import { uploadParaDrive, DRIVE_FOLDERS } from "@/lib/google-drive";

// Roda no Node (Google Drive / service_role precisam do runtime nodejs)
export const runtime = "nodejs";

const ORIGEM = "seletiva-longa-2026";
const SUBPASTA_DRIVE = "Seletiva Longa 2026";

const LIMITS = {
  nome: 200,
  email: 254,
  whatsapp: 20,
  cidade: 120,
  parentesco: 60,
  texto: 3000,
  url: 2048,
};

const FOTO_MAX_BYTES = 8 * 1024 * 1024; // 8MB (foto comprimida no cliente)
const FOTO_MIME_OK = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

/** Escapa caracteres com significado em HTML (previne injeção no e-mail). */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** Só aceita URLs http/https. */
function isSafeUrl(str: string): boolean {
  try {
    const u = new URL(str);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/** Idade em anos completos numa data de nascimento. */
function calcularIdade(nascimento: Date): number {
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return idade;
}

/** Normaliza celular BR para 11 dígitos (mesma lógica de /api/leads). */
function normalizarCelular(cel: string): string {
  const d = cel.replace(/\D/g, "");
  if (d.length === 13 && d.startsWith("55")) return d.slice(2);
  if (d.length === 14 && d.startsWith("55")) return d.slice(2, 13);
  if (d.length === 12 && d.startsWith("55")) return d.slice(2, 4) + "9" + d.slice(4);
  if (d.length === 12) return d.slice(0, 11);
  if (d.length === 10) return d.slice(0, 2) + "9" + d.slice(2);
  return d;
}

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}
function bool(fd: FormData, key: string): boolean {
  return fd.get(key) === "true" || fd.get(key) === "on";
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "anon";
  if (!rateLimit(`seletiva:${ip}`, 5, 60_000)) return rateLimitResponse();

  try {
    const fd = await req.formData();

    // ---- coleta ----
    const criancaNome = str(fd, "crianca_nome");
    const nomeArtistico = str(fd, "nome_artistico");
    const criancaNascimento = str(fd, "crianca_nascimento");
    const altura = str(fd, "altura");
    const criancaCidade = str(fd, "crianca_cidade");
    const responsavelNome = str(fd, "responsavel_nome");
    const responsavelParentesco = str(fd, "responsavel_parentesco");
    const responsavelWhatsapp = str(fd, "responsavel_whatsapp");
    const responsavelEmail = str(fd, "responsavel_email");
    const sobre = str(fd, "sobre");
    const experienciaTvCinema = bool(fd, "experiencia_tvcinema");
    const experienciaDescricao = str(fd, "experiencia_descricao");
    const portfolioUrl = str(fd, "portfolio_url");
    const selftapeUrl = str(fd, "selftape_url");
    const fazBallet = bool(fd, "faz_ballet");
    const balletVideoUrl = str(fd, "ballet_video_url");
    const materialProfissional = bool(fd, "material_profissional");
    const materialProfissionalLink = str(fd, "material_profissional_link");
    const consentimentoMenor = bool(fd, "consentimento_menor");
    const consentimentoLgpd = bool(fd, "consentimento_lgpd");
    const optinAulas = bool(fd, "optin_aulas");

    // ---- validação obrigatórios ----
    if (
      !criancaNome ||
      !criancaNascimento ||
      !responsavelNome ||
      !responsavelWhatsapp ||
      !responsavelEmail
    ) {
      return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }
    if (!consentimentoMenor) {
      return NextResponse.json(
        { error: "É necessário confirmar a ciência sobre a presença do responsável." },
        { status: 400 }
      );
    }
    if (!consentimentoLgpd) {
      return NextResponse.json({ error: "É necessário aceitar a Política de Privacidade." }, { status: 400 });
    }

    // ---- limites de tamanho ----
    if (
      criancaNome.length > LIMITS.nome ||
      responsavelNome.length > LIMITS.nome ||
      responsavelEmail.length > LIMITS.email ||
      responsavelWhatsapp.length > LIMITS.whatsapp ||
      criancaCidade.length > LIMITS.cidade ||
      responsavelParentesco.length > LIMITS.parentesco ||
      sobre.length > LIMITS.texto ||
      experienciaDescricao.length > LIMITS.texto ||
      portfolioUrl.length > LIMITS.url ||
      selftapeUrl.length > LIMITS.url ||
      balletVideoUrl.length > LIMITS.url ||
      nomeArtistico.length > LIMITS.nome ||
      altura.length > 20 ||
      materialProfissionalLink.length > LIMITS.url
    ) {
      return NextResponse.json({ error: "Um ou mais campos excedem o tamanho permitido." }, { status: 400 });
    }

    // ---- e-mail ----
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responsavelEmail)) {
      return NextResponse.json({ error: "E-mail do responsável inválido." }, { status: 400 });
    }

    // ---- data de nascimento + faixa etária 11 a 14 ----
    const nascimento = new Date(criancaNascimento);
    if (Number.isNaN(nascimento.getTime())) {
      return NextResponse.json({ error: "Data de nascimento inválida." }, { status: 400 });
    }
    const idade = calcularIdade(nascimento);
    if (idade < 11 || idade > 14) {
      return NextResponse.json(
        { error: "Esta seletiva é para candidatas de 11 a 14 anos. A idade informada está fora dessa faixa." },
        { status: 400 }
      );
    }

    // ---- URLs opcionais ----
    for (const [label, url] of [
      ["portfólio", portfolioUrl],
      ["self-tape", selftapeUrl],
      ["vídeo de ballet", balletVideoUrl],
      ["material profissional", materialProfissionalLink],
    ] as const) {
      if (url && !isSafeUrl(url)) {
        return NextResponse.json({ error: `O link de ${label} é inválido.` }, { status: 400 });
      }
    }

    // ---- upload da foto (opcional) → Google Drive ----
    let fotoDriveUrl: string | null = null;
    let fotoDriveId: string | null = null;
    const foto = fd.get("foto");
    if (foto && foto instanceof File && foto.size > 0) {
      if (!FOTO_MIME_OK.has(foto.type)) {
        return NextResponse.json({ error: "A foto deve ser JPG, PNG ou WebP." }, { status: 400 });
      }
      if (foto.size > FOTO_MAX_BYTES) {
        return NextResponse.json({ error: "A foto é muito grande (máx. 8MB)." }, { status: 400 });
      }
      try {
        const buffer = await foto.arrayBuffer();
        const ext = foto.type.split("/")[1] ?? "jpg";
        const nomeArq = `${criancaNome} - ${Date.now()}.${ext}`.replace(/[/\\]/g, "-");
        const r = await uploadParaDrive(buffer, nomeArq, foto.type, DRIVE_FOLDERS.sedeOutros, SUBPASTA_DRIVE);
        fotoDriveUrl = r.viewUrl;
        fotoDriveId = r.fileId;
      } catch {
        // Falha no Drive não bloqueia a inscrição — segue sem foto (equipe pede depois).
        fotoDriveUrl = null;
      }
    }

    const sb = createServiceClient();

    // ---- cria/reaproveita lead (funil de aulas) — best-effort, nunca bloqueia ----
    let leadId: string | null = null;
    try {
      const celular = normalizarCelular(responsavelWhatsapp);
      if (celular) {
        const { data: existente } = await sb
          .from("leads")
          .select("id")
          .eq("celular", celular)
          .maybeSingle();
        if (existente) {
          leadId = existente.id;
        } else {
          const { data: lead } = await sb
            .from("leads")
            .insert({
              nome: responsavelNome,
              celular,
              email: responsavelEmail,
              modalidade_interesse: "Seletiva Longa 2026",
              origem: ORIGEM,
              status: "novo",
              observacoes: `Inscrição da seletiva. Candidata: ${criancaNome} (${idade} anos).${
                optinAulas ? " Aceitou receber sobre aulas." : ""
              }`,
            })
            .select("id")
            .single();
          leadId = lead?.id ?? null;
        }
      }
    } catch {
      leadId = null;
    }

    // ---- grava a inscrição ----
    // Cast: tabela recém-criada ainda não está nos types gerados do Supabase
    // (mesmo padrão de calendario_bloqueios).
    const { error: insErr } = await (sb as unknown as {
      from: (t: string) => {
        insert: (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
      };
    })
      .from("seletiva_longa_2026_inscricoes")
      .insert({
        crianca_nome: criancaNome,
        nome_artistico: nomeArtistico || null,
        crianca_nascimento: criancaNascimento,
        crianca_idade: idade,
        altura: altura || null,
        crianca_cidade: criancaCidade || null,
        responsavel_nome: responsavelNome,
        responsavel_parentesco: responsavelParentesco || null,
        responsavel_whatsapp: responsavelWhatsapp,
        responsavel_email: responsavelEmail,
        sobre: sobre || null,
        experiencia_tvcinema: experienciaTvCinema,
        experiencia_descricao: experienciaDescricao || null,
        portfolio_url: portfolioUrl || null,
        selftape_url: selftapeUrl || null,
        faz_ballet: fazBallet,
        ballet_video_url: balletVideoUrl || null,
        foto_drive_url: fotoDriveUrl,
        foto_drive_id: fotoDriveId,
        material_profissional: materialProfissional,
        material_profissional_link: materialProfissionalLink || null,
        consentimento_menor: consentimentoMenor,
        consentimento_lgpd: consentimentoLgpd,
        optin_aulas: optinAulas,
        lead_id: leadId,
        origem: ORIGEM,
      });

    if (insErr) {
      return NextResponse.json({ error: "Erro ao salvar a inscrição. Tente novamente." }, { status: 500 });
    }

    // ---- e-mails (best-effort) via SMTP (mesmo envio do sistema da Sede) ----
    try {
      const { createTransport } = await import("nodemailer");
      const SMTP_FROM = process.env.SMTP_FROM_EMAIL ?? "andreadami@sededomovimento.art";
      const transport = createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: { user: process.env.SMTP_USERNAME ?? SMTP_FROM, pass: process.env.SMTP_PASSWORD },
      });
      const from = `"Sede do Movimento" <${SMTP_FROM}>`;
      const toEmail = process.env.EMAIL_ADMIN ?? SMTP_FROM;

      const sName = escapeHtml(criancaNome);
      const sResp = escapeHtml(responsavelNome);
      const sWhats = escapeHtml(responsavelWhatsapp);
      const sMail = escapeHtml(responsavelEmail);
      const linhas = [
        ["Candidata", `${sName} (${idade} anos)`],
        ["Nome artístico", escapeHtml(nomeArtistico) || "—"],
        ["Altura", escapeHtml(altura) || "—"],
        ["Cidade", escapeHtml(criancaCidade) || "—"],
        ["Responsável", `${sResp}${responsavelParentesco ? ` (${escapeHtml(responsavelParentesco)})` : ""}`],
        ["WhatsApp", sWhats],
        ["E-mail", sMail],
        ["Já fez TV/Cinema", experienciaTvCinema ? escapeHtml(experienciaDescricao) || "Sim" : "Não"],
        ["Portfólio", portfolioUrl ? escapeHtml(portfolioUrl) : "—"],
        ["Self-tape", selftapeUrl ? escapeHtml(selftapeUrl) : "—"],
        ["Faz ballet", fazBallet ? (balletVideoUrl ? `Sim — ${escapeHtml(balletVideoUrl)}` : "Sim") : "Não"],
        ["Foto", fotoDriveUrl ? escapeHtml(fotoDriveUrl) : "não enviada"],
        [
          "Material profissional pronto",
          materialProfissional
            ? `Sim${materialProfissionalLink ? ` — ${escapeHtml(materialProfissionalLink)}` : ""}`
            : "Não",
        ],
        ["Aceita receber sobre aulas", optinAulas ? "Sim" : "Não"],
      ];

      // Notificação interna
      await transport.sendMail({
        from,
        to: toEmail,
        replyTo: responsavelEmail,
        subject: `[Seletiva Longa 2026] ${criancaNome} — ${idade} anos`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
            <div style="background: #6A00FF; padding: 24px 32px; border-radius: 8px 8px 0 0;">
              <h1 style="color: #fff; margin: 0; font-size: 20px;">Nova inscrição — Seletiva Longa 2026</h1>
            </div>
            <div style="background: #f9f9f9; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e5e5e5; border-top: none;">
              <table style="width: 100%; border-collapse: collapse;">
                ${linhas
                  .map(
                    ([k, v]) =>
                      `<tr><td style="padding: 8px 0; font-weight: 600; width: 180px; color: #555; vertical-align: top;">${k}</td><td style="padding: 8px 0;">${v}</td></tr>`
                  )
                  .join("")}
              </table>
              ${
                sobre
                  ? `<hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0;" /><p style="font-weight:600;color:#555;margin:0 0 8px;">Sobre a criança</p><p style="margin:0;line-height:1.7;white-space:pre-line;">${escapeHtml(
                      sobre
                    )}</p>`
                  : ""
              }
            </div>
          </div>`,
      });

      // Confirmação ao responsável
      await transport.sendMail({
        from,
        to: responsavelEmail,
        subject: "Recebemos a inscrição na Seletiva — Sede do Movimento",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
            <div style="background: #6A00FF; padding: 24px 32px; border-radius: 8px 8px 0 0;">
              <h1 style="color: #fff; margin: 0; font-size: 20px;">Inscrição recebida 🎬</h1>
            </div>
            <div style="background: #f9f9f9; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e5e5e5; border-top: none; line-height: 1.7;">
              <p>Olá, ${sResp}!</p>
              <p>Recebemos a inscrição de <strong>${sName}</strong> na nossa seletiva para o longa-metragem. Nossa equipe vai avaliar o material e, se houver o próximo passo, entramos em contato pelo WhatsApp informado.</p>
              <p style="background:#fff;border:1px solid #e5e5e5;border-radius:8px;padding:16px;"><strong>Importante:</strong> por se tratar de menor de idade, <strong>nada é assinado sem a presença de um responsável maior de idade com vínculo familiar</strong> no dia do encontro presencial.</p>
              <p>Enquanto isso, vale lembrar: aqui na Sede a gente forma <strong>artistas completos</strong> — teatro, dança e música caminham juntos para preparar quem quer viver de TV, cinema e palco.</p>
              <p style="color:#888;">Sede do Movimento</p>
            </div>
          </div>`,
      });
    } catch {
      // e-mail não deve bloquear a confirmação de inscrição
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao enviar. Tente novamente." }, { status: 500 });
  }
}
