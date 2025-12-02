import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DivergenceAlertProps {
  tipologiaIA?: string | null;
  tipologiaGoogle?: string | null;
  confianciaIA?: number | null;
}

/**
 * Alerta visual para divergências entre classificação da IA e Google Places
 * Importante para transparência e auditoria
 */
export function DivergenceAlert({
  tipologiaIA,
  tipologiaGoogle,
  confianciaIA,
}: DivergenceAlertProps) {
  // Sem dados suficientes
  if (!tipologiaIA || !tipologiaGoogle) {
    return null;
  }

  // Sem divergência
  if (tipologiaIA === tipologiaGoogle) {
    return (
      <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-green-900 text-sm">
            Classificação Consistente
          </h4>
          <p className="text-sm text-green-700 mt-1">
            A análise de IA e Google Places concordam: <strong>{tipologiaIA}</strong>
          </p>
        </div>
      </div>
    );
  }

  // Divergência detectada
  return (
    <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-semibold text-yellow-900 text-sm flex items-center gap-2">
          Divergência Detectada
          {confianciaIA && confianciaIA < 50 && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
              Baixa Confiança
            </span>
          )}
        </h4>
        <div className="mt-2 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-yellow-900">IA Claude:</span>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded font-mono text-xs">
              {tipologiaIA}
            </span>
            {confianciaIA && (
              <span className="text-xs text-yellow-700">
                ({Math.round(confianciaIA)}% confiança)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-yellow-900">Google:</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded font-mono text-xs">
              {tipologiaGoogle}
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-yellow-800 bg-yellow-100 p-2 rounded">
          ⚠️ <strong>Ação Recomendada:</strong> Revisar manualmente para confirmar a
          classificação correta.
        </p>
      </div>
    </div>
  );
}
