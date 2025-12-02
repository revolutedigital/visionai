import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

export enum Etapa {
  RECEITA = 'RECEITA',
  GEOCODING = 'GEOCODING',
  PLACES = 'PLACES',
  ANALYSIS = 'ANALYSIS',
}

export enum Operacao {
  INICIO = 'INICIO',
  PROCESSAMENTO = 'PROCESSAMENTO',
  VALIDACAO = 'VALIDACAO',
  TRANSFORMACAO = 'TRANSFORMACAO',
  API_CALL = 'API_CALL',
  DATABASE_READ = 'DATABASE_READ',
  DATABASE_WRITE = 'DATABASE_WRITE',
  CONCLUSAO = 'CONCLUSAO',
  ERRO = 'ERRO',
  RETRY = 'RETRY',
}

interface LogContext {
  correlationId: string;
  clienteId?: string;
  loteId?: string;
  jobId?: string;
  etapa: Etapa;
  operacao: Operacao;
  origem?: string;
  tentativa?: number;
}

interface LogData {
  mensagem: string;
  nivel?: LogLevel;
  detalhes?: Record<string, any>;
  dadosEntrada?: Record<string, any>;
  dadosSaida?: Record<string, any>;
  transformacoes?: string[];
  validacoes?: Record<string, any>;
  alertas?: string[];
  tempoExecucaoMs?: number;
}

interface PerformanceTracker {
  startTime: number;
  operation: string;
}

/**
 * Serviço centralizado de logging estruturado
 * Garante rastreabilidade, auditoria e observabilidade completa
 */
export class StructuredLoggerService {
  private static VERSION = '1.0.0';
  private performanceTrackers: Map<string, PerformanceTracker> = new Map();

  /**
   * Gera um novo correlation ID único
   */
  static generateCorrelationId(): string {
    return randomUUID();
  }

  /**
   * Mascara dados sensíveis (CNPJ, CPF, etc)
   */
  private maskSensitiveData(data: any): any {
    if (!data) return data;

    const masked = { ...data };

    // Mascara CNPJ (mostra apenas primeiros 4 e últimos 2 dígitos)
    if (masked.cnpj) {
      const cnpj = masked.cnpj.replace(/\D/g, '');
      if (cnpj.length === 14) {
        masked.cnpj = `${cnpj.substring(0, 4)}****${cnpj.substring(12)}`;
      }
    }

    // Mascara telefone (mostra apenas DDD)
    if (masked.telefone) {
      const tel = masked.telefone.replace(/\D/g, '');
      if (tel.length >= 10) {
        masked.telefone = `(${tel.substring(0, 2)}) ****-****`;
      }
    }

    return masked;
  }

  /**
   * Registra log estruturado no banco de dados
   */
  async log(context: LogContext, data: LogData): Promise<void> {
    try {
      const {
        mensagem,
        nivel = LogLevel.INFO,
        detalhes,
        dadosEntrada,
        dadosSaida,
        transformacoes,
        validacoes,
        alertas,
        tempoExecucaoMs,
      } = data;

      // Mascara dados sensíveis antes de persistir
      const maskedEntrada = dadosEntrada ? this.maskSensitiveData(dadosEntrada) : null;
      const maskedSaida = dadosSaida ? this.maskSensitiveData(dadosSaida) : null;

      // Persistir no banco
      await prisma.processamentoLog.create({
        data: {
          correlationId: context.correlationId,
          clienteId: context.clienteId,
          loteId: context.loteId,
          jobId: context.jobId,
          etapa: context.etapa,
          operacao: context.operacao,
          nivel,
          mensagem,
          detalhes: detalhes ? JSON.stringify(detalhes) : null,
          dadosEntrada: maskedEntrada ? JSON.stringify(maskedEntrada) : null,
          dadosSaida: maskedSaida ? JSON.stringify(maskedSaida) : null,
          transformacoes: transformacoes ? JSON.stringify(transformacoes) : null,
          validacoes: validacoes ? JSON.stringify(validacoes) : null,
          alertas: alertas ? JSON.stringify(alertas) : null,
          tempoExecucaoMs,
          tentativa: context.tentativa || 1,
          origem: context.origem,
          versao: StructuredLoggerService.VERSION,
        },
      });

      // Também loga no console para desenvolvimento
      this.consoleLog(nivel, context, mensagem, detalhes);
    } catch (error) {
      // Se falhar ao salvar no banco, ao menos registra no console
      console.error('❌ Erro ao salvar log estruturado:', error);
      console.log('📝 Log que falhou:', { context, data });
    }
  }

  /**
   * Log visual no console (desenvolvimento)
   */
  private consoleLog(
    nivel: LogLevel,
    context: LogContext,
    mensagem: string,
    detalhes?: Record<string, any>
  ): void {
    const icon = {
      DEBUG: '🔍',
      INFO: 'ℹ️ ',
      WARN: '⚠️ ',
      ERROR: '❌',
      FATAL: '💀',
    }[nivel];

    const color = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m',  // Green
      WARN: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m', // Red
      FATAL: '\x1b[35m', // Magenta
    }[nivel];

    const reset = '\x1b[0m';

