import { useState, useCallback } from 'react';
import { logger } from '../utils/logger';
import { errorToast, successToast } from '../utils/toast';

interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  rollbackOnError?: boolean;
}

/**
 * Hook para Optimistic Updates - atualiza UI imediatamente e reverte se falhar
 *
 * Melhora UX tornando a interface mais responsiva
 *
 * @example
 * const { mutate, isLoading } = useOptimisticUpdate();
 *
 * async function handleDelete(id: string) {
 *   mutate(
 *     // Valor otimista (UI imediata)
 *     clients.filter(c => c.id !== id),
 *     // Função async real
 *     () => api.delete(`/clients/${id}`),
 *     {
 *       successMessage: 'Cliente excluído',
 *       rollbackOnError: true,
 *     }
 *   );
 * }
 */
export function useOptimisticUpdate<T = any>() {
  const [isLoading, setIsLoading] = useState(false);
  const [previousValue, setPreviousValue] = useState<T | null>(null);

  const mutate = useCallback(
    async (
      optimisticValue: T,
      mutateFn: () => Promise<any>,
      options: OptimisticUpdateOptions<T> = {}
    ): Promise<{ success: boolean; data?: any; error?: Error }> => {
      const {
        onSuccess,
        onError,
        successMessage,
        errorMessage = 'Operação falhou',
        rollbackOnError = true,
      } = options;

      try {
        setIsLoading(true);

        // 1. Aplicar valor otimista imediatamente
        // (isso é feito pelo componente que chama o hook)

        // 2. Executar mutação real
        const result = await mutateFn();

        // 3. Sucesso
        logger.info('[OptimisticUpdate] Sucesso', { result });

        if (successMessage) {
          successToast(successMessage);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        setPreviousValue(null);
        setIsLoading(false);

        return { success: true, data: result };
      } catch (error) {
        // 4. Erro - reverter se necessário
        logger.error('[OptimisticUpdate] Erro', error as Error);

        if (rollbackOnError && previousValue !== null) {
          logger.warn('[OptimisticUpdate] Revertendo para valor anterior');
          // O rollback é feito pelo componente
        }

        errorToast(errorMessage, (error as Error).message);

        if (onError) {
          onError(error as Error);
        }

        setIsLoading(false);

        return { success: false, error: error as Error };
      }
    },
    [previousValue]
  );

  /**
   * Salvar valor anterior para possível rollback
   */
  const saveSnapshot = useCallback((value: T) => {
    setPreviousValue(value);
  }, []);

  /**
   * Restaurar valor anterior (rollback manual)
   */
  const rollback = useCallback((): T | null => {
    return previousValue;
  }, [previousValue]);

  return {
    mutate,
    isLoading,
    saveSnapshot,
    rollback,
    previousValue,
  };
}

/**
 * Hook especializado para operações de lista (add/remove/update)
 */
export function useOptimisticList<T extends { id: string }>(
  initialData: T[] = []
) {
  const [data, setData] = useState<T[]>(initialData);
  const { mutate, isLoading, saveSnapshot, rollback } = useOptimisticUpdate<T[]>();

  /**
   * Adicionar item otimisticamente
   */
  const addItem = useCallback(
    async (
      item: T,
      mutateFn: () => Promise<T>,
      options?: OptimisticUpdateOptions<T[]>
    ) => {
      saveSnapshot(data);

      // Update otimista
      const optimisticData = [...data, item];
      setData(optimisticData);

      const result = await mutate(optimisticData, mutateFn, options);

      if (!result.success) {
        // Rollback
        const previousData = rollback();
        if (previousData) setData(previousData);
      }

      return result;
    },
    [data, mutate, saveSnapshot, rollback]
  );

  /**
   * Remover item otimisticamente
   */
  const removeItem = useCallback(
    async (
      id: string,
      mutateFn: () => Promise<void>,
      options?: OptimisticUpdateOptions<T[]>
    ) => {
      saveSnapshot(data);

      // Update otimista
      const optimisticData = data.filter((item) => item.id !== id);
      setData(optimisticData);

      const result = await mutate(optimisticData, mutateFn, options);

      if (!result.success) {
        // Rollback
        const previousData = rollback();
        if (previousData) setData(previousData);
      }

      return result;
    },
    [data, mutate, saveSnapshot, rollback]
  );

  /**
   * Atualizar item otimisticamente
   */
  const updateItem = useCallback(
    async (
      id: string,
      updates: Partial<T>,
      mutateFn: () => Promise<T>,
      options?: OptimisticUpdateOptions<T[]>
    ) => {
      saveSnapshot(data);

      // Update otimista
      const optimisticData = data.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      setData(optimisticData);

      const result = await mutate(optimisticData, mutateFn, options);

      if (!result.success) {
        // Rollback
        const previousData = rollback();
        if (previousData) setData(previousData);
      }

      return result;
    },
    [data, mutate, saveSnapshot, rollback]
  );

  return {
    data,
    setData,
    addItem,
    removeItem,
    updateItem,
    isLoading,
  };
}
