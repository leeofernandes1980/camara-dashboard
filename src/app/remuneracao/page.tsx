import { Info, DollarSign, Briefcase, Home, CreditCard } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import CeapDeputadoSearch from '@/components/remuneracao/CeapDeputadoSearch'
import { formatarMoeda } from '@/lib/utils'

const SUBSIDIO_MENSAL = 44008.52
const VERBA_MENSAL = 112000
const MORADIA_MENSAL = 4253
const CEAP_MAX_MENSAL = 50212.57

const itens = [
  {
    componente: 'Subsídio (salário)',
    mensal: SUBSIDIO_MENSAL,
    anual: SUBSIDIO_MENSAL * 13.333,
    obs: 'Igual para todos. Inclui 13º salário e 1/3 de férias.',
  },
  {
    componente: 'Verba de Gabinete',
    mensal: VERBA_MENSAL,
    anual: VERBA_MENSAL * 12,
    obs: 'Destinada a contratação de até 25 assessores/servidores.',
  },
  {
    componente: 'Auxílio-moradia',
    mensal: MORADIA_MENSAL,
    anual: MORADIA_MENSAL * 12,
    obs: 'Para deputados sem imóvel funcional no DF. Não cumulativo.',
  },
  {
    componente: 'CEAP',
    mensal: CEAP_MAX_MENSAL,
    anual: CEAP_MAX_MENSAL * 12,
    obs: 'Variável por estado — exibido é o valor máximo (AM/PA). Passagens incluídas.',
    destaque: true,
  },
]

const totalMensal = SUBSIDIO_MENSAL + VERBA_MENSAL + MORADIA_MENSAL + CEAP_MAX_MENSAL
const totalAnual = (SUBSIDIO_MENSAL * 13.333) + (VERBA_MENSAL * 12) + (MORADIA_MENSAL * 12) + (CEAP_MAX_MENSAL * 12)

export default function RemuneracaoPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Remuneração e Custo do Deputado Federal</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Composição dos custos por parlamentar com base na legislação vigente e dados da API oficial da Câmara
        </p>
      </div>

      {/* Aviso */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 space-y-1">
          <p className="font-semibold">Sobre os dados apresentados</p>
          <p>
            Os valores de subsídio, verba de gabinete e auxílios são definidos por lei e são iguais para todos os
            513 deputados. As despesas com CEAP são variáveis e obtidas em tempo real da API pública da Câmara.
            A API não disponibiliza endpoint de remuneração — os valores fixos são públicos e constam em atos
            normativos da Casa.
          </p>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard titulo="Subsídio mensal" valor={formatarMoeda(SUBSIDIO_MENSAL)} icone={DollarSign} cor="blue" />
        <StatCard titulo="Verba de Gabinete" valor={formatarMoeda(VERBA_MENSAL)} icone={Briefcase} cor="purple" />
        <StatCard titulo="Auxílio-moradia" valor={formatarMoeda(MORADIA_MENSAL)} icone={Home} cor="green" />
        <StatCard titulo="CEAP máximo/mês" valor={formatarMoeda(CEAP_MAX_MENSAL)} icone={CreditCard} cor="orange" />
      </div>

      {/* Tabela detalhada */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Composição do Custo por Deputado (valores de referência 2024)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">Componente</th>
                <th className="text-right pb-3 text-xs font-semibold text-gray-500 uppercase">Mensal</th>
                <th className="text-right pb-3 text-xs font-semibold text-gray-500 uppercase">Anual</th>
                <th className="text-left pb-3 pl-6 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Observação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {itens.map(({ componente, mensal, anual, obs, destaque }) => (
                <tr key={componente} className={destaque ? 'bg-blue-50/40' : ''}>
                  <td className="py-3 font-medium text-gray-800">{componente}</td>
                  <td className="py-3 text-right text-gray-700 whitespace-nowrap">{formatarMoeda(mensal)}</td>
                  <td className="py-3 text-right font-semibold text-gray-900 whitespace-nowrap">{formatarMoeda(anual)}</td>
                  <td className="py-3 pl-6 text-gray-500 text-xs hidden sm:table-cell">{obs}</td>
                </tr>
              ))}
              <tr className="bg-red-50 border-t-2 border-red-200 font-bold">
                <td className="py-3 text-red-800">Custo máximo estimado</td>
                <td className="py-3 text-right text-red-800 whitespace-nowrap">{formatarMoeda(totalMensal)}</td>
                <td className="py-3 text-right text-red-800 whitespace-nowrap">{formatarMoeda(totalAnual)}</td>
                <td className="py-3 pl-6 text-red-600 text-xs hidden sm:table-cell">
                  Sem INSS patronal (~20%), plano de saúde e outros
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-500">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-semibold text-gray-700 mb-1">Passagens aéreas</p>
            <p>Incluídas no CEAP — até 64 passagens/mês. Não há custo separado.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-semibold text-gray-700 mb-1">Plano de saúde</p>
            <p>Contribuição patronal da Câmara (~R$ 1.000/mês) + coparticipação do deputado.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-semibold text-gray-700 mb-1">Previdência (patronal)</p>
            <p>Contribuição de ~20% sobre o subsídio paga pela União (~R$ 8.800/mês).</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Fontes: Resolução da Mesa n. 1/2015; Ato da Mesa n. 43/2013 e atualizações; Ato da Presidência n. 56/2023.
          Valores sujeitos a reajuste anual por IPCA ou decisão da Mesa Diretora.
        </p>
      </div>

      {/* Consulta individual */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">Consultar Custo por Deputado</h2>
        <p className="text-sm text-gray-500 mb-5">
          Selecione um deputado e um ano para ver as despesas CEAP reais e a estimativa do custo total ao contribuinte.
        </p>
        <CeapDeputadoSearch />
      </div>

      {/* Nota metodológica */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-sm text-slate-600 space-y-2">
        <p className="font-semibold text-slate-800">Nota Metodológica</p>
        <p>
          O <strong>subsídio</strong> dos Deputados Federais é a remuneração bruta (salário). Ao contrário de servidores
          públicos tradicionais, deputados não recebem adicionais de produtividade ou gratificações de cargo —
          o subsídio é o único componente salarial.
        </p>
        <p>
          A <strong>Verba de Gabinete</strong> não é paga ao deputado: é um crédito usado para remunerar diretamente os
          funcionários do gabinete (assessores, secretários). O deputado não recebe esse valor em conta.
        </p>
        <p>
          O <strong>CEAP</strong> é o maior item variável. Os valores aqui exibidos são os gastos reais declarados pelo
          próprio deputado à Câmara, disponibilizados na API pública.
        </p>
      </div>
    </div>
  )
}
