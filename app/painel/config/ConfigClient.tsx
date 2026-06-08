'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adicionarConfigItem, salvarContextoItem } from './actions'

const CATEGORIAS = [
  { id: 'uniforme', label: 'Itens de Uniforme' },
  { id: 'doc_tipo', label: 'Tipos de Documento' },
  { id: 'modalidade_interesse', label: 'Modalidades de Interesse (Leads)' },
  { id: 'origem_lead', label: 'Origens de Lead' },
  { id: 'outro', label: 'Outro' },
]

export default function ConfigClient({ itens, contexto }: { itens: any[]; contexto: any[] }) {
  const router = useRouter()
  const [novoItem, setNovoItem] = useState({ categoria: 'uniforme', valor: '', label: '' })
  const [salvando, setSalvando] = useState(false)
  const [auditando, setAuditando] = useState(false)
  const [relatorio, setRelatorio] = useState<any>(null)
  const [abaAtiva, setAbaAtiva] = useState<'itens' | 'contexto' | 'auditoria'>('itens')
  const [contextoEdit, setContextoEdit] = useState<Record<string, string>>(
    Object.fromEntries(contexto.map((c: any) => [c.secao, c.conteudo]))
  )
  const [salvandoContexto, setSalvandoContexto] = useState(false)

  async function adicionarItem() {
    if (!novoItem.valor.trim() || !novoItem.label.trim()) return
    setSalvando(true)
    try {
      await adicionarConfigItem({
        categoria: novoItem.categoria,
        valor: novoItem.valor.toLowerCase().replace(/\s+/g, '_'),
        label: novoItem.label,
      })
      setNovoItem(n => ({ ...n, valor: '', label: '' }))
      router.refresh()
    } catch (e) {
      alert('Erro ao salvar: ' + (e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  async function salvarContexto(secao: string) {
    setSalvandoContexto(true)
    try {
      await salvarContextoItem(secao, contextoEdit[secao] ?? '')
    } catch (e) {
      alert('Erro ao salvar: ' + (e as Error).message)
    } finally {
      setSalvandoContexto(false)
    }
  }

  async function auditar() {
    setAuditando(true)
    setRelatorio(null)
    const res = await fetch('/api/admin/auditoria', { method: 'POST' })
    const json = await res.json()
    setAuditando(false)
    if (json.ok) {
      setRelatorio(json)
      setAbaAtiva('auditoria')
      router.refresh()
    }
  }

  const itensPorCategoria = CATEGORIAS.map(cat => ({
    ...cat,
    itens: itens.filter((i: any) => i.categoria === cat.id),
  })).filter(c => c.itens.length > 0)

  const STATUS_COLOR: Record<string, string> = {
    ok: 'text-green-600', problema: 'text-red-600', revisar: 'text-orange-600',
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(['itens', 'contexto', 'auditoria'] as const).map(aba => (
          <button key={aba} onClick={() => setAbaAtiva(aba)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
              abaAtiva === aba ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {aba === 'itens' ? 'Itens personalizados' : aba === 'contexto' ? 'Contexto da IA' : '🤖 Auditoria IA'}
          </button>
        ))}
      </div>

      {/* Itens */}
      {abaAtiva === 'itens' && (
        <div className="space-y-5">
          {/* Adicionar */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">+ Novo item</h2>
            <div className="grid grid-cols-3 gap-3">
              <select value={novoItem.categoria} onChange={e => setNovoItem(n => ({ ...n, categoria: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <input value={novoItem.label} onChange={e => setNovoItem(n => ({ ...n, label: e.target.value }))}
                placeholder="Nome exibido (ex: Body de Ballet)"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input value={novoItem.valor} onChange={e => setNovoItem(n => ({ ...n, valor: e.target.value }))}
                placeholder="Chave técnica (ex: body_ballet)"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <p className="text-xs text-gray-400">A chave técnica é usada no código. Use letras minúsculas e underscore.</p>
            <button onClick={adicionarItem} disabled={salvando || !novoItem.label || !novoItem.valor}
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-40">
              {salvando ? 'Salvando...' : 'Adicionar item'}
            </button>
          </div>

          {/* Lista */}
          {itensPorCategoria.map(cat => (
            <div key={cat.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{cat.label}</p>
                <span className="text-xs text-gray-400">{cat.itens.length} itens</span>
              </div>
              <div className="divide-y divide-gray-100">
                {cat.itens.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{item.label}</span>
                      <span className="text-xs text-gray-400 ml-2">{item.valor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.verificado
                        ? <span className="text-xs text-green-600">✓ Verificado</span>
                        : <span className="text-xs text-orange-500">Não verificado</span>}
                      {item.gemini_nota && <span className="text-xs text-gray-400 truncate max-w-[200px]">{item.gemini_nota}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contexto */}
      {abaAtiva === 'contexto' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Este contexto é usado pela IA de auditoria. Mantenha atualizado com as práticas reais da escola.</p>
          {contexto.map((c: any) => (
            <div key={c.secao} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{c.secao.replace(/_/g, ' ')}</p>
                {c.descricao && <span className="text-xs text-gray-400">{c.descricao}</span>}
              </div>
              <textarea
                value={contextoEdit[c.secao] ?? c.conteudo}
                onChange={e => setContextoEdit(prev => ({ ...prev, [c.secao]: e.target.value }))}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <button onClick={() => salvarContexto(c.secao)} disabled={salvandoContexto}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-40">
                {salvandoContexto ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Auditoria */}
      {abaAtiva === 'auditoria' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Auditoria com IA (Gemini Flash)</h2>
            <p className="text-sm text-gray-500">
              O Gemini lê o contexto da escola + todos os itens cadastrados e verifica se fazem sentido, estão nas categorias certas e se há inconsistências.
            </p>
            <button onClick={auditar} disabled={auditando}
              className="bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-40">
              {auditando ? '✨ Auditando...' : '🤖 Rodar auditoria agora'}
            </button>
          </div>

          {relatorio && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <p className="text-sm font-medium text-indigo-800">Resumo</p>
                <p className="text-sm text-indigo-700 mt-1">{relatorio.relatorio?.resumo}</p>
                <p className="text-xs text-indigo-500 mt-2">{relatorio.verificados} item(s) auditados · {relatorio.problemas?.length ?? 0} problema(s) crítico(s)</p>
              </div>

              {relatorio.problemas?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
                  <p className="text-xs font-semibold text-red-700 uppercase">Problemas críticos</p>
                  {relatorio.problemas.map((p: string, i: number) => (
                    <p key={i} className="text-sm text-red-700">• {p}</p>
                  ))}
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 bg-gray-50 border-b">Resultado por item</p>
                <div className="divide-y divide-gray-100">
                  {relatorio.relatorio?.itens?.map((item: any, i: number) => (
                    <div key={i} className="flex items-start justify-between px-4 py-3">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{item.label ?? item.valor}</span>
                        <span className="text-xs text-gray-400 ml-2">{item.categoria}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{item.nota}</p>
                        {item.sugestao && <p className="text-xs text-orange-600 mt-0.5">→ {item.sugestao}</p>}
                      </div>
                      <span className={`text-xs font-semibold ${STATUS_COLOR[item.status] ?? 'text-gray-500'} ml-4 shrink-0`}>
                        {item.status === 'ok' ? '✓ OK' : item.status === 'problema' ? '✗ Problema' : '⚠ Revisar'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {relatorio.relatorio?.sugestoes_gerais?.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-1">
                  <p className="text-xs font-semibold text-blue-700 uppercase">Sugestões gerais</p>
                  {relatorio.relatorio.sugestoes_gerais.map((s: string, i: number) => (
                    <p key={i} className="text-sm text-blue-700">• {s}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
