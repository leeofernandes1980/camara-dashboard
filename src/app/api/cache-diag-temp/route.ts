import { fetchDespesasDeputado } from '@/lib/api'

export async function GET() {
  const inicio = Date.now()
  const res = await fetchDespesasDeputado(204379, { ano: new Date().getFullYear() - 1, itens: 100 })
  const duracaoMs = Date.now() - inicio
  return Response.json({ duracaoMs, itens: res.dados.length, timestamp: new Date().toISOString() })
}
