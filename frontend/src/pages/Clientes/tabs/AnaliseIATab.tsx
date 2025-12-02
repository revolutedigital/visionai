import { Brain, TrendingUp, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

interface AnaliseConsolidada {
  analiseGeral?: string;
  insights?: string;
  indicadoresPotencial?: {
    score: number;
    categoria: string;
    fatoresPositivos?: string[];
    fatoresNegativos?: string[];
  };
}

interface AnaliseIATabProps {
  analiseConsolidada?: AnaliseConsolidada;
  fotosAnalisadas: number;
  totalFotos: number;
}

export function AnaliseIATab({
  analiseConsolidada,
  fotosAnalisadas,
  totalFotos,
}: AnaliseIATabProps) {
  if (!analiseConsolidada || fotosAnalisadas === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Análise de IA não disponível
        </h3>
        <p className="text-gray-500">
          As fotos deste cliente ainda não foram analisadas pela IA
        </p>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            {fotosAnalisadas} de {totalFotos} fotos analisadas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">Progresso da Análise</h3>
          <span className="text-sm text-gray-600">
            {fotosAnalisadas} / {totalFotos} fotos
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-indigo-600 h-3 rounded-full transition-all"
            style={{
              width: `${totalFotos > 0 ? (fotosAnalisadas / totalFotos) * 100 : 0}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Indicadores de Potencial */}
      {analiseConsolidada.indicadoresPotencial && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-indigo-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">
              Indicadores de Potencial
            </h3>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Score:</span>
              <div className="flex items-center">
                <span className="text-3xl font-bold text-indigo-600 mr-2">
                  {analiseConsolidada.indicadoresPotencial.score}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    analiseConsolidada.indicadoresPotencial.categoria === 'ALTO'
                      ? 'bg-green-100 text-green-800'
                      : analiseConsolidada.indicadoresPotencial.categoria === 'MÉDIO'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {analiseConsolidada.indicadoresPotencial.categoria}
                </span>
              </div>
            </div>
          </div>

          {/* Fatores Positivos */}
          {analiseConsolidada.indicadoresPotencial.fatoresPositivos &&
            analiseConsolidada.indicadoresPotencial.fatoresPositivos.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="text-sm font-semibold text-gray-900">
                    Fatores Positivos
                  </h4>
                </div>
                <ul className="space-y-2">
                  {analiseConsolidada.indicadoresPotencial.fatoresPositivos.map(
                    (fator, idx) => (
                      <li
                        key={idx}
                        className="flex items-start text-sm text-gray-700"
                      >
                        <span className="text-green-500 mr-2">✓</span>
                        <span>{fator}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

          {/* Fatores Negativos */}
          {analiseConsolidada.indicadoresPotencial.fatoresNegativos &&
            analiseConsolidada.indicadoresPotencial.fatoresNegativos.length > 0 && (
              <div>
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <h4 className="text-sm font-semibold text-gray-900">
                    Pontos de Atenção
                  </h4>
                </div>
                <ul className="space-y-2">
                  {analiseConsolidada.indicadoresPotencial.fatoresNegativos.map(
                    (fator, idx) => (
                      <li
                        key={idx}
                        className="flex items-start text-sm text-gray-700"
                      >
                        <span className="text-red-500 mr-2">⚠</span>
                        <span>{fator}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
        </div>
      )}

      {/* Análise Geral */}
      {analiseConsolidada.analiseGeral && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Brain className="w-6 h-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Análise Geral</h3>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {analiseConsolidada.analiseGeral}
          </p>
        </div>
      )}

      {/* Insights */}
      {analiseConsolidada.insights && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-md p-6 border border-indigo-100">
          <div className="flex items-center mb-4">
            <Sparkles className="w-6 h-6 text-indigo-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Insights Estratégicos</h3>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {analiseConsolidada.insights}
          </p>
        </div>
      )}
    </div>
  );
}
