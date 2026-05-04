import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";

const MODEL = "gemini-2.5-flash";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    if (!audioFile) return NextResponse.json({ error: "Nenhum áudio recebido." }, { status: 400 });

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = (audioFile.type || "audio/webm") as string;

    const keys = [process.env.GOOGLE_AI_KEY, process.env.GOOGLE_AI_KEY_2].filter(Boolean) as string[];
    if (!keys.length) return NextResponse.json({ error: "GOOGLE_AI_KEY não configurada." }, { status: 500 });

    let lastError: unknown;
    for (const key of keys) {
      try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: MODEL });
        const result = await model.generateContent([
          {
            inlineData: { data: base64, mimeType },
          },
          "Transcreva este áudio em português. Retorne apenas o texto transcrito, sem comentários ou formatação extra.",
        ]);
        const text = result.response.text().trim();
        return NextResponse.json({ text });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "";
        const isQuota = msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED");
        if (isQuota) { lastError = err; continue; }
        throw err;
      }
    }
    throw lastError;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
