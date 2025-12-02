import { useState } from 'react';
import { MapPin, Image, Brain, Activity, ChevronRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PhaseData {
  id: string;
  name: string;
  icon: any;
  progress: number;
  processed: number;
  total: number;
  color: {
    bg: string;
    ring: string;
    text: string;
    gradient: string;
  };
}

interface PipelineTimelineProps {
  geocodingProgress: number;
  geocodingProcessed: number;
  geocodingTotal: number;
  placesProgress: number;
  placesProcessed: number;
  placesTotal: number;
  analysisProgress: number;
  analysisProcessed: number;
  analysisTotal: number;
  tipologiaProgress: number;
  tipologiaProcessed: number;
  tipologiaTotal: number;
}

export function PipelineTimeline({
  geocodingProgress,
  geocodingProcessed,
  geocodingTotal,
  placesProgress,
  placesProcessed,
  placesTotal,
  analysisProgress,
  analysisProcessed,
  analysisTotal,
  tipologiaProgress,
  tipologiaProcessed,
  tipologiaTotal,
}: PipelineTimelineProps) {
  const navigate = useNavigate();
  const [hoveredPhase, setHoveredPhase] = useState<string | null>(null);

  const phases: PhaseData[] = [
    {
      id: 'geocoding',
      name: 'Geocodificação',
      icon: MapPin,
      progress: geocodingProgress,
      processed: geocodingProcessed,
      total: geocodingTotal,
      color: {
        bg: 'bg-blue-100',
        ring: 'ring-blue-50',
        text: 'text-blue-600',
        gradient: 'from-blue-300 to-purple-300',
      },
    },
    {
      id: 'places',
      name: 'Google Places',
      icon: Image,
      progress: placesProgress,
      processed: placesProcessed,
      total: placesTotal,
      color: {
        bg: 'bg-purple-100',
        ring: 'ring-purple-50',
        text: 'text-purple-600',
        gradient: 'from-purple-300 to-indigo-300',
      },
    },
    {
      id: 'analysis',
      name: 'Análise IA',
      icon: Brain,
      progress: analysisProgress,
      processed: analysisProcessed,
      total: analysisTotal,
      color: {
        bg: 'bg-indigo-100',
        ring: 'ring-indigo-50',
        text: 'text-indigo-600',
        gradient: 'from-indigo-300 to-purple-300',
      },
    },
    {
      id: 'tipologia',
      name: 'Tipologia',
      icon: Activity,
      progress: tipologiaProgress,
      processed: tipologiaProcessed,
      total: tipologiaTotal,
      color: {
        bg: 'bg-purple-100',
        ring: 'ring-purple-50',
        text: 'text-purple-600',
        gradient: 'from-purple-300 to-pink-300',
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pipeline de Processamento</h2>
          <p className="text-sm text-gray-500">Status em tempo real de cada fase</p>
        </div>
        <button
          onClick={() => navigate('/pipeline')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md font-medium text-sm"
          aria-label="Ver detalhes do pipeline"
        >
          Ver Detalhes
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Timeline Visual */}
      <div className="flex items-center justify-around mb-8">
        {phases.map((phase, index) => {
          const Icon = phase.icon;
          const isHovered = hoveredPhase === phase.id;

          return (
            <div key={phase.id} className="flex items-center flex-1">
              {/* Phase Card */}
              <button
                onMouseEnter={() => setHoveredPhase(phase.id)}
                onMouseLeave={() => setHoveredPhase(null)}
                onClick={() => navigate('/pipeline')}
                className={`flex-1 text-center transition-all cursor-pointer group ${
                  isHovered ? 'transform scale-105' : ''
                }`}
                aria-label={`Ver detalhes de ${phase.name}`}
              >
                <div
                  className={`w-16 h-16 mx-auto mb-3 rounded-full ${phase.color.bg} flex items-center justify-center ring-4 ${phase.color.ring} group-hover:ring-8 transition-all`}
                >
                  <Icon className={`w-8 h-8 ${phase.color.text}`} />
                </div>
                <p className="text-xs font-bold text-gray-900 mb-1">{phase.name}</p>
                <p className={`text-2xl font-bold ${phase.color.text}`}>
                  {phase.progress}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {phase.processed} / {phase.total}
                </p>

                {/* Progress Bar */}
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${phase.color.bg}`}
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>
              </button>

              {/* Connector Arrow */}
              {index < phases.length - 1 && (
                <div className="flex-shrink-0 mx-4">
                  <div
                    className={`w-12 h-1 bg-gradient-to-r ${phases[index].color.gradient} rounded`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Clock className="w-4 h-4" />
          <span className="font-medium">Atividade Recente</span>
        </div>
        <div className="text-sm text-gray-500 text-center py-3 bg-gray-50 rounded-lg">
          Conecte ao pipeline para ver atividades em tempo real
        </div>
      </div>
    </div>
  );
}
