export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Users, Vote, Building2, Calendar, FileText, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import StatCard from '@/components/ui/StatCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import VotacaoCard from '@/components/votacoes/VotacaoCard'
import DeputadoCard from '@/components/deputados/DeputadoCard'
import ProposicaoCard from '@/components/proposicoes/ProposicaoCard'
import { fetchDeputados, fetchVotacoes, fetchProposicoes, fetchPartidos } from '@/lib/api'
import { data30DiasAtrasISO, dataHojeISO, anoAtual } from '@/lib/utils'

async function HomeContent() {
  const [resDeputados, resVotacoes, resProposicoes, resPartidos] = await Promise.allSettled([
    fetchDeputados({ itens: 8 }),
    fetchVotacoes({ dataInicio: data30DiasAtrasISO(), dataFim: dataHojeISO(), itens: 5 }),
    fetchProposicoes({ ano: anoAtual(), itens: 6, ordem: 'DESC', ordenarPor: 'ano' }),
    fetchPartidos({ itens: 100 }),
  ])

  const deputados = resDeputados.status === 'fulfilled' ? resDeputados.value.dados : []
  const votacoes = resVotacoes.status === 'fulfilled' ? resVotacoes.value.dados : []
  const proposicoes = resProposicoes.status === 'fulfilled' ? resProposicoes.value.dados : []
  const totalPartidos = resPartidos.status === 'fulfilled' ? resPartidos.value.dados.length : 0

  const aprovadas = votacoes.filter((v) => v.aprovacao === 1).length
  const rejeitadas = votacoes.filter((v) => v.aprovacao === 0).length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Painel da Câmara dos Deputados</h1>
        <p className="text-gray-500 mt-1">
          Dados públicos em tempo real via API da Câmara dos Deputados • {dataHojeISO().split('-').reverse().join('/')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard titulo="Deputados Federais" valor={513} icone={Users} cor="blue" />
        <StatCard titulo="Votações (30 dias)" valor={votacoes.length} icone={Vote} cor="green" />
        <StatCard titulo="Partidos com bancada" valor={totalPartidos} icone={Building2} cor="purple" />
        <StatCard titulo="Aprovadas (30 dias)" valor={aprovadas} icone={Vote} cor="green" />
        <StatCard titulo="Rejeitadas (30 dias)" valor={rejeitadas} icone={Vote} cor="orange" />
        <StatCard titulo="Legislatura Atual" valor={57} icone={Calendar} cor="blue" />
      </div>

      {/* Links rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/rankings', label: 'Rankings', sub: 'Gastos, bancadas, UFs', cor: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { href: '/analise', label: 'Análise', sub: 'Composição da Câmara', cor: 'bg-blue-50 border-blue-200 text-blue-700' },
          { href: '/proposicoes', label: 'Proposições', sub: 'PLs, PECs, MPVs', cor: 'bg-green-50 border-green-200 text-green-700' },
          { href: '/partidos', label: 'Partidos', sub: 'Bancadas e membros', cor: 'bg-purple-50 border-purple-200 text-purple-700' },
        ].map(({ href, label, sub, cor }) => (
          <Link key={href} href={href}
            className={`p-4 rounded-lg border ${cor} hover:opacity-80 transition-opacity`}>
            <p className="font-semibold text-sm">{label}</p>
            <p className="text-xs opacity-70 mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Votações recentes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Votações Recentes (30 dias)</h2>
          <Link href="/votacoes" className="text-sm text-blue-600 hover:underline">Ver todas →</Link>
        </div>
        {votacoes.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma votação encontrada no período.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {votacoes.map((v) => <VotacaoCard key={v.id} votacao={v} />)}
          </div>
        )}
      </div>

      {/* Proposições recentes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Proposições Recentes ({anoAtual()})</h2>
          <Link href="/proposicoes" className="text-sm text-blue-600 hover:underline">Ver todas →</Link>
        </div>
        {proposicoes.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma proposição encontrada.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proposicoes.map((p) => <ProposicaoCard key={p.id} proposicao={p} />)}
          </div>
        )}
      </div>

      {/* Deputados em destaque */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Deputados em Destaque</h2>
          <Link href="/deputados" className="text-sm text-blue-600 hover:underline">Ver todos →</Link>
        </div>
        {deputados.length === 0 ? (
          <p className="text-gray-400 text-sm">Não foi possível carregar os deputados.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-4">
            {deputados.map((d) => <DeputadoCard key={d.id} deputado={d} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HomeContent />
    </Suspense>
  )
}
