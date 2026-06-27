'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, X } from 'lucide-react'
import { buscarDeputados, getCeapResumo } from '@/app/actions'
import type { Deputado } from '@/lib/types'
import { formatarMoeda, anosDisponiveis } from '@/lib/utils'
import AvatarImage from '@/components/ui/AvatarImage'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const SUBSIDIO_MENSAL = 44008.52
const VERBA_MENSAL = 112000
const MORADIA_MENSAL = 4253

const SUBSIDIO_ANUAL = SUBSIDIO_MENSAL * 13.333
const VERBA_ANUAL = VERBA_MENSAL * 12
const MORADIA_ANUAL = MORADIA_MENSAL * 12

type Resultado = {
  total: number
  porMes: Array<{ mes: number; label: string; total: number }>
  porCategoria: Array<{ categoria: string; total: number }>
}

export default function CeapDeputadoSearch() {
  const [busca, setBusca] = useState('')
  const [sugestoes, setSugestoes] = useState<Deputado[]>([])
  const [buscando, setBuscando] = useState(false)
  const [deputado, setDeputado] = useState<Deputado | null>(null)
  const [ano, setAno] = useState(new Date().getFullYear())
  const [carregando, setCarregando] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!busca || busca.length < 2) { setSugestoes([]); return }
    const t = setTimeout(async () => {
      setBuscando(true)
      const r = await buscarDeputados(busca)
      setSugestoes(r)
      setBuscando(false)
    }, 300)
    return () => clearTimeout(t)
  }, [busca])

  async function consultar() {
    if (!deputado) return
    setCarregando(true)
    setResultado(null)
    setErro(null)
    try {
      const res = await getCeapResumo(deputado.id, ano)
      setResultado(res)
    } catch {
      setErro('Não foi possível carregar as despesas. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  function limpar() {
    setDeputado(null)
    setResultado(null)
    setBusca('')
    setSugestoes([])
  }

  const custoTotal = resultado
    ? SUBSIDIO_ANUAL + VERBA_ANUAL + MORADIA_ANUAL + resultado.total
    : 0

  return (
    <div className="space-y-5">
      {/* Linha de busca */}
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        {/* Campo de busca */}
        <div className="relative flex-1">
          <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 bg-white">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {deputado ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  <AvatarImage src={deputado.urlFoto} alt={deputado.nome} size={24} />
                </div>
                <span className="text-sm font-medium text-gray-800 truncate">{deputado.nome}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">{deputado.siglaPartido}/{deputado.siglaUf}</span>
                <button onClick={limpar} className="ml-auto flex-shrink-0">
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-700" />
                </button>
              </div>
            ) : (
              <input
                type="text"
                placeholder="Digite o nome do deputado..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                maxLength={100}
                className="flex-1 text-sm bg-transparent outline-none min-w-0"
              />
            )}
            {buscando && <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />}
          </div>

          {sugestoes.length > 0 && !deputado && (
            <div className="absolute z-20 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-64 overflow-y-auto">
              {sugestoes.map((d) => (
                <button
                  key={d.id}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 text-left transition-colors"
                  onClick={() => { setDeputado(d); setBusca(''); setSugestoes([]) }}
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <AvatarImage src={d.urlFoto} alt={d.nome} size={32} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{d.nome}</p>
                    <p className="text-xs text-gray-500">{d.siglaPartido} — {d.siglaUf}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <select
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
        >
          {anosDisponiveis().map((a) => <option key={a} value={a}>{a}</option>)}
        </select>

        <button
          onClick={consultar}
          disabled={!deputado || carregando}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {carregando ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Consultar
        </button>
      </div>

      {erro && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{erro}</p>
      )}

      {carregando && (
        <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Carregando todas as despesas do ano...</span>
        </div>
      )}

      {resultado && deputado && (
        <div className="space-y-5">
          {/* CEAP total */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">CEAP total em {ano}</p>
              <p className="text-2xl font-bold text-blue-800 mt-1">{formatarMoeda(resultado.total)}</p>
              <p className="text-xs text-blue-600 mt-0.5">{deputado.nome}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-xs text-red-500 font-medium uppercase tracking-wide">Custo total estimado {ano}</p>
              <p className="text-2xl font-bold text-red-800 mt-1">{formatarMoeda(custoTotal)}</p>
              <p className="text-xs text-red-600 mt-0.5">Fixo + CEAP real</p>
            </div>
          </div>

          {/* Gráfico mensal */}
          {resultado.porMes.some((m) => m.total > 0) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">CEAP por Mês — {ano}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={resultado.porMes} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis
                    tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <Tooltip
                    formatter={(v) => [formatarMoeda(Number(v)), 'CEAP']}
                    labelStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Categorias */}
          {resultado.porCategoria.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Principais Tipos de Despesa</h3>
              <div className="space-y-2">
                {resultado.porCategoria.map((c) => {
                  const pct = resultado.total > 0 ? (c.total / resultado.total) * 100 : 0
                  return (
                    <div key={c.categoria}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600 truncate flex-1 pr-3">{c.categoria}</span>
                        <span className="font-semibold text-gray-800 flex-shrink-0">{formatarMoeda(c.total)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div
                          className="h-1.5 bg-blue-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Custo total detalhado */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Estimativa de Custo Anual ao Contribuinte — {deputado.nome}
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subsídio + 13º + Férias</span>
                <span className="font-medium text-gray-800">{formatarMoeda(SUBSIDIO_ANUAL)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Verba de Gabinete (pessoal)</span>
                <span className="font-medium text-gray-800">{formatarMoeda(VERBA_ANUAL)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Auxílio-moradia (estimado)</span>
                <span className="font-medium text-gray-800">{formatarMoeda(MORADIA_ANUAL)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">CEAP real ({ano})</span>
                <span className="font-semibold text-blue-700">{formatarMoeda(resultado.total)}</span>
              </div>
              <div className="border-t border-gray-300 pt-3 flex justify-between font-bold text-base">
                <span className="text-gray-900">Total estimado</span>
                <span className="text-red-700">{formatarMoeda(custoTotal)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              Estimativa baseada em valores públicos de 2024. Não inclui INSS patronal (~20% do subsídio),
              plano de saúde, seguro de vida e outros benefícios acessórios.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
