import { requireStaff } from '@/lib/api-auth'

export default async function EspetaculosPage() {
  await requireStaff()

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">🌟</span>
        <h1 className="text-2xl font-bold text-gray-900">Espetáculos</h1>
      </div>
      <p className="text-gray-400 text-sm mb-8">Gestão de espetáculos, eventos e autorizações</p>

      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
        <span className="text-5xl block mb-4">🚧</span>
        <p className="text-lg font-semibold text-gray-700 mb-2">Em construção</p>
        <p className="text-sm text-gray-400 max-w-sm mx-auto">
          Esta seção vai centralizar inscrições em espetáculos, autorizações de responsáveis,
          cobranças por turma e controle de figurinos.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 text-left max-w-md mx-auto">
          {[
            { icon: '🎭', label: 'Lista de espetáculos e eventos' },
            { icon: '✍️', label: 'Autorização digital por responsável' },
            { icon: '💰', label: 'Cobrança por turma / por aluno' },
            { icon: '👗', label: 'Controle de figurinos' },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
              <span className="text-lg">{f.icon}</span>
              <span className="text-xs text-gray-500">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
