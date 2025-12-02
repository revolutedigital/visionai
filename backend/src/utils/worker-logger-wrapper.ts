import { Job } from 'bull';
import StructuredLoggerService, { Etapa } from '../services/structured-logger.service';

export interface WorkerContext {
  correlationId: string;
  clienteId?: string;
  loteId?: string;
  jobId: string;
  etapa: Etapa;
  origem: string;
  tentativa: number;
}

export interface WorkerExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  correlationId: string;
  performanceMs?: number;
}

/**
 * Wrapper para workers com logging automático
 * Simplifica a implementação de logging estruturado nos workers
 */
export class WorkerLoggerWrapper {
  private logger: StructuredLoggerService;

  constructor() {
    this.logger = new StructuredLoggerService();
  }

  /**
   * Executa um worker com logging automático completo
   * @param job Job do Bull Queue
   * @param etapa Etapa do pipeline
   * @param origem Nome do worker
   * @param executeFn Função a ser executada
   */
  async executeWithLogging<TData, TResult>(
    job: Job<TData & { clienteId?: string; loteId?: string }>,
    etapa: Etapa,
    origem: string,
    executeFn: (context: WorkerContext, logger: StructuredLoggerService) => Promise<TResult>
  ): Promise<WorkerExecutionResult> {
    const correlationId = StructuredLoggerService.generateCorrelationId();
    const perfTrackingId = `${origem}-${job.id}`;

    const context: WorkerContext = {
      correlationId,
      clienteId: job.data.clienteId,
      loteId: job.data.loteId,
      jobId: String(job.id),
      etapa,
      origem,
      tentativa: job.attemptsMade + 1,
    };

    // Iniciar tracking de performance
    this.logger.startPerformanceTracking(perfTrackingId, `${etapa}_TOTAL`);

    try {
      // Log de início
      await this.logger.logInicio(
        context,
        `Iniciando processamento: ${origem}`,
        { jobData: job.data }
      );

      // Executar função do worker
      const result = await executeFn(context, this.logger);

      // Finalizar tracking
      const performanceMs = this.logger.endPerformanceTracking(perfTrackingId);

      // Log de conclusão
      await this.logger.logConclusao(
        context,
        `Processamento concluído com sucesso: ${origem}`,
        { result },
        undefined,
        performanceMs
      );

      return {
        success: true,
        data: result,
        correlationId,
        performanceMs,
      };
    } catch (error: any) {
      // Finalizar tracking
      const performanceMs = this.logger.endPerformanceTracking(perfTrackingId);

      // Log de erro
      await this.logger.logErro(context, `Erro no processamento: ${origem}`, error, {
        tentativa: job.attemptsMade + 1,
        maxTentativas: job.opts.attempts,
        performanceMs,
      });

      return {
        success: false,
        error: error.message,
        correlationId,
        performanceMs,
      };
    }
  }

  /**
   * Cria um contexto de worker para uso manual
   */
  createContext(
    job: Job<any>,
    etapa: Etapa,
    origem: string,
    correlationId?: string
  ): WorkerContext {
    return {
      correlationId: correlationId || StructuredLoggerService.generateCorrelationId(),
      clienteId: job.data.clienteId,
      loteId: job.data.loteId,
      jobId: String(job.id),
      etapa,
      origem,
      tentativa: job.attemptsMade + 1,
    };
  }

  /**
   * Retorna instância do logger
   */
  getLogger(): StructuredLoggerService {
    return this.logger;
  }
}

export default WorkerLoggerWrapper;
