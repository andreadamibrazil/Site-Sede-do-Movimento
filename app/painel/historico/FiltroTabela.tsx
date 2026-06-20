'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const TABELA_LABEL: Record<string, string> = {
  turmas: 'Turmas', alunos: 'Alunos', matriculas: 'Matrículas',
  matricula_turmas: 'Matrícula → Turma', mensalidades: 'Mensalidades',
  pagamentos: 'Pagamentos', renegociacoes: 'Renegociações',
  perfis_usuario: 'Usuários', professores: 'Professores', presencas: 'Presenças',
}

export default function FiltroTabela() {
  const router = useRouter()
  const params = useSearchParams()
  const tabela = params.get('tabela') ?? ''
  const usuario = params.get('usuario') ?? ''

  const buildUrl = useCallback((newTabela: string, newUsuario: string) => {
    const p = new URLSearchParams()
    if (newTabela) p.set('tabela', newTabela)
    if (newUsuario) p.set('usuario', newUsuario)
    const qs = p.toString()
    return `/painel/historico${qs ? `?${qs}` : ''}`
  }, [])

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={usuario}
        onChange={e => router.push(buildUrl(tabela, e.target.value))}
        placeholder="Filtrar por usuário"
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
      />
      <select
        value={tabela}
        onChange={e => router.push(buildUrl(e.target.value, usuario))}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Todas as tabelas</option>
        {Object.entries(TABELA_LABEL).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </div>
  )
}
