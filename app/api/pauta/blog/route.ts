import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/gemini";
import { google } from "googleapis";
import { auth } from "@/lib/auth";

const SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ??
  "1LHL8J-KjJJZTTREk1LeQw_ZbR7HNDF7WalL6ZpgQyt8";
const SHEET_NAME = "Pauta";

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

  try {
    const { id, url, annotation, assunto, analise } = await req.json();
    const config = await fetchConfig();

    const negocioNome = config.negocio_nome || "Sede do Movimento";
    const negocioDesc = config.negocio_descricao || "escola de dança no Rio de Janeiro";
    const modalidades = config.modalidades || "ballet, contemporâneo, jazz";
    const publicoPrincipal = config.publico_principal || "";
    const tomVoz = config.tom_de_voz || "";
    const diferenciais = config.diferenciais || "";
    const local = config.local || "";

    const prompt = `Você é um redator especialista em marketing de conteúdo para ${negocioNome} — ${negocioDesc}.
Modalidades: ${modalidades}.${publicoPrincipal ? `\nPúblico: ${publicoPrincipal}.` : ""}${tomVoz ? `\nTom de voz: ${tomVoz}.` : ""}${diferenciais ? `\nDiferenciais: ${diferenciais}.` : ""}${local ? `\nLocalização: ${local}.` : ""}

Com base nesta referência, escreva um artigo completo para o blog da ${negocioNome}:

URL de referência: ${url || "não informado"}
Assunto: ${assunto || "não informado"}
Anotação: ${annotation || "não informado"}${analise ? `\n\nANÁLISE DA REFERÊNCIA:\n${analise}` : ""}

Escreva um artigo de blog com:
1. **Título SEO** — atrativo, com palavra-chave relevante para dança
2. **Introdução** (2-3 parágrafos) — cria conexão emocional com o leitor
3. **Desenvolvimento** (3-4 seções com subtítulos H2) — conteúdo útil e aprofundado
4. **Conclusão** (1 parágrafo) — reforça a mensagem e convida à ação
5. **CTA final** — convida o leitor a conhecer a ${negocioNome}

Escreva em português, com tom ${tomVoz || "próximo, inspirador e acessível"}. Extensão: 600-900 palavras. Use markdown.`;

    const text = await generateWithFallback(prompt);

    if (id) {
      try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!A:A`,
        });
        const rows = res.data.values ?? [];
        const rowIndex = rows.findIndex((row: string[]) => row[0] === id);
        if (rowIndex !== -1) {
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!O${rowIndex + 1}`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [[text]] },
          });
        }
      } catch (err) {
        console.error("Failed to save blog to sheet:", err);
      }
    }

    return NextResponse.json({ result: text });
  } catch (err) {
    console.error("POST /api/pauta/blog error:", err);
    return NextResponse.json({ error: "Erro ao gerar blog." }, { status: 500 });
  }
}
