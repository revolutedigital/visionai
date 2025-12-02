import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { QuickActions } from './QuickActions';
import { LiveStatus } from './LiveStatus';

interface HeroSectionProps {
  totalClientes: number;
  pipelineProgress: number;
  estimatedTime: string;
  weeklyGrowth?: number;
  pendingJobs: number;
}

export function HeroSection({
  totalClientes,
  pipelineProgress,
  estimatedTime,
  weeklyGrowth = 0,
  pendingJobs,
}: HeroSectionProps) {
  const getTrendIcon = () => {
    if (weeklyGrowth > 0) return <TrendingUp className="w-4 h-4" />;
    if (weeklyGrowth < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (weeklyGrowth > 0) return 'text-green-600';
    if (weeklyGrowth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl shadow-2xl p-8 text-white">
      {/* Live Status Badge */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard RAC</h1>
          <p className="text-indigo-100 text-sm">Sistema de Análise Inteligente de Clientes</p>
        </div>
        <LiveStatus />
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Clientes */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-indigo-100 text-sm font-medium mb-2">Total de Clientes</p>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold">{totalClientes.toLocaleString()}</p>
            <div className={`flex items-center gap-1 ${getTrendColor()} bg-white/20 px-2 py-1 rounded-full text-xs font-semibold mb-1`}>
              {getTrendIcon()}
              <span>{Math.abs(weeklyGrowth)}%</span>
            </div>
          </div>
          <p className="text-indigo-100 text-xs mt-2">vs. semana passada</p>
        </div>

        {/* Pipeline Progress */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-indigo-100 text-sm font-medium mb-2">Pipeline Completo</p>
          <div className="flex items-end gap-3 mb-2">
            <p className="text-4xl font-bold">{pipelineProgress}%</p>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${pipelineProgress}%` }}
            />
          </div>
          <p className="text-indigo-100 text-xs mt-2">Progresso geral</p>
        </div>

        {/* ETA */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-indigo-100 text-sm font-medium mb-2">Tempo Estimado</p>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-yellow-300 animate-pulse" />
            <p className="text-4xl font-bold">{estimatedTime}</p>
          </div>
          <p className="text-indigo-100 text-xs mt-2">
            {pendingJobs} job{pendingJobs !== 1 ? 's' : ''} pendente{pendingJobs !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-indigo-100 text-sm font-medium mb-4">Ações Rápidas</p>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
