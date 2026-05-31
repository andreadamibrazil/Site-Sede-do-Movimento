'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Só as 6 salas reais — borda esquerda colorida, fundo branco
const SALA_COR: Record<string, { border: string; dot: string; label: string }> = {
  'Amarela': { border: 'border-l-yellow-400',  dot: 'bg-yellow-400',  label: 'Amarela' },
  'Branca':  { border: 'border-l-slate-400',   dot: 'bg-slate-400',   label: 'Branca'  },
  'Verde':   { border: 'border-l-emerald-500', dot: 'bg-emerald-500', label: 'Verde'   },
  'Azul':    { border: 'border-l-blue-500',    dot: 'bg-blue-500',    label: 'Azul'    },
  'Lilás':   { border: 'border-l-purple-400',  dot: 'bg-purple-400',  label: 'Lilás'   },
  'Roxa':    { border: 'border-l-violet-600',  dot: 'bg-violet-600',  label: 'Roxa'    },
}

const DIAS = ['Seg','Ter','Qua','Qui','Sex']

type Aula = {
  id: string; data: string; hora_inicio: string; hora_fim: string
  status: string; chamada_concluida_em: string | null
  turmas: { id: string; nome: string; professores: { id: string; nome: string } | null; salas: { id: string; nome: string } | null } | null
  presencas: { id: string }[]
}

