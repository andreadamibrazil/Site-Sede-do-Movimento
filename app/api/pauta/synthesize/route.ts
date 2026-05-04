import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_SHEETS_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_SHEETS_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET,
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    const sheets = google.sheets({ version: "v4", auth: oauth2Client });
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

interface EntryInput {
  id: string;
  url: string;
  annotation: string;
  assunto: string;
  analise: string;
  platform: string;
}

function detectPlatform(url: string): string {
  if (!url) return "Outro";
  const lower = url.toLowerCase();
  if (lower.includes("instagram.com")) return "Instagram";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "YouTube";
  if (lower.includes("tiktok.com")) return "TikTok";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "Twitter/X";
  return "Outro";
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entries }: { entries: EntryInput[] } = await req.json();
  if (!entries?.length) return NextResponse.json({ error: "Missing entries" }, { status: 400 });

  const config = await fetchConfig();
  const negocio = config.negocio_nome || "Sede do Movimento";
  const descricao = config.negocio_descricao || "escola de dança no Rio de Janeiro";
  const publico = config.publico_principal || "";

  const entriesText = entries.map((e, i) => {
    const lines = [`[Referência ${i + 1}]`];
    if (e.url) lines.push(`URL: ${e.url}`);
    if (e.platform) lines.push(`Plataforma: ${e.platform}`);
    if (e.assunto) lines.push(`Assunto: ${e.assunto}`);
    if (e.annotation) lines.push(`Anotação: ${e.annotation}`);
    if (e.analise) lines.push(`Análise prévia:\n${e.analise}`);
    return lines.join("\n");
  }).join("\n\n---\n\n");

  const assuntos = [...new Set(entries.map((e) => e.assunto).filter(Boolean))].join(", ");

  const prompt = `Você é um especialista em marketing de conteúdo para ${negocio} — ${descricao}.${publico ? `\nPúblico: ${publico}.` : ""}

Abaixo estão ${entries.length} referências de conteúdo coletadas. Sintetize-as em uma análise consolidada que:

1. **Tema central**: o que une essas referências — qual o fio condutor
2. **Insights combinados** (4-6): os insights mais fortes extraídos do conjunto, não de cada um isolado
3. **Ideias de conteúdo** (3-5): ideias concretas de posts/reels para ${negocio} inspiradas nessas referências juntas
4. **Ângulo diferenciador**: o que essas referências sugerem que ${negocio} poderia explorar de forma única

REFERÊNCIAS:

${entriesText}

Responda em português, de forma direta e prática. Formato:

TEMA CENTRAL: [texto]

INSIGHTS:
- [insight 1]
- [insight 2]

IDEIAS DE CONTEÚDO:
- [ideia 1]
- [ideia 2]

ÂNGULO DIFERENCIADOR: [texto]`;

  let analysis = "";
  const apiKey = process.env.GOOGLE_AI_KEY;

  if (!apiKey) return NextResponse.json({ error: "GOOGLE_AI_KEY not configured" }, { status: 500 });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
    const result = await model.generateContent(prompt);
    analysis = result.response.text();
  } catch (err) {
    console.error("Gemini synthesize error:", err);
    return NextResponse.json({ error: "Erro ao gerar síntese" }, { status: 500 });
  }

  // Create new entry in spreadsheet
  const sheets = getSheets();
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const user = session.user?.email ?? "";
  const annotation = `Síntese de ${entries.length} referências${assuntos ? `: ${assuntos}` : ""}`;
  const firstUrl = entries[0]?.url ?? "";
  const platform = detectPlatform(firstUrl);

  const colA = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:A`,
  });
  const aRows = colA.data.values ?? [];
  let nextRow = aRows.length + 1;
  for (let i = 1; i < aRows.length; i++) {
    if (!aRows[i]?.[0]?.trim()) { nextRow = i + 1; break; }
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A${nextRow}:R${nextRow}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        id, timestamp, user, platform, firstUrl, annotation,
        "", "", "", "Referência", assuntos, analysis,
        "", "", "", false, false, false,
      ]],
    },
  });

  return NextResponse.json({
    id, timestamp, user, platform,
    url: firstUrl, annotation,
    dores_desejos: "", funil: "", negocio: "",
    status: "Referência", assunto: assuntos,
    analise: analysis, favorito: false,
  }, { status: 201 });
}
