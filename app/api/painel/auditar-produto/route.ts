import { NextRequest, NextResponse } from 'next/server'
import { callGemini } from '@/lib/gemini'
import { requireAdmin } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response
  try {
    const { prompt } = await request.json()

    const text = await callGemini(prompt)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ ok: true, aviso: null })
    const dados = JSON.parse(jsonMatch[0])
    return NextResponse.json(dados)
  } catch {
    return NextResponse.json({ ok: true, aviso: null })
  }
}
