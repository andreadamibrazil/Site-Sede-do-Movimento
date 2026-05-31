import { createClient } from '@/lib/supabase/server'

export default async function TurmasPage() {
  const supabase = await createClient()

  const { data: turmas } = await supabase
    .from('turmas')
    .select(`
      id, nome, capacidade, preco_padrao, status, nivel,
      modalidades(nome),
      professores(nome),
      salas(nome)
    `)
    .order('nome')

  // Conta alunos por turma
  const { data: matriculaTurmas } = await supabase
    .from('matricula_turmas')
    .select('turma_id')
    .is('data_saida', null)

  const contagemPorTurma: Record<string, number> = {}
  matriculaTurmas?.forEach(({ turma_id }) => {
    contagemPorTurma[turma_id] = (contagemPorTurma[turma_id] ?? 0) + 1
  })

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Turmas</h1>
        <a
          href="/painel/turmas/nova"
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Nova turma
        </a>
      </div>

      <div className="grid gap-3">
        {turmas?.map((turma) => {
          const alunos = contagemPorTurma[turma.id] ?? 0
          const ocupacao = Math.round((alunos / turma.capacidade) * 100)
          const barColor = ocupacao >= 90 ? 'bg-red-400' : ocupacao >= 70 ? 'bg-orange-400' : 'bg-green-400'

          return (
            <a
              key={turma.id}
              href={`/painel/turmas/${turma.id}`}
              className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-5 hover:border-indigo-300 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{turma.nome}</p>
                  {turma.status !== 'ativa' && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {turma.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {(turma.modalidades as any)?.nome}
                  {(turma.professores as any)?.nome ? ` · ${(turma.professores as any).nome}` : ''}
                  {(turma.salas as any)?.nome ? ` · Sala ${(turma.salas as any).nome}` : ''}
                </p>
              </div>

              {/* Barra de ocupação */}
              <div className="w-32 shrink-0">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{alunos}/{turma.capacidade}</span>
                  <span>{ocupacao}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(ocupacao, 100)}%` }} />
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-900">
                  R$ {turma.preco_padrao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-400">/mês</p>
              </div>
            </a>
          )
        })}
        {!turmas?.length && (
          <p className="text-center text-gray-400 text-sm py-12">Nenhuma turma cadastrada ainda.</p>
        )}
      </div>
    </div>
  )
}
