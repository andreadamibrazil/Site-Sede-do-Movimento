import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/lib/auth";

const SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ??
  "1LHL8J-KjJJZTTREk1LeQw_ZbR7HNDF7WalL6ZpgQyt8";
const SHEET_NAME = "Pauta";

// Columns: id, timestamp, user, platform, url, annotation, dores_desejos, funil, negocio, status
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
} as const;

function getSheets() {
  const authClient = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth: authClient });
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
      range: `${SHEET_NAME}!A2:J`,
    });

    const rows = res.data.values ?? [];
    const entries = rows.map((row) => ({
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
    const { url, annotation, dores_desejos, funil, negocio, status } = body;

    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const user = session.user?.email ?? "";
    const platform = detectPlatform(url ?? "");

    const sheets = getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:J`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[id, timestamp, user, platform, url, annotation, dores_desejos, funil, negocio, status]],
      },
    });

    return NextResponse.json({ id, timestamp, user, platform, url, annotation, dores_desejos, funil, negocio, status }, { status: 201 });
  } catch (err) {
    console.error("POST /api/pauta error:", err);
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
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

    // Find row index with this id
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`,
    });

    const rows = res.data.values ?? [];
    const rowIndex = rows.findIndex((row) => row[0] === id);

    if (rowIndex === -1) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Get sheet id (gid) for the sheet named SHEET_NAME
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheet = meta.data.sheets?.find(
      (s) => s.properties?.title === SHEET_NAME
    );
    const sheetId = sheet?.properties?.sheetId ?? 0;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: "ROWS",
                startIndex: rowIndex, // 0-based; row 0 = data row 1 (header is row 0 in sheet but we read from A2)
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
