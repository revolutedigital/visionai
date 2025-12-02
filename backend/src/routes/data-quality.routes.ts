import { Router } from 'express';
import {
  getDataQualityReport,
  getPrioridades,
  recalculateAll,
  getClienteQuality,
  updateClienteQuality,
} from '../controllers/data-quality.controller';

const router = Router();

/**
 * Sprint 3: Rotas de Qualidade de Dados
 */

// Relatório consolidado de qualidade
router.get('/report', getDataQualityReport);

// Listar clientes com baixa qualidade (prioritários)
router.get('/prioridades', getPrioridades);

// Recalcular qualidade de todos os clientes
router.post('/recalculate', recalculateAll);

// Atualizar qualidade de um cliente específico
router.post('/:id/update', updateClienteQuality);

// Obter qualidade de um cliente específico (deve vir por último para não conflitar)
router.get('/:id', getClienteQuality);

export default router;
