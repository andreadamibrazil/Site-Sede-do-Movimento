import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { google } from "googleapis";
import { auth } from "@/lib/auth";

const SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ??
  "1LHL8J-KjJJZTTREk1LeQw_ZbR7HNDF7WalL6ZpgQyt8";

function getSheets() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_SHEETS_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_SHEETS_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return google.sheets({ version: "v4", auth: oauth2Client });
}

async function fetchConfig(): Promise<Record<string, string>> {
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Config!A2:B50",
    });
    const config: Record<string, string> = {};
    (res.data.values ?? []).forEach(([k, v]: string[]) => { if (k) config[k] = v ?? ""; });
    return config;
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 500 });
  }

  try {
    const { url, annotation, dores_desejos, funil, negocio, assunto, analise } = await req.json();
    const config = await fetchConfig();

    const client = new Anthropic({ apiKey });

    const negocioNome = config.negocio_nome || "Sede do Movimento";
    const negocioDesc = config.negocio_descricao || "escola de dança no Rio de Janeiro";
    const modalidades = config.modalidades || "ballet, contemporâneo, jazz";
    const publicoPrincipal = config.publico_principal || "";
    const publicoDores = config.publico_dores || dores_desejos || "não informado";
    const publicoDesejos = config.publico_desejos || "";
    const tomVoz = config.tom_de_voz || "";
    const objetivo = config.objetivo_conteudo || "";

    const prompt = `Você é um especialista em marketing de conteúdo para ${negocioNome} — ${negocioDesc}.
Modalidades: ${modalidades}.${publicoPrincipal ? `\nPúblico: ${publicoPrincipal}.` : ""}${tomVoz ? `\nTom de voz: ${tomVoz}.` : ""}${objetivo ? `\nObjetivo: ${objetivo}.` : ""}

Com base nesta referência de conteúdo, crie uma ideia de post para redes sociais ou blog:

URL: ${url || "não informado"}
Anotação: ${annotation || "não informado"}
Dores e Desejos do público: ${publicoDores}${publicoDesejos ? ` / Desejos: ${publicoDesejos}` : ""}
Etapa do funil: ${funil || "não informado"}
Negócio: ${negocio || negocioNome}
Assunto: ${assunto || "não informado"}${analise ? `\n\nANÁLISE DO VÍDEO (transcrição + hooks extraídos):\n${analise}` : ""}

Gere:
1. **Título** — chamativo, até 10 palavras
2. **Gancho** — primeira frase do post (máx 2 linhas), que para o scroll
3. **Estrutura** — 3 a 5 tópicos do que abordar
4. **CTA** — call to action final
5. **Formato sugerido** — (carrossel, reels, blog, stories, etc.)

Seja direto, criativo e focado no público da ${negocioNome}.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ result: text });
  } catch (err) {
    console.error("POST /api/pauta/generate error:", err);
    return NextResponse.json({ error: "Erro ao gerar conteúdo." }, { status: 500 });
  }
}
