export default function RelatoriosPage() {
  return <EmBreve titulo="Relatórios" descricao="Mapa de turmas, inadimplência, faturamento e pagamento de professores." />
}

function EmBreve({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-2">{titulo}</h1>
      <p className="text-sm text-gray-400">{descricao}</p>
      <div className="mt-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">
        Em construção
      </div>
    </div>
  )
}
