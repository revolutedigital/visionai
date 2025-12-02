import { Star, Users, Image, Clock, Globe, TrendingUp, Award } from 'lucide-react';

interface ScoringData {
  scoreTotal: number;
  categoria: string;
  scoreRating: number;
  scoreAvaliacoes: number;
  scoreFotosQualidade: number;
  scoreHorarioFunc: number;
  scoreWebsite: number;
  scoreDensidadeReviews: number;
  densidadeAvaliacoes?: number;
  tempoAbertoSemanal?: number;
  diasAbertoPorSemana?: number;
}

interface ScoringBreakdownProps {
  scoring: ScoringData;
  showDetails?: boolean;
}

export function ScoringBreakdown({ scoring, showDetails = false }: ScoringBreakdownProps) {
  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'ALTO':
        return 'text-green-600 bg-green-50';
      case 'MÉDIO':
        return 'text-yellow-600 bg-yellow-50';
      case 'BAIXO':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getProgressColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const ScoreBar = ({
    label,
    score,
    maxScore,
    icon: Icon,
    metric,
  }: {
    label: string;
    score: number;
    maxScore: number;
    icon: any;
    metric?: string;
  }) => {
    const percentage = (score / maxScore) * 100;

    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700">{label}</span>
          </div>
          <div className="flex items-center gap-2">
            {metric && <span className="text-xs text-gray-500">{metric}</span>}
            <span className="font-semibold text-gray-900">
              {score.toFixed(1)}/{maxScore}
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getProgressColor(score, maxScore)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Score Total e Categoria */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
        <div>
          <p className="text-sm font-medium text-gray-600">Score Total</p>
          <p className="text-3xl font-bold text-indigo-600">{scoring.scoreTotal}/70</p>
          <p className="text-xs text-gray-500 mt-1">Sprint 1: Max 70 pontos</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-600 mb-1">Categoria</p>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(
              scoring.categoria
            )}`}
          >
            <Award className="w-4 h-4 mr-1" />
            {scoring.categoria}
          </span>
        </div>
      </div>

      {/* Breakdown dos Scores */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Componentes do Score
        </h4>

        <ScoreBar
          label="Rating Google"
          score={scoring.scoreRating}
          maxScore={15}
          icon={Star}
        />

        <ScoreBar
          label="Total de Avaliações"
          score={scoring.scoreAvaliacoes}
          maxScore={10}
          icon={Users}
        />

        <ScoreBar
          label="Densidade de Reviews"
          score={scoring.scoreDensidadeReviews}
          maxScore={10}
          icon={TrendingUp}
          metric={
            scoring.densidadeAvaliacoes
              ? `${scoring.densidadeAvaliacoes.toFixed(1)}/mês`
              : undefined
          }
        />

        <ScoreBar
          label="Horário de Funcionamento"
          score={scoring.scoreHorarioFunc}
          maxScore={10}
          icon={Clock}
          metric={
            scoring.diasAbertoPorSemana && scoring.tempoAbertoSemanal
              ? `${scoring.diasAbertoPorSemana}d, ${scoring.tempoAbertoSemanal}h/sem`
              : undefined
          }
        />

        <ScoreBar
          label="Presença de Website"
          score={scoring.scoreWebsite}
          maxScore={10}
          icon={Globe}
        />

        <ScoreBar
          label="Qualidade de Fotos (IA)"
          score={scoring.scoreFotosQualidade}
          maxScore={15}
          icon={Image}
        />
      </div>

      {/* Métricas Detalhadas (Opcional) */}
      {showDetails && (
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200">
          {scoring.densidadeAvaliacoes !== undefined && (
            <div className="text-center p-2 bg-blue-50 rounded">
              <p className="text-xs text-gray-600">Densidade</p>
              <p className="text-lg font-semibold text-blue-600">
                {scoring.densidadeAvaliacoes.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">reviews/mês</p>
            </div>
          )}
          {scoring.tempoAbertoSemanal !== undefined && (
            <div className="text-center p-2 bg-green-50 rounded">
              <p className="text-xs text-gray-600">Hrs Abertas</p>
              <p className="text-lg font-semibold text-green-600">
                {scoring.tempoAbertoSemanal}h
              </p>
              <p className="text-xs text-gray-500">por semana</p>
            </div>
          )}
          {scoring.diasAbertoPorSemana !== undefined && (
            <div className="text-center p-2 bg-purple-50 rounded">
              <p className="text-xs text-gray-600">Dias Abertos</p>
              <p className="text-lg font-semibold text-purple-600">
                {scoring.diasAbertoPorSemana}
              </p>
              <p className="text-xs text-gray-500">por semana</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
