export function formatarData(dataISO: string): string {
  if (!dataISO) return '—'
  try {
    const [datePart] = dataISO.split('T')
    const [ano, mes, dia] = datePart.split('-')
    return `${dia}/${mes}/${ano}`
  } catch {
    return dataISO
  }
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function formatarPlacar(sim: number, nao: number, outros: number): string {
  return `Sim: ${sim} | Não: ${nao} | Outros: ${outros}`
}

export function corVoto(tipoVoto: string): string {
  switch (tipoVoto?.toUpperCase()) {
    case 'SIM':
      return 'text-green-700 bg-green-100'
    case 'NÃO':
    case 'NAO':
      return 'text-red-700 bg-red-100'
    case 'ABSTENÇÃO':
    case 'ABSTENCAO':
      return 'text-yellow-700 bg-yellow-100'
    case 'OBSTRUÇÃO':
    case 'OBSTRUCAO':
      return 'text-orange-700 bg-orange-100'
    case 'ART. 17':
      return 'text-purple-700 bg-purple-100'
    default:
      return 'text-gray-700 bg-gray-100'
  }
}

export function corAprovacao(aprovacao: number): string {
  return aprovacao === 1 ? 'green' : 'red'
}

export function truncarTexto(texto: string, limite: number): string {
  if (!texto) return '—'
  if (texto.length <= limite) return texto
  return texto.substring(0, limite) + '...'
}

export function anoAtual(): number {
  return new Date().getFullYear()
}

export function anosDisponiveis(): number[] {
  const atual = anoAtual()
  const anos: number[] = []
  for (let a = atual; a >= 2019; a--) {
    anos.push(a)
  }
  return anos
}

export function dataHojeISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function data30DiasAtrasISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().split('T')[0]
}
