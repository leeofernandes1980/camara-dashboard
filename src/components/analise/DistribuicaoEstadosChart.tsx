'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { EstatisticaEstado } from '@/lib/types'

const REGIOES: Record<string, string> = {
  AC: 'Norte', AM: 'Norte', AP: 'Norte', PA: 'Norte', RO: 'Norte', RR: 'Norte', TO: 'Norte',
  AL: 'Nordeste', BA: 'Nordeste', CE: 'Nordeste', MA: 'Nordeste', PB: 'Nordeste',
  PE: 'Nordeste', PI: 'Nordeste', RN: 'Nordeste', SE: 'Nordeste',
  DF: 'Centro-Oeste', GO: 'Centro-Oeste', MS: 'Centro-Oeste', MT: 'Centro-Oeste',
  ES: 'Sudeste', MG: 'Sudeste', RJ: 'Sudeste', SP: 'Sudeste',
  PR: 'Sul', RS: 'Sul', SC: 'Sul',
}

const CORES_REGIAO: Record<string, string> = {
  'Norte': '#0891b2',
  'Nordeste': '#ca8a04',
  'Centro-Oeste': '#16a34a',
  'Sudeste': '#2563eb',
  'Sul': '#7c3aed',
}

interface DistribuicaoEstadosChartProps {
  dados: EstatisticaEstado[]
}

export default function DistribuicaoEstadosChart({ dados }: DistribuicaoEstadosChartProps) {
  const sorted = [...dados].sort((a, b) => b.totalDeputados - a.totalDeputados)

  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={sorted} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="uf" tick={{ fontSize: 11, fill: '#6b7280' }} angle={-45} textAnchor="end" interval={0} />
        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
        <Tooltip
          formatter={(value) => [`${value} deputados`, 'Total']}
          labelFormatter={(uf) => `${uf} — ${REGIOES[uf] ?? ''}`}
        />
        <Bar dataKey="totalDeputados" radius={[4, 4, 0, 0]}>
          {sorted.map((d, i) => (
            <Cell key={i} fill={CORES_REGIAO[REGIOES[d.uf] ?? ''] ?? '#6b7280'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
