'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { salvarPrecoReferencia, toggleAtivoPrecoReferencia } from './actions'

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

type Produto = {
  id: string; categoria: string; descricao: string
  valor: number | null; ativo: boolean
}

export default function ProdutosClient({ produtos: inicial }: { produtos: Produto[] }) {
  const router = useRouter()

  const [produtos, setProdutos] = useState(inicial)
  const [adicionando, setAdicionando] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState({ categoria: 'espetaculo_participacao', descricao: '', valor: '' })
  const [salvando, setSalvando] = useState(false)
  const [auditando, setAuditando] = useState(false)
  const [avisoIA, setAvisoIA] = useState('')

  // Auditoria de IA: verifica duplicatas e padrão de nomes
  async function auditarComIA(descricao: string, categoria: string) {
    if (!descricao || descricao.length < 5) return
    setAuditando(true); setAvisoIA('')

    const nomes = produtos.map(p => p.descricao).join('\n')
    const prompt = `Você é um auditor de catálogo de produtos de uma escola de dança.

Produto sendo criado:
- Categoria: ${CAT_LABEL[categoria] ?? categoria}
- Descrição: "${descricao}"

Produtos existentes no catálogo:
${nomes}

Responda em JSON com este formato exato:
{
  "duplicata": true/false,
  "similar": "nome do produto similar se houver, ou null",
  "aviso": "aviso curto em português se houver problema, ou null",
  "ok": true/false
}

Verifique:
1. Se é duplicata exata ou muito similar a algum existente
2. Se o nome segue o padrão do catálogo (categoria — detalhe — lote/variação)
3. Se a nomenclatura pode causar confusão`

    try {
      const res = await fetch('/api/painel/auditar-produto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (data.aviso) setAvisoIA(`⚠️ IA: ${data.aviso}`)
      else if (data.ok) setAvisoIA('✓ Nome aprovado pela IA')
    } catch (_) {}

    setAuditando(false)
  }

  async function salvar() {
    if (!form.descricao || !form.categoria) return
    setSalvando(true)
    try {
      await salvarPrecoReferencia(
        { categoria: form.categoria, descricao: form.descricao, valor: form.valor ? Number(form.valor.replace(',', '.')) : null },
        editandoId ?? undefined
      )
      setAdicionando(false)
      setEditandoId(null)
      setAvisoIA('')
      router.refresh()
    } catch (e) {
      alert('Erro ao salvar: ' + (e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    await toggleAtivoPrecoReferencia(id, ativo)
    setProdutos(p => p.map(x => x.id === id ? { ...x, ativo: !ativo } : x))
  }

  function abrirEdit(p: Produto) {
    setForm({ categoria: p.categoria, descricao: p.descricao, valor: p.valor?.toString().replace('.', ',') ?? '' })
    setEditandoId(p.id)
    setAdicionando(true)
    setAvisoIA('')
  }

  // Agrupa por categoria
  const grupos: Record<string, Produto[]> = {}
  for (const p of produtos) {
    if (!grupos[p.categoria]) grupos[p.categoria] = []
    grupos[p.categoria]!.push(p)
  }

  return (
    <div className="space-y-6">
      {/* Botão adicionar */}
      {!adicionando && (
        <button onClick={() => { setAdicionando(true); setEditandoId(null); setForm({ categoria: 'espetaculo_participacao', descricao: '', valor: '' }); setAvisoIA('') }}
          className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          + Novo produto
        </button>
      )}

      {/* Formulário */}
      {adicionando && (
        <div className="bg-white border border-indigo-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">
            {editandoId ? 'Editar produto' : 'Novo produto'}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Categoria</label>
              <select value={form.categoria} onChange={e => setForm(f => ({...f, categoria: e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {Object.entries(CAT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Preço padrão (R$) — deixe vazio se variável</label>
              <input value={form.valor} onChange={e => setForm(f => ({...f, valor: e.target.value}))}
                placeholder="700,00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nome do produto *
                <span className="text-gray-400 font-normal ml-1">— use o padrão: Categoria — detalhe — lote</span>
              </label>
              <input value={form.descricao}
                onChange={e => setForm(f => ({...f, descricao: e.target.value}))}
                onBlur={() => auditarComIA(form.descricao, form.categoria)}
                placeholder="Ex: Figurino espetáculo — 2 figurinos — 1º lote"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              {auditando && <p className="text-xs text-gray-400 mt-1">🤖 IA verificando...</p>}
              {avisoIA && (
                <p className={`text-xs mt-1 ${avisoIA.startsWith('⚠️') ? 'text-orange-600' : 'text-green-600'}`}>
                  {avisoIA}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => { setAdicionando(false); setEditandoId(null); setAvisoIA('') }}
              className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-lg">Cancelar</button>
            <button onClick={salvar} disabled={salvando || !form.descricao}
              className="bg-indigo-600 text-white text-sm font-medium px-6 py-2 rounded-lg disabled:opacity-50 hover:bg-indigo-700">
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {/* Lista por categoria */}
      {Object.entries(grupos).map(([cat, lista]) => (
        <div key={cat}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {CAT_LABEL[cat] ?? cat}
          </p>
          <div className="space-y-1.5">
            {lista.map(p => (
              <div key={p.id}
                className={`bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 ${!p.ativo ? 'opacity-50' : ''}`}>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{p.descricao}</p>
                </div>
                <div className="text-sm font-semibold text-gray-700 shrink-0">
                  {p.valor ? `R$ ${Number(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'variável'}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => abrirEdit(p)} className="text-xs text-gray-400 hover:text-gray-600">✎</button>
                  <button onClick={() => toggleAtivo(p.id, p.ativo)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.ativo ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${p.ativo ? 'translate-x-4' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
