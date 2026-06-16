'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

interface VotosChartProps {
  sim: number
  nao: number
  outros: number
}

const CORES = ['#16a34a', '#dc2626', '#ca8a04']

export default function VotosChart({ sim, nao, outros }: VotosChartProps) {
  const dados = [
    { name: 'Sim', value: sim },
    { name: 'Não', value: nao },
    { name: 'Outros', value: outros },
  ].filter((d) => d.value > 0)

  if (dados.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Sem dados de votação disponíveis
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={dados}
          cx="50%"
          cy="50%"
          outerRadius={90}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
          labelLine={false}
        >
          {dados.map((_, i) => (
            <Cell key={i} fill={CORES[i]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [value, 'Votos']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
