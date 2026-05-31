'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Aluno = { id: string; nome: string; status_pedagogico: string }
type Preco = { id: string; categoria: string; descricao: string; valor: number | null }

const CAT_LABEL: Record<string, string> = {
  taxa_matricula: 'Taxa de matrícula',
  espetaculo_participacao: 'Espetáculo — participação',
  espetaculo_figurino: 'Espetáculo — figurino',
  espetaculo_foto: 'Foto do espetáculo',
  espetaculo_programa: 'Programa/PlayBill',
  pratica_montagem: 'Prática de Montagem',
  workshop: 'Workshop',
  aula_particular: 'Aula particular',
  uniforme: 'Uniforme',
  aluguel_sala: 'Aluguel de sala',
  ensaio_extra: 'Ensaio extra',
  outro: 'Outro',
}

export default function CobrancaLoteClient({ alunos, precos }: { alunos: Aluno[]; precos: Preco[] }) {
  const supabase = createClient()
  const router = useRouter()

  const [busca, setBusca] = useState('')
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [precoSelecionado, setPrecoSelecionado] = useState<Preco | null>(null)
  const [form, setForm] = useState({
    descricao: '',
    descricao_detalhada: '',
    preco_unitario: '',
    quantidade: '1',
    vencimento: '',
    categoria_custom: '',
  })
  const [salvando, setSalvando] = useState(false)
  const [resultado, setResultado] = useState<{ ok: number; erro: number } | null>(null)

  const alunosFiltrados = useMemo(() =>
    alunos.filter(a => a.nome.toLowerCase().includes(busca.toLowerCase())),
    [alunos, busca]
  )

  function toggleAluno(id: string) {
    setSelecionados(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selecionarTodos() {
    if (selecionados.size === alunosFiltrados.length) {
      setSelecionados(new Set())
    } else {
      setSelecionados(new Set(alunosFiltrados.map(a => a.id)))
    }
  }

  function selecionarPreco(p: Preco) {
    setPrecoSelecionado(p)
    setForm(f => ({
      ...f,
      descricao: p.descricao,
      preco_unitario: p.valor?.toString().replace('.', ',') ?? '',
    }))
  }

  const qtd = Number(form.quantidade) || 1
  const unitario = Number(form.preco_unitario.replace(',', '.')) || 0
  const total = unitario * qtd

  async function lancar() {
    if (!selecionados.size || !form.descricao || !unitario) return
    setSalvando(true)

    let ok = 0, erro = 0
    const alunosArr = Array.from(selecionados)

    for (const aluno_id of alunosArr) {
      const { error } = await supabase.from('cobrancas_avulsas').insert({
        aluno_id,
        categoria: (precoSelecionado?.categoria as any) ?? 'outro',
        categoria_custom: form.categoria_custom || null,
        descricao: form.descricao,
        descricao_detalhada: form.descricao_detalhada || null,
        valor: total,
        preco_unitario: unitario,
        quantidade: qtd,
        vencimento: form.vencimento || null,
        status: 'pendente',
      })
      if (error) erro++; else ok++
    }

    setSalvando(false)
    setResultado({ ok, erro })
    setSelecionados(new Set())
  }

  if (resultado) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-5xl">{resultado.erro === 0 ? '✅' : '⚠️'}</div>
        <h2 className="text-xl font-semibold text-gray-900">
          {resultado.ok} cobrança{resultado.ok !== 1 ? 's' : ''} lançada{resultado.ok !== 1 ? 's' : ''}
        </h2>
        {resultado.erro > 0 && <p className="text-sm text-red-500">{resultado.erro} com erro</p>}
        <p className="text-sm text-gray-500">
          Total lançado: R$ {(total * resultado.ok).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => setResultado(null)}
            className="border border-gray-200 text-gray-600 text-sm px-5 py-2 rounded-lg hover:bg-gray-50">
            Fazer outra
          </button>
          <a href="/painel/financeiro"
            className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-indigo-700">
            Ver financeiro
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Coluna esquerda — selecionar alunos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            Alunos ({selecionados.size} selecionados)
          </h2>
          <button onClick={selecionarTodos} className="text-xs text-indigo-600 hover:text-indigo-700">
            {selecionados.size === alunosFiltrados.length ? 'Desmarcar todos' : 'Selecionar todos'}
          </button>
        </div>

        <input value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="🔍 Buscar aluno..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />

        <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[420px] overflow-y-auto">
          {alunosFiltrados.map(a => (
            <label key={a.id}
              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${
                selecionados.has(a.id) ? 'bg-indigo-50' : 'hover:bg-gray-50'
              }`}>
              <input type="checkbox" checked={selecionados.has(a.id)}
                onChange={() => toggleAluno(a.id)}
                className="rounded text-indigo-600" />
              <span className="text-sm text-gray-900">{a.nome}</span>
            </label>
          ))}
          {!alunosFiltrados.length && (
            <p className="text-sm text-gray-400 text-center py-6">Nenhum aluno encontrado.</p>
          )}
        </div>
      </div>

      {/* Coluna direita — configurar cobrança */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Configurar cobrança</h2>

        {/* Produtos pré-configurados */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Selecionar produto cadastrado:</p>
          <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
            {precos.map(p => (
              <button key={p.id} onClick={() => selecionarPreco(p)}
                className={`text-left text-xs px-3 py-2 rounded-lg border transition-colors ${
                  precoSelecionado?.id === p.id
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                <p className="font-medium truncate">{p.descricao}</p>
                {p.valor && <p className="text-gray-400 mt-0.5">R$ {Number(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descrição *</label>
            <input value={form.descricao} onChange={e => setForm(f => ({...f, descricao: e.target.value}))}
              placeholder="Ex: Taxa de participação Espetáculo 2026 — 1º lote"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Descrição detalhada <span className="text-gray-400">(opcional — explica o que está sendo comprado)</span>
            </label>
            <textarea value={form.descricao_detalhada}
              onChange={e => setForm(f => ({...f, descricao_detalhada: e.target.value}))}
              rows={2}
              placeholder="Ex: Inclui blusa exclusiva + 2 convites gratuitos. Pagamento em até 3x."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Preço unit. (R$) *</label>
              <input value={form.preco_unitario}
                onChange={e => setForm(f => ({...f, preco_unitario: e.target.value}))}
                placeholder="700,00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Qtd.</label>
              <input type="number" min={1} value={form.quantidade}
                onChange={e => setForm(f => ({...f, quantidade: e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vencimento</label>
              <input type="date" value={form.vencimento}
                onChange={e => setForm(f => ({...f, vencimento: e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {/* Resumo */}
          {unitario > 0 && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{qtd}× R$ {unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="font-semibold text-gray-900">= R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por aluno</span>
              </div>
              {selecionados.size > 0 && (
                <div className="flex justify-between text-gray-500 mt-1 text-xs">
                  <span>{selecionados.size} aluno{selecionados.size !== 1 ? 's' : ''}</span>
                  <span className="font-semibold text-indigo-600">
                    Total geral: R$ {(total * selecionados.size).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <button onClick={lancar}
          disabled={salvando || !selecionados.size || !form.descricao || !unitario}
          className="w-full bg-indigo-600 text-white font-medium text-sm py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-colors">
          {salvando
            ? 'Lançando...'
            : `Lançar para ${selecionados.size} aluno${selecionados.size !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  )
}
