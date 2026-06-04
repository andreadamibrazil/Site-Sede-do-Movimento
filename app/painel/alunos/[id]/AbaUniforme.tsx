'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const ITENS = [
  { id: 'camisa', label: 'Camisa' },
  { id: 'collant', label: 'Collant' },
  { id: 'saia', label: 'Saia' },
  { id: 'short', label: 'Short' },
  { id: 'meia', label: 'Meia' },
  { id: 'kimono', label: 'Kimono' },
  { id: 'sapatilha', label: 'Sapatilha' },
  { id: 'outro', label: 'Outro' },
]

const TAMANHOS = ['PP', 'P', 'M', 'G', 'GG', '2', '4', '6', '8', '10', '12', '14', '16', 'único']

type Retirada = {
  id: string
  item: string
  tamanho: string
  quantidade: number
  valor: number | null
  observacao: string | null
  responsavel_nome: string | null
  assinado: boolean
  created_at: string
}

export default function AbaUniforme({ alunoId, retiradas: inicial }: { alunoId: string; retiradas: Retirada[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [lista, setLista] = useState(inicial)
  const [form, setForm] = useState({ item: 'camisa', tamanho: 'M', quantidade: 1, valor: '', observacao: '', responsavel_nome: '' })
  const [salvando, setSalvando] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)

  function set(campo: string, v: any) { setForm(f => ({ ...f, [campo]: v })) }

  async function salvar() {
    setSalvando(true)
    const { data, error } = await (supabase as any).from('uniforme_retiradas').insert({
      aluno_id: alunoId,
      item: form.item,
      tamanho: form.tamanho,
      quantidade: Number(form.quantidade),
      valor: form.valor ? Number(form.valor.toString().replace(',', '.')) : null,
      observacao: form.observacao || null,
      responsavel_nome: form.responsavel_nome || null,
    }).select().single()

    setSalvando(false)
    if (!error && data) {
      setLista(l => [data, ...l])
      setMostrarForm(false)
      setForm({ item: 'camisa', tamanho: 'M', quantidade: 1, valor: '', observacao: '', responsavel_nome: '' })
      router.refresh()
    }
  }

  const ITEM_LABEL: Record<string, string> = Object.fromEntries(ITENS.map(i => [i.id, i.label]))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Retirada de Uniforme</h2>
        <button onClick={() => setMostrarForm(!mostrarForm)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
          + Registrar retirada
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Item *</label>
              <select value={form.item} onChange={e => set('item', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {ITENS.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tamanho *</label>
              <select value={form.tamanho} onChange={e => set('tamanho', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {TAMANHOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade</label>
              <input type="number" min={1} value={form.quantidade} onChange={e => set('quantidade', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Valor (R$)</label>
              <input value={form.valor} onChange={e => set('valor', e.target.value)} placeholder="0,00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Responsável pela retirada</label>
            <input value={form.responsavel_nome} onChange={e => set('responsavel_nome', e.target.value)}
              placeholder="Nome de quem retirou"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observação</label>
            <input value={form.observacao} onChange={e => set('observacao', e.target.value)}
              placeholder="Ex: uniforme de dança do ventre, turma Jazz Adulto"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMostrarForm(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-xl hover:bg-gray-50">Cancelar</button>
            <button onClick={salvar} disabled={salvando} className="flex-1 bg-indigo-600 text-white text-sm font-medium py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-40">
              {salvando ? 'Salvando...' : 'Registrar'}
            </button>
          </div>
        </div>
      )}

      {lista.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Nenhuma retirada registrada.</p>
      ) : (
        <div className="space-y-2">
          {lista.map(r => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {ITEM_LABEL[r.item] ?? r.item} — Tam. {r.tamanho}
                  {r.quantidade > 1 ? ` (${r.quantidade}x)` : ''}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(r.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  {r.responsavel_nome ? ` · ${r.responsavel_nome}` : ''}
                  {r.observacao ? ` · ${r.observacao}` : ''}
                </p>
              </div>
              <div className="text-right">
                {r.valor && <p className="text-sm font-semibold text-gray-700">R$ {Number(r.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>}
                {r.assinado
                  ? <span className="text-xs text-green-600">✓ Assinado</span>
                  : <span className="text-xs text-orange-500">Pendente</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
