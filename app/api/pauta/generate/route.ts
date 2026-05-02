import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";

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

    const client = new Anthropic({ apiKey });

    const prompt = `Você é um especialista em marketing de conteúdo para escolas de dança e artes cênicas.

Com base nesta referência de conteúdo, crie uma ideia de post para redes sociais ou blog:

URL: ${url || "não informado"}
Anotação: ${annotation || "não informado"}
Dores e Desejos do público: ${dores_desejos || "não informado"}
Etapa do funil: ${funil || "não informado"}
Negócio: ${negocio || "não informado"}
Assunto: ${assunto || "não informado"}${analise ? `\n\nANÁLISE DO VÍDEO (transcrição + hooks extraídos):\n${analise}` : ""}

Gere:
1. **Título** — chamativo, até 10 palavras
2. **Gancho** — primeira frase do post (máx 2 linhas), que para o scroll
3. **Estrutura** — 3 a 5 tópicos do que abordar
4. **CTA** — call to action final
5. **Formato sugerido** — (carrossel, reels, blog, stories, etc.)

Seja direto, criativo e focado no público da Sede do Movimento.`;

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
