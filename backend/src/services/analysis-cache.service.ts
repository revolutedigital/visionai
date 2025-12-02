import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AnalysisResult {
  tipologia: string; // Código Pepsi: F1, H3, etc
  tipologiaNome: string; // Nome legível
  confianca: number; // 0-100
  detalhes: any; // Resultado completo da análise
}

/**
 * Serviço de cache para análises de IA
 * Evita re-analisar fotos duplicadas (mesmo hash SHA256)
 *
 * ROI Esperado: 30-40% redução de custos IA
 */
export class AnalysisCacheService {
  /**
   * Busca análise cacheada pelo hash da foto
   */
  async get(fileHash: string): Promise<AnalysisResult | null> {
    const cached = await prisma.analysisCache.findUnique({
      where: { fileHash },
    });

    if (!cached) {
      return null;
    }

    // Atualizar estatísticas de uso
    await prisma.analysisCache.update({
      where: { fileHash },
      data: {
        timesUsed: { increment: 1 },
        lastUsed: new Date(),
      },
    });

    console.log(`✨ Cache HIT: ${fileHash.slice(0, 12)}... (usado ${cached.timesUsed + 1}x)`);

    return {
      tipologia: cached.tipologia || '',
      tipologiaNome: cached.tipologiaNome || '',
      confianca: cached.confianca || 0,
      detalhes: JSON.parse(cached.analiseResultado),
    };
  }

  /**
   * Salva resultado de análise no cache
   */
  async set(
    fileHash: string,
    result: AnalysisResult,
    promptVersion?: string,
    modelUsed?: string
  ): Promise<void> {
    await prisma.analysisCache.create({
      data: {
        fileHash,
        analiseResultado: JSON.stringify(result.detalhes),
        tipologia: result.tipologia,
        tipologiaNome: result.tipologiaNome,
        confianca: result.confianca,
        promptVersion,
        modelUsed,
      },
    });

    console.log(`💾 Cache SAVED: ${fileHash.slice(0, 12)}... (${result.tipologia} - ${result.confianca}%)`);
  }

  /**
   * Invalida cache por tipologia (útil quando muda o prompt)
   */
  async invalidateByTipologia(tipologia: string): Promise<number> {
    const result = await prisma.analysisCache.deleteMany({
      where: { tipologia },
    });

    console.log(`🗑️  Cache invalidado: ${result.count} entradas de ${tipologia}`);
    return result.count;
  }

  /**
   * Invalida cache por versão de prompt
   * Usar quando atualizar prompt e quiser re-analisar tudo
   */
  async invalidateByPromptVersion(promptVersion: string): Promise<number> {
    const result = await prisma.analysisCache.deleteMany({
      where: { promptVersion },
    });

    console.log(`🗑️  Cache invalidado: ${result.count} entradas do prompt ${promptVersion}`);
    return result.count;
  }

  /**
   * Estatísticas de cache
   */
  async getStats() {
    const totalEntries = await prisma.analysisCache.count();

    const avgUsage = await prisma.analysisCache.aggregate({
      _avg: { timesUsed: true },
      _max: { timesUsed: true },
    });

    const byTipologia = await prisma.analysisCache.groupBy({
      by: ['tipologia'],
      _count: true,
      orderBy: { _count: { tipologia: 'desc' } },
      take: 10,
    });

    return {
      totalEntries,
      avgUsage: avgUsage._avg.timesUsed || 0,
      maxUsage: avgUsage._max.timesUsed || 0,
      topTipologias: byTipologia.map(t => ({
        tipologia: t.tipologia,
        count: t._count,
      })),
    };
  }
}
