import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import Anthropic from "@anthropic-ai/sdk";
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

async function getTranscript(url: string): Promise<string> {
  const apiKey = process.env.SUPADATA_API_KEY;
  if (!apiKey) throw new Error("SUPADATA_API_KEY not configured");

  const res = await fetch(
    `https://api.supadata.ai/v1/youtube/transcript?url=${encodeURIComponent(url)}&text=true&lang=pt`,
    { headers: { "x-api-key": apiKey } }
  );

  if (!res.ok) {
    // Try without lang param (some videos only have auto-generated captions)
    const res2 = await fetch(
      `https://api.supadata.ai/v1/youtube/transcript?url=${encodeURIComponent(url)}&text=true`,
      { headers: { "x-api-key": apiKey } }
    );
    if (!res2.ok) throw new Error(`Supadata error: ${res2.status}`);
    const data2 = await res2.json();
    return typeof data2 === "string" ? data2 : data2.content ?? data2.text ?? JSON.stringify(data2).slice(0, 3000);
  }

  const data = await res.json();
  const raw = typeof data === "string" ? data : data.content ?? data.text ?? "";
  return raw.slice(0, 8000);
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
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? "1LHL8J-KjJJZTTREk1LeQw_ZbR7HNDF7WalL6ZpgQyt8",
      range: "Config!A2:B50",
    });
    const config: Record<string, string> = {};
    (res.data.values ?? []).forEach(([k, v]: string[]) => { if (k) config[k] = v ?? ""; });
    return config;
  } catch {
    return {};
  }
}

function buildAnalysisPrompt(url: string, transcript: string, annotation: string, assunto: string, config: Record<string, string>): string {
  const negocio = config.negocio_nome || "Sede do Movimento";
  const descricao = config.negocio_descricao || "escola de dança no Rio de Janeiro: ballet, contemporâneo, jazz, MoviRio, Nova Atmosfera";
  const publico = config.publico_principal || "";
  const dores = config.publico_dores || "";
  const desejos = config.publico_desejos || "";

  return `Você é um especialista em marketing de conteúdo para ${negocio} — ${descricao}.${publico ? `\nPúblico: ${publico}.` : ""}${dores ? `\nDores: ${dores}.` : ""}${desejos ? `\nDesejos: ${desejos}.` : ""}

Analise este vídeo com base na transcrição abaixo e extraia:

1. **Resumo** (2-3 linhas): do que se trata o vídeo
2. **Hooks virais** (3-5): frases ou momentos do vídeo que têm alto potencial de engajamento — algo surpreendente, contraintuitivo, emocional ou acionável que poderia virar um reel/post
3. **Contexto estratégico** (1-2 linhas): por que esse conteúdo é relevante para ${negocio}

URL: ${url}
${assunto ? `Assunto: ${assunto}` : ""}
${annotation ? `Anotação: ${annotation}` : ""}

TRANSCRIÇÃO:
${transcript}

Responda em português, de forma direta e prática. Formato:

RESUMO: [texto]

HOOKS VIRAIS:
- [hook 1]
- [hook 2]
- [hook 3]

CONTEXTO: [texto]`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, url, annotation = "", assunto = "" } = await req.json();
  if (!id || !url) return NextResponse.json({ error: "Missing id or url" }, { status: 400 });

  let transcript = "";
  let transcriptError = "";

  try {
    transcript = await getTranscript(url);
  } catch (err) {
    transcriptError = err instanceof Error ? err.message : "Erro ao buscar transcrição";
  }

  if (!transcript) {
    return NextResponse.json({ error: transcriptError || "Transcrição não disponível para este vídeo" }, { status: 422 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const config = await fetchConfig();
  let analysis = "";

  if (apiKey) {
    try {
      const client = new Anthropic({ apiKey });
      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        messages: [{ role: "user", content: buildAnalysisPrompt(url, transcript, annotation, assunto, config) }],
      });
      analysis = (msg.content[0] as { type: string; text: string }).text;
    } catch (err) {
      console.error("Claude analysis error:", err);
      analysis = `TRANSCRIÇÃO (sem análise — configure ANTHROPIC_API_KEY):\n${transcript.slice(0, 500)}…`;
    }
  } else {
    analysis = `TRANSCRIÇÃO:\n${transcript.slice(0, 1500)}…`;
  }

  // Save analysis (col L) + transcript (col M) to sheet
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
        range: `${SHEET_NAME}!L${rowIndex + 1}:M${rowIndex + 1}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[analysis, transcript]] },
      });
    }
  } catch (err) {
    console.error("Failed to save analysis to sheet:", err);
  }

  return NextResponse.json({ analysis, transcript: transcript.slice(0, 500) });
}
