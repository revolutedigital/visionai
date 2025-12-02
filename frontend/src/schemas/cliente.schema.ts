import { z } from 'zod';

/**
 * Schema Zod para validação de Cliente
 * Garante que dados vindos da API estão no formato esperado
 */

export const ClienteSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  endereco: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres').optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable(),

  // Geocoding
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  geocodificadoEm: z.string().datetime().optional().nullable(),
  geocodingAccuracy: z.string().optional().nullable(),

  // Google Places
  googlePlaceId: z.string().optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  totalReviews: z.number().int().min(0).optional().nullable(),
  googleMapsUrl: z.string().url().optional().nullable(),
  placeTypes: z.array(z.string()).optional().nullable(),
  processadoPlacesEm: z.string().datetime().optional().nullable(),

  // Tipologia
  tipologia: z.string().optional().nullable(),
  tipologiaConfianca: z.number().min(0).max(100).optional().nullable(),
  tipologiaIA: z.string().optional().nullable(),
  tipologiaGoogle: z.string().optional().nullable(),

  // Scoring
  potencialScore: z.number().int().min(0).max(100).optional().nullable(),
  potencialCategoria: z.enum(['ALTO', 'MÉDIO', 'BAIXO']).optional().nullable(),
  scoringBreakdown: z.string().optional().nullable(),

  // Visual Analysis (Sprint 2)
  qualidadeSinalizacao: z.string().optional().nullable(),
  presencaBranding: z.boolean().optional().nullable(),
  nivelProfissionalizacao: z.string().optional().nullable(),
  publicoAlvo: z.string().optional().nullable(),
  ambienteEstabelecimento: z.string().optional().nullable(),
  indicadoresVisuais: z.string().optional().nullable(),

  // Data Quality (Sprint 3)
  dataQualityScore: z.number().min(0).max(100).optional().nullable(),
  dataQualityCategory: z.enum(['EXCELENTE', 'ALTA', 'MEDIA', 'BAIXA']).optional().nullable(),
  camposFaltando: z.number().int().min(0).optional().nullable(),
  camposCompletos: z.number().int().min(0).optional().nullable(),

  // Timestamps
  criadoEm: z.string().datetime(),
  atualizadoEm: z.string().datetime(),
  analisadoEm: z.string().datetime().optional().nullable(),
});

export type Cliente = z.infer<typeof ClienteSchema>;

/**
 * Schema para lista de clientes (resposta da API)
 */
export const ClientesResponseSchema = z.object({
  success: z.boolean(),
  clientes: z.array(ClienteSchema),
  total: z.number().int().min(0).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
});

export type ClientesResponse = z.infer<typeof ClientesResponseSchema>;

/**
 * Schema para Dashboard Stats
 */
export const DashboardStatsSchema = z.object({
  geocoding: z.object({
    total: z.number().int().min(0),
    geocodificados: z.number().int().min(0),
    pendentes: z.number().int().min(0),
    percentual: z.number().min(0).max(100),
  }),
  places: z.object({
    total: z.number().int().min(0),
    processados: z.number().int().min(0),
    comFotos: z.number().int().min(0),
    totalFotos: z.number().int().min(0),
  }),
  analysis: z.object({
    total: z.number().int().min(0),
    concluidos: z.number().int().min(0),
    fotosAnalisadas: z.number().int().min(0),
    percentual: z.number().min(0).max(100),
  }),
  enrichment: z
    .object({
      total: z.number().int().min(0),
      enriquecidos: z.number().int().min(0),
      pendentes: z.number().int().min(0),
      percentual: z.number().min(0).max(100),
    })
    .optional(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

/**
 * Schema para Tipologia Distribuição
 */
export const TipologiaDistribuicaoSchema = z.object({
  success: z.boolean(),
  total: z.number().int().min(0),
  distribuicao: z.array(
    z.object({
      tipologia: z.string(),
      count: z.number().int().min(0),
      percentual: z.number().min(0).max(100),
    })
  ),
});

export type TipologiaDistribuicao = z.infer<typeof TipologiaDistribuicaoSchema>;

/**
 * Helper para validar dados da API
 * Loga erro automaticamente se validação falhar
 */
export function validateApiData<T>(schema: z.ZodSchema<T>, data: unknown, context?: string): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`[Zod Validation Error] ${context || 'Unknown'}:`, error.issues);
      throw new Error(
        `Dados inválidos recebidos da API: ${error.issues.map((e) => e.message).join(', ')}`
      );
    }
    throw error;
  }
}

/**
 * Helper para validação segura (retorna undefined se falhar)
 */
export function safeValidateApiData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T | undefined {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.warn('[Zod Validation Warning]:', result.error.issues);
  return undefined;
}
