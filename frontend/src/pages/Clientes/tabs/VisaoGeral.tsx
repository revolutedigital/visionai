import {
  MapPin,
  Star,
  Phone,
  Globe,
  Tag,
  TrendingUp,
  Award,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  CheckCircle,
} from 'lucide-react';
import { ConfidenceIndicator } from '../../../components/ConfidenceIndicator';

interface ClienteData {
  nome: string;
  endereco: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  tipoEstabelecimento?: string;
  rating?: number;
  totalAvaliacoes?: number;
  potencialCategoria?: string;
  potencialScore?: number;
  status?: string;
  website?: string;
  redesSociais?: string;
  tipologia?: string;
  tipologiaNome?: string;
  tipologiaConfianca?: number;
  tipologiaJustificativa?: string;
  estrategiaComercial?: string;
  dataQualityScore?: number;
  confiabilidadeDados?: string;
  scoringBreakdown?: string;
}

interface VisaoGeralProps {
  cliente: ClienteData;
}

export function VisaoGeral({ cliente }: VisaoGeralProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Informações Básicas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Informações Básicas</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600">Endereço</p>
              <p className="text-sm font-medium text-gray-900">{cliente.endereco}</p>
              {(cliente.cidade || cliente.estado) && (
                <p className="text-xs text-gray-500">
                  {cliente.cidade}
                  {cliente.cidade && cliente.estado && ', '}
                  {cliente.estado}
                </p>
              )}
            </div>
          </div>

          {cliente.telefone && (
            <div className="flex items-start">
              <Phone className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="text-sm font-medium text-gray-900">{cliente.telefone}</p>
              </div>
            </div>
          )}

          {cliente.tipoEstabelecimento && (
            <div className="flex items-start">
              <Tag className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Tipo de Estabelecimento</p>
                <p className="text-sm font-medium text-gray-900">
                  {cliente.tipoEstabelecimento}
                </p>
              </div>
            </div>
          )}

          {cliente.rating && (
            <div className="flex items-start">
              <Star className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Avaliação</p>
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-900 mr-2">
                    {cliente.rating.toFixed(1)}
                  </p>
                  <span className="text-xs text-gray-500">
                    ({cliente.totalAvaliacoes} avaliações)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Potencial & Score */}
      {(cliente.potencialScore || cliente.potencialCategoria) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Potencial de Negócio</h3>
          <div className="space-y-4">
            {cliente.potencialCategoria && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Categoria</p>
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-lg font-semibold ${
                    cliente.potencialCategoria === 'ALTO'
                      ? 'bg-green-100 text-green-800'
                      : cliente.potencialCategoria === 'MÉDIO'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  {cliente.potencialCategoria}
                </div>
              </div>
            )}

            {cliente.potencialScore !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Score de Potencial</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {cliente.potencialScore}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      cliente.potencialCategoria === 'ALTO'
                        ? 'bg-green-500'
                        : cliente.potencialCategoria === 'MÉDIO'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${cliente.potencialScore}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Breakdown do Scoring */}
            {cliente.scoringBreakdown && (() => {
              try {
                const breakdown = JSON.parse(cliente.scoringBreakdown);
                return (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-3 font-medium">Como chegamos a este score:</p>
                    <div className="space-y-2">
                      {breakdown.scoreRating > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">⭐ Rating ({breakdown.rating?.toFixed(1) || 'N/A'})</span>
                          <span className="font-medium text-gray-900">{breakdown.scoreRating} pts</span>
                        </div>
                      )}
                      {breakdown.scoreAvaliacoes > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">💬 Avaliações ({breakdown.totalAvaliacoes || 0})</span>
                          <span className="font-medium text-gray-900">{breakdown.scoreAvaliacoes} pts</span>
                        </div>
                      )}
                      {breakdown.scoreFotosQualidade > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">📸 Qualidade Fotos</span>
                          <span className="font-medium text-gray-900">{breakdown.scoreFotosQualidade} pts</span>
                        </div>
                      )}
                      {breakdown.scoreHorarioFunc > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">🕐 Horário ({breakdown.diasAbertoPorSemana || 0}d/sem)</span>
                          <span className="font-medium text-gray-900">{breakdown.scoreHorarioFunc} pts</span>
                        </div>
                      )}
                      {breakdown.scoreWebsite > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">🌐 Website</span>
                          <span className="font-medium text-gray-900">{breakdown.scoreWebsite} pts</span>
                        </div>
                      )}
                      {breakdown.scoreDensidadeReviews > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">📊 Densidade Reviews</span>
                          <span className="font-medium text-gray-900">{breakdown.scoreDensidadeReviews} pts</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              } catch {
                return null;
              }
            })()}
          </div>
        </div>
      )}

      {/* Tipologia & Estratégia */}
      {cliente.tipologia && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Tipologia & Estratégia
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Tipologia</p>
              <p className="text-sm font-semibold text-gray-900">{cliente.tipologia}</p>
              {cliente.tipologiaNome && (
                <p className="text-xs text-gray-600 mt-1">{cliente.tipologiaNome}</p>
              )}
              {cliente.tipologiaConfianca && (
                <div className="mt-3">
                  <ConfidenceIndicator
                    confidence={cliente.tipologiaConfianca}
                    showLabel={true}
                    showWarning={true}
                    size="sm"
                  />
                </div>
              )}
            </div>

            {cliente.estrategiaComercial && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Estratégia Comercial</p>
                <p className="text-sm text-gray-700">{cliente.estrategiaComercial}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Presença Digital */}
      {(cliente.website || cliente.redesSociais) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Presença Digital</h3>
          <div className="space-y-3">
            {cliente.website && (
              <div className="flex items-center">
                <Globe className="w-4 h-4 text-gray-500 mr-2" />
                <a
                  href={cliente.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline break-all"
                >
                  {cliente.website}
                </a>
              </div>
            )}
            {cliente.redesSociais &&
              (() => {
                try {
                  const redes = JSON.parse(cliente.redesSociais);
                  return (
                    <>
                      {redes.instagram && (
                        <div className="flex items-center">
                          <InstagramIcon className="w-4 h-4 text-pink-600 mr-2" />
                          <a
                            href={redes.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:underline break-all"
                          >
                            Instagram
                          </a>
                        </div>
                      )}
                      {redes.facebook && (
                        <div className="flex items-center">
                          <FacebookIcon className="w-4 h-4 text-blue-600 mr-2" />
                          <a
                            href={redes.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:underline break-all"
                          >
                            Facebook
                          </a>
                        </div>
                      )}
                    </>
                  );
                } catch {
                  return null;
                }
              })()}
          </div>
        </div>
      )}

      {/* Qualidade dos Dados */}
      {cliente.dataQualityScore !== undefined && (
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Qualidade dos Dados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Score de Qualidade:</span>
                <span className="text-2xl font-bold text-indigo-600">
                  {cliente.dataQualityScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    cliente.dataQualityScore >= 80
                      ? 'bg-green-500'
                      : cliente.dataQualityScore >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${cliente.dataQualityScore}%` }}
                ></div>
              </div>
            </div>
            {cliente.confiabilidadeDados && (
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <div>
                  <span className="text-xs text-gray-500">Confiabilidade: </span>
                  <span
                    className={`text-sm font-medium ${
                      cliente.confiabilidadeDados === 'ALTA'
                        ? 'text-green-600'
                        : cliente.confiabilidadeDados === 'MEDIA'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {cliente.confiabilidadeDados}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
