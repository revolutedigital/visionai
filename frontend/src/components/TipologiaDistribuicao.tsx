import {
  Store,
  Coffee,
  UtensilsCrossed,
  Beer,
  ShoppingCart,
  Hotel,
  PartyPopper,
  Dumbbell,
  Award as Crown,
  Warehouse,
  Building2,
  Pill,
  GraduationCap,
  Fuel,
} from 'lucide-react';
import { getTipologia } from '../constants/pepsiTipologias';

interface TipologiaItem {
  tipologia: string;
  quantidade: number;
  percentual: number;
  label: string;
}

interface TipologiaDistribuicaoProps {
  distribuicao: TipologiaItem[];
  total: number;
  loading: boolean;
}

/**
 * Configuração de cores e ícones por categoria Pepsi
 */
const CATEGORIA_CONFIG: Record<string, { icon: any; color: string; bgColor: string; borderColor: string }> = {
  'Supermercados': {
    icon: ShoppingCart,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  'Lojas': {
    icon: Store,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  'Pequeno Varejo': {
    icon: Store,
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  'Serviços': {
    icon: Building2,
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
  },
  'Restaurantes': {
    icon: UtensilsCrossed,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  'Padarias e Cafés': {
    icon: Coffee,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  'Conveniência': {
    icon: Fuel,
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
  },
  'Farmácias': {
    icon: Pill,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  'Bares e Vida Noturna': {
    icon: Beer,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  'Catering & Eventos': {
    icon: PartyPopper,
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
  'Postos e Quiosques': {
    icon: Store,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  'Entretenimento': {
    icon: PartyPopper,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  'Hospedagem': {
    icon: Hotel,
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
  'Educação e Serviços': {
    icon: GraduationCap,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  'Atacado': {
    icon: Warehouse,
    color: 'text-stone-700',
    bgColor: 'bg-stone-50',
    borderColor: 'border-stone-200',
  },
};

/**
 * Obtém configuração de estilo para uma tipologia
 */
function getTipologiaConfig(tipologiaCode: string) {
  const tipologia = getTipologia(tipologiaCode);
  if (tipologia && CATEGORIA_CONFIG[tipologia.categoria]) {
    return CATEGORIA_CONFIG[tipologia.categoria];
  }
  // Fallback padrão
  return {
    icon: Store,
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  };
}

export function TipologiaDistribuicao({ distribuicao, total, loading }: TipologiaDistribuicaoProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!distribuicao || distribuicao.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <Warehouse className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum cliente classificado ainda</p>
        <p className="text-sm mt-2">Execute a classificação de tipologias para ver os resultados</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Distribuição por Tipologia</h3>
          <p className="text-sm text-gray-500 mt-1">
            {total} clientes classificados em {distribuicao.length} tipologias
          </p>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {distribuicao.map((item, index) => {
          // Suporta tanto códigos Pepsi (F1, G1, etc.) quanto nomes antigos
          const config = getTipologiaConfig(item.tipologia);
          const Icon = config.icon;

          // Obter informações da tipologia Pepsi
          const tipologiaInfo = getTipologia(item.tipologia);

          return (
            <div
              key={item.tipologia}
              className={`relative p-6 rounded-xl border-2 ${config.borderColor} ${config.bgColor} hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}
            >
              {/* Badge de Rank */}
              {index < 3 && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
                  #{index + 1}
                </div>
              )}

              {/* Ícone */}
              <div className={`${config.bgColor} p-3 rounded-lg inline-block mb-4`}>
                <Icon className={`w-8 h-8 ${config.color}`} />
              </div>

              {/* Label - Mostra código + nome da tipologia */}
              <div className="mb-2">
                {tipologiaInfo && (
                  <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-gray-300 text-gray-600">
                    {tipologiaInfo.codigo}
                  </span>
                )}
                <h4 className={`font-semibold ${config.color} text-sm mt-1`}>
                  {tipologiaInfo ? tipologiaInfo.nome : item.label}
                </h4>
                {tipologiaInfo && (
                  <p className="text-xs text-gray-500 mt-0.5">{tipologiaInfo.categoria}</p>
                )}
              </div>

              {/* Quantidade */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{item.quantidade}</span>
                <span className="text-sm text-gray-500">clientes</span>
              </div>

              {/* Percentual */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Do total</span>
                  <span className="font-bold">{item.percentual}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${item.percentual}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráfico de Barras Horizontal */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Visão Comparativa</h4>
        <div className="space-y-3">
          {distribuicao.slice(0, 10).map((item) => {
            // Suporta tanto códigos Pepsi quanto nomes antigos
            const config = getTipologiaConfig(item.tipologia);
            const Icon = config.icon;
            const tipologiaInfo = getTipologia(item.tipologia);

            return (
              <div key={item.tipologia} className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${config.color} flex-shrink-0`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {tipologiaInfo ? `${tipologiaInfo.codigo} - ${tipologiaInfo.nome}` : item.label}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {item.quantidade} ({item.percentual}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500`}
                      style={{ width: `${item.percentual}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 3 Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {distribuicao.slice(0, 3).map((item, index) => {
          const config = getTipologiaConfig(item.tipologia);
          const Icon = config.icon;
          const tipologiaInfo = getTipologia(item.tipologia);

          const medals = ['🥇', '🥈', '🥉'];

          return (
            <div
              key={item.tipologia}
              className={`relative bg-gradient-to-br ${
                index === 0
                  ? 'from-yellow-50 to-orange-50 border-yellow-300'
                  : index === 1
                  ? 'from-gray-50 to-gray-100 border-gray-300'
                  : 'from-orange-50 to-red-50 border-orange-300'
              } border-2 rounded-xl p-6`}
            >
              <div className="text-4xl mb-2">{medals[index]}</div>
              <div className="flex items-center gap-3 mb-3">
                <Icon className={`w-6 h-6 ${config.color}`} />
                <h4 className="font-bold text-gray-900">{item.label}</h4>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">{item.quantidade}</span>
                <span className="text-lg text-gray-600">({item.percentual}%)</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {index === 0 && 'Tipologia mais comum'}
                {index === 1 && 'Segunda mais frequente'}
                {index === 2 && 'Terceira colocação'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
