'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { formatarMoeda } from '@/lib/utils'

interface GastosChartProps {
  dados: { categoria: string; total: number }[]
}

export default function GastosChart({ dados }: GastosChartProps) {
  if (dados.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Sem despesas para exibir
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={dados} margin={{ top: 5, right: 20, left: 20, bottom: 80 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="categoria"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          angle={-45}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11, fill: '#6b7280' }}
        />
        <Tooltip
          formatter={(value) => [formatarMoeda(Number(value)), 'Total']}
          labelStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
