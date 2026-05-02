import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/lib/auth";

const SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ??
  "1LHL8J-KjJJZTTREk1LeQw_ZbR7HNDF7WalL6ZpgQyt8";
const SHEET_NAME = "Pauta";

// Columns: id, timestamp, user, platform, url, annotation, dores_desejos, funil, negocio, status, assunto, analise
const COL = {
  id: 0,
  timestamp: 1,
  user: 2,
  platform: 3,
  url: 4,
  annotation: 5,
  dores_desejos: 6,
  funil: 7,
  negocio: 8,
  status: 9,
  assunto: 10,
  analise: 11,
} as const;

function getSheets() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_SHEETS_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_SHEETS_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  return google.sheets({ version: "v4", auth: oauth2Client });
}

function detectPlatform(url: string): string {
  if (!url) return "Outro";
  const lower = url.toLowerCase();
  if (lower.includes("instagram.com")) return "Instagram";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "YouTube";
  if (lower.includes("tiktok.com")) return "TikTok";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "Twitter/X";
  if (lower.includes("facebook.com")) return "Facebook";
  if (lower.includes("linkedin.com")) return "LinkedIn";
  return "Outro";
}

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:L`,
    });

    const rows = res.data.values ?? [];
    const entries = rows.map((row: string[]) => ({
      id: row[COL.id] ?? "",
      timestamp: row[COL.timestamp] ?? "",
      user: row[COL.user] ?? "",
      platform: row[COL.platform] ?? "",
      url: row[COL.url] ?? "",
      annotation: row[COL.annotation] ?? "",
      dores_desejos: row[COL.dores_desejos] ?? "",
      funil: row[COL.funil] ?? "",
      negocio: row[COL.negocio] ?? "",
      status: row[COL.status] ?? "",
      assunto: row[COL.assunto] ?? "",
      analise: row[COL.analise] ?? "",
    }));

    return NextResponse.json(entries);
  } catch (err) {
    console.error("GET /api/pauta error:", err);
    return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { url, annotation, dores_desejos, funil, negocio, status, assunto } = body;

    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const user = session.user?.email ?? "";
    const platform = detectPlatform(url ?? "");

    const sheets = getSheets();

    // Find first truly empty row in column A (ignore rows with only checkbox data in P:Q)
    const colA = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`,
    });
    const aRows = colA.data.values ?? [];
    // First empty row after header (row index 0 = row 1)
    let nextRow = aRows.length + 1;
    for (let i = 1; i < aRows.length; i++) {
      if (!aRows[i]?.[0]?.trim()) { nextRow = i + 1; break; }
    }

    // Write data columns A:K, leave L-O empty, set P:Q as FALSE
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${nextRow}:Q${nextRow}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[id, timestamp, user, platform, url ?? "", annotation ?? "", dores_desejos ?? "", funil ?? "", negocio ?? "", status ?? "", assunto ?? "", "", "", "", "", false, false]],
      },
    });

    // Apply BOOLEAN (checkbox) validation to P and Q of the new row
    const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheetObj = sheetMeta.data.sheets?.find((s) => s.properties?.title === SHEET_NAME);
    const sheetId = sheetObj?.properties?.sheetId ?? 0;
    const rowIdx = nextRow - 1; // 0-based
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [15, 16].map((col) => ({
          setDataValidation: {
            range: { sheetId, startRowIndex: rowIdx, endRowIndex: rowIdx + 1, startColumnIndex: col, endColumnIndex: col + 1 },
            rule: { condition: { type: "BOOLEAN" }, showCustomUi: true },
          },
        })),
      },
    });

    return NextResponse.json({ id, timestamp, user, platform, url, annotation, dores_desejos, funil, negocio, status, assunto: assunto ?? "" }, { status: 201 });
  } catch (err) {
    console.error("POST /api/pauta error:", err);
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status, annotation, dores_desejos, funil, negocio, assunto } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:K`,
    });

    const rows = res.data.values ?? [];
    const rowIndex = rows.findIndex((row: string[]) => row[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const sheetRow = rowIndex + 1;
    const existing = rows[rowIndex];

    // Update F:K (annotation, dores_desejos, funil, negocio, status, assunto)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!F${sheetRow}:K${sheetRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          annotation  ?? existing[COL.annotation]  ?? "",
          dores_desejos ?? existing[COL.dores_desejos] ?? "",
          funil       ?? existing[COL.funil]       ?? "",
          negocio     ?? existing[COL.negocio]     ?? "",
          status      ?? existing[COL.status]      ?? "",
          assunto     ?? existing[COL.assunto]     ?? "",
        ]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/pauta error:", err);
    return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const sheets = getSheets();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`,
    });

    const rows = res.data.values ?? [];
    const rowIndex = rows.findIndex((row: string[]) => row[0] === id);

    if (rowIndex === -1) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheet = meta.data.sheets?.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => s.properties?.title === SHEET_NAME
    );
    const sheetId = (sheet?.properties?.sheetId as number | null | undefined) ?? 0;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: "ROWS",
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/pauta error:", err);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
