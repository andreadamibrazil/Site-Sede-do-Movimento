'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { atualizarAcessoProfessor } from './actions'

const DIAS: Record<string, string> = {
  segunda: 'Seg', terca: 'Ter', quarta: 'Qua',
  quinta: 'Qui', sexta: 'Sex', sabado: 'Sáb', domingo: 'Dom'
}

export default function ProfessorPerfil({ professor, turmas }: { professor: any; turmas: any[] }) {
  const router = useRouter()

  const [email, setEmail] = useState(professor.email ?? '')
  const [celular, setCelular] = useState(professor.celular ?? '')
  const [mei, setMei] = useState(professor.mei ?? '')
  const [valorTransporte, setValorTransporte] = useState(
    professor.valor_transporte ? String(Number(professor.valor_transporte).toFixed(2)).replace('.', ',') : ''
  )
  const [salvandoEmail, setSalvandoEmail] = useState(false)
  const [emailSalvo, setEmailSalvo] = useState(false)

  async function salvarAcesso() {
    setSalvandoEmail(true)
    try {
      const transporte = valorTransporte ? Number(valorTransporte.replace(',', '.')) : null
      await atualizarAcessoProfessor(professor.id, {
        email: email.trim(),
        celular: celular.trim(),
        mei: mei.trim() || null,
        valor_transporte: transporte && transporte > 0 ? transporte : null,
      })
      setEmailSalvo(true)
      setTimeout(() => setEmailSalvo(false), 3000)
      router.refresh()
    } catch (e) {
      alert('Erro ao salvar: ' + (e as Error).message)
    } finally {
      setSalvandoEmail(false)
    }
  }

  const temAcesso = !!professor.email

  return (
    <div className="space-y-4">
      {/* Acesso ao portal */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Acesso ao portal</h2>
          {temAcesso ? (
            <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">✓ Com acesso</span>
          ) : (
            <span className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full border border-red-200">Sem acesso</span>
          )}
        </div>
        <p className="text-xs text-gray-400">
          O professor acessa o portal em <strong>sededomovimento.art/professor</strong> com o email cadastrado aqui.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email de acesso (Google)</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@gmail.com"
              type="email"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Celular (WhatsApp)</label>
            <input
              value={celular}
              onChange={e => setCelular(e.target.value)}
              placeholder="(21) 99999-9999"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">MEI / CNPJ (para folha)</label>
            <input
              value={mei}
              onChange={e => setMei(e.target.value)}
              placeholder="00.000.000/0000-00"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Transporte mensal (R$)
              <span className="text-gray-400 font-normal ml-1">— incluído automaticamente na folha</span>
            </label>
            <input
              value={valorTransporte}
              onChange={e => setValorTransporte(e.target.value)}
              placeholder="0,00"
              type="text"
              inputMode="decimal"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
        <button
          onClick={salvarAcesso}
          disabled={salvandoEmail}
          className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-40"
        >
          {salvandoEmail ? 'Salvando...' : emailSalvo ? '✓ Salvo!' : 'Salvar'}
        </button>
      </div>

      {/* Turmas vinculadas */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Turmas vinculadas</h2>
          <span className="text-xs text-gray-400">{turmas.length} turma(s)</span>
        </div>

        {turmas.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-400">
            Nenhuma turma vinculada.
            <br />
            <Link href="/painel/turmas" className="text-indigo-500 hover:text-indigo-700 text-xs mt-1 block">
              Ir para turmas para vincular →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {turmas.map(t => {
              const horarios = (t.turma_horarios ?? []) as any[]
              return (
                <a
                  key={t.id}
                  href={`/painel/turmas/${t.id}`}
                  className="block border border-gray-100 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.nome}</p>
                      <p className="text-xs text-gray-400">
                        {t.modalidades?.nome}{t.nivel ? ` · ${t.nivel}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {horarios.slice(0,2).map((h: any, i: number) => (
                        <span key={i} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                          {DIAS[h.dia_semana]} {h.hora_inicio?.slice(0,5)}
                        </span>
                      ))}
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
