'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Usuario = {
  id: string
  nome: string
  email: string
  perfil: 'admin' | 'secretaria' | 'professor'
  ativo: boolean
  created_at: string
  ultimo_login: string | null
}

type Convite = {
  email: string
  perfil: 'admin' | 'secretaria' | 'professor'
  convidado_em: string
}

const PERFIL_LABEL: Record<string, string> = {
  admin: 'Admin',
  secretaria: 'Secretaria',
  professor: 'Professor',
}

const PERFIL_COLOR: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  secretaria: 'bg-blue-100 text-blue-700',
  professor: 'bg-green-100 text-green-700',
}

export default function UsuariosClient({
  usuarios: inicial,
  convites: convitesIniciais,
}: {
  usuarios: Usuario[]
  convites: Convite[]
}) {
  const [usuarios, setUsuarios] = useState(inicial)
  const [convites, setConvites] = useState(convitesIniciais)
  const [salvando, setSalvando] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [novoEmail, setNovoEmail] = useState('')
  const [novoPerfil, setNovoPerfil] = useState<'secretaria' | 'admin' | 'professor'>('secretaria')
  const [convidando, setConvidando] = useState(false)
  const [erroConvite, setErroConvite] = useState('')
  const supabase = createClient()

  async function toggleAtivo(id: string, ativo: boolean) {
    setSalvando(id)
    await supabase.from('perfis_usuario').update({ ativo: !ativo }).eq('id', id)
    setUsuarios(u => u.map(x => x.id === id ? { ...x, ativo: !ativo } : x))
    setSalvando(null)
  }

  async function mudarPerfil(id: string, perfil: string) {
    setSalvando(id)
    await supabase.from('perfis_usuario').update({ perfil: perfil as any }).eq('id', id)
    setUsuarios(u => u.map(x => x.id === id ? { ...x, perfil: perfil as any } : x))
    setSalvando(null)
  }

  async function enviarConvite() {
    if (!novoEmail.endsWith('@sededomovimento.art')) {
      setErroConvite('Use um email @sededomovimento.art')
      return
    }
    setConvidando(true)
    setErroConvite('')
    const res = await fetch('/api/painel/usuarios/convidar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: novoEmail, perfil: novoPerfil }),
    })
    const data = await res.json()
    if (!res.ok) {
      setErroConvite(data.error ?? 'Erro ao convidar')
    } else {
      setConvites(c => [{ email: novoEmail, perfil: novoPerfil, convidado_em: new Date().toISOString() }, ...c])
      setNovoEmail('')
      setShowModal(false)
    }
    setConvidando(false)
  }

  async function removerConvite(email: string) {
    await fetch('/api/painel/usuarios/convidar', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setConvites(c => c.filter(x => x.email !== email))
  }

  function formatarData(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Usuários</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Novos logins com @sededomovimento.art entram como Secretaria (inativo) — ative e promova aqui.
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setErroConvite('') }}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Convidar usuário
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Perfil</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Último login</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cadastrado em</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ativo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usuarios.map((u) => (
              <tr key={u.id} className={`transition-colors ${!u.ativo ? 'opacity-50' : 'hover:bg-gray-50'}`}>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{u.nome}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.perfil}
                    disabled={salvando === u.id}
                    onChange={e => mudarPerfil(u.id, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${PERFIL_COLOR[u.perfil]}`}
                  >
                    <option value="admin">Admin</option>
                    <option value="secretaria">Secretaria</option>
                    <option value="professor">Professor</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatarData(u.ultimo_login)}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatarData(u.created_at)}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleAtivo(u.id, u.ativo)}
                    disabled={salvando === u.id}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                      u.ativo ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      u.ativo ? 'translate-x-4' : 'translate-x-1'
                    }`} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {convites.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Convites pendentes</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {convites.map((c) => (
                  <tr key={c.email} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{c.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${PERFIL_COLOR[c.perfil]}`}>
                        {PERFIL_LABEL[c.perfil]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">Convidado em {formatarData(c.convidado_em)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => removerConvite(c.email)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Quando o usuário fizer login com Google, entra automaticamente com o perfil configurado (inativo — ative acima).
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Convidar usuário</h2>
            <p className="text-sm text-gray-500">
              O usuário aparecerá aqui assim que fizer login em{' '}
              <span className="font-mono text-xs">sededomovimento.art/painel/login</span> com a conta Google.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={novoEmail}
                  onChange={e => setNovoEmail(e.target.value)}
                  placeholder="secretaria@sededomovimento.art"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                <select
                  value={novoPerfil}
                  onChange={e => setNovoPerfil(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="secretaria">Secretaria</option>
                  <option value="professor">Professor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {erroConvite && <p className="text-sm text-red-500">{erroConvite}</p>}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={enviarConvite}
                disabled={convidando || !novoEmail}
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {convidando ? 'Salvando...' : 'Confirmar convite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
