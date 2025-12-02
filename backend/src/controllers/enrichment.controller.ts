import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { enrichmentQueue } from '../workers/enrichment.worker';

const prisma = new PrismaClient();

/**
 * Sprint 3+: Controller de Enriquecimento Multi-Fonte
 */

/**
 * POST /api/enrichment/start
 * Inicia enriquecimento multi-fonte para clientes prioritários
 */
export async function startEnrichment(req: Request, res: Response) {
  try {
    const { clienteIds, maxQualityScore } = req.body;

    let clientes;

    if (clienteIds && Array.isArray(clienteIds)) {
      // Enriquecer IDs específicos
      clientes = await prisma.cliente.findMany({
        where: {
          id: { in: clienteIds },
          enrichmentStatus: { in: ['PENDENTE', 'FALHA'] },
        },
        select: { id: true, nome: true },
      });
    } else {
      // Enriquecer clientes com baixa qualidade de dados
      const maxScore = maxQualityScore || 70;
      clientes = await prisma.cliente.findMany({
        where: {
          dataQualityScore: { lte: maxScore },
          enrichmentStatus: { in: ['PENDENTE', 'FALHA'] },
        },
        orderBy: { dataQualityScore: 'asc' },
        take: 50, // Máximo 50 por vez
        select: { id: true, nome: true, dataQualityScore: true },
      });
    }

    if (clientes.length === 0) {
      return res.json({
        success: false,
        message: 'Nenhum cliente pendente para enriquecimento',
        total: 0,
      });
    }

    // Adicionar jobs à fila
    for (const cliente of clientes) {
      await enrichmentQueue.add(
        { clienteId: cliente.id },
        {
          delay: 1000, // 1s de delay entre cada job para não sobrecarregar APIs
        }
      );
    }

    res.json({
      success: true,
      message: `${clientes.length} clientes adicionados à fila de enriquecimento`,
      total: clientes.length,
      clientes: clientes.map((c: any) => ({
        id: c.id,
        nome: c.nome,
      })),
    });
  } catch (error: any) {
    console.error('Erro ao iniciar enriquecimento:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/enrichment/status
 * Retorna status do enriquecimento
 */
export async function getEnrichmentStatus(req: Request, res: Response) {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      enrichmentQueue.getWaitingCount(),
      enrichmentQueue.getActiveCount(),
      enrichmentQueue.getCompletedCount(),
      enrichmentQueue.getFailedCount(),
    ]);

    const [clientes, enriched, pending, processing, failedClientes] = await Promise.all([
      prisma.cliente.count(),
      prisma.cliente.count({ where: { enrichmentStatus: 'CONCLUIDO' } }),
      prisma.cliente.count({ where: { enrichmentStatus: 'PENDENTE' } }),
      prisma.cliente.count({ where: { enrichmentStatus: 'PROCESSANDO' } }),
      prisma.cliente.count({ where: { enrichmentStatus: 'FALHA' } }),
    ]);

    const percentualCompleto =
      clientes > 0 ? Math.round((enriched / clientes) * 100) : 0;

    res.json({
      queue: {
        waiting,
        active,
        completed,
        failed,
      },
      clientes: {
        total: clientes,
        enriquecidos: enriched,
        pendentes: pending,
        processando: processing,
        falhas: failedClientes,
        percentualCompleto,
      },
    });
  } catch (error: any) {
    console.error('Erro ao obter status do enriquecimento:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/enrichment/clientes
 * Lista clientes com status de enriquecimento
 */
export async function getEnrichedClientes(req: Request, res: Response) {
  try {
    const { status } = req.query;

    const where: any = {};
    if (status) {
      where.enrichmentStatus = status;
    }

    const clientes = await prisma.cliente.findMany({
      where,
      orderBy: { enrichmentProcessadoEm: 'desc' },
      take: 100,
      select: {
        id: true,
        nome: true,
        endereco: true,
        telefone: true,
        website: true,
        redesSociais: true,
        enrichmentStatus: true,
        enrichmentProcessadoEm: true,
        fontesValidadas: true,
        confiabilidadeDados: true,
        dataQualityScore: true,
      },
    });

    res.json({
      success: true,
      total: clientes.length,
      clientes: clientes.map((c: any) => ({
        ...c,
        redesSociais: c.redesSociais ? JSON.parse(c.redesSociais) : null,
        fontesValidadas: c.fontesValidadas ? JSON.parse(c.fontesValidadas) : [],
      })),
    });
  } catch (error: any) {
    console.error('Erro ao listar clientes enriquecidos:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/enrichment/retry-failed
 * Reprocessa clientes que falharam
 */
export async function retryFailed(req: Request, res: Response) {
  try {
    const failed = await prisma.cliente.findMany({
      where: { enrichmentStatus: 'FALHA' },
      select: { id: true, nome: true },
    });

    for (const cliente of failed) {
      await enrichmentQueue.add({ clienteId: cliente.id });
    }

    res.json({
      success: true,
      message: `${failed.length} clientes com falha readicionados à fila`,
      total: failed.length,
    });
  } catch (error: any) {
    console.error('Erro ao reprocessar clientes com falha:', error);
    res.status(500).json({ error: error.message });
  }
}
