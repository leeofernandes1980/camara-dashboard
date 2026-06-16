import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Mail, Phone, MapPin, GraduationCap, User, ExternalLink } from 'lucide-react'
import { fetchDeputado } from '@/lib/api'
import { formatarData } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AvatarImage from '@/components/ui/AvatarImage'
import DeputadoTabs from '@/components/deputados/DeputadoTabs'

interface PageProps {
  params: Promise<{ id: string }>
}

function calcularIdade(dataNascimento: string): number | null {
  if (!dataNascimento) return null
  const nasc = new Date(dataNascimento)
  const hoje = new Date()
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

async function DeputadoContent({ id }: { id: number }) {
  const res = await fetchDeputado(id).catch(() => null)
  if (!res) notFound()

  const deputado = res.dados
  const status = deputado.ultimoStatus
  const idade = deputado.dataNascimento ? calcularIdade(deputado.dataNascimento) : null

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Perfil */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 ring-4 ring-blue-100">
            <AvatarImage src={status?.urlFoto || deputado.urlFoto || ''} alt={deputado.nome} size={128} />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{status?.nome || deputado.nome}</h1>
            {deputado.nomeCivil && deputado.nomeCivil !== (status?.nome || deputado.nome) && (
              <p className="text-gray-500 text-sm mt-0.5">Nome civil: {deputado.nomeCivil}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge texto={status?.siglaPartido || deputado.siglaPartido} cor="blue" />
              <Badge texto={status?.siglaUf || deputado.siglaUf} cor="gray" />
              {status?.situacao && <Badge texto={status.situacao} cor="green" />}
              {deputado.escolaridade && <Badge texto={deputado.escolaridade} cor="purple" />}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
              {deputado.dataNascimento && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>
                    {formatarData(deputado.dataNascimento)}
                    {idade !== null && <span className="ml-1 text-gray-400">({idade} anos)</span>}
                  </span>
                </div>
              )}
              {deputado.municipioNascimento && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{deputado.municipioNascimento} — {deputado.ufNascimento}</span>
                </div>
              )}
              {(status?.gabinete?.email || deputado.email) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${status?.gabinete?.email || deputado.email}`}
                    className="hover:text-blue-600 truncate">
                    {status?.gabinete?.email || deputado.email}
                  </a>
                </div>
              )}
              {status?.gabinete?.telefone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{status.gabinete.telefone}</span>
                </div>
              )}
              {deputado.escolaridade && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  <span>{deputado.escolaridade}</span>
                </div>
              )}
              {deputado.sexo && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Sexo: {deputado.sexo === 'M' ? 'Masculino' : 'Feminino'}</span>
                </div>
              )}
            </div>

            {/* Redes sociais */}
            {deputado.redeSocial && deputado.redeSocial.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {deputado.redeSocial.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-600 hover:bg-blue-100">
                    <ExternalLink className="w-3 h-3" />
                    Rede Social {i + 1}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Gabinete */}
        {status?.gabinete && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Gabinete</h3>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {status.gabinete.predio && <span>Prédio {status.gabinete.predio}</span>}
              {status.gabinete.andar && <span>Andar {status.gabinete.andar}</span>}
              {status.gabinete.sala && <span>Sala {status.gabinete.sala}</span>}
              {status.gabinete.telefone && <span>Tel: {status.gabinete.telefone}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Tabs com Despesas, Proposições, Discursos, Comissões */}
      <DeputadoTabs deputadoId={id} />
    </div>
  )
}

export default async function DeputadoPage({ params }: PageProps) {
  const { id } = await params
  const idNum = Number(id)
  if (isNaN(idNum)) notFound()
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DeputadoContent id={idNum} />
    </Suspense>
  )
}
