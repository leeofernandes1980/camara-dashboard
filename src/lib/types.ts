export interface Deputado {
  id: number
  uri: string
  nome: string
  siglaPartido: string
  uriPartido: string
  siglaUf: string
  idLegislatura: number
  urlFoto: string
  email: string
}

export interface DeputadoDetalhe extends Deputado {
  cpf: string
  sexo: string
  dataNascimento: string
  dataFalecimento: string
  ufNascimento: string
  municipioNascimento: string
  escolaridade: string
  situacao: string
  condicaoEleitoral: string
  nomeCivil: string
  redeSocial: string[]
  ultimoStatus: {
    id: number
    uri: string
    nome: string
    siglaPartido: string
    uriPartido: string
    siglaUf: string
    idLegislatura: number
    urlFoto: string
    email: string
    data: string
    idLegislaturaAtual: number
    nomeEleitoral: string
    gabinete: {
      nome: string
      predio: string
      sala: string
      andar: string
      telefone: string
      email: string
    }
    situacao: string
    condicaoEleitoral: string
    descricaoStatus: string
  }
}

export interface Votacao {
  id: string
  uri: string
  data: string
  dataHoraRegistro: string
  siglaOrgao: string
  uriOrgao: string
  uriEvento: string
  proposicaoObjeto: string
  descricao: string
  aprovacao: number
  votosSim: number
  votosNao: number
  votosOutros: number
}

export interface VotacaoDeputado extends Votacao {
  tipoVoto: string
}

export interface Voto {
  tipoVoto: string
  dataRegistroVoto: string
  deputado_: {
    id: number
    uri: string
    nome: string
    siglaPartido: string
    uriPartido: string
    siglaUf: string
    idLegislatura: number
    urlFoto: string
    email: string
  }
}

export interface Orientacao {
  codPartidoBloco: string
  siglaPartidoBloco: string
  codOrientacao: string
  orientacao: string
}

export interface Despesa {
  ano: number
  mes: number
  tipoDespesa: string
  codDocumento: number
  tipoDocumento: string
  codTipoDocumento: number
  dataDocumento: string
  numDocumento: string
  valorDocumento: number
  urlDocumento: string
  nomeFornecedor: string
  cnpjCpfFornecedor: string
  valorLiquido: number
  valorGlosa: number
  numRessarcimento: string
  codLote: number
  parcela: number
}

export interface PaginatedResponse<T> {
  dados: T[]
  links: { rel: string; href: string }[]
}

export interface Orgao {
  id: number
  uri: string
  sigla: string
  nome: string
  apelido: string
  codTipoOrgao: number
  tipoOrgao: string
  nomeTipoOrgao: string
  nomePublicacao: string
  sala: string
  codSituacao: number
  situacao: string
  urlWebsite: string
  urlFoto: string
  idLegislaturaInicial: number
  idLegislaturaFinal: number
  casa: string
}

// ── Proposições ──────────────────────────────────────────
export interface Proposicao {
  id: number
  uri: string
  siglaTipo: string
  codTipo: number
  numero: number
  ano: number
  ementa: string
}

export interface ProposicaoDetalhe {
  id: number
  uri: string
  siglaTipo: string
  codTipo: number
  numero: number
  ano: number
  ementa: string
  ementaDetalhada: string
  keywords: string
  dataApresentacao: string
  statusProposicao: {
    dataHora: string
    sequencia: number
    siglaOrgao: string
    uriOrgao: string
    regime: string
    descricaoTramitacao: string
    codTipoTramitacao: string
    descricaoSituacao: string
    codSituacao: number
    despacho: string
    url: string
    ambito: string
    apreciacao: string
  }
}

export interface AutorProposicao {
  uri: string
  nome: string
  codTipo: number
  tipo: string
  ordemAssinatura: number
  proponente: number
}

export interface TramitacaoProposicao {
  dataHora: string
  sequencia: number
  siglaOrgao: string
  descricaoTramitacao: string
  descricaoSituacao: string
  despacho: string
  url: string
}

// ── Partidos ─────────────────────────────────────────────
export interface PartidoItem {
  id: number
  uri: string
  sigla: string
  nome: string
  urlLogo: string
  idLegislatura: number
}

export interface Partido {
  id: number
  uri: string
  sigla: string
  nome: string
  urlLogo: string
  status: {
    data: string
    idLegislatura: string
    situacao: string
    totalPosse: string
    totalMembros: string
    uriMembros: string
    lider: {
      uri: string
      nome: string
      siglaPartido: string
      uriPartido: string
      uf: string
      idLegislatura: number
      urlFoto: string
      email: string
    }
  }
}

// ── Eventos / Sessões ────────────────────────────────────
export interface Evento {
  id: number
  uri: string
  dataHoraInicio: string
  dataHoraFim: string
  situacao: string
  descricaoTipo: string
  descricao: string
  localExterno: string
  orgaos: Array<{
    uri: string
    sigla: string
    nome: string
    apelido: string
    codTipoOrgao: number
    tipoOrgao: string
  }>
  localCamara: {
    nome: string
    predio: string
    sala: string
    andar: string
  }
  urlRegistro: string
}

// ── Discurso ─────────────────────────────────────────────
export interface Discurso {
  dataHoraInicio: string
  dataHoraFim: string
  tipoDiscurso: string
  urlTexto: string
  urlAudio: string
  urlVideo: string
  faseEvento: {
    titulo: string
    dataHoraInicio: string
    dataHoraFim: string
  }
  transcricao: string
  keywords: string
  sumario: string
}

// ── Órgão de Membro ──────────────────────────────────────
export interface OrgaoMembro {
  idOrgao: number
  uriOrgao: string
  siglaOrgao: string
  nomeOrgao: string
  nomePublicacao: string
  titulo: string
  codTitulo: string
  efetivo: boolean
  codTipoMembro: number
  descricaoTipoMembro: string
  dataInicio: string
  dataFim: string
}

// ── Tipos auxiliares de análise ──────────────────────────
export interface DeputadoRanking extends Deputado {
  totalGasto: number
  totalProposicoes?: number
}

export interface EstatisticaPartido {
  sigla: string
  nome: string
  totalDeputados: number
  ufs: string[]
}

export interface EstatisticaEstado {
  uf: string
  totalDeputados: number
  partidos: string[]
}
