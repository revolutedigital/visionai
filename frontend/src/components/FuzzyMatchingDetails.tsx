import { useState, useEffect } from 'react';
import { Search, CheckCircle2, AlertCircle, ArrowRight, Info } from 'lucide-react';
import { Skeleton } from './Skeleton';

interface FuzzyMatchData {
  clienteId: string;
  clienteNome: string;
  campos: Array<{
    campo: string;
    valorOriginal: string;
    valorGoogle: string;
    score: number; // 0-100
    metodo: 'exact' | 'fuzzy' | 'partial';
    distancia?: number; // Levenshtein distance
  }>;
  scoreGeral: number; // Média dos scores
  confianca: 'alta' | 'media' | 'baixa';
}

interface FuzzyMatchingDetailsProps {
  clienteId?: string;
  limit?: number;
}

/**
 * Componente para exibir detalhes de Fuzzy Matching
 * Mostra similaridade campo por campo entre dados originais e Google Places
 */
export function FuzzyMatchingDetails({ clienteId, limit = 20 }: FuzzyMatchingDetailsProps) {
  const [data, setData] = useState<FuzzyMatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<string | null>(null);

  useEffect(() => {
    fetchFuzzyMatching();
  }, [clienteId, limit]);

  async function fetchFuzzyMatching() {
    try {
      setLoading(true);
      const url = clienteId
        ? `http://localhost:5000/api/fuzzy/details/${clienteId}`
        : `http://localhost:5000/api/fuzzy/details?limit=${limit}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(Array.isArray(result) ? result : [result]);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar fuzzy matching:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton width="100%" height={150} variant="rounded" />
        <Skeleton width="100%" height={150} variant="rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <p className="text-red-700 font-semibold">Erro ao carregar fuzzy matching</p>
        <p className="text-sm text-red-600 mt-1">{error}</p>
        <button
          onClick={fetchFuzzyMatching}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">Nenhum dado de fuzzy matching disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legenda de Scores */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">Score de Similaridade:</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>≥ 90: Match Exato</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>70-89: Match Parcial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>{'<'} 70: Divergência</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Clientes */}
      {data.map((cliente) => (
        <div
          key={cliente.clienteId}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden"
        >
          {/* Header do Card */}
          <button
            onClick={() =>
              setSelectedCliente(
                selectedCliente === cliente.clienteId ? null : cliente.clienteId
              )
            }
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-indigo-600" />
              <div className="text-left">
                <p className="font-semibold text-gray-900">{cliente.clienteNome}</p>
                <p className="text-sm text-gray-600">
                  Score Geral: <strong>{Math.round(cliente.scoreGeral)}%</strong>
                </p>
              </div>
            </div>
            <ConfiancaBadge confianca={cliente.confianca} />
          </button>

          {/* Detalhes Expandidos */}
          {selectedCliente === cliente.clienteId && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="space-y-3">
                {cliente.campos.map((campo, index) => (
                  <CampoComparison key={index} campo={campo} />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface ConfiancaBadgeProps {
  confianca: 'alta' | 'media' | 'baixa';
}

function ConfiancaBadge({ confianca }: ConfiancaBadgeProps) {
  const styles = {
    alta: 'bg-green-100 text-green-800',
    media: 'bg-yellow-100 text-yellow-800',
    baixa: 'bg-red-100 text-red-800',
  };

  const labels = {
    alta: 'Alta Confiança',
    media: 'Média Confiança',
    baixa: 'Baixa Confiança',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[confianca]}`}>
      {labels[confianca]}
    </span>
  );
}

interface CampoComparisonProps {
  campo: FuzzyMatchData['campos'][0];
}

function CampoComparison({ campo }: CampoComparisonProps) {
  const scoreColor =
    campo.score >= 90
      ? 'text-green-700 bg-green-100'
      : campo.score >= 70
      ? 'text-yellow-700 bg-yellow-100'
      : 'text-red-700 bg-red-100';

  const metodoLabels = {
    exact: 'Match Exato',
    fuzzy: 'Match Difuso',
    partial: 'Match Parcial',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Cabeçalho com Score */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
            {campo.campo}
          </span>
          <span className="text-xs text-gray-500">{metodoLabels[campo.metodo]}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded font-bold text-sm ${scoreColor}`}>
            {Math.round(campo.score)}%
          </span>
          {campo.score >= 90 && <CheckCircle2 className="w-4 h-4 text-green-600" />}
          {campo.score < 70 && <AlertCircle className="w-4 h-4 text-red-600" />}
        </div>
      </div>

      {/* Comparação Visual */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-1">Original</p>
          <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded truncate border border-gray-300">
            {campo.valorOriginal || <span className="text-gray-400 italic">Vazio</span>}
          </p>
        </div>

        <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-1">Google Places</p>
          <p className="font-mono text-sm bg-indigo-50 px-3 py-2 rounded truncate border border-indigo-300">
            {campo.valorGoogle || <span className="text-gray-400 italic">Vazio</span>}
          </p>
        </div>
      </div>

      {/* Distância Levenshtein (se disponível) */}
      {campo.distancia !== undefined && (
        <p className="text-xs text-gray-600 mt-2">
          Distância de edição: <strong>{campo.distancia}</strong> caracteres
        </p>
      )}
    </div>
  );
}
