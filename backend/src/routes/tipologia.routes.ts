import { Router } from 'express';
import {
  startTipologiaAll,
  classificarCliente,
  recalcularTodos,
  getDistribuicao,
} from '../controllers/tipologia.controller';

const router = Router();

/**
 * Sprint 4: Rotas de Tipologia/Classificação
 */

// Iniciar classificação de tipologia para todos os clientes analisados
router.post('/start', startTipologiaAll);

// Obter distribuição por tipologia
router.get('/distribuicao', getDistribuicao);

// Recalcular tipologias para todos os clientes
router.post('/recalcular-todos', recalcularTodos);

// Classificar um cliente específico
router.post('/classificar/:id', classificarCliente);

export default router;
