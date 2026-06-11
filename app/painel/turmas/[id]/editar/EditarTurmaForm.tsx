'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { editarTurma } from '../../actions'

const DIAS = [
  { id: 'segunda', label: 'Seg' }, { id: 'terca', label: 'Ter' },
  { id: 'quarta', label: 'Qua' }, { id: 'quinta', label: 'Qui' },
  { id: 'sexta', label: 'Sex' }, { id: 'sabado', label: 'Sáb' },
  { id: 'domingo', label: 'Dom' },
]

type Horario = { id?: string; dia_semana: string; hora_inicio: string; hora_fim: string }

export default function EditarTurmaForm({ turma, horarios: horariosIniciais, modalidades, professores, salas }: any) {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const [form, setForm] = useState({
    nome: turma.nome ?? '',
    descricao: (turma as any).descricao ?? '',
    modalidade_id: turma.modalidade_id ?? '',
    professor_id: turma.professor_id ?? '',
    sala_id: turma.sala_id ?? '',
    capacidade: turma.capacidade ?? 15,
    nivel: turma.nivel ?? '',
    faixa_etaria_min: turma.faixa_etaria_min ?? '',
    faixa_etaria_max: turma.faixa_etaria_max ?? '',
    preco_padrao: turma.preco_padrao?.toString().replace('.', ',') ?? '',
    status: turma.status ?? 'ativa',
    observacoes: turma.observacoes ?? '',
    data_inicio: turma.data_inicio ?? '',
    data_fim: turma.data_fim ?? '',
  })

  const [horarios, setHorarios] = useState<Horario[]>(horariosIniciais)

  function set(campo: string, valor: any) { setForm(f => ({ ...f, [campo]: valor })) }

  function calcularCarga(hs: Horario[]) {
    const totalMin = hs.reduce((acc, h) => {
      const [hi, mi] = h.hora_inicio.split(':').map(Number)
      const [hf, mf] = h.hora_fim.split(':').map(Number)
      return acc + (hf * 60 + mf) - (hi * 60 + mi)
    }, 0)
    const dias = hs.length
    const minPorDia = dias > 0 ? Math.round(totalMin / dias) : 0
    const h = Math.floor(minPorDia / 60), m = minPorDia % 60
    return { dias, durStr: m > 0 ? `${h}h${m}min` : `${h}h`, totalMin }
  }

  const TABELA_MENSAL: Record<string, Record<string, number>> = {
    '1': { '60': 166, '90': 190 },
    '2': { '60': 290, '90': 330 },
    '3': { '60': 330, '90': 305 },
    '4': { '60': 305, '90': 415 },
    '5': { '60': 416, '90': 485 },
  }
  function sugerirPreco(hs: Horario[]): number | null {
    if (hs.length === 0) return null
    const totalMin = hs.reduce((acc, h) => {
      const [hi, mi] = h.hora_inicio.split(':').map(Number)
      const [hf, mf] = h.hora_fim.split(':').map(Number)
      return acc + (hf * 60 + mf) - (hi * 60 + mi)
    }, 0)
    const minPorDia = Math.round(totalMin / hs.length)
    const durKey = minPorDia <= 60 ? '60' : '90'
    return TABELA_MENSAL[String(Math.min(hs.length, 5))]?.[durKey] ?? null
  }

  function addHorario() { setHorarios(h => [...h, { dia_semana: 'segunda', hora_inicio: '18:00', hora_fim: '19:00' }]) }
  function removeHorario(i: number) { setHorarios(h => h.filter((_, idx) => idx !== i)) }
  function setHorario(i: number, campo: keyof Horario, valor: string) {
    setHorarios(h => h.map((item, idx) => idx === i ? { ...item, [campo]: valor } : item))
  }

  async function salvar() {
    setErro('')
    if (!form.nome || !form.modalidade_id || !form.preco_padrao) {
      setErro('Nome, modalidade e preço são obrigatórios.')
      return
    }
    setSalvando(true)

    try {
      await editarTurma(
        turma.id,
        {
          nome: form.nome,
          descricao: form.descricao || null,
          modalidade_id: form.modalidade_id,
          professor_id: form.professor_id || null,
          sala_id: form.sala_id || null,
          capacidade: Number(form.capacidade),
          nivel: form.nivel || null,
          faixa_etaria_min: form.faixa_etaria_min ? Number(form.faixa_etaria_min) : null,
          faixa_etaria_max: form.faixa_etaria_max ? Number(form.faixa_etaria_max) : null,
          preco_padrao: Number(form.preco_padrao.replace(',', '.')),
          status: form.status,
          observacoes: form.observacoes || null,
          data_inicio: form.data_inicio || null,
          data_fim: form.data_fim || null,
        } as any,
        horarios.map((h: any) => ({ dia_semana: h.dia_semana, hora_inicio: h.hora_inicio, hora_fim: h.hora_fim }))
      )
      router.push(`/painel/turmas/${turma.id}`)
    } catch (e) {
      setErro((e as Error).message)
      setSalvando(false)
    }
  }

  const { dias, durStr, totalMin } = calcularCarga(horarios)
  const totalM = totalMin % 60

  return (
    <div className="space-y-6">
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Dados da turma</h2>

        <div><label className="block text-xs font-medium text-gray-600 mb-1">Nome *</label>
          <input value={form.nome} onChange={e => set('nome', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>

        <div><label className="block text-xs font-medium text-gray-600 mb-1">Descrição curta</label>
          <input value={form.descricao} onChange={e => set('descricao', e.target.value)}
            placeholder="Ex: Ballet para iniciantes, 2x por semana, 1h de aula"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Modalidade *</label>
            <select value={form.modalidade_id} onChange={e => set('modalidade_id', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {modalidades.map((m: any) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select></div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Preço mensal (R$) *</label>
              {(() => { const s = sugerirPreco(horarios); return s ? <button type="button" onClick={() => set('preco_padrao', String(s).replace('.', ','))} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Tabela: R$ {s.toLocaleString('pt-BR')} →</button> : null })()}
            </div>
            <input value={form.preco_padrao} onChange={e => set('preco_padrao', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Professor</label>
            <select value={form.professor_id} onChange={e => set('professor_id', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">— Sem professor —</option>
              {professores.map((p: any) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Sala</label>
            <select value={form.sala_id} onChange={e => set('sala_id', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">— Sem sala fixa —</option>
              {salas.map((s: any) => <option key={s.id} value={s.id}>{s.nome}{s.capacidade_max ? ` (máx ${s.capacidade_max})` : ''}</option>)}
            </select></div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Capacidade</label>
            <input type="number" value={form.capacidade} onChange={e => set('capacidade', e.target.value)} min={1}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Idade mín.</label>
            <input type="number" value={form.faixa_etaria_min} onChange={e => set('faixa_etaria_min', e.target.value)} placeholder="Ex: 6"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Idade máx.</label>
            <input type="number" value={form.faixa_etaria_max} onChange={e => set('faixa_etaria_max', e.target.value)} placeholder="Ex: 12"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Nível</label>
            <input value={form.nivel} onChange={e => set('nivel', e.target.value)} placeholder="Básico, Intermediário..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="ativa">Ativa</option>
              <option value="suspensa">Suspensa</option>
              <option value="encerrada">Encerrada</option>
            </select></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Início do ciclo</label>
            <input type="date" value={form.data_inicio} onChange={e => set('data_inicio', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Fim previsto</label>
            <input type="date" value={form.data_fim} onChange={e => set('data_fim', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Horários recorrentes</h2>
          <button onClick={addHorario} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">+ Adicionar</button>
        </div>

        {dias > 0 && (
          <div className="bg-indigo-50 rounded-lg px-4 py-2 text-xs text-indigo-700 font-medium">
            {dias}x por semana · {durStr}/aula · {totalM > 0 ? `${Math.floor(totalMin/60)}h${totalM}min` : `${Math.floor(totalMin/60)}h`}/semana
          </div>
        )}

        {horarios.map((h, i) => (
          <div key={i} className="flex items-center gap-3">
            <select value={h.dia_semana} onChange={e => setHorario(i, 'dia_semana', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {DIAS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
            <input type="time" value={h.hora_inicio} onChange={e => setHorario(i, 'hora_inicio', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <span className="text-gray-400 text-sm">até</span>
            <input type="time" value={h.hora_fim} onChange={e => setHorario(i, 'hora_fim', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onClick={() => removeHorario(i)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
          </div>
        ))}
      </section>

      {erro && <p className="text-sm text-red-500">{erro}</p>}

      <div className="flex gap-3">
        <button onClick={salvar} disabled={salvando}
          className="bg-indigo-600 text-white font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {salvando ? 'Salvando...' : 'Salvar alterações'}
        </button>
        <a href={`/painel/turmas/${turma.id}`} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5">Cancelar</a>
      </div>
    </div>
  )
}
