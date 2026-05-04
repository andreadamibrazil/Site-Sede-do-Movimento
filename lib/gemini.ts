import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "gemini-2.5-flash";

export async function generateWithFallback(prompt: string): Promise<string> {
  const keys = [process.env.GOOGLE_AI_KEY, process.env.GOOGLE_AI_KEY_2].filter(Boolean) as string[];
  if (!keys.length) throw new Error("Nenhuma GOOGLE_AI_KEY configurada.");

  for (let i = 0; i < keys.length; i++) {
    try {
      const genAI = new GoogleGenerativeAI(keys[i]);
      const model = genAI.getGenerativeModel({ model: MODEL });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      const isQuota = msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED");
      if (i < keys.length - 1 && isQuota) continue;
      throw err;
    }
  }
  throw new Error("Todas as keys esgotadas.");
}
