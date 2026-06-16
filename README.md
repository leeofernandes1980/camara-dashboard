# Câmara Dashboard

Dashboard de dados públicos da Câmara dos Deputados do Brasil, consumindo em tempo real a API oficial de dados abertos legislativos.

---

## Visão Geral

Aplicação web que visualiza dados públicos da Câmara Federal brasileira: deputados, votações, proposições legislativas, partidos, despesas CEAP, remuneração parlamentar e rankings. Todos os dados são obtidos diretamente da API pública — sem banco de dados próprio e sem autenticação.

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
# Instalar dependências
npm install

# Servidor de desenvolvimento
npm run dev

# Build de produção
npm run build
npm start

# Lint
npm run lint
```

A aplicação estará disponível em `http://localhost:3000`.

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
    │   ├── actions.ts              # Server Actions (chamadas à API seguras para o browser)
    │   ├── layout.tsx              # Layout raiz (Sidebar + Header)
    │   ├── globals.css
    │   ├── page.tsx                # Home — painel geral
    │   ├── deputados/
    │   │   ├── page.tsx            # Lista de deputados com filtros
    │   │   └── [id]/page.tsx       # Perfil completo do deputado
    │   ├── votacoes/
    │   │   ├── page.tsx            # Lista de votações com filtros
    │   │   └── [id]/page.tsx       # Detalhe da votação (votos + orientações)
    │   ├── proposicoes/
    │   │   ├── page.tsx            # Lista de proposições com filtros
    │   │   └── [id]/page.tsx       # Detalhe + tramitação + autores
    │   ├── partidos/
    │   │   ├── page.tsx            # Listagem de partidos
    │   │   └── [id]/page.tsx       # Perfil do partido (membros + UFs)
    │   ├── remuneracao/
    │   │   └── page.tsx            # Remuneração e custo do deputado
    │   ├── cota-parlamentar/
    │   │   └── page.tsx            # Consulta de despesas CEAP
    │   ├── analise/
    │   │   └── page.tsx            # Análise de composição da Câmara
    │   └── rankings/
    │       └── page.tsx            # Rankings de gastos CEAP
    ├── lib/
    │   ├── types.ts                # Interfaces TypeScript
    │   ├── api.ts                  # Funções de fetch da API (uso server-side)
    │   └── utils.ts                # Funções utilitárias
    ├── hooks/
    │   ├── useDeputados.ts
    │   ├── useVotacoes.ts
    │   ├── useProposicoes.ts
    │   ├── usePartidos.ts
    │   ├── usePaginacao.ts
    │   └── useDebounce.ts
    └── components/
        ├── layout/
        │   ├── Sidebar.tsx         # Navegação lateral (9 itens)
        │   └── Header.tsx
        ├── ui/
        │   ├── Badge.tsx
        │   ├── StatCard.tsx
        │   ├── LoadingSpinner.tsx
        │   ├── ErrorMessage.tsx
        │   ├── Pagination.tsx
        │   ├── AvatarImage.tsx     # Client — foto com fallback ui-avatars
        │   └── PartidoLogo.tsx     # Client — logo com fallback de iniciais
        ├── deputados/
        │   ├── DeputadoCard.tsx
        │   ├── DeputadoTable.tsx
        │   ├── DeputadoFiltros.tsx
        │   └── DeputadoTabs.tsx    # Client — abas lazy do perfil
        ├── votacoes/
        │   ├── VotacaoCard.tsx
        │   ├── VotacaoFiltros.tsx
        │   ├── VotosChart.tsx      # PieChart (Sim/Não/Outros)
        │   └── OrientacoesTable.tsx
        ├── proposicoes/
        │   ├── ProposicaoCard.tsx
        │   └── ProposicaoFiltros.tsx
        ├── partidos/
        │   └── PartidoCard.tsx
        ├── cota/
        │   ├── GastosTable.tsx
        │   ├── GastosChart.tsx     # BarChart de despesas por categoria/mês
        │   └── CotatFiltros.tsx
        ├── analise/
        │   ├── DistribuicaoPartidosChart.tsx
        │   └── DistribuicaoEstadosChart.tsx
        ├── remuneracao/
        │   └── CeapDeputadoSearch.tsx  # Client — busca CEAP por deputado/ano
        └── rankings/
            ├── RankingTable.tsx
            └── GastosRankingLoader.tsx  # Client — ranking batch via Server Actions
