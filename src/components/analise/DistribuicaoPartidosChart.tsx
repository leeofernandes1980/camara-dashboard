'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { EstatisticaPartido } from '@/lib/types'

interface DistribuicaoPartidosChartProps {
  dados: EstatisticaPartido[]
  limite?: number
}

const CORES = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#7c3aed', '#0891b2', '#ea580c', '#be185d']

export default function DistribuicaoPartidosChart({ dados, limite = 15 }: DistribuicaoPartidosChartProps) {
  const sorted = [...dados].sort((a, b) => b.totalDeputados - a.totalDeputados).slice(0, limite)

  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={sorted} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="sigla"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          angle={-45}
          textAnchor="end"
          interval={0}
        />
        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
        <Tooltip
          formatter={(value) => [`${value} deputados`, 'Total']}
          labelFormatter={(label) => `Partido: ${label}`}
        />
        <Bar dataKey="totalDeputados" radius={[4, 4, 0, 0]}>
          {sorted.map((_, i) => (
            <Cell key={i} fill={CORES[i % CORES.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
