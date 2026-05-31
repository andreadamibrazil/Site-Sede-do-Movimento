'use client'

import { useRouter, useSearchParams } from 'next/navigation'

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

  return (
    <select
      value={tabela}
      onChange={e => router.push(`/painel/historico${e.target.value ? `?tabela=${e.target.value}` : ''}`)}
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">Todas as tabelas</option>
      {Object.entries(TABELA_LABEL).map(([k, v]) => (
        <option key={k} value={k}>{v}</option>
      ))}
    </select>
  )
}
