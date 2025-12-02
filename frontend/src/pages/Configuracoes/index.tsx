import { useState, useEffect } from 'react';
import {
  Trash2,
  Database,
  Activity,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Server,
  BarChart3,
  Clock,
  FileText
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

interface SystemStats {
  clientes: {
    total: number;
    porStatus: Array<{ status: string; _count: number }>;
  };
  planilhas: number;
  fotos: {
    total: number;
    storageUsed: number;
    storageUsedMB: string;
  };
  logs: number;
  cache: any;
  tipologias: Array<{ tipologia: string; _count: number }>;
}

export default function Configuracoes() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  // Carregar estatísticas
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllClientes = async () => {
    if (confirmAction !== 'delete-clientes') {
      setConfirmAction('delete-clientes');
      return;
    }

    try {
      setActionLoading('delete-clientes');
      const response = await fetch(`${API_BASE_URL}/api/admin/clientes`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        alert(`✅ ${data.deleted.clientes} clientes apagados com sucesso!`);
        loadStats();
      } else {
        alert('❌ Erro ao apagar clientes');
      }
    } catch (error) {
      alert('❌ Erro ao apagar clientes: ' + error);
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  const handleDeleteAllPlanilhas = async () => {
    if (confirmAction !== 'delete-planilhas') {
      setConfirmAction('delete-planilhas');
      return;
    }

    try {
      setActionLoading('delete-planilhas');
      const response = await fetch(`${API_BASE_URL}/api/admin/planilhas`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        alert(`✅ ${data.deleted} planilhas apagadas com sucesso!`);
        loadStats();
      } else {
        alert('❌ Erro ao apagar planilhas');
      }
    } catch (error) {
      alert('❌ Erro ao apagar planilhas: ' + error);
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  const handleCleanLogs = async () => {
    if (confirmAction !== 'clean-logs') {
      setConfirmAction('clean-logs');
      return;
    }

    try {
      setActionLoading('clean-logs');
      const response = await fetch(`${API_BASE_URL}/api/admin/logs?days=30`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        alert(`✅ ${data.deleted} logs limpos com sucesso!`);
        loadStats();
      } else {
        alert('❌ Erro ao limpar logs');
      }
    } catch (error) {
      alert('❌ Erro ao limpar logs: ' + error);
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  const handleClearCache = async () => {
    try {
      setActionLoading('clear-cache');
      const response = await fetch(`${API_BASE_URL}/api/admin/cache/clear`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        alert('✅ Cache limpo com sucesso!');
        loadStats();
      } else {
        alert('❌ Erro ao limpar cache');
      }
    } catch (error) {
      alert('❌ Erro ao limpar cache: ' + error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetSystem = async () => {
    if (confirmAction !== 'reset-system') {
      setConfirmAction('reset-system');
      return;
    }

    const confirmed = window.confirm(
      '⚠️ ATENÇÃO: Isso vai APAGAR TUDO do sistema!\n\n' +
      'Todos os clientes, planilhas, fotos e logs serão deletados permanentemente.\n\n' +
      'Esta ação NÃO PODE SER DESFEITA!\n\n' +
      'Deseja realmente continuar?'
    );

    if (!confirmed) {
      setConfirmAction(null);
      return;
    }

    try {
      setActionLoading('reset-system');
      const response = await fetch(`${API_BASE_URL}/api/admin/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmPassword: 'RESET_SYSTEM_CONFIRM' }),
      });
      const data = await response.json();

      if (data.success) {
        alert('✅ Sistema resetado com sucesso!');
        loadStats();
      } else {
        alert('❌ Erro ao resetar sistema: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      alert('❌ Erro ao resetar sistema: ' + error);
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações do Sistema</h1>
          <p className="text-gray-600">Gerencie dados, cache e configurações administrativas</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{stats?.clientes.total || 0}</span>
            </div>
            <p className="text-sm text-gray-600">Clientes</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">{stats?.planilhas || 0}</span>
            </div>
            <p className="text-sm text-gray-600">Planilhas</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <HardDrive className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">{stats?.fotos.total || 0}</span>
            </div>
            <p className="text-sm text-gray-600">Fotos ({stats?.fotos.storageUsedMB || 0} MB)</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">{stats?.logs || 0}</span>
            </div>
            <p className="text-sm text-gray-600">Logs</p>
          </div>
        </div>

        {/* Ações Perigosas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Ações Perigosas</h2>
          </div>

          <div className="space-y-4">
            {/* Apagar Clientes */}
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-gray-900">Apagar Todos os Clientes</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Remove {stats?.clientes.total || 0} clientes e {stats?.fotos.total || 0} fotos do sistema. Esta ação não pode ser desfeita.
                </p>
                {confirmAction === 'delete-clientes' && (
                  <p className="text-sm text-red-600 font-semibold mt-2">
                    ⚠️ Clique novamente para confirmar a exclusão
                  </p>
                )}
              </div>
              <button
                onClick={handleDeleteAllClientes}
                disabled={actionLoading !== null}
                className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                  confirmAction === 'delete-clientes'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-100 hover:bg-red-200 text-red-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {actionLoading === 'delete-clientes' ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : confirmAction === 'delete-clientes' ? (
                  'Confirmar'
                ) : (
                  'Apagar'
                )}
              </button>
            </div>

            {/* Apagar Planilhas */}
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-gray-900">Apagar Todas as Planilhas</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Remove {stats?.planilhas || 0} planilhas e todos os clientes associados. Esta ação não pode ser desfeita.
                </p>
                {confirmAction === 'delete-planilhas' && (
                  <p className="text-sm text-orange-600 font-semibold mt-2">
                    ⚠️ Clique novamente para confirmar a exclusão
                  </p>
                )}
              </div>
              <button
                onClick={handleDeleteAllPlanilhas}
                disabled={actionLoading !== null}
                className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                  confirmAction === 'delete-planilhas'
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {actionLoading === 'delete-planilhas' ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : confirmAction === 'delete-planilhas' ? (
                  'Confirmar'
                ) : (
                  'Apagar'
                )}
              </button>
            </div>

            {/* Limpar Logs */}
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-gray-900">Limpar Logs Antigos</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Remove logs com mais de 30 dias ({stats?.logs || 0} logs no total). Ajuda a liberar espaço.
                </p>
                {confirmAction === 'clean-logs' && (
                  <p className="text-sm text-yellow-600 font-semibold mt-2">
                    ⚠️ Clique novamente para confirmar
                  </p>
                )}
              </div>
              <button
                onClick={handleCleanLogs}
                disabled={actionLoading !== null}
                className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                  confirmAction === 'clean-logs'
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {actionLoading === 'clean-logs' ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : confirmAction === 'clean-logs' ? (
                  'Confirmar'
                ) : (
                  'Limpar'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Manutenção */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Server className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Manutenção</h2>
          </div>

          <div className="space-y-4">
            {/* Limpar Cache */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Limpar Cache Redis</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Limpa o cache Redis. Útil após mudanças no código ou para liberar memória.
                </p>
              </div>
              <button
                onClick={handleClearCache}
                disabled={actionLoading !== null}
                className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'clear-cache' ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  'Limpar'
                )}
              </button>
            </div>

            {/* Atualizar Estatísticas */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Atualizar Estatísticas</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Recarrega as estatísticas do sistema para exibir dados atualizados.
                </p>
              </div>
              <button
                onClick={loadStats}
                disabled={loading}
                className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  'Atualizar'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Reset Completo */}
        <div className="bg-red-900 text-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold">Zona de Perigo: Reset Completo</h2>
          </div>

          <p className="text-red-100 mb-4">
            Esta ação vai apagar TUDO do sistema: todos os clientes, planilhas, fotos, logs e cache.
            Use apenas para resetar completamente o sistema.
          </p>

          {confirmAction === 'reset-system' && (
            <div className="bg-red-800 border border-red-700 rounded-lg p-4 mb-4">
              <p className="font-semibold text-white">
                ⚠️ ATENÇÃO: Você vai apagar TODOS os dados do sistema!
              </p>
              <p className="text-red-100 text-sm mt-1">
                Clique novamente no botão para confirmar o reset completo.
              </p>
            </div>
          )}

          <button
            onClick={handleResetSystem}
            disabled={actionLoading !== null}
            className={`w-full px-6 py-3 rounded-lg font-bold transition-colors ${
              confirmAction === 'reset-system'
                ? 'bg-white text-red-900 hover:bg-red-50'
                : 'bg-red-800 text-white hover:bg-red-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {actionLoading === 'reset-system' ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Resetando Sistema...
              </span>
            ) : confirmAction === 'reset-system' ? (
              '⚠️ CONFIRMAR RESET COMPLETO'
            ) : (
              'Reset Completo do Sistema'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
