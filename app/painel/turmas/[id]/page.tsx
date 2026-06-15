import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PlanoAula from './PlanoAula'
import BotaoReativarTurma from './BotaoReativarTurma'
import BotaoRemoverAluno from './BotaoRemoverAluno'

const DIAS_LABEL: Record<string, string> = {
  segunda: 'Segunda', terca: 'Terça', quarta: 'Quarta',
  quinta: 'Quinta', sexta: 'Sexta', sabado: 'Sábado', domingo: 'Domingo',
}

export default async function TurmaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: turma } = await supabase
    .from('turmas')
    .select(`
      *,
      modalidades(nome),
      professores!professor_id(nome),
      salas(nome)
    `)
    .eq('id', id)
    .single()

  if (!turma) notFound()

  const { data: horarios } = await supabase
    .from('turma_horarios')
    .select('*')
    .eq('turma_id', id)
    .order('dia_semana')

  const { data: matriculaTurmas } = await supabase
    .from('matricula_turmas')
    .select('id, matriculas(aluno_id, status, alunos(id, nome, status_financeiro))')
    .eq('turma_id', id)
    .is('data_saida', null)

  const alunos = (matriculaTurmas ?? [])
    .filter(mt => (mt.matriculas as any)?.status === 'ativa')
    .map(mt => {
      const a = (mt.matriculas as any)?.alunos
      if (!a) return null
      return { matriculaTurmaId: mt.id as string, id: a.id as string, nome: a.nome as string, status_financeiro: a.status_financeiro as string | null }
    })
    .filter((a): a is NonNullable<typeof a> => a !== null)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/painel/turmas" className="text-xs text-gray-400 hover:text-gray-600">← Turmas</Link>
          <h1 className="text-xl font-semibold text-gray-900 mt-1">{turma.nome}</h1>
          {(turma as any).descricao && (
            <p className="text-sm text-gray-500 mt-0.5">{(turma as any).descricao}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            turma.status === 'ativa' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {turma.status}
          </span>
          {turma.status !== 'ativa' && <BotaoReativarTurma turmaId={id} />}
          <a
            href={`/painel/turmas/${id}/editar`}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 px-3 py-1 rounded-lg"
          >
            Editar
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Info da turma */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Detalhes</h2>
          <Row label="Modalidade" value={(turma.modalidades as any)?.nome ?? '—'} />
          <Row label="Professor" value={(turma.professores as any)?.nome ?? '—'} />
          <Row label="Sala" value={(turma.salas as any)?.nome ?? '—'} />
          <Row label="Capacidade" value={`${alunos.length} / ${turma.capacidade} alunos`} />
          <Row label="Preço padrão" value={`R$ ${Number(turma.preco_padrao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`} />
          {turma.nivel && <Row label="Nível" value={turma.nivel} />}
          {(turma.faixa_etaria_min || turma.faixa_etaria_max) && (
            <Row label="Faixa etária" value={`${turma.faixa_etaria_min ?? '?'} – ${turma.faixa_etaria_max ?? '+'} anos`} />
          )}
        </div>

        {/* Horários */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Horários</h2>
          {horarios?.length ? horarios.map(h => (
            <div key={h.id} className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{DIAS_LABEL[h.dia_semana]}</span>
              <span className="text-gray-500">{h.hora_inicio.slice(0,5)} – {h.hora_fim.slice(0,5)}</span>
            </div>
          )) : (
            <p className="text-sm text-gray-400">Sem horários cadastrados.</p>
          )}
        </div>
      </div>

      {/* Alunos matriculados */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            Alunos matriculados ({alunos.length})
          </h2>
        </div>
        {alunos.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Nenhum aluno nesta turma ainda.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              {alunos.map((a, i) => (
                <tr key={a.matriculaTurmaId || i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{a.nome}</td>
                  <td className="px-5 py-3">
                    {a.status_financeiro === 'inadimplente' && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Inadimplente</span>
                    )}
                    {a.status_financeiro === 'em_atraso' && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Em atraso</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <a href={`/painel/alunos/${a.id}`} className="text-xs text-indigo-600 hover:text-indigo-700">Ver →</a>
                      <BotaoRemoverAluno matriculaTurmaId={a.matriculaTurmaId} alunoNome={a.nome} turmaId={id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Plano de aula */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Plano de aula</h2>
        <PlanoAula
          turmaId={id}
          dataInicio={(turma as any).data_inicio}
          dataFim={(turma as any).data_fim}
        />
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
