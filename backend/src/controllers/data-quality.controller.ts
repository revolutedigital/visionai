import { Request, Response } from 'express';
import { DataQualityService } from '../services/data-quality.service';

const dataQualityService = new DataQualityService();

/**
 * Sprint 3: Controller de Qualidade de Dados
 */

/**
 * GET /api/data-quality/report
 * Retorna relatório consolidado de qualidade de dados
 */
export async function getDataQualityReport(req: Request, res: Response) {
  try {
    const report = await dataQualityService.getDataQualityReport();
    res.json(report);
  } catch (error: any) {
    console.error('Erro ao gerar relatório de qualidade:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/data-quality/prioridades?minScore=70
 * Lista clientes com baixa qualidade de dados (prioritários para enriquecimento)
 */
export async function getPrioridades(req: Request, res: Response) {
  try {
    const minScore = parseInt(req.query.minScore as string) || 70;
    const clientes = await dataQualityService.getClientesComBaixaQualidade(minScore);
    res.json(clientes);
  } catch (error: any) {
    console.error('Erro ao buscar prioridades:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/data-quality/recalculate
 * Recalcula qualidade de dados para todos os clientes
 */
export async function recalculateAll(req: Request, res: Response) {
  try {
    const result = await dataQualityService.recalculateAllDataQuality();
    res.json({
      message: 'Recálculo de qualidade concluído',
      ...result,
    });
  } catch (error: any) {
    console.error('Erro ao recalcular qualidade:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/data-quality/:id
 * Retorna análise de qualidade para um cliente específico
 */
export async function getClienteQuality(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const report = await dataQualityService.analyzeDataQuality(id);
    res.json(report);
  } catch (error: any) {
    console.error('Erro ao analisar qualidade do cliente:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/data-quality/:id/update
 * Atualiza o score de qualidade de um cliente específico
 */
export async function updateClienteQuality(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await dataQualityService.updateDataQualityScore(id);
    const report = await dataQualityService.analyzeDataQuality(id);
    res.json({
      message: 'Score de qualidade atualizado',
      ...report,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar qualidade do cliente:', error);
    res.status(500).json({ error: error.message });
  }
}
