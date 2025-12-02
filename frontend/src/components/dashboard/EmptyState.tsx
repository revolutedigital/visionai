import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Upload, MapPin, Image, Brain } from 'lucide-react';

export function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-xl p-12 text-center border border-indigo-100">
      <div className="max-w-2xl mx-auto">
        {/* Icon Animation */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full animate-pulse opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FileSpreadsheet className="w-16 h-16 text-indigo-600" />
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Bem-vindo ao Sistema RAC
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Análise Inteligente de Clientes com IA
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate('/upload')}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-lg font-bold group"
          aria-label="Importar primeira planilha"
        >
          <Upload className="w-6 h-6 mr-3 group-hover:animate-bounce" />
          Importar Primeira Planilha
        </button>

        {/* Features Preview */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-6 font-medium">
            O sistema irá processar automaticamente:
          </p>
          <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-blue-100">
              <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-blue-900">Geocodificação</p>
              <p className="text-xs text-gray-600 mt-1">Endereço → GPS</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-purple-100">
              <Image className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-purple-900">Google Places</p>
              <p className="text-xs text-gray-600 mt-1">Fotos e Dados</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-indigo-100">
              <Brain className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-indigo-900">Análise com IA</p>
              <p className="text-xs text-gray-600 mt-1">Claude Vision</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto text-sm">
          <div className="bg-white/50 backdrop-blur-sm p-3 rounded-lg">
            <p className="font-bold text-gray-900">Automático</p>
            <p className="text-xs text-gray-600">100% sem intervenção</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm p-3 rounded-lg">
            <p className="font-bold text-gray-900">Rápido</p>
            <p className="text-xs text-gray-600">Processos paralelos</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm p-3 rounded-lg">
            <p className="font-bold text-gray-900">Inteligente</p>
            <p className="text-xs text-gray-600">IA Claude 3.7</p>
          </div>
        </div>
      </div>
    </div>
  );
}
