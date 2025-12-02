import { useRef, useCallback } from 'react';
import { logger } from '../utils/logger';

interface RateLimitConfig {
  maxRequests: number; // Máximo de requests
  windowMs: number; // Janela de tempo em milissegundos
  blockDurationMs?: number; // Duração do bloqueio após atingir limite
}

interface RateLimitState {
  requests: number[];
  blockedUntil: number | null;
}

/**
 * Hook para implementar Rate Limiting client-side
 *
 * Protege contra:
 * - Spam de requisições
 * - Cliques acidentais repetidos
 * - Loops infinitos de polling
 *
 * @example
 * const { isAllowed, getRemainingRequests } = useRateLimit({
 *   maxRequests: 10,
 *   windowMs: 60000, // 10 requests por minuto
 *   blockDurationMs: 30000, // Bloquear por 30s se exceder
 * });
 *
 * async function handleClick() {
 *   if (!isAllowed()) {
 *     toast.error('Muitas requisições. Aguarde antes de tentar novamente.');
 *     return;
 *   }
 *   await fetchData();
 * }
 */
export function useRateLimit(config: RateLimitConfig) {
  const { maxRequests, windowMs, blockDurationMs = 0 } = config;

  const stateRef = useRef<RateLimitState>({
    requests: [],
    blockedUntil: null,
  });

  /**
   * Limpa requisições antigas fora da janela de tempo
   */
  const cleanOldRequests = useCallback(() => {
    const now = Date.now();
    const state = stateRef.current;

    state.requests = state.requests.filter((timestamp) => now - timestamp < windowMs);
  }, [windowMs]);

  /**
   * Verifica se a requisição é permitida
   * Retorna false se exceder o limite
   */
  const isAllowed = useCallback((): boolean => {
    const now = Date.now();
    const state = stateRef.current;

    // Verificar se está bloqueado
    if (state.blockedUntil && now < state.blockedUntil) {
      const remainingMs = state.blockedUntil - now;
      logger.warn(`[Rate Limit] Bloqueado por mais ${Math.ceil(remainingMs / 1000)}s`);
      return false;
    }

    // Limpar requisições antigas
    cleanOldRequests();

    // Verificar se excedeu o limite
    if (state.requests.length >= maxRequests) {
      logger.warn(
        `[Rate Limit] Limite atingido: ${state.requests.length}/${maxRequests} em ${windowMs}ms`
      );

      // Bloquear se configurado
      if (blockDurationMs > 0) {
        state.blockedUntil = now + blockDurationMs;
        logger.warn(`[Rate Limit] Bloqueado por ${blockDurationMs / 1000}s`);
      }

      return false;
    }

    // Permitir e registrar requisição
    state.requests.push(now);
    return true;
  }, [maxRequests, windowMs, blockDurationMs, cleanOldRequests]);

  /**
   * Retorna o número de requisições restantes
   */
  const getRemainingRequests = useCallback((): number => {
    cleanOldRequests();
    const remaining = maxRequests - stateRef.current.requests.length;
    return Math.max(0, remaining);
  }, [maxRequests, cleanOldRequests]);

  /**
   * Retorna o tempo restante de bloqueio em milissegundos
   */
  const getBlockedTimeRemaining = useCallback((): number => {
    const state = stateRef.current;
    if (!state.blockedUntil) return 0;

    const now = Date.now();
    const remaining = state.blockedUntil - now;
    return Math.max(0, remaining);
  }, []);

  /**
   * Reseta o rate limiter (útil para testes ou logout)
   */
  const reset = useCallback(() => {
    stateRef.current = {
      requests: [],
      blockedUntil: null,
    };
    logger.info('[Rate Limit] Reset');
  }, []);

  return {
    isAllowed,
    getRemainingRequests,
    getBlockedTimeRemaining,
    reset,
  };
}

/**
 * Presets comuns de rate limiting
 */
export const RATE_LIMIT_PRESETS = {
  // Upload de arquivos: 5 por minuto
  upload: {
    maxRequests: 5,
    windowMs: 60000,
    blockDurationMs: 30000,
  },
  // Busca/Search: 30 por minuto
  search: {
    maxRequests: 30,
    windowMs: 60000,
    blockDurationMs: 10000,
  },
  // Ações críticas (delete): 3 por minuto
  critical: {
    maxRequests: 3,
    windowMs: 60000,
    blockDurationMs: 60000,
  },
  // Polling: 120 por minuto (1 a cada 500ms)
  polling: {
    maxRequests: 120,
    windowMs: 60000,
    blockDurationMs: 0, // Não bloquear, apenas throttle
  },
  // Botões gerais: 20 por minuto
  button: {
    maxRequests: 20,
    windowMs: 60000,
    blockDurationMs: 5000,
  },
} as const;
