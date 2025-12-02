import Queue from 'bull';
import { PrismaClient } from '@prisma/client';
import { EnrichmentService } from '../services/enrichment.service';

const prisma = new PrismaClient();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Fila de enriquecimento multi-fonte
export const enrichmentQueue = new Queue('enrichment', REDIS_URL, {
  defaultJobOptions: {
    attempts: 2, // Tentar 2 vezes
    backoff: {
      type: 'exponential',
      delay: 5000, // Esperar 5s entre tentativas
    },
    removeOnComplete: 100, // Manter últimos 100 jobs
    removeOnFail: false, // Manter jobs com falha para debug
  },
});

const enrichmentService = new EnrichmentService();

/**
 * Worker: Processa enriquecimento multi-fonte
 */
enrichmentQueue.process(async (job) => {
  const { clienteId } = job.data;

  console.log(`\n🔍 [ENRICHMENT] Processando cliente ${clienteId}`);

  try {
    // Atualizar status para PROCESSANDO
    await prisma.cliente.update({
      where: { id: clienteId },
      data: {
        enrichmentStatus: 'PROCESSANDO',
      },
    });

    // Executar enriquecimento multi-fonte
    const result = await enrichmentService.enrichCliente(clienteId);

    if (result.sucesso) {
      // Atualizar status para CONCLUIDO
      await prisma.cliente.update({
        where: { id: clienteId },
        data: {
          enrichmentStatus: 'CONCLUIDO',
          enrichmentProcessadoEm: new Date(),
          enrichmentErro: null,
        },
      });

      console.log(`✅ [ENRICHMENT] Cliente ${clienteId} enriquecido com sucesso`);
      console.log(`   Fontes consultadas: ${result.fontesConsultadas.join(', ')}`);

      return {
        success: true,
        clienteId,
        fontesConsultadas: result.fontesConsultadas,
        confiabilidade: result.confiabilidade,
      };
    } else {
      throw new Error('Enriquecimento falhou');
    }
  } catch (error: any) {
    console.error(`❌ [ENRICHMENT] Erro ao processar cliente ${clienteId}:`, error.message);

    // Atualizar status para FALHA
    await prisma.cliente.update({
      where: { id: clienteId },
      data: {
        enrichmentStatus: 'FALHA',
        enrichmentErro: error.message,
      },
    });

    throw error; // Re-throw para o Bull registrar a falha
  }
});

// Eventos da fila
enrichmentQueue.on('completed', (job, result) => {
  console.log(`✅ [ENRICHMENT] Job ${job.id} concluído:`, result);
});

enrichmentQueue.on('failed', (job, err) => {
  console.error(`❌ [ENRICHMENT] Job ${job?.id} falhou:`, err.message);
});

enrichmentQueue.on('stalled', (job) => {
  console.warn(`⚠️  [ENRICHMENT] Job ${job.id} travou (stalled)`);
});

console.log('🔍 Worker de Enriquecimento Multi-Fonte iniciado');
