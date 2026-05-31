'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Professor = {
  id: string
  nome: string
  email: string | null
  celular: string | null
  forma_pagamento: string
  valor_base: number | null
  ativo: boolean
  observacoes: string | null
}

const FORMAS = [
  { id: 'fixo_mensal', label: 'Fixo mensal' },
  { id: 'por_aluno',   label: 'Por aluno' },
  { id: 'percentual',  label: 'Percentual' },
  { id: 'diaria',      label: 'Diária' },
]

export default function ProfessoresClient({ professores: inicial }: { professores: Professor[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [lista, setLista] = useState(inicial)
  const [editando, setEditando] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Professor>>({})
  const [salvando, setSalvando] = useState(false)

  async function toggleAtivo(id: string, ativo: boolean) {
    await supabase.from('professores').update({ ativo: !ativo }).eq('id', id)
    setLista(l => l.map(p => p.id === id ? { ...p, ativo: !ativo } : p))
  }

  function abrirEdit(p: Professor) {
    setForm({ nome: p.nome, email: p.email ?? '', celular: p.celular ?? '', forma_pagamento: p.forma_pagamento, valor_base: p.valor_base, observacoes: p.observacoes ?? '' })
    setEditando(p.id)
  }

  async function salvarEdit() {
    if (!editando) return
    setSalvando(true)
    await supabase.from('professores').update({
      nome: form.nome,
      email: form.email || null,
      celular: form.celular || null,
      forma_pagamento: form.forma_pagamento as 'fixo_mensal' | 'por_aluno' | 'percentual' | 'diaria' | undefined,
      valor_base: form.valor_base || null,
      observacoes: form.observacoes || null,
    }).eq('id', editando)
    setSalvando(false)
    setEditando(null)
    router.refresh()
  }

  const ativos = lista.filter(p => p.ativo)
  const inativos = lista.filter(p => !p.ativo)

  return (
    <div className="space-y-6">
      {/* Ativos */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Ativos ({ativos.length})
        </p>
        <div className="space-y-1.5">
          {ativos.map(p => <CardProfessor key={p.id} p={p} onToggle={toggleAtivo} onEdit={abrirEdit} />)}
        </div>
      </div>

      {/* Inativos */}
      {inativos.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Inativos ({inativos.length}) — não aparecem na agenda
          </p>
          <div className="space-y-1.5 opacity-50">
            {inativos.map(p => <CardProfessor key={p.id} p={p} onToggle={toggleAtivo} onEdit={abrirEdit} />)}
          </div>
        </div>
      )}

      {/* Modal edição */}
      {editando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setEditando(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-semibold text-gray-900">Editar professor</h2>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nome</label>
              <input value={form.nome ?? ''} onChange={e => setForm(f => ({...f, nome: e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Celular</label>
                <input value={form.celular ?? ''} onChange={e => setForm(f => ({...f, celular: e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input value={form.email ?? ''} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Forma de pagamento</label>
                <select value={form.forma_pagamento ?? 'fixo_mensal'} onChange={e => setForm(f => ({...f, forma_pagamento: e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {FORMAS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Valor base (R$)</label>
                <input type="number" value={form.valor_base ?? ''} onChange={e => setForm(f => ({...f, valor_base: Number(e.target.value)}))}
                  placeholder="Ex: 2000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setEditando(null)} className="flex-1 text-sm text-gray-500 border border-gray-200 py-2.5 rounded-xl">Cancelar</button>
              <button onClick={salvarEdit} disabled={salvando}
                className="flex-1 bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CardProfessor({ p, onToggle, onEdit }: { p: Professor; onToggle: (id: string, ativo: boolean) => void; onEdit: (p: Professor) => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{p.nome}</p>
        {p.email && <p className="text-xs text-gray-400 truncate">{p.email}</p>}
      </div>
      <div className="text-xs text-gray-400 shrink-0">
        {FORMAS.find(f => f.id === p.forma_pagamento)?.label ?? p.forma_pagamento}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => onEdit(p)} className="text-xs text-gray-400 hover:text-gray-600">✎</button>
        <button
          onClick={() => onToggle(p.id, p.ativo)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.ativo ? 'bg-indigo-600' : 'bg-gray-200'}`}>
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${p.ativo ? 'translate-x-4' : 'translate-x-1'}`} />
        </button>
      </div>
    </div>
  )
}
