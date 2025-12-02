import {
  Eye,
  Sparkles,
  Users,
  Home,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface IndicadoresVisuais {
  sinalizacaoExterna: boolean;
  logotipoVisivel: boolean;
  coresInstitucionais: boolean;
  uniformizacao: boolean;
  iluminacao: 'BOA' | 'REGULAR' | 'FRACA';
  limpeza: 'EXCELENTE' | 'BOA' | 'REGULAR' | 'PRECARIA';
  organizacaoEspacial: 'EXCELENTE' | 'BOA' | 'REGULAR' | 'PRECARIA';
  materialPromocional: boolean;
  tecnologiaAparente: string[];
}

interface VisualInsightsProps {
  qualidadeSinalizacao?: string;
  presencaBranding?: boolean;
  nivelProfissionalizacao?: string;
  publicoAlvo?: string;
  ambienteEstabelecimento?: string;
  indicadoresVisuais?: string;
}

export function VisualInsights({
  qualidadeSinalizacao,
  presencaBranding,
  nivelProfissionalizacao,
  publicoAlvo,
  ambienteEstabelecimento,
  indicadoresVisuais,
}: VisualInsightsProps) {
  // Parse indicadores visuais
  let indicadores: IndicadoresVisuais | null = null;
  if (indicadoresVisuais) {
    try {
      indicadores = JSON.parse(indicadoresVisuais);
    } catch {
      indicadores = null;
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality.toUpperCase()) {
      case 'EXCELENTE':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'BOA':
      case 'BOA':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'REGULAR':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'PRECARIA':
      case 'FRACA':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getProfessionalismColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ALTO':
        return 'text-green-600 bg-green-50';
      case 'MEDIO':
      case 'MÉDIO':
        return 'text-yellow-600 bg-yellow-50';
      case 'BAIXO':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const BooleanIndicator = ({ value, label }: { value: boolean; label: string }) => (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-700">{label}</span>
      {value ? (
        <CheckCircle2 className="w-5 h-5 text-green-600" />
      ) : (
        <XCircle className="w-5 h-5 text-gray-400" />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
          <Eye className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Análise Visual (Sprint 2)</h3>
          <p className="text-sm text-gray-500">Insights de branding e profissionalização</p>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Qualidade Sinalização */}
        {qualidadeSinalizacao && (
          <div
            className={`p-4 rounded-lg border ${getQualityColor(qualidadeSinalizacao)}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <p className="text-xs font-semibold uppercase">Sinalização</p>
            </div>
            <p className="text-lg font-bold">{qualidadeSinalizacao}</p>
          </div>
        )}

        {/* Presença Branding */}
        {presencaBranding !== undefined && (
          <div
            className={`p-4 rounded-lg border ${
              presencaBranding
                ? 'text-green-600 bg-green-50 border-green-200'
                : 'text-gray-600 bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5" />
              <p className="text-xs font-semibold uppercase">Branding</p>
            </div>
            <p className="text-lg font-bold">
              {presencaBranding ? 'Presente' : 'Ausente'}
            </p>
          </div>
        )}

        {/* Nível Profissionalização */}
        {nivelProfissionalizacao && (
          <div
            className={`p-4 rounded-lg border ${getProfessionalismColor(
              nivelProfissionalizacao
            )} border-opacity-30`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5" />
              <p className="text-xs font-semibold uppercase">Profissionalização</p>
            </div>
            <p className="text-lg font-bold">{nivelProfissionalizacao}</p>
          </div>
        )}

        {/* Ambiente */}
        {ambienteEstabelecimento && (
          <div className="p-4 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-5 h-5" />
              <p className="text-xs font-semibold uppercase">Ambiente</p>
            </div>
            <p className="text-lg font-bold">{ambienteEstabelecimento}</p>
          </div>
        )}
      </div>

      {/* Público-Alvo */}
      {publicoAlvo && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-5 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Público-Alvo Identificado</h4>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{publicoAlvo}</p>
        </div>
      )}

      {/* Indicadores Visuais Detalhados */}
      {indicadores && (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-gray-600" />
            Indicadores Visuais Detalhados
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            <BooleanIndicator
              value={indicadores.sinalizacaoExterna}
              label="Sinalização Externa"
            />
            <BooleanIndicator
              value={indicadores.logotipoVisivel}
              label="Logotipo Visível"
            />
            <BooleanIndicator
              value={indicadores.coresInstitucionais}
              label="Cores Institucionais"
            />
            <BooleanIndicator
              value={indicadores.uniformizacao}
              label="Uniformização"
            />
            <BooleanIndicator
              value={indicadores.materialPromocional}
              label="Material Promocional"
            />
          </div>

          {/* Qualitative Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Iluminação</p>
              <p
                className={`text-sm font-semibold ${
                  indicadores.iluminacao === 'BOA'
                    ? 'text-green-600'
                    : indicadores.iluminacao === 'REGULAR'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {indicadores.iluminacao}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Limpeza</p>
              <p className={`text-sm font-semibold ${getQualityColor(indicadores.limpeza)}`}>
                {indicadores.limpeza}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Organização</p>
              <p
                className={`text-sm font-semibold ${getQualityColor(
                  indicadores.organizacaoEspacial
                )}`}
              >
                {indicadores.organizacaoEspacial}
              </p>
            </div>
          </div>

          {/* Tecnologia Aparente */}
          {indicadores.tecnologiaAparente && indicadores.tecnologiaAparente.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Tecnologia Aparente:
              </p>
              <div className="flex flex-wrap gap-2">
                {indicadores.tecnologiaAparente.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
