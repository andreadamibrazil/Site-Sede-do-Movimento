'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { registrarPagamento as registrarPagamentoAction } from './actions'

const FILTROS = [
  { id: 'aberta,em_atraso', label: 'A receber' },
  { id: 'em_atraso',        label: 'Em atraso' },
  { id: 'aberta',           label: 'Em dia' },
  { id: 'recebida',         label: 'Pagas' },
  { id: 'aberta,em_atraso,recebida,renegociada,cancelada', label: 'Todas' },
]

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  aberta:      { label: 'Em aberto',   className: 'bg-gray-100 text-gray-600' },
  em_atraso:   { label: 'Em atraso',   className: 'bg-orange-100 text-orange-700' },
  recebida:    { label: 'Paga',        className: 'bg-green-100 text-green-700' },
  renegociada: { label: 'Renegociada', className: 'bg-blue-100 text-blue-700' },
  cancelada:   { label: 'Cancelada',   className: 'bg-gray-100 text-gray-400' },
}

type Mensalidade = {
  id: string
  competencia: string
  valor: number
  vencimento: string
  status: string
  valor_pago: number | null
  pago_em: string | null
}

type Grupo = {
  aluno: { id: string; nome: string; celular: string | null; status_financeiro: string }
  mensalidades: Mensalidade[]
}

