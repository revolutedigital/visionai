import { useState, useEffect } from 'react';
import { MapPin, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Skeleton } from './Skeleton';

interface GeoValidationData {
  totalClientes: number;
  geocodificados: number;
  precisaoExata: number;
  precisaoParcial: number;
  falhas: number;
  divergenciasCoord: number;
  clientesDetalhes: Array<{
    id: string;
    nome: string;
    status: 'exact' | 'partial' | 'failed';
    latitude?: number;
    longitude?: number;
    precisao?: string;
    divergencia?: number; // distância em metros
  }>;
}

/**
 * Relatório detalhado de validação geográfica
 * Mostra precisão de geocoding e permite drill-down por cliente
 */
export function GeoValidationReport() {
  const [data, setData] = useState<GeoValidationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    fetchGeoValidation();
  }, []);

  async function fetchGeoValidation() {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/geo/validation-report');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar validação geo:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton width="100%" height={120} variant="rounded" />
        <Skeleton width="100%" height={200} variant="rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <p className="text-red-700 font-semibold">Erro ao carregar validação</p>
        <p className="text-sm text-red-600 mt-1">{error}</p>
        <button
          onClick={fetchGeoValidation}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">Nenhum dado de validação disponível</p>
      </div>
    );
  }

  const successRate = data.totalClientes > 0
    ? Math.round((data.geocodificados / data.totalClientes) * 100)
    : 0;

  const exactRate = data.geocodificados > 0
    ? Math.round((data.precisaoExata / data.geocodificados) * 100)
    : 0;

  const partialRate = data.geocodificados > 0
    ? Math.round((data.precisaoParcial / data.geocodificados) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Resumo Estatístico */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={MapPin}
          label="Taxa de Sucesso"
          value={`${successRate}%`}
          subtitle={`${data.geocodificados} de ${data.totalClientes}`}
          color="indigo"
        />
        <StatCard
          icon={CheckCircle2}
          label="Precisão Exata"
          value={`${exactRate}%`}
          subtitle={`${data.precisaoExata} clientes`}
          color="green"
        />
        <StatCard
          icon={AlertTriangle}
          label="Precisão Parcial"
          value={`${partialRate}%`}
          subtitle={`${data.precisaoParcial} clientes`}
          color="yellow"
        />
        <StatCard
          icon={XCircle}
          label="Falhas"
          value={data.falhas}
          subtitle={data.falhas > 0 ? 'Requerem atenção' : 'Sem falhas'}
          color="red"
        />
      </div>

      {/* Divergências de Coordenadas */}
      {data.divergenciasCoord > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-900">
                {data.divergenciasCoord} Divergências de Coordenadas Detectadas
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Diferença {'>'} 100m entre coordenadas originais e Google Places
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Drill-down por Status */}
      <div className="space-y-3">
        <CollapsibleSection
          title="Geocoding Exato"
          count={data.precisaoExata}
          color="green"
          expanded={expandedSection === 'exact'}
          onToggle={() => setExpandedSection(expandedSection === 'exact' ? null : 'exact')}
        >
          {data.clientesDetalhes
            .filter(c => c.status === 'exact')
            .map(cliente => (
              <ClienteGeoItem key={cliente.id} cliente={cliente} />
            ))}
        </CollapsibleSection>

        <CollapsibleSection
          title="Geocoding Parcial"
          count={data.precisaoParcial}
          color="yellow"
          expanded={expandedSection === 'partial'}
          onToggle={() => setExpandedSection(expandedSection === 'partial' ? null : 'partial')}
        >
          {data.clientesDetalhes
            .filter(c => c.status === 'partial')
            .map(cliente => (
              <ClienteGeoItem key={cliente.id} cliente={cliente} />
            ))}
        </CollapsibleSection>

        {data.falhas > 0 && (
          <CollapsibleSection
            title="Falhas de Geocoding"
            count={data.falhas}
            color="red"
            expanded={expandedSection === 'failed'}
            onToggle={() => setExpandedSection(expandedSection === 'failed' ? null : 'failed')}
          >
            {data.clientesDetalhes
              .filter(c => c.status === 'failed')
              .map(cliente => (
                <ClienteGeoItem key={cliente.id} cliente={cliente} />
              ))}
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: any;
  label: string;
  value: string | number;
  subtitle: string;
  color: 'indigo' | 'green' | 'yellow' | 'red';
}

function StatCard({ icon: Icon, label, value, subtitle, color }: StatCardProps) {
  const colors = {
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    red: 'bg-red-50 border-red-200 text-red-900',
  };

  const iconColors = {
    indigo: 'text-indigo-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
  };

  return (
    <div className={`border rounded-lg p-4 ${colors[color]}`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${iconColors[color]}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-1 opacity-80">{subtitle}</p>
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  count: number;
  color: 'green' | 'yellow' | 'red';
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  count,
  color,
  expanded,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  const colors = {
    green: 'bg-green-50 border-green-200 text-green-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    red: 'bg-red-50 border-red-200 text-red-900',
  };

  return (
    <div className={`border rounded-lg ${colors[color]}`}>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold">{title}</span>
          <span className="text-sm opacity-70">({count})</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-current/20 p-4 space-y-2 max-h-96 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}

interface ClienteGeoItemProps {
  cliente: GeoValidationData['clientesDetalhes'][0];
}

function ClienteGeoItem({ cliente }: ClienteGeoItemProps) {
  const statusIcons = {
    exact: CheckCircle2,
    partial: AlertTriangle,
    failed: XCircle,
  };

  const statusColors = {
    exact: 'text-green-700',
    partial: 'text-yellow-700',
    failed: 'text-red-700',
  };

  const Icon = statusIcons[cliente.status];

  return (
    <div className="flex items-start gap-3 p-3 bg-white/50 rounded border border-current/10">
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${statusColors[cliente.status]}`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{cliente.nome}</p>
        {cliente.latitude && cliente.longitude ? (
          <div className="text-xs mt-1 space-y-0.5">
            <p className="font-mono">
              {cliente.latitude.toFixed(6)}, {cliente.longitude.toFixed(6)}
            </p>
            {cliente.precisao && (
              <p className="opacity-70">Precisão: {cliente.precisao}</p>
            )}
            {cliente.divergencia && cliente.divergencia > 100 && (
              <p className="text-red-700 font-semibold">
                Divergência: {Math.round(cliente.divergencia)}m
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-red-700 mt-1">Coordenadas não disponíveis</p>
        )}
      </div>
    </div>
  );
}
