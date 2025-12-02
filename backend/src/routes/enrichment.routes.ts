import { Router } from 'express';
import {
  startEnrichment,
  getEnrichmentStatus,
  getEnrichedClientes,
  retryFailed,
} from '../controllers/enrichment.controller';

const router = Router();

/**
 * Sprint 3+: Rotas de Enriquecimento Multi-Fonte
 */

// Iniciar enriquecimento
router.post('/start', startEnrichment);

// Status da fila de enriquecimento
router.get('/status', getEnrichmentStatus);

// Listar clientes enriquecidos
router.get('/clientes', getEnrichedClientes);

// Reprocessar clientes com falha
router.post('/retry-failed', retryFailed);

export default router;
