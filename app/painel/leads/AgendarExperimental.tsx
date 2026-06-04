'use client'

import { useState, useEffect } from 'react'

interface Props {
  leadId: string
  leadNome: string
  onClose: () => void
}

type Turma = { id: string; nome: string }
type Aula = { id: string; data: string; hora_inicio: string; hora_fim: string; professores: { nome: string } | null }

const DIAS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

function formatarAula(aula: Aula) {
  const d = new Date(aula.data + 'T12:00:00')
  const dia = DIAS[d.getDay()]
  const data = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  const prof = aula.professores?.nome ? ` · ${aula.professores.nome}` : ''
  return `${dia} ${data} · ${aula.hora_inicio?.slice(0,5)}${prof}`
}

export default function AgendarExperimental({ leadId, leadNome, onClose }: Props) {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [turmaId, setTurmaId] = useState('')
  const [aulas, setAulas] = useState<Aula[]>([])
  const [aulaId, setAulaId] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [feito, setFeito] = useState(false)
  const [notificou, setNotificou] = useState<boolean | null>(null)
  const [erroTurmas, setErroTurmas] = useState('')

  useEffect(() => {
    fetch('/api/experimentais/turmas')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setTurmas(data)
        else setErroTurmas('Erro ao carregar turmas')
      })
      .catch(() => setErroTurmas('Erro de conexão'))
  }, [])

  useEffect(() => {
    if (!turmaId) { setAulas([]); setAulaId(''); return }
    fetch(`/api/experimentais/aulas?turma_id=${turmaId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setAulas(data)
        else setAulas([])
        setAulaId('')
      })
      .catch(() => setAulas([]))
  }, [turmaId])

  async function agendar() {
    if (!aulaId) return
    setSalvando(true)
    const res = await fetch('/api/experimentais', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: leadId, aula_id: aulaId }),
    })
    const json = await res.json()
    setSalvando(false)
    if (json.ok) {
      setFeito(true)
      setNotificou(json.notificou_professor)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        {feito ? (
          <div className="text-center space-y-3">
            <div className="text-4xl">🎭</div>
            <h2 className="text-base font-semibold text-gray-900">Experimental agendado!</h2>
            <p className="text-sm text-gray-500">{leadNome}</p>
            {notificou === true && (
              <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">✓ Professor notificado via WhatsApp</p>
            )}
            {notificou === false && (
              <p className="text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2">⚠ Notificação não enviada — verifique o celular do professor</p>
            )}
            <button onClick={onClose} className="w-full mt-2 bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-700">
              Fechar
            </button>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Agendar experimental</h2>
              <p className="text-sm text-gray-500 mt-0.5">{leadNome}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Turma</label>
                {erroTurmas ? (
                  <p className="text-xs text-red-600">{erroTurmas}</p>
                ) : turmas.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">Carregando turmas...</p>
                ) : (
                  <select
                    value={turmaId}
                    onChange={e => setTurmaId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Selecionar turma...</option>
                    {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                  </select>
                )}
              </div>

              {turmaId && (
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Aula</label>
                  {aulas.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">Nenhuma aula próxima encontrada.</p>
                  ) : (
                    <select
                      value={aulaId}
                      onChange={e => setAulaId(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Selecionar aula...</option>
                      {aulas.map(a => <option key={a.id} value={a.id}>{formatarAula(a)}</option>)}
                    </select>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50">
                Cancelar
              </button>
              <button
                onClick={agendar}
                disabled={!aulaId || salvando}
                className="flex-1 bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-40"
              >
                {salvando ? 'Agendando...' : 'Agendar + Notificar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
