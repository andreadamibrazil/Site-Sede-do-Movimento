'use client'

import { useRef, useState } from 'react'

export function useActionGuard() {
  const processando = useRef(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run<T>(fn: () => Promise<T>): Promise<T | null> {
    if (processando.current) return null   // bloqueia imediatamente, antes do re-render
    processando.current = true
    setLoading(true)
    setError(null)
    try {
      return await fn()
    } catch (e: any) {
      setError(e?.message ?? 'Erro desconhecido')
      return null
    } finally {
      processando.current = false
      setLoading(false)
    }
  }

  return { run, loading, error, setError }
}
