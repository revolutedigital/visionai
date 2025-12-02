/**
 * Environment-aware Logger
 *
 * Substitui console.log/error/warn para comportamento seguro em produção
 * - DEV: Loga normalmente no console
 * - PROD: Silencia logs de debug, mantém apenas errors críticos
 * - PROD: Envia errors para Sentry automaticamente
 */

import * as Sentry from '@sentry/react';

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

interface LoggerConfig {
  enableDebugInProd?: boolean;
  enableInfoInProd?: boolean;
  errorTrackingService?: (error: Error, context?: any) => void;
}

class Logger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig = {}) {
    this.config = {
      enableDebugInProd: false,
      enableInfoInProd: false,
      ...config,
    };
  }

  /**
   * Debug logs - apenas em desenvolvimento
   */
  debug(message: string, ...args: any[]) {
    if (isDev || this.config.enableDebugInProd) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Info logs - apenas em desenvolvimento por padrão
   */
  info(message: string, ...args: any[]) {
    if (isDev || this.config.enableInfoInProd) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Warning logs - sempre ativo
   */
  warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${message}`, ...args);
  }

  /**
   * Error logs - sempre ativo + envio para serviço de tracking
   */
  error(message: string, error?: Error | any, context?: any) {
    console.error(`[ERROR] ${message}`, error, context);

    // Sempre enviar para Sentry em produção
    if (isProd) {
      if (error instanceof Error) {
        Sentry.captureException(error, {
          tags: {
            component: context?.component || 'unknown',
            action: context?.action || 'unknown',
          },
          extra: {
            message,
            ...context,
          },
        });
      } else {
        // Se não for Error, capturar como mensagem
        Sentry.captureMessage(message, {
          level: 'error',
          extra: { error, ...context },
        });
      }
    }

    // Compatibilidade com errorTrackingService customizado
    if (this.config.errorTrackingService && error instanceof Error) {
      this.config.errorTrackingService(error, { message, ...context });
    }
  }

  /**
   * Success logs - apenas em desenvolvimento
   */
  success(message: string, ...args: any[]) {
    if (isDev) {
      console.log(`✅ ${message}`, ...args);
    }
  }

  /**
   * API logs - útil para debug de requests
   */
  api(method: string, url: string, data?: any) {
    if (isDev) {
      console.log(`[API ${method}] ${url}`, data);
    }
  }

  /**
   * Performance logs
   */
  perf(label: string, startTime: number) {
    if (isDev) {
      const duration = Date.now() - startTime;
      console.log(`[PERF] ${label}: ${duration}ms`);
    }
  }

  /**
   * Configurar serviço de error tracking (Sentry, etc.)
   */
  setErrorTracking(service: (error: Error, context?: any) => void) {
    this.config.errorTrackingService = service;
  }
}

// Singleton instance
export const logger = new Logger();

// Helper para timing
export function startTimer() {
  return Date.now();
}

// Decorator para log automático de funções
export function logExecution(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const start = Date.now();
    logger.debug(`Executing ${propertyKey}`, args);

    try {
      const result = await originalMethod.apply(this, args);
      logger.perf(propertyKey, start);
      return result;
    } catch (error) {
      logger.error(`Error in ${propertyKey}`, error as Error, { args });
      throw error;
    }
  };

  return descriptor;
}

export default logger;
