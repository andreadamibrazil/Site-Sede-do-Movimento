import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    const keys = [
      process.env.GOOGLE_AI_KEY,
      process.env.GOOGLE_AI_KEY_2,
      process.env.GOOGLE_AI_KEY_3,
    ].filter(Boolean) as string[]

    if (!keys.length) {
      return NextResponse.json({ ok: true, aviso: null })
    }

    for (const key of keys) {
      try {
        const genAI = new GoogleGenerativeAI(key)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
        const result = await model.generateContent(prompt)
        const text = result.response.text().trim()

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) return NextResponse.json({ ok: true, aviso: null })

        const dados = JSON.parse(jsonMatch[0])
        return NextResponse.json(dados)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : ''
        const isQuota = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')
        if (!isQuota) break
      }
    }

    return NextResponse.json({ ok: true, aviso: null })
  } catch {
    return NextResponse.json({ ok: true, aviso: null })
  }
}
