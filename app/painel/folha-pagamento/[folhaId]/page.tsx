import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import EnviarAssinarBtn from './EnviarAssinarBtn'
import EditarItemFolha from './EditarItemFolha'
import ComprovanteBtn from './ComprovanteBtn'

export default async function FolhaDetalhePage({
  params,
}: {
  params: Promise<{ folhaId: string }>
}) {
  const { folhaId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const service = createServiceClient() as any

  const { data: folha } = await service
    .from('folhas_pagamento')
    .select('*, professores(nome, celular, cpf, mei, email, valor_base, forma_pagamento)')
    .eq('id', folhaId)
    .single()

  if (!folha) notFound()

  const { data: itens } = await service
    .from('itens_folha')
    .select('*, turmas(nome)')
    .eq('folha_id', folhaId)
    .order('data_aula', { ascending: true })

  const prof = folha.professores as any
  const mes = new Date(folha.mes_referencia + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  // Agrupa aulas por turma
  const porTurma: Record<string, { nome: string; itens: any[]; total: number }> = {}
  for (const item of (itens ?? [])) {
    if (item.tipo !== 'aula') continue
    const nome = (item.turmas as any)?.nome ?? 'Turma'
    if (!porTurma[nome]) porTurma[nome] = { nome, itens: [], total: 0 }
    porTurma[nome].itens.push(item)
    porTurma[nome].total += item.valor ?? 0
  }

  const itensFixos = (itens ?? []).filter((i: any) => i.tipo === 'fixo')

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/painel/folha-pagamento" className="text-sm text-gray-400 hover:text-gray-600">
          ← Folhas
        </Link>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          folha.status === 'pago' ? 'bg-emerald-100 text-emerald-700' :
          folha.status === 'assinado' ? 'bg-green-100 text-green-700' :
          folha.status === 'enviado' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-500'
        }`}>
          {folha.status.charAt(0).toUpperCase() + folha.status.slice(1)}
        </span>
      </div>

      {/* Cabeçalho da folha */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{prof?.nome}</h1>
            <p className="text-sm text-gray-500 mt-0.5 capitalize">Folha de pagamento — {mes}</p>
            {prof?.cpf && <p className="text-xs text-gray-400 mt-1">CPF: {prof.cpf}</p>}
            {prof?.mei && <p className="text-xs text-gray-400">MEI/CNPJ: {prof.mei}</p>}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">
              {Number(folha.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total a receber</p>
          </div>
        </div>
      </div>

      {/* Aulas por turma */}
      {Object.values(porTurma).map(({ nome, itens: aulasT, total }) => {
        const primeiroItem = aulasT[0]
        const numAlunos = primeiroItem?.num_alunos_mes ?? 0
        const valorHora = primeiroItem?.valor_hora_efetivo ?? 0
        const bonus = primeiroItem?.bonus_hora ?? 0
        return (
          <div key={nome} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 text-sm">{nome}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {numAlunos} aluno{numAlunos !== 1 ? 's' : ''} no mês ·{' '}
                  <span className="text-gray-600">R$ {Number(valorHora).toFixed(2).replace('.', ',')}/h</span>
                  {bonus > 0 && (
                    <span className="text-green-600 ml-1">(base R$31,50 + bônus R${Number(bonus).toFixed(2).replace('.', ',')})</span>
                  )}
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-gray-50">
                {aulasT.map((item: any) => {
                  const data = item.data_aula
                    ? new Date(item.data_aula + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
                    : '—'
                  return (
                    <tr key={item.id} className={`${!item.pago ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-2 text-gray-600">{data}</td>
                      <td className="px-4 py-2 text-gray-500">
                        {item.hora_inicio?.slice(0,5)}–{item.hora_fim?.slice(0,5)}
                      </td>
                      <td className="px-4 py-2 text-gray-500">{Number(item.horas_aula ?? 0).toFixed(1).replace('.',',')}h</td>
                      <td className="px-4 py-2 text-right text-gray-700 font-medium">
                        {item.pago
                          ? Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : <span className="text-red-400">Não pago</span>}
                      </td>
                      <td className="px-2 py-2 text-right">
                        <EditarItemFolha
                          itemId={item.id}
                          pago={item.pago}
                          folhaStatus={folha.status}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}

      {/* Valores fixos */}
      {itensFixos.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <p className="font-medium text-gray-900 text-sm">Valores fixos</p>
          </div>
          {itensFixos.map((item: any) => (
            <div key={item.id} className="px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-gray-700">{item.descricao}</p>
              <p className="text-sm font-semibold text-gray-900">
                {Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Resumo */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 space-y-2">
        <div className="flex justify-between text-sm text-gray-700">
          <span>Aulas realizadas</span>
          <span>{Number(folha.valor_aulas).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
        {Number(folha.valor_fixo) > 0 && (
          <div className="flex justify-between text-sm text-gray-700">
            <span>Valores fixos</span>
            <span>{Number(folha.valor_fixo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-indigo-200">
          <span>Total</span>
          <span>{Number(folha.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
      </div>

      {/* Ação de assinatura — só para rascunho ou enviado */}
      {(folha.status === 'rascunho' || folha.status === 'enviado') && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Assinatura digital</h2>
          {folha.autentique_doc_id && (
            <p className="text-xs text-blue-600 mb-3">
              📄 Documento já criado no Autentique —{' '}
              <a
                href={`https://app.autentique.com.br/dashboard/documentos/${folha.autentique_doc_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                ver documento
              </a>
            </p>
          )}
          <EnviarAssinarBtn
            folhaId={folha.id}
            emailProfessor={(prof as any)?.email ?? null}
          />
        </div>
      )}

      {folha.status === 'assinado' && folha.autentique_doc_id && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-sm font-medium text-green-800">✅ Folha assinada por ambas as partes</p>
          <a
            href={`https://app.autentique.com.br/dashboard/documentos/${folha.autentique_doc_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-green-600 underline mt-1 inline-block"
          >
            Ver documento assinado →
          </a>
        </div>
      )}

      {/* Comprovante de pagamento — visível sempre que assinado ou pago */}
      {(folha.status === 'assinado' || folha.status === 'pago') && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Comprovante de pagamento</h2>
          <ComprovanteBtn
            folhaId={folha.id}
            comprovanteAtual={folha.comprovante_url ?? null}
            drivePdfUrl={folha.drive_pdf_url ?? null}
          />
        </div>
      )}

      {/* Link para PDF no Drive (rascunho/enviado) */}
      {folha.drive_pdf_url && folha.status !== 'assinado' && folha.status !== 'pago' && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
          📁 PDF salvo no Drive:{' '}
          <a href={folha.drive_pdf_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">
            ver arquivo →
          </a>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        Fechamento dia 5 · Pagamento dia 15 via Pix · Gerado em {new Date(folha.created_at).toLocaleDateString('pt-BR')}
      </p>
    </div>
  )
}
