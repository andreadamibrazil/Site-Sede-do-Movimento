export default function BotaoTermoAditivo({ alunoId }: { alunoId: string }) {
  return (
    <a
      href={`/api/alunos/${alunoId}/termo-aditivo`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
      title="Gerar Termo Aditivo para editar e imprimir/salvar como PDF"
    >
      📝 Aditivo
    </a>
  )
}
