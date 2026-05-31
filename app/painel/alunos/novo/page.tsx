import NovoAlunoForm from './NovoAlunoForm'

export default function NovoAlunoPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <a href="/painel/alunos" className="text-xs text-gray-400 hover:text-gray-600">← Alunos</a>
        <h1 className="text-xl font-semibold text-gray-900 mt-1">Novo aluno</h1>
      </div>
      <NovoAlunoForm />
    </div>
  )
}
