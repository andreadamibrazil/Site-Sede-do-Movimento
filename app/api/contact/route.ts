import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const FORM_LABELS: Record<string, string> = {
  general: "Contato Geral",
  "trabalhe-conosco": "Trabalhe Conosco",
  ouvidoria: "Ouvidoria",
};

// Input length limits to prevent DoS via oversized payloads
const LIMITS = {
  nome: 200,
  email: 254,    // RFC 5321 max
  telefone: 20,
  assunto: 300,
  mensagem: 5000,
  curriculo: 2048,
};

/** Escape characters that have special meaning in HTML to prevent email injection. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** Only allow http/https URLs — blocks javascript: and other dangerous schemes. */
function isSafeUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await req.json();
    const { nome, email, telefone, assunto, mensagem, curriculo, formType } = body;

    // Required field validation
    if (!nome || !email || !assunto || !mensagem) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
    }

    // Length limits
    if (
      String(nome).length > LIMITS.nome ||
      String(email).length > LIMITS.email ||
      String(assunto).length > LIMITS.assunto ||
      String(mensagem).length > LIMITS.mensagem ||
      (telefone && String(telefone).length > LIMITS.telefone) ||
      (curriculo && String(curriculo).length > LIMITS.curriculo)
    ) {
      return NextResponse.json({ error: "Um ou mais campos excedem o tamanho permitido." }, { status: 400 });
    }

    // Basic server-side email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

    // Curriculo must be a safe http/https URL if provided
    if (curriculo && !isSafeUrl(String(curriculo))) {
      return NextResponse.json({ error: "URL do currículo inválida." }, { status: 400 });
    }

    // Only allow known form types; default to generic label
    const safeFormType = Object.prototype.hasOwnProperty.call(FORM_LABELS, formType)
      ? (formType as string)
      : "general";
    const formLabel = FORM_LABELS[safeFormType];

    const toEmail = process.env.RESEND_TO_EMAIL ?? "contato@sededomovimento.art";
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

    // Escape all user-supplied values before interpolating into HTML
    const safeName      = escapeHtml(String(nome));
    const safeEmail     = escapeHtml(String(email));
    const safeTel       = telefone ? escapeHtml(String(telefone)) : null;
    const safeAssunto   = escapeHtml(String(assunto));
    const safeMensagem  = escapeHtml(String(mensagem));
    const safeCurriculo = curriculo ? escapeHtml(String(curriculo)) : null;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <div style="background: #6A00FF; padding: 24px 32px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 20px;">Sede do Movimento — ${formLabel}</h1>
        </div>
        <div style="background: #f9f9f9; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e5e5e5; border-top: none;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: 600; width: 140px; color: #555;">Nome</td><td style="padding: 8px 0;">${safeName}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #555;">E-mail</td><td style="padding: 8px 0;"><a href="mailto:${safeEmail}" style="color: #6A00FF;">${safeEmail}</a></td></tr>
            ${safeTel ? `<tr><td style="padding: 8px 0; font-weight: 600; color: #555;">Telefone</td><td style="padding: 8px 0;">${safeTel}</td></tr>` : ""}
            <tr><td style="padding: 8px 0; font-weight: 600; color: #555;">Assunto</td><td style="padding: 8px 0;">${safeAssunto}</td></tr>
            ${safeCurriculo ? `<tr><td style="padding: 8px 0; font-weight: 600; color: #555;">Currículo</td><td style="padding: 8px 0;"><a href="${safeCurriculo}" style="color: #6A00FF;">${safeCurriculo}</a></td></tr>` : ""}
          </table>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
          <p style="font-weight: 600; color: #555; margin: 0 0 8px;">Mensagem</p>
          <p style="margin: 0; line-height: 1.7; white-space: pre-line;">${safeMensagem}</p>
        </div>
        <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 16px;">
          Enviado via formulário em sededomovimento.art
        </p>
      </div>
    `;

    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: String(email),
      subject: `[${formLabel}] ${safeAssunto} — ${safeName}`,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao enviar. Tente novamente." }, { status: 500 });
  }
}
