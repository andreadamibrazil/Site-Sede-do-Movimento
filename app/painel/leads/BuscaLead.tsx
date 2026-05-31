'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export default function BuscaLead() {
  const router = useRouter()
  const params = useSearchParams()
  const busca = params.get('busca') ?? ''

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const p = new URLSearchParams(params.toString())
    if (e.target.value) p.set('busca', e.target.value)
    else p.delete('busca')
    p.delete('pagina')
    router.push(`/painel/leads?${p.toString()}`)
  }, [params, router])

  return (
    <input
      type="search"
      defaultValue={busca}
      onChange={handleChange}
      placeholder="Buscar por nome ou celular..."
      className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-64 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
    />
  )
}
