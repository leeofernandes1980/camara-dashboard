# Câmara Dashboard

Dashboard de dados públicos da Câmara dos Deputados do Brasil, consumindo em tempo real a API oficial de dados abertos legislativos.

**Deploy:** [camara-dashboard.vercel.app](https://camara-dashboard.vercel.app) · **Repo:** [github.com/leeofernandes1980/camara-dashboard](https://github.com/leeofernandes1980/camara-dashboard)

---

## Visão Geral

Aplicação web que visualiza dados públicos da Câmara Federal brasileira: deputados, votações, proposições legislativas, partidos, despesas CEAP, remuneração parlamentar, análise demográfica e rankings. Todos os dados são obtidos diretamente da API pública — sem banco de dados próprio e sem autenticação.

**API base:** `https://dadosabertos.camara.leg.br/api/v2`
**Documentação oficial:** `https://dadosabertos.camara.leg.br/swagger/api.html`

---

## Stack Tecnológica

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 16.2.9 | Framework principal (App Router) |
| React | 19.2.4 | UI |
| TypeScript | ^5 | Tipagem estática |
| Tailwind CSS | ^4 | Estilização |
| Recharts | ^3.8.1 | Gráficos e visualizações |
| Lucide React | ^1.18.0 | Ícones |

---

## Instalação e Execução

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de produção
npm start
npm run lint
```

Não há variáveis de ambiente obrigatórias. A API da Câmara é pública e não requer autenticação.

---

## Estrutura do Projeto

```
camara-dashboard/
├── next.config.ts
├── package.json
├── tsconfig.json
└── src/
    ├── app/
    │   ├── actions.ts              # Server Actions (anti-CORS)
    │   ├── layout.tsx              # Layout raiz (Sidebar + Header)
    │   ├── page.tsx                # Home — painel geral
    │   ├── deputados/
    │   │   ├── page.tsx            # Lista com filtros
    │   │   └── [id]/page.tsx       # Perfil completo + 5 abas
    │   ├── votacoes/
    │   │   ├── page.tsx            # Lista com filtros e atalhos de período
    │   │   └── [id]/page.tsx       # Detalhe + disciplina partidária
    │   ├── proposicoes/
    │   │   ├── page.tsx            # Lista com busca por referência e por tema
    │   │   └── [id]/page.tsx       # Detalhe + tramitação + autores + íntegra
    │   ├── partidos/
    │   │   ├── page.tsx
    │   │   └── [id]/page.tsx
    │   ├── remuneracao/page.tsx
    │   ├── cota-parlamentar/page.tsx
    │   ├── analise/page.tsx        # Composição por gênero real via API
    │   └── rankings/page.tsx       # CEAP + votações disputadas + tipo
    ├── lib/
    │   ├── types.ts
    │   ├── api.ts
    │   └── utils.ts
    ├── hooks/
    │   ├── useDeputados.ts
    │   ├── useVotacoes.ts
    │   ├── useProposicoes.ts
    │   ├── usePartidos.ts
    │   ├── usePaginacao.ts
    │   └── useDebounce.ts
    └── components/
        ├── layout/          Sidebar (9 itens) + Header
        ├── ui/              Badge, StatCard, LoadingSpinner, ErrorMessage,
        │                    Pagination, AvatarImage, PartidoLogo
        ├── deputados/       DeputadoCard, DeputadoTable, DeputadoFiltros, DeputadoTabs
        ├── votacoes/        VotacaoCard, VotacaoFiltros, VotosChart, OrientacoesTable
        ├── proposicoes/     ProposicaoCard, ProposicaoFiltros
        ├── partidos/        PartidoCard
        ├── cota/            GastosTable, GastosChart, CotatFiltros
        ├── analise/         DistribuicaoPartidosChart, DistribuicaoEstadosChart
        ├── remuneracao/     CeapDeputadoSearch
        └── rankings/        RankingTable, GastosRankingLoader
```

---

## Páginas

### `/` — Home
Painel geral com estatísticas rápidas, votações e proposições recentes, deputados em destaque e links de acesso rápido. Carrega 4 blocos em paralelo com `Promise.allSettled`.

### `/deputados` — Lista de Deputados
Filtros por nome, UF, partido e sexo. Alterna entre cards e tabela. Paginação server-side.

### `/deputados/[id]` — Perfil do Deputado
Dados cadastrais completos (nome civil, gabinete, redes sociais, **idade calculada dinamicamente**). **5 abas com carregamento lazy:**

| Aba | Conteúdo |
|---|---|
| Despesas CEAP | Gráfico + **Top 5 fornecedores** + tabela com link de comprovante fiscal |
| Proposições | Lista paginada de projetos do deputado |
| **Votações** | Tabela paginada com data, descrição linkada para `/votacoes/[id]`, badge colorido do voto |
| Discursos | Discursos recentes com sumário e palavras-chave |
| Comissões | Órgãos com cargo e período |

### `/votacoes` — Lista de Votações
Atalhos de período rápido (**7d / 30d / 60d / 3 meses**). Filtros por data, órgão e resultado.
> A API da Câmara rejeita janelas > 90 dias. O sistema limita automaticamente a 88 dias e exibe aviso quando necessário.

### `/votacoes/[id]` — Detalhe da Votação
PieChart de votos, orientações por bancada, lista de votos individuais com:
- **Coluna Disciplina** por deputado (Alinhado / Divergiu / —)
- **Bloco Disciplina Partidária** — barra por partido (verde ≥80% / amarelo ≥50% / vermelho <50%)

### `/proposicoes` — Lista de Proposições
**Busca inteligente** no campo "Buscar por tema ou referência":
- **Referência exata** — detecta `PEC 221/2019`, `PL 1234/2024`, `MPV 987/2022` e usa `siglaTipo + numero + ano` na API (badge azul #)
- **Busca por tema** — remove stopwords PT e extrai até 4 termos significativos antes de enviar para a API (badge âmbar mostra os termos usados)

Filtros adicionais: tipo, ano, autor. Link "Íntegra" externo por card.

### `/proposicoes/[id]` — Detalhe da Proposição
Ementa, situação atual, autores com link para perfil, histórico de tramitação cronológico inverso, links externos por passo de tramitação e botão **"Ver íntegra na Câmara"**.

### `/partidos` — Lista de Partidos
Cards com total de deputados e estados representados.

### `/partidos/[id]` — Perfil do Partido
Logo, líder da bancada, distribuição por UF, grid de todos os membros (com deduplicação de IDs duplicados da API).

### `/analise` — Análise da Câmara
- Distribuição por partido e por UF/região
- **Composição por Gênero real via API** (`siglaSexo: 'F'` em paralelo com lista geral):
  - Cards M/F com percentuais
  - Barra proporcional
  - Top 10 partidos por % feminino
  - Breakdown por região geográfica

### `/rankings` — Rankings
- **CEAP Top 50** — carregamento em lotes de 20 via Server Actions com barra de progresso
- **Bancadas** — deputados por partido
- **UFs** — representação por estado
- **Votações Mais Disputadas** — menores margens |Sim − Não|, link para cada votação
- **Proposições por Tipo** — ranking visual de barras (PL, MPV, PEC, PDC…)

### `/remuneracao` — Remuneração e Custo do Deputado
StatCards de resumo, tabela de composição mensal/anual, buscador CEAP interativo (autocomplete + gráfico + calculadora de custo total).

### `/cota-parlamentar` — Cota Parlamentar (CEAP)
Busca por deputado e ano. Gráfico mensal e tabela detalhada com link do comprovante fiscal.

---

## Server Actions (`src/app/actions.ts`)

Permitem que componentes Client chamem funções que executam **no servidor**, evitando CORS e rate-limit da API quando chamada do browser.

| Função | Retorno | Uso |
|---|---|---|
| `getTodosDeputados()` | `Deputado[]` | Loop paginado — ~6 req, 513 dep. |
| `getBatchDespesas(ids, ano)` | `Record<number, number>` | Soma CEAP de lote em paralelo |
| `buscarDeputados(nome)` | `Deputado[]` | Autocomplete por nome |
| `getCeapResumo(id, ano)` | `{ total, porMes, porCategoria }` | Consolida despesas por mês e categoria |

---

## Camada de API (`src/lib/api.ts`)

### Cache
- `fetchDeputados` usa `revalidate: 3600` (1h) — lista estável
- Demais endpoints: `cache: 'no-store'`

### Funções disponíveis

#### Deputados
| Função | Descrição |
|---|---|
| `fetchDeputados(params?)` | Lista paginada com filtros (incl. `siglaSexo`) |
| `fetchTodosDeputados()` | Todos os 513 deputados (~6 req, com cache 1h) |
| `fetchTodosDeputadosFiltrados({ siglaSexo?, siglaUF?, siglaPartido? })` | Loop paginado com filtros — usado em `/analise` |
| `fetchDeputado(id)` | Detalhes completos |
| `fetchDespesasDeputado(id, params?)` | Despesas CEAP paginadas |
| `fetchDespesasTotalDeputado(id, ano)` | Soma total do ano |
| `fetchDiscursosDeputado(id, params?)` | Discursos |
| `fetchOrgaosDeputado(id)` | Comissões |
| `fetchProposicoesDeputado(id, params?)` | Proposições por autor |
| `fetchVotacoesDeputado(id, params?)` | Votações do deputado com `tipoVoto` |

#### Votações
| Função | Descrição |
|---|---|
| `fetchVotacoes(params?)` | Lista paginada (máx. 88 dias de janela) |
| `fetchVotacoesRecentes(itens?)` | Últimos 90 dias, ordem DESC |
| `fetchVotacao(id)` | Detalhe |
| `fetchVotos(id)` | Votos individuais |
| `fetchOrientacoes(id)` | Orientações de bancada |

#### Proposições
| Função | Descrição |
|---|---|
| `fetchProposicoes(params?)` | Lista com filtros incl. `keywords` e `numero` |
| `fetchProposicao(id)` | Detalhe |
| `fetchAutoresProposicao(id)` | Autores |
| `fetchTramitacoesProposicao(id)` | Histórico |

#### Partidos, Órgãos, Eventos
`fetchPartidos`, `fetchPartido`, `fetchMembrosPartido`, `fetchOrgaos`, `fetchEventos`

---

## Tipos TypeScript (`src/lib/types.ts`)

| Interface | Descrição |
|---|---|
| `Deputado` | Listagem — id, nome, partido, UF, foto, e-mail |
| `DeputadoDetalhe` | Detalhe — estende Deputado com gabinete, escolaridade, situação |
| `Votacao` | id, data, descrição, aprovação, placar |
| `VotacaoDeputado` | Estende `Votacao` com `tipoVoto` — retorno de `/deputados/{id}/votacoes` |
| `Voto` | tipoVoto + dados do deputado |
| `Orientacao` | Orientação de bancada (`siglaPartidoBloco`, `orientacao`) |
| `Despesa` | Tipo, fornecedor, valor, `urlDocumento` |
| `Proposicao` | id, tipo, número, ano, ementa |
| `ProposicaoDetalhe` | Detalhe com status, tramitação atual, keywords |
| `AutorProposicao` | Autor de uma proposição |
| `TramitacaoProposicao` | Passo no histórico (data, órgão, situação, url) |
| `PartidoItem` / `Partido` | Listagem e detalhe com líder e status |
| `Evento` / `Discurso` / `OrgaoMembro` | Sessões, discursos, comissões |
| `PaginatedResponse<T>` | `{ dados: T[], links: { rel, href }[] }` |
| `DeputadoRanking` / `EstatisticaPartido` / `EstatisticaEstado` | Tipos de análise |

---

## Hooks Customizados (`src/hooks/`)

| Hook | Interface de filtros | Descrição |
|---|---|---|
| `useDeputados(filtros)` | nome, UF, partido, sexo | Lista com filtros e paginação |
| `useVotacoes(filtros)` | dataInicio, dataFim, idOrgao, aprovacao | Lista com paginação |
| `useProposicoes(filtros)` | siglaTipo, numero, ano, autor, keywords | Lista com paginação e busca inteligente |
| `usePartidos()` | — | Lista de partidos |
| `usePaginacao()` | — | Lógica genérica de paginação |
| `useDebounce(value, delay)` | — | Debounce para inputs de filtro |

---

## Decisões de Arquitetura

### Server vs. Client Components
Server Components são o padrão. `'use client'` apenas quando necessário: `useState`/`useEffect`, handlers de eventos.

### Server Actions (`src/app/actions.ts`)
Usadas quando Client Components precisam chamar a API. Requisições server-to-server evitam CORS e têm limites mais altos.

### `export const dynamic = 'force-dynamic'`
Obrigatório em rotas **não-dinâmicas** que usam `cache: 'no-store'`. Rotas `[id]` já são dinâmicas por padrão.

### Busca de proposições — parsing de referências
```typescript
// "PEC 221/2019" → { siglaTipo: 'PEC', numero: 221, ano: 2019 }
/^([A-Za-z]{2,5})\s+n?\.?\s*(\d+)\s*\/\s*(\d{4})$/i
```
Quando detectado, bypassa `keywords` e usa os parâmetros estruturados da API.

### Remoção de stopwords (busca por tema)
Termos como "jornada de trabalho a 36 horas" → extraídos 4 palavras significativas → `"jornada trabalho 36 semanais"`. A API da Câmara busca no campo `palavrasChave` da proposição, não no texto completo da ementa.

### Disciplina partidária em votações
`oriMap[siglaPartidoBloco] → orientacao`. Deputados em blocos cujo `siglaPartidoBloco` não casa exatamente com `siglaPartido` retornam `null` (exibido como `—`).

### Cap de janela de datas — Votações
A API rejeita HTTP 400 para janelas > ~90 dias. O sistema calcula o diff e, se `>= 90`, limita silenciosamente a 88 dias a partir de `dataFim`, exibindo aviso em âmbar.

### Loop paginado
```typescript
while (true) {
  const res = await fetchDeputados({ itens: 100, pagina })
  todos.push(...res.dados)
  if (!res.links.some((l) => l.rel === 'next')) break
  pagina++
}
```

### Deduplicação de membros de partido
```typescript
const membros = Array.from(new Map(membrosRaw.map((m) => [m.id, m])).values())
```

### `Promise.allSettled`
Páginas multi-bloco usam `allSettled`: falha de um endpoint não derruba a página.

---

## Remuneração dos Deputados — Valores de Referência (2024)

| Componente | Mensal | Anual |
|---|---|---|
| Subsídio (salário bruto) | R$ 44.008,52 | R$ 586.780 *(com 13º + férias)* |
| Verba de Gabinete (pessoal) | R$ 112.000,00 | R$ 1.344.000 |
| Auxílio-moradia | R$ 4.253,00 | R$ 51.036 |
| CEAP máximo (AM/PA) | R$ 50.212,57 | R$ 602.551 |
| **Total máximo estimado** | **R$ 210.474** | **≈ R$ 2.584.367** |

> Fontes: Resolução da Mesa n. 1/2015; Ato da Mesa n. 43/2013; Ato da Presidência n. 56/2023.

---

## Configuração de Imagens (`next.config.ts`)

```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'www.camara.leg.br' },  // fotos dos deputados
    { protocol: 'https', hostname: 'ui-avatars.com' },      // avatar fallback
  ],
}
```

---

## Limitações Conhecidas

| Limitação | Detalhe |
|---|---|
| Rankings CEAP | ~513 req em lotes de 20 via Server Actions — pode levar 30-60 s |
| Fotos e logos | API frequentemente retorna 403 — tratado com fallback automático |
| Votações — janela máxima | API rejeita > ~90 dias; sistema limita a 88 dias com aviso |
| Proposições — busca por ementa | API busca `palavrasChave` (metadado), não texto completo da ementa |
| Escolaridade em `/analise` | Requereria ~513 calls individuais — não implementado |
| Remuneração | API não expõe salários — valores hardcoded da legislação pública |

---

## Referências

- [API dados abertos — Swagger](https://dadosabertos.camara.leg.br/swagger/api.html)
- [Portal de Dados Abertos Legislativos](https://dadosabertos.camara.leg.br)
- [Documentação Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Recharts](https://recharts.org/en-US/)
