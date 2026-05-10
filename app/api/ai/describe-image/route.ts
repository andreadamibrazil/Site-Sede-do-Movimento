import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY ?? process.env.GOOGLE_AI_API_KEY ?? "");

// URL da API externa (planilha de pauta) definida no servidor — nunca vinda do cliente
const EXTERNAL_API_URL = process.env.PAUTA_IMAGE_API_URL;

const SEDE_CONTEXT = `
Você é um especialista em SEO visual da Sede do Movimento, um complexo cultural e escola de artes cênicas
no Rio Comprido, Rio de Janeiro. A escola oferece dança, teatro, música e formação artística completa.
Perfis sociais: Instagram @sededomovimento, YouTube @sededomovimento.
`;

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin");
    if (origin && origin !== req.nextUrl.origin) {
      return NextResponse.json({ error: "Origem não autorizada" }, { status: 403 });
    }

    const body = await req.json();
    const { imageUrl, context, caption, postTitle } = body as {
      imageUrl?: string;
      context?: string;
      caption?: string;
      postTitle?: string;
    };

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl é obrigatório" }, { status: 400 });
    }

    // Tenta API externa configurada via env (ex: planilha de pauta)
    if (EXTERNAL_API_URL) {
      try {
        const res = await fetch(EXTERNAL_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl, context, caption, postTitle }),
        });
        if (res.ok) {
          const data = (await res.json()) as { description?: string; result?: string; text?: string };
          const description = data.description ?? data.result ?? data.text;
          if (description) return NextResponse.json({ description });
        }
      } catch {
        // fallback para Gemini
      }
    }

    // Gemini como fallback (ou primário quando PAUTA_IMAGE_API_URL não está configurado)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) {
      return NextResponse.json({ error: "Não foi possível buscar a imagem" }, { status: 400 });
    }
    const imgBuffer = await imgResponse.arrayBuffer();
    const imgBase64 = Buffer.from(imgBuffer).toString("base64");
    const mimeType = imgResponse.headers.get("content-type") ?? "image/jpeg";

    const contextParts = [
      context ? `Contexto do uso: ${context}` : "",
      caption ? `Legenda/caption: ${caption}` : "",
      postTitle ? `Título do post/conteúdo: ${postTitle}` : "",
    ].filter(Boolean).join("\n");

    const prompt = `${SEDE_CONTEXT}

Analise esta imagem e gere UMA descrição otimizada para SEO com as seguintes regras:
- Mencione "Sede do Movimento" naturalmente na descrição
- Inclua "Rio de Janeiro" quando relevante
- Se houver aula, espetáculo ou atividade artística visível, descreva com especificidade (ex: "aulas de dança contemporânea na Sede do Movimento")
- Contexto de uso desta imagem: ${contextParts || "imagem institucional da escola"}
- Seja descritivo mas conciso (máx 250 caracteres)
- Priorize palavras que pessoas buscariam no Google (escola de dança Rio de Janeiro, espetáculo, formação artística)
- Tom: profissional e inspirador
- Responda APENAS com a descrição, sem prefixos, sem aspas

Exemplos de tom:
✅ "Alunos da Sede do Movimento em aula de ballet clássico no Rio Comprido, Rio de Janeiro — formação artística completa para todas as idades"
✅ "Espetáculo Arcanum 2025 da Sede do Movimento no Teatro João Caetano, Rio de Janeiro — dança, teatro e música em uma experiência única"
❌ "Uma imagem mostrando..." (genérico demais)`;

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType, data: imgBase64 } },
    ]);

    const description = result.response.text().trim();
    return NextResponse.json({ description });

  } catch (err) {
    console.error("[ai/describe-image]", err);
    return NextResponse.json(
      { error: "Erro ao gerar descrição", details: String(err) },
      { status: 500 }
    );
  }
}