    console.log(
      `${color}${icon} [${context.etapa}/${context.operacao}] ${mensagem}${reset}`,
      detalhes ? detalhes : ''
    );
  }

  /**
   * Inicia tracking de performance
   */
  startPerformanceTracking(trackingId: string, operation: string): void {
    this.performanceTrackers.set(trackingId, {
      startTime: Date.now(),
      operation,
    });
  }

  /**
   * Finaliza tracking de performance e retorna tempo decorrido
   */
  endPerformanceTracking(trackingId: string): number {
    const tracker = this.performanceTrackers.get(trackingId);
    if (!tracker) return 0;

    const elapsed = Date.now() - tracker.startTime;
    this.performanceTrackers.delete(trackingId);
    return elapsed;
  }

  /**
   * Helper: Log de início de processamento
   */
  async logInicio(
    context: Omit<LogContext, 'operacao'>,
    mensagem: string,
    dadosEntrada?: Record<string, any>
  ): Promise<void> {
    await this.log(
      { ...context, operacao: Operacao.INICIO },
      {
        mensagem,
        nivel: LogLevel.INFO,
        dadosEntrada,
      }
    );
  }

  /**
   * Helper: Log de conclusão com sucesso
   */
  async logConclusao(
    context: Omit<LogContext, 'operacao'>,
    mensagem: string,
    dadosSaida?: Record<string, any>,
    transformacoes?: string[],
    tempoExecucaoMs?: number
  ): Promise<void> {
    await this.log(
      { ...context, operacao: Operacao.CONCLUSAO },
      {
        mensagem,
        nivel: LogLevel.INFO,
        dadosSaida,
        transformacoes,
        tempoExecucaoMs,
      }
    );
  }

  /**
   * Helper: Log de erro
   */
  async logErro(
    context: Omit<LogContext, 'operacao'>,
    mensagem: string,
    error: any,
    detalhes?: Record<string, any>
  ): Promise<void> {
    await this.log(
      { ...context, operacao: Operacao.ERRO },
      {
        mensagem,
        nivel: LogLevel.ERROR,
        detalhes: {
          ...detalhes,
          errorMessage: error?.message,
          errorStack: error?.stack,
        },
      }
    );
  }

  /**
   * Helper: Log de validação
   */
  async logValidacao(
    context: Omit<LogContext, 'operacao'>,
    mensagem: string,
    validacoes: Record<string, any>,
    nivel: LogLevel = LogLevel.INFO
  ): Promise<void> {
    await this.log(
      { ...context, operacao: Operacao.VALIDACAO },
      {
        mensagem,
        nivel,
        validacoes,
      }
    );
  }

  /**
   * Helper: Log de transformação de dados
   */
  async logTransformacao(
    context: Omit<LogContext, 'operacao'>,
    mensagem: string,
    dadosEntrada: Record<string, any>,
    dadosSaida: Record<string, any>,
    transformacoes: string[]
  ): Promise<void> {
    await this.log(
      { ...context, operacao: Operacao.TRANSFORMACAO },
      {
        mensagem,
        nivel: LogLevel.INFO,
        dadosEntrada,
        dadosSaida,
        transformacoes,
      }
    );
  }

  /**
   * Helper: Log de chamada de API externa
   */
  async logApiCall(
    context: Omit<LogContext, 'operacao'>,
    mensagem: string,
    detalhes: Record<string, any>,
    tempoExecucaoMs?: number
  ): Promise<void> {
    await this.log(
      { ...context, operacao: Operacao.API_CALL },
      {
        mensagem,
        nivel: LogLevel.INFO,
        detalhes,
        tempoExecucaoMs,
      }
    );
  }

  /**
   * Helper: Log com alertas/warnings
   */
  async logAlerta(
    context: LogContext,
    mensagem: string,
    alertas: string[],
    detalhes?: Record<string, any>
  ): Promise<void> {
    await this.log(context, {
      mensagem,
      nivel: LogLevel.WARN,
      alertas,
      detalhes,
    });
  }

  /**
   * Buscar logs por correlation ID (para rastrear jornada completa)
   */
  async getLogsByCorrelation(correlationId: string): Promise<any[]> {
    return await prisma.processamentoLog.findMany({
      where: { correlationId },
      orderBy: { timestamp: 'asc' },
    });
  }

  /**
   * Buscar logs por cliente
   */
  async getLogsByCliente(clienteId: string, limit = 100): Promise<any[]> {
    return await prisma.processamentoLog.findMany({
      where: { clienteId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  /**
   * Buscar logs por lote
   */
  async getLogsByLote(loteId: string): Promise<any[]> {
    return await prisma.processamentoLog.findMany({
      where: { loteId },
      orderBy: { timestamp: 'asc' },
    });
  }

  /**
   * Análise de performance por etapa
   */
  async getPerformanceStats(etapa: Etapa): Promise<any> {
    const logs = await prisma.processamentoLog.findMany({
      where: {
        etapa,
        tempoExecucaoMs: { not: null },
      },
      select: {
        tempoExecucaoMs: true,
        operacao: true,
      },
    });

    const tempos = logs.map((l) => l.tempoExecucaoMs!);
    const soma = tempos.reduce((a, b) => a + b, 0);
    const media = soma / tempos.length || 0;
    const min = Math.min(...tempos, 0);
    const max = Math.max(...tempos, 0);

    return {
      etapa,
      totalLogs: logs.length,
      tempoMedio: Math.round(media),
      tempoMinimo: min,
      tempoMaximo: max,
    };
  }
}

export default StructuredLoggerService;
