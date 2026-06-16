'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ORIGENS = [
  'Passa na frente', 'Indicação de aluno', 'Indicação de familiar',
  'Instagram', 'WhatsApp', 'Google', 'Festival', 'Outro',
]

export default function BotaoNovoLead({ modalidades }: { modalidades: string[] }) {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const [form, setForm] = useState({
    nome: '', celular: '', email: '',
    modalidade_interesse: '', como_conheceu: '',
  })

  function set(campo: string, v: string) {
    setForm(f => ({ ...f, [campo]: v }))
  }

  function fechar() {
    setAberto(false)
    setErro('')
    setForm({ nome: '', celular: '', email: '', modalidade_interesse: '', como_conheceu: '' })
  }

  async function salvar() {
    if (!form.nome.trim()) { setErro('Nome é obrigatório.'); return }
    setSalvando(true)
    setErro('')

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    setSalvando(false)

    if (!res.ok) {
      setErro(json.error ?? 'Erro ao salvar.')
      return
    }

    fechar()
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-3 py-2 rounded-xl hover:bg-indigo-700"
      >
        <span className="text-base leading-none">+</span> Novo Lead
      </button>

      {aberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Novo lead</h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Nome *</label>
                <input
                  value={form.nome}
                  onChange={e => set('nome', e.target.value)}
                  placeholder="Nome completo"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Celular</label>
                <input
                  value={form.celular}
                  onChange={e => set('celular', e.target.value)}
                  placeholder="(21) 99999-9999"
                  type="tel"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">E-mail</label>
                <input
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="email@exemplo.com"
                  type="email"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-2 block">Modalidade de interesse</label>
                <div className="flex flex-wrap gap-1.5">
                  {modalidades.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => set('modalidade_interesse', form.modalidade_interesse === m ? '' : m)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        form.modalidade_interesse === m
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 bg-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Como conheceu</label>
                <select
                  value={form.como_conheceu}
                  onChange={e => set('como_conheceu', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Selecionar...</option>
                  {ORIGENS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {erro && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p>}

            <div className="flex gap-2 pt-1">
              <button
                onClick={fechar}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando}
                className="flex-1 bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-40"
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
