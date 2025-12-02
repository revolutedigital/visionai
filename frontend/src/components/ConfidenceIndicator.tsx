import { AlertCircle } from 'lucide-react';

interface ConfidenceIndicatorProps {
  confidence: number;
  showLabel?: boolean;
  showWarning?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Componente para exibir nível de confiança com código de cores
 *
 * Thresholds:
 * - Verde (80-100%): Alta confiança
 * - Amarelo (50-79%): Média confiança - revisar
 * - Vermelho (<50%): Baixa confiança - REVISAR MANUALMENTE
 */
export function ConfidenceIndicator({
  confidence,
  showLabel = true,
  showWarning = true,
  size = 'md',
}: ConfidenceIndicatorProps) {
  // Determinar cor baseada no threshold
  const getColorClasses = () => {
    if (confidence >= 80) {
      return {
        bar: 'bg-green-500',
        text: 'text-green-700',
        bg: 'bg-green-50',
        border: 'border-green-200',
        badge: 'bg-green-100 text-green-800 border-green-300',
      };
    } else if (confidence >= 50) {
      return {
        bar: 'bg-yellow-500',
        text: 'text-yellow-700',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      };
    } else {
      return {
        bar: 'bg-red-500',
        text: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        badge: 'bg-red-100 text-red-800 border-red-300',
      };
    }
  };

  const getLabel = () => {
    if (confidence >= 80) return 'Alta Confiança';
    if (confidence >= 50) return 'Média Confiança';
    return 'Baixa Confiança';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return { bar: 'h-1.5', text: 'text-xs' };
      case 'lg':
        return { bar: 'h-3', text: 'text-sm' };
      default:
        return { bar: 'h-2', text: 'text-xs' };
    }
  };

  const colors = getColorClasses();
  const sizeClasses = getSizeClasses();

  return (
    <div className="space-y-2">
      {/* Barra de progresso com cores */}
      <div className="w-full bg-gray-200 rounded-full overflow-hidden" style={{ height: sizeClasses.bar === 'h-1.5' ? '6px' : sizeClasses.bar === 'h-3' ? '12px' : '8px' }}>
        <div
          className={`${colors.bar} ${sizeClasses.bar} rounded-full transition-all duration-300`}
          style={{ width: `${confidence}%` }}
        ></div>
      </div>

      {/* Label e Badge */}
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={`${sizeClasses.text} ${colors.text} font-medium`}>
            {Math.round(confidence)}% - {getLabel()}
          </span>
          <span className={`${sizeClasses.text} px-2 py-0.5 rounded-full border ${colors.badge} font-medium`}>
            {getLabel()}
          </span>
        </div>
      )}

      {/* Alerta para baixa confiança */}
      {showWarning && confidence < 50 && (
        <div className={`flex items-start gap-2 ${colors.bg} border ${colors.border} rounded-lg p-3`}>
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-red-900">⚠️ CONFIANÇA BAIXA - Revisar Manualmente</p>
            <p className="text-xs text-red-700 mt-1">
              Este resultado possui confiança abaixo de 50%. Recomendamos validação manual antes de tomar decisões baseadas nesta classificação.
            </p>
          </div>
        </div>
      )}

      {/* Alerta para média confiança */}
      {showWarning && confidence >= 50 && confidence < 80 && (
        <div className={`flex items-start gap-2 ${colors.bg} border ${colors.border} rounded-lg p-3`}>
          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-yellow-900">Revisar Recomendado</p>
            <p className="text-xs text-yellow-700 mt-1">
              Confiança moderada. Considere validar esta classificação para garantir precisão.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