```

---

## Páginas

### `/` — Home
Painel geral com estatísticas rápidas, votações e proposições recentes, deputados em destaque e links de acesso rápido para todas as seções. Carrega 4 blocos em paralelo com `Promise.allSettled`.

### `/deputados` — Lista de Deputados
Filtros por nome, UF, partido e sexo. Alterna entre cards e tabela. Paginação server-side.

### `/deputados/[id]` — Perfil do Deputado
Dados cadastrais, gabinete, redes sociais e **4 abas com carregamento lazy**:
- **Despesas CEAP** — tabela + gráfico de barras por categoria, com filtro de ano
- **Proposições** — lista paginada de projetos do deputado
- **Discursos** — discursos recentes com sumário
- **Comissões** — órgãos dos quais o deputado é membro

### `/votacoes` — Lista de Votações
Filtros por data e resultado. Paginação.

### `/votacoes/[id]` — Detalhe da Votação
PieChart de votos (Sim/Não/Outros), tabela de orientações por bancada, lista de votos individuais.

### `/proposicoes` — Lista de Proposições
Filtros por tipo (PL, PEC, MPV…), ano e autor.

### `/proposicoes/[id]` — Detalhe da Proposição
Ementa, situação atual, autores com link para perfil, histórico de tramitação em ordem cronológica inversa.

### `/partidos` — Lista de Partidos
Cards com total de deputados e estados representados.

### `/partidos/[id]` — Perfil do Partido
Logo, líder da bancada, distribuição por UF, grid de todos os membros (com deduplicação de IDs duplicados da API).

### `/remuneracao` — Remuneração e Custo do Deputado *(nova)*
Análise completa dos custos por parlamentar:
- **StatCards** de resumo: subsídio, verba de gabinete, auxílio-moradia, CEAP máximo
- **Tabela de composição** com valores mensais e anuais de cada componente e total máximo estimado
- **Cards informativos**: passagens aéreas, plano de saúde, previdência patronal
- **Buscador interativo** (autocomplete por nome) + seletor de ano → CEAP real via Server Action
- **Gráfico mensal** de CEAP (BarChart)
- **Categorias de despesa** com barras de progresso
- **Calculadora de custo total**: fixo (lei) + CEAP real = estimativa ao contribuinte
- **Nota metodológica** sobre subsídio vs. verba de gabinete vs. CEAP

### `/cota-parlamentar` — Cota Parlamentar (CEAP)
Busca por deputado e ano. Gráfico mensal e tabela detalhada de despesas com link do documento.

### `/analise` — Análise da Câmara
Gráficos de distribuição por partido e por UF. Estatísticas de composição da legislatura.

### `/rankings` — Rankings
Ranking dos 50 maiores gastadores de CEAP. Carregamento via Server Actions em lotes de 20 deputados com barra de progresso.

---

## Server Actions (`src/app/actions.ts`)

As Server Actions permitem que componentes Client chamem funções que executam **no servidor**, evitando CORS e rate-limit da API da Câmara quando chamada diretamente do browser.

| Função | Parâmetros | Retorno | Uso |
|---|---|---|---|
| `getTodosDeputados()` | — | `Deputado[]` | Carrega todos os 513 deputados (loop paginado) |
| `getBatchDespesas(ids, ano)` | `number[]`, `number` | `Record<number, number>` | Soma CEAP de um lote de deputados em paralelo |
| `buscarDeputados(nome)` | `string` | `Deputado[]` | Busca deputados por nome (autocomplete) |
| `getCeapResumo(id, ano)` | `number`, `number` | `{ total, porMes, porCategoria }` | Carrega todas as despesas paginadas e consolida por mês e categoria |

> **Por que Server Actions?**  
> A API da Câmara aplica rate-limit em rajadas de requisições do browser. Com Server Actions as chamadas saem do servidor Next.js (server-to-server), sem restrições CORS e com limites mais altos.

---

## Camada de API (`src/lib/api.ts`)

Todas as funções usam `cache: 'no-store'` e lançam erros com mensagens descritivas. São destinadas ao uso **server-side** (Server Components ou Server Actions).

### Padrão de resposta
```typescript
type PaginatedResponse<T> = {
  dados: T[]
  links: { rel: string; href: string }[]  // links.rel === 'next' indica próxima página
}
```

### Funções disponíveis

#### Deputados
| Função | Endpoint | Descrição |
|---|---|---|
| `fetchDeputados(params?)` | `GET /deputados` | Lista paginada com filtros |
| `fetchTodosDeputados()` | `GET /deputados` (loop) | Todos os 513 deputados (~6 requisições) |
| `fetchDeputado(id)` | `GET /deputados/{id}` | Detalhes de um deputado |
| `fetchDespesasDeputado(id, params?)` | `GET /deputados/{id}/despesas` | Despesas CEAP paginadas |
| `fetchDespesasTotalDeputado(id, ano)` | `GET /deputados/{id}/despesas` | Soma total do ano |
| `fetchDiscursosDeputado(id, params?)` | `GET /deputados/{id}/discursos` | Discursos |
| `fetchOrgaosDeputado(id)` | `GET /deputados/{id}/orgaos` | Comissões |
| `fetchProposicoesDeputado(id, params?)` | `GET /proposicoes?idDeputadoAutor` | Proposições por autor |

#### Votações
| Função | Endpoint | Descrição |
|---|---|---|
| `fetchVotacoes(params?)` | `GET /votacoes` | Lista paginada |
| `fetchVotacao(id)` | `GET /votacoes/{id}` | Detalhe |
| `fetchVotos(id)` | `GET /votacoes/{id}/votos` | Votos individuais |
| `fetchOrientacoes(id)` | `GET /votacoes/{id}/orientacoes` | Orientações de bancada |

#### Proposições
| Função | Endpoint | Descrição |
|---|---|---|
| `fetchProposicoes(params?)` | `GET /proposicoes` | Lista com filtros |
| `fetchProposicao(id)` | `GET /proposicoes/{id}` | Detalhe |
| `fetchAutoresProposicao(id)` | `GET /proposicoes/{id}/autores` | Autores |
| `fetchTramitacoesProposicao(id)` | `GET /proposicoes/{id}/tramitacoes` | Histórico |

#### Partidos
| Função | Endpoint | Descrição |
|---|---|---|
| `fetchPartidos(params?)` | `GET /partidos` | Lista |
| `fetchPartido(id)` | `GET /partidos/{id}` | Detalhe com líder e status |
| `fetchMembrosPartido(id, params?)` | `GET /partidos/{id}/membros` | Membros |

#### Órgãos e Eventos
| Função | Endpoint | Descrição |
|---|---|---|
| `fetchOrgaos(params?)` | `GET /orgaos` | Lista de órgãos |
| `fetchEventos(params?)` | `GET /eventos` | Sessões e eventos |

---

## Tipos TypeScript (`src/lib/types.ts`)

| Interface | Descrição |
|---|---|
| `Deputado` | Listagem — id, nome, partido, UF, foto, e-mail |
| `DeputadoDetalhe` | Detalhes — estende Deputado com gabinete, escolaridade, situação |
| `Votacao` | id, data, descrição, aprovação, placar |
| `Voto` | tipoVoto + dados do deputado |
| `Orientacao` | Orientação de bancada em uma votação |
| `Despesa` | Despesa CEAP — tipo, fornecedor, valor, documento |
| `Proposicao` | Listagem — id, tipo, número, ano, ementa |
| `ProposicaoDetalhe` | Detalhes com tramitação atual e keywords |
| `AutorProposicao` | Autor de uma proposição |
| `TramitacaoProposicao` | Passo no histórico de tramitação |
| `PartidoItem` | Listagem — id, sigla, nome, logo |
| `Partido` | Detalhe com status, líder e total de membros |
| `Evento` | Sessão/evento — data, tipo, órgãos, local |
| `Discurso` | Sumário, palavras-chave, links |
| `OrgaoMembro` | Participação de deputado em órgão/comissão |
| `DeputadoRanking` | Deputado + totalGasto (rankings) |
| `EstatisticaPartido` | Sigla, nome, total deputados, UFs |
| `EstatisticaEstado` | UF, total deputados, partidos presentes |
| `PaginatedResponse<T>` | Envelope `{ dados: T[], links: [...] }` |

---

## Utilitários (`src/lib/utils.ts`)

| Função | Descrição |
|---|---|
| `formatarData(dataISO)` | `"2024-03-15"` → `"15/03/2024"` |
| `formatarMoeda(valor)` | Formata em R$ com separadores brasileiros |
| `formatarPlacar(sim, nao, outros)` | Texto resumido do placar |
| `corVoto(tipoVoto)` | Classes Tailwind para badge de voto |
| `corAprovacao(aprovacao)` | `1` → `'green'`, `0` → `'red'` |
| `truncarTexto(texto, limite)` | Trunca com reticências |
| `anoAtual()` | Ano corrente |
| `anosDisponiveis()` | Array do ano corrente até 2019 |
| `dataHojeISO()` | `"YYYY-MM-DD"` de hoje |
| `data30DiasAtrasISO()` | `"YYYY-MM-DD"` de 30 dias atrás |

---

## Hooks Customizados (`src/hooks/`)

| Hook | Dados gerenciados |
|---|---|
| `useDeputados(filtros)` | Lista com filtros e paginação |
| `useVotacoes(filtros)` | Lista com filtros e paginação |
| `useProposicoes(filtros)` | Lista com filtros e paginação |
| `usePartidos()` | Lista de partidos |
| `usePaginacao()` | Lógica genérica de paginação |
| `useDebounce(value, delay)` | Debounce de valores para filtros |

---

## Componentes

### Layout

**`Sidebar`** — 9 itens de navegação: Home, Deputados, Votações, Proposições, Partidos, Rankings, Análise, Remuneração, Cota Parlamentar. Responsivo com menu hambúrguer.

### UI Genéricos

| Componente | Props | Descrição |
|---|---|---|
| `Badge` | `texto`, `cor` | Cores: `gray\|blue\|green\|red\|yellow\|purple\|orange` |
| `StatCard` | `titulo`, `valor`, `icone`, `cor` | Card com ícone Lucide. `valor` aceita `string\|number` |
| `LoadingSpinner` | — | Spinner centralizado |
| `ErrorMessage` | `mensagem` | Bloco de erro estilizado |
| `Pagination` | `pagina`, `temProxima`, callbacks | Botões Anterior/Próxima |
| `AvatarImage` | `src`, `alt`, `size`, `className` | **Client.** `next/image` com fallback `ui-avatars.com`. `alt` usa `?? ''` para garantir string |
| `PartidoLogo` | `src`, `sigla`, `className` | **Client.** `<img>` com fallback de iniciais |

### Feature Components

**`DeputadoTabs`** (Client) — 4 abas com lazy loading via `useEffect` por aba selecionada.

**`GastosRankingLoader`** (Client) — Orquestra o ranking de gastos:
1. Chama `getTodosDeputados()` (Server Action)
2. Processa em lotes de 20 com `getBatchDespesas()` (Server Action)
3. Exibe barra de progresso + Top 50 no `RankingTable`

**`CeapDeputadoSearch`** (Client) — Busca interativa na página de remuneração:
1. Autocomplete de deputado via `buscarDeputados()` (Server Action com debounce 300ms)
2. Seletor de ano
3. Consulta CEAP via `getCeapResumo()` (Server Action — percorre todas as páginas)
4. Exibe total, gráfico mensal (BarChart), categorias com barras, calculadora de custo total

**`VotosChart`** — PieChart com `{ name, value }` para Sim/Não/Outros.

**`GastosChart`** — BarChart com categorias de despesa (eixo Y em R$ mil).

---

## Decisões de Arquitetura

### Server vs Client Components
Server Components são o padrão. Client Components (`'use client'`) apenas quando necessário: `useState`/`useEffect`, handlers de eventos, `usePathname`.

### Server Actions (`src/app/actions.ts`)
Usadas quando Client Components precisam chamar a API da Câmara. A API aplica rate-limit em rajadas do browser; requisições server-to-server têm limites mais altos e sem CORS. Padrão adotado em `GastosRankingLoader` e `CeapDeputadoSearch`.

### `export const dynamic = 'force-dynamic'`
Necessário em rotas **não-dinâmicas** (sem `[param]`) que usam `cache: 'no-store'`. Evita tentativa de pré-render estático no build. Aplicado em: `page.tsx`, `analise/page.tsx`, `rankings/page.tsx`, `partidos/page.tsx`, `partidos/[id]/page.tsx`, `proposicoes/[id]/page.tsx`.

Rotas dinâmicas (`[id]`) já são dinâmicas por padrão — não precisam de `force-dynamic`.

### Loop de paginação (`fetchTodosDeputados`)
```typescript
while (true) {
  const res = await fetchDeputados({ itens: 100, pagina })
  todos.push(...res.dados)
  if (!res.links.some((l) => l.rel === 'next')) break
  pagina++
}
// ~6 requisições para 513 deputados
```

### Deduplicação de membros de partido
A API retorna IDs duplicados em `/partidos/{id}/membros`. Resolvido com:
```typescript
const membros = Array.from(new Map(membrosRaw.map((m) => [m.id, m])).values())
```

### `Promise.allSettled`
Páginas multi-bloco usam `allSettled` em vez de `all`: a falha de um endpoint não derruba a página — o bloco afetado simplesmente não é exibido.

---

## Remuneração dos Deputados — Valores de Referência (2024)

A API da Câmara **não possui endpoint de remuneração**. Os valores abaixo são públicos, previstos em legislação, e iguais para todos os 513 deputados.

| Componente | Mensal | Anual |
|---|---|---|
| Subsídio (salário bruto) | R$ 44.008,52 | R$ 586.780 *(com 13º + férias)* |
| Verba de Gabinete (pessoal) | R$ 112.000,00 | R$ 1.344.000 |
| Auxílio-moradia *(se elegível)* | R$ 4.253,00 | R$ 51.036 |
| CEAP *(valor máximo — AM/PA)* | R$ 50.212,57 | R$ 602.551 |
| **Total máximo estimado** | **R$ 210.474** | **≈ R$ 2.584.367** |

> Não inclui INSS patronal (~20% do subsídio), plano de saúde, seguro de vida e outros benefícios acessórios.  
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

Logos dos partidos usam `<img>` nativo (não `next/image`) — a URL varia e o fallback é gerenciado pelo `PartidoLogo`.

---

## Limitações Conhecidas

- **Rankings:** ~513 requisições via Server Actions (lotes de 20). Em conexões lentas pode levar 30-60 s.
- **Fotos e logos:** a API frequentemente retorna 403. `AvatarImage` e `PartidoLogo` tratam automaticamente com fallback.
- **Sem cache:** `cache: 'no-store'` em todas as requisições. Para produção, considerar `next: { revalidate: 3600 }`.
- **Remuneração:** API não expõe salários — valores fixos são hardcoded a partir da legislação pública.

---

## Referências

- [API dados abertos — Swagger](https://dadosabertos.camara.leg.br/swagger/api.html)
- [Portal de Dados Abertos Legislativos](https://dadosabertos.camara.leg.br)
- [Documentação Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Recharts](https://recharts.org/en-US/)
