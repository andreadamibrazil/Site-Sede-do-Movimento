import { NextRequest, NextResponse } from "next/server";
import { callGeminiVision } from "@/lib/gemini";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    if (!audioFile) return NextResponse.json({ error: "Nenhum áudio recebido." }, { status: 400 });

    // Limite: 25MB
    const MAX_SIZE = 25 * 1024 * 1024
    if (audioFile.size > MAX_SIZE) {
      return NextResponse.json({ error: "Áudio muito grande. Máximo 25MB." }, { status: 413 })
    }
    const ALLOWED_TYPES = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/m4a']
    if (audioFile.type && !ALLOWED_TYPES.some(t => audioFile.type.startsWith(t.split('/')[0]))) {
      return NextResponse.json({ error: "Tipo de arquivo não suportado." }, { status: 415 })
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = (audioFile.type || "audio/webm") as string;

    const text = await callGeminiVision(
      base64,
      mimeType,
      "Transcreva este áudio em português. Retorne apenas o texto transcrito, sem comentários ou formatação extra."
    );
    return NextResponse.json({ text: text.trim() });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
