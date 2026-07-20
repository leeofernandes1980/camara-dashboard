import type {
  Deputado,
  DeputadoDetalhe,
  Despesa,
  Votacao,
  VotacaoDeputado,
  Voto,
  Orientacao,
  Orgao,
  OrgaoMembro,
  Discurso,
  Proposicao,
  ProposicaoDetalhe,
  AutorProposicao,
  TramitacaoProposicao,
  PartidoItem,
  Partido,
  Evento,
  PaginatedResponse,
} from './types'

const BASE_URL = 'https://dadosabertos.camara.leg.br/api/v2'
const defaultHeaders = { Accept: 'application/json' }

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.append(key, String(value))
      }
    }
  }
  return url.toString()
}

async function apiFetch<T>(url: string, revalidate?: number): Promise<T> {
  // No Vercel (Next.js 16), o Runtime/Data Cache só passa a persistir fetches
  // entre invocações serverless com `cache: 'force-cache'` explícito — só
  // `next.revalidate` não é suficiente (ver docs/runtime-cache do Vercel).
  const cacheOpt: RequestInit = revalidate
    ? ({ cache: 'force-cache', next: { revalidate } } as RequestInit)
    : { cache: 'no-store' }
  const res = await fetch(url, { headers: defaultHeaders, ...cacheOpt })
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`)
  return res.json()
}

// ── Deputados ────────────────────────────────────────────

export async function fetchDeputados(params?: {
  siglaUF?: string
  siglaPartido?: string
  nome?: string
  siglaSexo?: string
  itens?: number
  pagina?: number
}): Promise<PaginatedResponse<Deputado>> {
  try {
    return await apiFetch(buildUrl('/deputados', params as Record<string, string | number | undefined>), 3600)
  } catch (err) {
    throw new Error(`Falha ao buscar deputados: ${(err as Error).message}`)
  }
}

export async function fetchTodosDeputados(): Promise<Deputado[]> {
  const todos: Deputado[] = []
  let pagina = 1
  while (true) {
    const res = await fetchDeputados({ itens: 100, pagina })
    todos.push(...res.dados)
    if (!res.links.some((l) => l.rel === 'next')) break
    pagina++
  }
  return todos
}

export async function fetchDeputado(id: number): Promise<{ dados: DeputadoDetalhe }> {
  try {
    return await apiFetch(buildUrl(`/deputados/${id}`))
  } catch (err) {
    throw new Error(`Falha ao buscar deputado ${id}: ${(err as Error).message}`)
  }
}

export async function fetchDespesasDeputado(
  id: number,
  params?: { ano?: number; mes?: number; itens?: number; pagina?: number }
): Promise<PaginatedResponse<Despesa>> {
  try {
    // Anos fechados não mudam mais: cache longo. Ano corrente ainda recebe lançamentos: cache curto.
    const revalidate = params?.ano && params.ano < new Date().getFullYear() ? 86400 : 3600
    return await apiFetch(
      buildUrl(`/deputados/${id}/despesas`, params as Record<string, string | number | undefined>),
      revalidate
    )
  } catch (err) {
    throw new Error(`Falha ao buscar despesas do deputado ${id}: ${(err as Error).message}`)
  }
}

export async function fetchDiscursosDeputado(
  id: number,
  params?: { dataInicio?: string; dataFim?: string; itens?: number; pagina?: number }
): Promise<PaginatedResponse<Discurso>> {
  try {
    return await apiFetch(buildUrl(`/deputados/${id}/discursos`, params as Record<string, string | number | undefined>))
  } catch (err) {
    throw new Error(`Falha ao buscar discursos do deputado ${id}: ${(err as Error).message}`)
  }
}

export async function fetchVotacoesDeputado(
  id: number,
  params?: { dataInicio?: string; dataFim?: string; itens?: number; pagina?: number }
): Promise<PaginatedResponse<VotacaoDeputado>> {
  try {
    return await apiFetch(buildUrl(`/deputados/${id}/votacoes`, params as Record<string, string | number | undefined>))
  } catch (err) {
    throw new Error(`Falha ao buscar votações do deputado ${id}: ${(err as Error).message}`)
  }
}

export async function fetchOrgaosDeputado(id: number): Promise<PaginatedResponse<OrgaoMembro>> {
  try {
    return await apiFetch(buildUrl(`/deputados/${id}/orgaos`, { itens: 100 }))
  } catch (err) {
    throw new Error(`Falha ao buscar órgãos do deputado ${id}: ${(err as Error).message}`)
  }
}

export async function fetchProposicoesDeputado(
  id: number,
  params?: { itens?: number; pagina?: number }
): Promise<PaginatedResponse<Proposicao>> {
  try {
    return await apiFetch(buildUrl('/proposicoes', {
      idDeputadoAutor: id,
      itens: params?.itens ?? 20,
      pagina: params?.pagina ?? 1,
      ordem: 'DESC',
      ordenarPor: 'ano',
    }))
  } catch (err) {
    throw new Error(`Falha ao buscar proposições do deputado ${id}: ${(err as Error).message}`)
  }
}

// ── Votações ─────────────────────────────────────────────

export async function fetchVotacoes(params?: {
  dataInicio?: string
  dataFim?: string
  idOrgao?: number
  aprovacao?: number
  itens?: number
  pagina?: number
}): Promise<PaginatedResponse<Votacao>> {
  try {
    return await apiFetch(buildUrl('/votacoes', params as Record<string, string | number | undefined>))
  } catch (err) {
    throw new Error(`Falha ao buscar votações: ${(err as Error).message}`)
  }
}

export async function fetchVotacao(id: string): Promise<{ dados: Votacao }> {
  try {
    return await apiFetch(buildUrl(`/votacoes/${id}`))
  } catch (err) {
    throw new Error(`Falha ao buscar votação ${id}: ${(err as Error).message}`)
  }
}

export async function fetchVotos(id: string): Promise<PaginatedResponse<Voto>> {
  try {
    return await apiFetch(buildUrl(`/votacoes/${id}/votos`))
  } catch (err) {
    throw new Error(`Falha ao buscar votos da votação ${id}: ${(err as Error).message}`)
  }
}

export async function fetchOrientacoes(id: string): Promise<PaginatedResponse<Orientacao>> {
  try {
    return await apiFetch(buildUrl(`/votacoes/${id}/orientacoes`))
  } catch (err) {
    throw new Error(`Falha ao buscar orientações da votação ${id}: ${(err as Error).message}`)
  }
}

// ── Proposições ──────────────────────────────────────────

export async function fetchProposicoes(params?: {
  siglaTipo?: string
  numero?: number
  ano?: number
  autor?: string
  idDeputadoAutor?: number
  tema?: number
  keywords?: string
  itens?: number
  pagina?: number
  ordem?: string
  ordenarPor?: string
}): Promise<PaginatedResponse<Proposicao>> {
  try {
    return await apiFetch(buildUrl('/proposicoes', params as Record<string, string | number | undefined>))
  } catch (err) {
    throw new Error(`Falha ao buscar proposições: ${(err as Error).message}`)
  }
}

export async function fetchProposicao(id: number): Promise<{ dados: ProposicaoDetalhe }> {
  try {
    return await apiFetch(buildUrl(`/proposicoes/${id}`))
  } catch (err) {
    throw new Error(`Falha ao buscar proposição ${id}: ${(err as Error).message}`)
  }
}

export async function fetchAutoresProposicao(id: number): Promise<PaginatedResponse<AutorProposicao>> {
  try {
    return await apiFetch(buildUrl(`/proposicoes/${id}/autores`))
  } catch (err) {
    throw new Error(`Falha ao buscar autores da proposição ${id}: ${(err as Error).message}`)
  }
}

export async function fetchTramitacoesProposicao(id: number): Promise<PaginatedResponse<TramitacaoProposicao>> {
  try {
    return await apiFetch(buildUrl(`/proposicoes/${id}/tramitacoes`))
  } catch (err) {
    throw new Error(`Falha ao buscar tramitações da proposição ${id}: ${(err as Error).message}`)
  }
}

// ── Partidos ─────────────────────────────────────────────

export async function fetchPartidos(params?: { itens?: number; pagina?: number }): Promise<PaginatedResponse<PartidoItem>> {
  try {
    return await apiFetch(buildUrl('/partidos', { itens: 100, ...params } as Record<string, string | number | undefined>))
  } catch (err) {
    throw new Error(`Falha ao buscar partidos: ${(err as Error).message}`)
  }
}

export async function fetchPartido(id: number): Promise<{ dados: Partido }> {
  try {
    return await apiFetch(buildUrl(`/partidos/${id}`))
  } catch (err) {
    throw new Error(`Falha ao buscar partido ${id}: ${(err as Error).message}`)
  }
}

export async function fetchMembrosPartido(
  id: number,
  params?: { itens?: number; pagina?: number }
): Promise<PaginatedResponse<Deputado>> {
  try {
    return await apiFetch(buildUrl(`/partidos/${id}/membros`, params as Record<string, string | number | undefined>))
  } catch (err) {
    throw new Error(`Falha ao buscar membros do partido ${id}: ${(err as Error).message}`)
  }
}

// ── Órgãos ───────────────────────────────────────────────

export async function fetchOrgaos(params?: { itens?: number; pagina?: number }): Promise<PaginatedResponse<Orgao>> {
  try {
    return await apiFetch(buildUrl('/orgaos', { itens: 100, ...params } as Record<string, string | number | undefined>))
  } catch (err) {
    throw new Error(`Falha ao buscar órgãos: ${(err as Error).message}`)
  }
}

// ── Eventos / Sessões ────────────────────────────────────

export async function fetchEventos(params?: {
  dataInicio?: string
  dataFim?: string
  idOrgao?: number
  itens?: number
  pagina?: number
}): Promise<PaginatedResponse<Evento>> {
  try {
    return await apiFetch(buildUrl('/eventos', params as Record<string, string | number | undefined>))
  } catch (err) {
    throw new Error(`Falha ao buscar eventos: ${(err as Error).message}`)
  }
}

// ── Rankings (batch fetching) ────────────────────────────

export async function fetchDespesasTotalDeputado(id: number, ano: number): Promise<number> {
  try {
    const res = await fetchDespesasDeputado(id, { ano, itens: 100 })
    return res.dados.reduce((acc, d) => acc + (d.valorLiquido || 0), 0)
  } catch {
    return 0
  }
}

export async function fetchTodosDeputadosFiltrados(params: {
  siglaSexo?: 'F' | 'M'
  siglaUF?: string
  siglaPartido?: string
}): Promise<Deputado[]> {
  const todos: Deputado[] = []
  let pagina = 1
  while (true) {
    const res = await fetchDeputados({ ...params, itens: 100, pagina })
    todos.push(...res.dados)
    if (!res.links.some((l) => l.rel === 'next')) break
    pagina++
  }
  return todos
}

export async function fetchVotacoesRecentes(itens = 100): Promise<PaginatedResponse<Votacao>> {
  try {
    return await apiFetch(buildUrl('/votacoes', {
      dataInicio: (() => { const d = new Date(); d.setDate(d.getDate() - 90); return d.toISOString().slice(0, 10) })(),
      dataFim:    new Date().toISOString().slice(0, 10),
      itens,
      ordem: 'DESC',
      ordenarPor: 'dataHoraRegistro',
    }))
  } catch (err) {
    throw new Error(`Falha ao buscar votações recentes: ${(err as Error).message}`)
  }
}
