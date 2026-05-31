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

export default function UsuariosClient({ usuarios: inicial }: { usuarios: Usuario[] }) {
  const [usuarios, setUsuarios] = useState(inicial)
  const [salvando, setSalvando] = useState<string | null>(null)
  const supabase = createClient()

  async function toggleAtivo(id: string, ativo: boolean) {
    setSalvando(id)
    await supabase.from('perfis_usuario').update({ ativo: !ativo }).eq('id', id)
    setUsuarios(u => u.map(x => x.id === id ? { ...x, ativo: !ativo } : x))
    setSalvando(null)
  }

  async function mudarPerfil(id: string, perfil: string) {
    setSalvando(id)
    await supabase.from('perfis_usuario').update({ perfil: perfil as 'admin' | 'secretaria' | 'professor' }).eq('id', id)
    setUsuarios(u => u.map(x => x.id === id ? { ...x, perfil: perfil as any } : x))
    setSalvando(null)
  }

  function formatarData(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Usuários</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Novos logins com @sededomovimento.art entram como Secretaria (inativo) — ative e promova aqui.
        </p>
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

      <p className="text-xs text-gray-400">
        Para adicionar alguém: peça que faça login em{' '}
        <span className="font-mono text-gray-600">sededomovimento.art/painel/login</span>{' '}
        com email @sededomovimento.art. Aparece aqui automaticamente (inativo).
      </p>
    </div>
  )
}
