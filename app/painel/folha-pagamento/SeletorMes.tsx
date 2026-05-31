'use client'

export default function SeletorMes({ meses, mesAtual }: { meses: string[]; mesAtual: string }) {
  return (
    <select
      value={mesAtual}
      onChange={e => window.location.href = `/painel/folha-pagamento?mes=${e.target.value}`}
      className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
    >
      {meses.map(m => (
        <option key={m} value={m}>
          {new Date(m + '-01T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </option>
      ))}
    </select>
  )
}
