import { useState, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
  onRetry?: (attempt: number, delay: number) => void;
}

interface RetryState {
  attempt: number;
  isRetrying: boolean;
  lastError: Error | null;
}

/**
 * Hook para Retry Logic com Exponential Backoff
 *
 * Aumenta resilência do sistema retentando operações falhadas
 *
 * @example
 * const { execute, state } = useRetry({
 *   maxAttempts: 3,
 *   initialDelay: 1000,
 * });
 *
 * const data = await execute(() => fetch('/api/data'));
 */
export function useRetry<T = any>(options: RetryOptions = {}) {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    shouldRetry,
    onRetry,
  } = options;

  const [state, setState] = useState<RetryState>({
    attempt: 0,
    isRetrying: false,
    lastError: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Calcular delay com exponential backoff + jitter
   */
  const calculateDelay = useCallback(
    (attempt: number): number => {
      const exponentialDelay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );

      // Adicionar jitter (±25%)
      const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);

      return Math.round(exponentialDelay + jitter);
    },
    [initialDelay, backoffMultiplier, maxDelay]
  );

  /**
   * Sleep com possibilidade de abort
   */
  const sleep = useCallback((ms: number, signal?: AbortSignal): Promise<void> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);

      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('Retry aborted'));
        });
      }
    });
  }, []);

  /**
   * Executar função com retry
   */
  const execute = useCallback(
    async (fn: () => Promise<T>): Promise<T> => {
      // Criar novo AbortController
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      let lastError: Error | null = null;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          // Verificar se foi abortado
          if (signal.aborted) {
            throw new Error('Retry aborted');
          }

          setState({
            attempt: attempt + 1,
            isRetrying: attempt > 0,
            lastError,
          });

          // Executar função
          const result = await fn();

          // Sucesso - resetar estado
          setState({
            attempt: 0,
            isRetrying: false,
            lastError: null,
          });

          logger.info(`[Retry] Sucesso na tentativa ${attempt + 1}`);

          return result;
        } catch (error) {
          lastError = error as Error;

          logger.warn(
            `[Retry] Tentativa ${attempt + 1}/${maxAttempts} falhou`,
            error
          );

          // Verificar se deve retentar
          const isLastAttempt = attempt === maxAttempts - 1;

          if (isLastAttempt) {
            setState({
              attempt: maxAttempts,
              isRetrying: false,
              lastError,
            });

            throw error;
          }

          // Verificar condição customizada de retry
          if (shouldRetry && !shouldRetry(lastError, attempt + 1)) {
            logger.warn('[Retry] shouldRetry retornou false, abortando');

            setState({
              attempt: attempt + 1,
              isRetrying: false,
              lastError,
            });

            throw error;
          }

          // Calcular delay e aguardar
          const delay = calculateDelay(attempt);

          if (onRetry) {
            onRetry(attempt + 1, delay);
          }

          logger.info(`[Retry] Aguardando ${delay}ms antes de retentar...`);

          await sleep(delay, signal);
        }
      }

      // Nunca deve chegar aqui, mas TypeScript precisa
      throw lastError || new Error('Max retry attempts reached');
    },
    [
      maxAttempts,
      calculateDelay,
      shouldRetry,
      onRetry,
      sleep,
    ]
  );

  /**
   * Abortar tentativas de retry
   */
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState({
        attempt: 0,
        isRetrying: false,
        lastError: null,
      });
      logger.info('[Retry] Abortado pelo usuário');
    }
  }, []);

  /**
   * Resetar estado
   */
  const reset = useCallback(() => {
    setState({
      attempt: 0,
      isRetrying: false,
      lastError: null,
    });
  }, []);

  return {
    execute,
    abort,
    reset,
    state,
    isRetrying: state.isRetrying,
    attempt: state.attempt,
    lastError: state.lastError,
  };
}

/**
 * Presets de retry para casos comuns
 */
export const RETRY_PRESETS = {
  // Requests de API padrão
  api: {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    shouldRetry: (error: Error) => {
      // Não retentar erros 4xx (exceto 408, 429)
      if ('status' in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) {
          return status === 408 || status === 429;
        }
      }
      return true;
    },
  },

  // Upload de arquivos grandes
  upload: {
    maxAttempts: 5,
    initialDelay: 2000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  },

  // Operações críticas
  critical: {
    maxAttempts: 5,
    initialDelay: 500,
    maxDelay: 60000,
    backoffMultiplier: 3,
  },

  // Polling (tentativas rápidas)
  polling: {
    maxAttempts: 10,
    initialDelay: 500,
    maxDelay: 5000,
    backoffMultiplier: 1.5,
  },
} as const;
