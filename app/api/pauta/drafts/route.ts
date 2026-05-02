import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/lib/auth";

const SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ??
  "1LHL8J-KjJJZTTREk1LeQw_ZbR7HNDF7WalL6ZpgQyt8";
const SHEET_NAME = "Rascunhos";

// Columns: id(A), timestamp(B), user(C), entry_id(D), assunto(E), negocio(F), content(G), status(H)
const COL = {
  id: 0,
  timestamp: 1,
  user: 2,
  entry_id: 3,
  assunto: 4,
  negocio: 5,
  content: 6,
  status: 7,
} as const;

function getSheets() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_SHEETS_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_SHEETS_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return google.sheets({ version: "v4", auth: oauth2Client });
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:H`,
    });

    const rows = res.data.values ?? [];
    const drafts = rows.map((row: string[]) => ({
      id: row[COL.id] ?? "",
      timestamp: row[COL.timestamp] ?? "",
      user: row[COL.user] ?? "",
      entry_id: row[COL.entry_id] ?? "",
      assunto: row[COL.assunto] ?? "",
      negocio: row[COL.negocio] ?? "",
      content: row[COL.content] ?? "",
      status: (row[COL.status] ?? "Rascunho") as "Rascunho" | "Publicado",
    }));

    return NextResponse.json(drafts);
  } catch (err) {
    console.error("GET /api/pauta/drafts error:", err);
    return NextResponse.json({ error: "Failed to fetch drafts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { entry_id = "", assunto = "", negocio = "", content } = body;
    if (!content) return NextResponse.json({ error: "Missing content" }, { status: 400 });

    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const user = session.user?.email ?? "";

    const sheets = getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:H`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[id, timestamp, user, entry_id, assunto, negocio, content, "Rascunho"]],
      },
    });

    return NextResponse.json(
      { id, timestamp, user, entry_id, assunto, negocio, content, status: "Rascunho" },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/pauta/drafts error:", err);
    return NextResponse.json({ error: "Failed to create draft" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, content, status } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`,
    });

    const rows = res.data.values ?? [];
    const rowIndex = rows.findIndex((row: string[]) => row[0] === id);
    if (rowIndex === -1) return NextResponse.json({ error: "Draft not found" }, { status: 404 });

    const sheetRow = rowIndex + 1;
    const updates: Promise<unknown>[] = [];

    if (content !== undefined) {
      updates.push(
        sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!G${sheetRow}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [[content]] },
        })
      );
    }
    if (status !== undefined) {
      updates.push(
        sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!H${sheetRow}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [[status]] },
        })
      );
    }

    await Promise.all(updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/pauta/drafts error:", err);
    return NextResponse.json({ error: "Failed to update draft" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`,
    });

    const rows = res.data.values ?? [];
    const rowIndex = rows.findIndex((row: string[]) => row[0] === id);
    if (rowIndex === -1) return NextResponse.json({ error: "Draft not found" }, { status: 404 });

    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sheet = meta.data.sheets?.find((s: any) => s.properties?.title === SHEET_NAME);
    const sheetId = (sheet?.properties?.sheetId as number | null | undefined) ?? 0;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: { sheetId, dimension: "ROWS", startIndex: rowIndex, endIndex: rowIndex + 1 },
            },
          },
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/pauta/drafts error:", err);
    return NextResponse.json({ error: "Failed to delete draft" }, { status: 500 });
  }
}