export default function FinanceiroClient({
  grupos,
  filtroAtual,
  buscaAtual,
}: {
  grupos: Grupo[]
  filtroAtual: string
  buscaAtual: string
}) {
  const router = useRouter()

  const [pagando, setPagando] = useState<string | null>(null) // mensalidade id
  const [forma, setForma] = useState('pix')
  const [valorPago, setValorPago] = useState('')
  const [, setObsReg] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [busca, setBusca] = useState(buscaAtual)
  const fileRef = useRef<HTMLInputElement>(null)
  const [comprovante, setComprovante] = useState<File | null>(null)

  function navegar(filtro: string) {
    router.push(`/painel/financeiro?filtro=${filtro}${busca ? `&busca=${busca}` : ''}`)
  }

  function pesquisar(texto: string) {
    setBusca(texto)
    router.push(`/painel/financeiro?filtro=${filtroAtual}${texto ? `&busca=${texto}` : ''}`)
  }

  function abrirPagamento(mensId: string, valor: number) {
    setPagando(mensId)
    setValorPago(valor.toFixed(2).replace('.', ','))
    setForma('pix')
    setObsReg('')
    setComprovante(null)
  }

  async function registrarPagamento() {
    if (!pagando) return
    setSalvando(true)

    const valorNum = Number(valorPago.replace(',', '.'))
    let comprovanteUrl: string | null = null

    // Upload comprovante client-side (storage direto do browser)
    if (comprovante) {
      const { createClient } = await import('@/lib/supabase/client')
      const storageClient = createClient()
      const path = `comprovantes/${pagando}/${Date.now()}.${comprovante.name.split('.').pop()}`
      const { data: upData } = await storageClient.storage
        .from('documentos-alunos')
        .upload(path, comprovante)
      if (upData?.path) comprovanteUrl = upData.path
    }

    try {
      await registrarPagamentoAction({
        mensalidadeId: pagando,
        valor: valorNum,
        forma,
        comprovanteUrl,
      })
      setPagando(null)
      router.refresh()
    } catch (e) {
      alert('Erro ao registrar pagamento: ' + (e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  function fmtData(iso: string) {
    return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  function fmtMes(iso: string) {
    return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  function fmtValor(v: number) {
    return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  }

  const diasAtraso = (vencimento: string) => {
    const diff = Math.floor((Date.now() - new Date(vencimento + 'T12:00:00').getTime()) / 86400000)
    return diff > 0 ? diff : 0
  }

  return (
    <div className="space-y-4">
      {/* Filtros + busca */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {FILTROS.map(f => (
            <button key={f.id} onClick={() => navegar(f.id)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                filtroAtual === f.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input value={busca} onChange={e => pesquisar(e.target.value)}
            placeholder="Buscar aluno..."
            className="pl-8 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      {/* Lista por aluno */}
      {grupos.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-sm">Nenhuma mensalidade encontrada.</p>
          <p className="text-gray-300 text-xs mt-1">As mensalidades são geradas ao criar matrículas.</p>
        </div>
      ) : grupos.map(({ aluno, mensalidades }) => {
        const totalGrupo = mensalidades.reduce((a, m) => a + Number(m.valor), 0)
        return (
          <div key={aluno.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Header do aluno */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <a href={`/painel/alunos/${aluno.id}?aba=financeiro`}
                  className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                  {aluno.nome}
                </a>
                {aluno.celular && (
                  <p className="text-xs text-gray-400 mt-0.5">{formatarCelular(aluno.celular)}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  R$ {fmtValor(totalGrupo)}
                </p>
                <p className="text-xs text-gray-400">{mensalidades.length} mensalidade{mensalidades.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Mensalidades */}
            <div className="divide-y divide-gray-50">
              {mensalidades.map(m => {
                const atraso = m.status === 'em_atraso' ? diasAtraso(m.vencimento) : 0
                const badge = STATUS_BADGE[m.status] ?? { label: m.status, className: 'bg-gray-100 text-gray-500' }
                const isPagando = pagando === m.id

                return (
                  <div key={m.id}>
                    <div className="px-4 py-3 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">{fmtMes(m.competencia)}</p>
                        <p className="text-xs text-gray-400">
                          Vence {fmtData(m.vencimento)}
                          {atraso > 0 && <span className="text-orange-500 ml-1">· {atraso} dias em atraso</span>}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 shrink-0">
                        R$ {fmtValor(Number(m.valor))}
                      </p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}>
                        {badge.label}
                      </span>
                      {m.status !== 'recebida' && m.status !== 'cancelada' && (
                        <button
                          onClick={() => isPagando ? setPagando(null) : abrirPagamento(m.id, Number(m.valor))}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg shrink-0 transition-colors ${
                            isPagando
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}>
                          {isPagando ? 'Cancelar' : 'Registrar pagamento'}
                        </button>
                      )}
                      {m.status === 'recebida' && m.pago_em && (
                        <p className="text-xs text-green-600 shrink-0">
                          ✓ {fmtData(m.pago_em.split('T')[0])}
                        </p>
                      )}
                    </div>

                    {/* Formulário inline de pagamento */}
                    {isPagando && (
                      <div className="px-4 pb-4 bg-indigo-50 border-t border-indigo-100 space-y-3">
                        <p className="text-xs font-semibold text-indigo-700 pt-3">Registrar recebimento</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Forma de pagamento</label>
                            <select value={forma} onChange={e => setForma(e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                              <option value="pix">PIX</option>
                              <option value="dinheiro">Dinheiro</option>
                              <option value="cartao">Cartão</option>
                              <option value="transferencia">Transferência</option>
                              <option value="boleto">Boleto</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Valor recebido (R$)</label>
                            <input value={valorPago} onChange={e => setValorPago(e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                          </div>
                        </div>

                        {/* Upload comprovante */}
                        <div>
                          <input ref={fileRef} type="file" onChange={e => setComprovante(e.target.files?.[0] ?? null)}
                            className="hidden" id={`comp-${m.id}`} accept="image/*,application/pdf" />
                          <label htmlFor={`comp-${m.id}`}
                            className="flex items-center gap-2 text-xs text-indigo-600 cursor-pointer hover:text-indigo-700">
                            <span>📎</span>
                            {comprovante ? comprovante.name : 'Anexar comprovante (opcional)'}
                          </label>
                        </div>

                        <button onClick={registrarPagamento} disabled={salvando}
                          className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                          {salvando ? 'Salvando...' : 'Confirmar recebimento'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function formatarCelular(cel: string) {
  const n = cel.replace(/\D/g, '')
  if (n.length === 11) return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`
  if (n.length === 10) return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`
  return cel
}
