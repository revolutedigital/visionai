import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Award,
  BarChart3,
  ListChecks,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';

interface DataQualityReport {
  overview: {
    totalClientes: number;
    mediaQualidade: number;
    excelente: number;
    alta: number;
    media: number;
    baixa: number;
  };
  topPrioridades: {
    id: string;
    nome: string;
    endereco: string;
    dataQualityScore: number;
    confiabilidade: string;
    camposCriticos: string[];
    recomendacoes: string[];
  }[];
  camposMaisFaltando: {
    campo: string;
    total: number;
  }[];
}

interface DataQualityProps {
  report: DataQualityReport | null;
  loading: boolean;
}

export function DataQuality({ report, loading }: DataQualityProps) {
  const navigate = useNavigate();
  const [expandedCampo, setExpandedCampo] = useState<string | null>(null);
  const [showAllPriorities, setShowAllPriorities] = useState(false);

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const getConfiabilidadeColor = (conf: string) => {
    switch (conf.toUpperCase()) {
      case 'EXCELENTE':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'ALTA':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'MEDIA':
      case 'MÉDIA':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'BAIXA':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const { overview, topPrioridades, camposMaisFaltando } = report;
  const displayedPriorities = showAllPriorities ? topPrioridades : topPrioridades.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
          <Database className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Qualidade de Dados (Sprint 3)</h3>
          <p className="text-sm text-gray-500">
            Garantindo máximo aproveitamento dos dados de cada cliente
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Score Médio */}
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5" />
            <p className="text-sm font-medium opacity-90">Score Médio de Qualidade</p>
          </div>
          <p className="text-4xl font-bold">{overview.mediaQualidade}%</p>
          <p className="text-sm opacity-75 mt-2">de {overview.totalClientes} clientes</p>
        </div>

        {/* Distribuição */}
        <div className="md:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <p className="text-sm font-semibold text-gray-700">Distribuição por Confiabilidade</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-100">
              <span className="text-xs font-medium text-green-700">Excelente</span>
              <span className="text-lg font-bold text-green-700">{overview.excelente}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-xs font-medium text-blue-700">Alta</span>
              <span className="text-lg font-bold text-blue-700">{overview.alta}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg border border-yellow-100">
              <span className="text-xs font-medium text-yellow-700">Média</span>
              <span className="text-lg font-bold text-yellow-700">{overview.media}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-100">
              <span className="text-xs font-medium text-red-700">Baixa</span>
              <span className="text-lg font-bold text-red-700">{overview.baixa}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Campos Faltando */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <h4 className="font-semibold text-gray-900">
            Campos Mais Frequentemente Ausentes
          </h4>
          <span className="text-xs text-gray-500">(Clique para ver clientes afetados)</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {camposMaisFaltando.slice(0, 10).map((campo, idx) => (
            <button
              key={idx}
              onClick={() => setExpandedCampo(expandedCampo === campo.campo ? null : campo.campo)}
              className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200 hover:border-orange-400 hover:shadow-md transition-all text-left"
            >
              <p className="text-xs font-medium text-gray-600 mb-1">{campo.campo}</p>
              <p className="text-2xl font-bold text-orange-600">{campo.total}</p>
              <p className="text-xs text-gray-500">clientes</p>
              {expandedCampo === campo.campo && (
                <ChevronUp className="w-4 h-4 text-orange-600 mt-2" />
              )}
              {expandedCampo !== campo.campo && (
                <ChevronDown className="w-4 h-4 text-orange-600 mt-2" />
              )}
            </button>
          ))}
        </div>

        {/* Drill-down: Mostrar clientes afetados */}
        {expandedCampo && (
          <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm font-semibold text-orange-900 mb-3">
              Clientes sem o campo "{expandedCampo}":
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {topPrioridades
                .filter(c => c.camposCriticos.includes(expandedCampo))
                .slice(0, 20)
                .map(cliente => (
                  <button
                    key={cliente.id}
                    onClick={() => navigate(`/clientes/${cliente.id}`)}
                    className="w-full flex items-center justify-between p-2 bg-white rounded border border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{cliente.nome}</p>
                      <p className="text-xs text-gray-600 truncate">{cliente.endereco}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-orange-600 flex-shrink-0 ml-2" />
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Prioridades */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks className="w-5 h-5 text-indigo-600" />
          <h4 className="font-semibold text-gray-900">
            Top 10 Clientes Prioritários para Enriquecimento
          </h4>
          <span className="text-xs text-gray-500">(Baixa qualidade de dados)</span>
        </div>

        <div className="space-y-3">
          {displayedPriorities.map((cliente, idx) => (
            <button
              key={cliente.id}
              onClick={() => navigate(`/clientes/${cliente.id}`)}
              className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                    <h5 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {cliente.nome}
                    </h5>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <p className="text-xs text-gray-600">{cliente.endereco}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">
                      {cliente.dataQualityScore}%
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold border ${getConfiabilidadeColor(
                      cliente.confiabilidade
                    )}`}
                  >
                    {cliente.confiabilidade}
                  </span>
                </div>
              </div>

              {/* Campos Críticos */}
              {cliente.camposCriticos.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    Campos Críticos Faltando:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {cliente.camposCriticos.map((campo, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium"
                      >
                        {campo}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recomendações */}
              {cliente.recomendacoes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-indigo-500" />
                    Ações Recomendadas:
                  </p>
                  <ul className="space-y-1">
                    {cliente.recomendacoes.slice(0, 3).map((rec, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Botão "Ver Mais" */}
        {topPrioridades.length > 10 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAllPriorities(!showAllPriorities)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold flex items-center gap-2 mx-auto"
            >
              {showAllPriorities ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Mostrar Menos
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Ver Todos ({topPrioridades.length})
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