export default function AgendaGrid({ aulas, pendentes, datas, hojeStr, isAdmin, salas, professores }: {
  aulas: Aula[]; pendentes: any[]; datas: string[]; hojeStr: string
  isAdmin: boolean; salas: { id: string; nome: string }[]; professores: { id: string; nome: string }[]
}) {
  const supabase = createClient()
  const router = useRouter()
  const [editando, setEditando] = useState<{ turmaId: string; aula: Aula } | null>(null)
  const [editForm, setEditForm] = useState({ nome: '', sala_id: '', professor_id: '' })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  function abrirEdit(aula: Aula, e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    if (!aula.turmas) return
    setEditForm({
      nome: aula.turmas.nome,
      sala_id: aula.turmas.salas?.id ?? '',
      professor_id: aula.turmas.professores?.id ?? '',
    })
    setEditando({ turmaId: aula.turmas.id, aula })
    setErro('')
  }

  async function salvarEdit() {
    if (!editando) return
    setSalvando(true); setErro('')
    const { error } = await supabase.from('turmas').update({
      nome: editForm.nome || editando.aula.turmas!.nome,
      sala_id: editForm.sala_id || null,
      professor_id: editForm.professor_id || null,
    }).eq('id', editando.turmaId)
    if (error) { setErro(error.message); setSalvando(false); return }
    setSalvando(false); setEditando(null)
    router.refresh()
  }

  // Agrupa por dia
  const porDia: Record<string, Aula[]> = {}
  for (const d of datas) porDia[d] = []
  for (const a of aulas) { if (porDia[a.data]) porDia[a.data]!.push(a) }

  return (
    <div className="flex flex-col h-full">
      {/* Pendentes */}
      {pendentes.length > 0 && (
        <div className="mx-4 mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-red-600">⚠️ {pendentes.length} chamada{pendentes.length>1?'s':''} pendente{pendentes.length>1?'s':''}:</span>
          {pendentes.map((a:any)=>(
            <a key={a.id} href={`/painel/chamada/${a.id}`}
              className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-lg hover:bg-red-200">
              {a.turmas?.nome} →
            </a>
          ))}
        </div>
      )}

      {/* Legenda */}
      <div className="mx-4 mt-2 flex items-center gap-4 flex-wrap">
        <span className="text-xs text-gray-400">Salas:</span>
        {Object.entries(SALA_COR).map(([nome, cor]) => (
          <div key={nome} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${cor.dot}`}/>
            <span className="text-xs text-gray-500">{nome}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-200"/>
          <span className="text-xs text-gray-400">Sem sala</span>
        </div>
      </div>

      {/* Grade */}
      <div className="flex-1 overflow-x-auto mt-2 px-4 pb-6">
        <div className="min-w-[680px]">
          {/* Header */}
          <div className="grid grid-cols-5 gap-2 mb-2">
            {datas.map((data, idx) => {
              const isHoje = data === hojeStr
              const d = new Date(data+'T12:00:00')
              return (
                <div key={data} className={`text-center py-2 rounded-xl ${isHoje?'bg-indigo-600 text-white':'text-gray-500'}`}>
                  <p className="text-sm font-semibold">{DIAS[idx]}</p>
                  <p className={`text-xs ${isHoje?'text-indigo-200':'text-gray-400'}`}>
                    {d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Colunas */}
          <div className="grid grid-cols-5 gap-2 items-start">
            {datas.map((data) => {
              const lista = (porDia[data]??[]).sort((a,b)=>a.hora_inicio.localeCompare(b.hora_inicio))
              const isHoje = data === hojeStr
              return (
                <div key={data} className={`space-y-1 min-h-[120px] rounded-xl p-0.5 ${isHoje?'bg-indigo-50/40':''}`}>
                  {lista.map(aula => {
                    const nomeSala = aula.turmas?.salas?.nome ?? ''
                    const cor = SALA_COR[nomeSala]
                    const concluida = !!aula.chamada_concluida_em
                    const presentes = aula.presencas?.length ?? 0
                    return (
                      <div key={aula.id} className="group relative">
                        <a
                          href={`/painel/chamada/${aula.id}`}
                          className={`block bg-white rounded-lg border border-gray-100 border-l-4 px-2 py-1.5 hover:shadow-sm transition-shadow ${
                            cor ? cor.border : 'border-l-gray-200'
                          } ${concluida?'opacity-50':''}`}
                        >
                          <p className="text-xs font-semibold text-gray-900 leading-tight">{aula.turmas?.nome ?? '—'}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {aula.hora_inicio?.slice(0,5)}–{aula.hora_fim?.slice(0,5)}
                          </p>
                          <div className="flex justify-between items-center mt-0.5">
                            <span className="text-xs text-gray-500">
                              {presentes>0?`${presentes} al.`:''}
                            </span>
                            {concluida && <span className="text-xs text-green-500">✓</span>}
                            {!concluida && isHoje && <span className="text-xs text-indigo-500 font-medium">→</span>}
                          </div>
                        </a>
                        {isAdmin && (
                          <button
                            onClick={e=>abrirEdit(aula,e)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs w-5 h-5 rounded flex items-center justify-center"
                          >✎</button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Modal edição */}
      {editando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={()=>setEditando(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e=>e.stopPropagation()}>
            <h2 className="text-base font-semibold text-gray-900 mb-1">{editando.aula.turmas?.nome}</h2>
            <p className="text-xs text-gray-400 mb-4">Editando turma — mudanças ficam salvas no histórico</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nome da turma</label>
                <input value={editForm.nome} onChange={e=>setEditForm(f=>({...f,nome:e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Sala</label>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={()=>setEditForm(f=>({...f,sala_id:''}))}
                    className={`py-2 rounded-lg border text-xs transition-colors ${!editForm.sala_id?'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium':'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    Sem sala
                  </button>
                  {salas.map(sala=>{
                    const cor = SALA_COR[sala.nome]
                    const sel = editForm.sala_id === sala.id
                    return (
                      <button key={sala.id} onClick={()=>setEditForm(f=>({...f,sala_id:sala.id}))}
                        className={`py-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                          sel?'border-indigo-500 ring-1 ring-indigo-300':'border-gray-200 hover:border-gray-300'
                        }`}>
                        {cor&&<div className={`w-2.5 h-2.5 rounded-full ${cor.dot}`}/>}
                        {sala.nome}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Professor</label>
                <select value={editForm.professor_id} onChange={e=>setEditForm(f=>({...f,professor_id:e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">— Sem professor —</option>
                  {professores.map(p=><option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>

              {erro && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{erro}</p>}
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={()=>setEditando(null)}
                className="flex-1 text-sm text-gray-500 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={salvarEdit} disabled={salvando}
                className="flex-1 bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                {salvando?'Salvando...':'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
