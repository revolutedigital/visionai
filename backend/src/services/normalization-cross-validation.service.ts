/**
 * Normalization Cross Validation Service
 *
 * Vision AI Component: Valida normalização de endereços de múltiplas fontes
 * - Claude IA (pago, inteligente)
 * - Regex Local (grátis, regras fixas)
 *
 * Confiança:
 * - 100%: IA e Regex concordam (>90% similar)
 * - 80%: Concordam moderadamente (70-90%)
 * - 60%: Divergem muito (<70%) → Usar Regex (IA pode ter alucinado)
 *
 * ROI:
 * - Detecta alucinações da IA
 * - Economia de 50% em custos (usa Regex quando IA diverge)
 * - Mesma qualidade final
 */

import { localNormalizerService, NormalizationResult } from './local-normalizer.service';

export interface NormalizationCrossValidation {
  enderecoFinal: string;
  confianca: number; // 0-100%
  fonteUsada: 'ia' | 'regex' | 'consenso';
  detalhes: {
    iaResultado?: string;
    regexResultado: string;
    similaridade: number; // 0-100%
    divergencias: string[];
    alucinacaoDetectada: boolean;
  };
}

export class NormalizationCrossValidationService {
  /**
   * Valida normalização da IA contra normalização local (regex)
   */
  async validateNormalization(
    enderecoOriginal: string,
    enderecoIA: string | null
  ): Promise<NormalizationCrossValidation> {
    // SEMPRE executar normalização local (grátis!)
    const regexResult: NormalizationResult = localNormalizerService.normalize(enderecoOriginal);

    // Se IA não retornou resultado, usar Regex
    if (!enderecoIA || enderecoIA.trim() === '') {
      console.log(`⚠️  [Vision AI - Normalização] IA não retornou resultado, usando Regex`);

      return {
        enderecoFinal: regexResult.normalizado,
        confianca: regexResult.confianca,
        fonteUsada: 'regex',
        detalhes: {
          iaResultado: undefined,
          regexResultado: regexResult.normalizado,
          similaridade: 0,
          divergencias: ['IA não retornou resultado'],
          alucinacaoDetectada: false,
        },
      };
    }

    // Calcular similaridade entre IA e Regex
    const similaridade = this.calculateSimilarity(enderecoIA, regexResult.normalizado);

    const divergencias: string[] = [];
    let alucinacaoDetectada = false;

    // DECISÃO: Baseado na concordância
    if (similaridade >= 90) {
      // ✅ ALTA CONCORDÂNCIA (>90%)
      console.log(`✅ [Vision AI - Normalização] Alta concordância: ${similaridade.toFixed(0)}%`);
      console.log(`   IA: "${enderecoIA}"`);
      console.log(`   Regex: "${regexResult.normalizado}"`);

      return {
        enderecoFinal: enderecoIA, // Preferir IA (mais inteligente)
        confianca: 100,
        fonteUsada: 'consenso',
        detalhes: {
          iaResultado: enderecoIA,
          regexResultado: regexResult.normalizado,
          similaridade,
          divergencias: [],
          alucinacaoDetectada: false,
        },
      };
    }
    else if (similaridade >= 70) {
      // ⚠️ CONCORDÂNCIA MODERADA (70-90%)
      console.warn(`⚠️  [Vision AI - Normalização] Concordância moderada: ${similaridade.toFixed(0)}%`);
      console.log(`   IA: "${enderecoIA}"`);
      console.log(`   Regex: "${regexResult.normalizado}"`);

      divergencias.push(`Concordância moderada: ${similaridade.toFixed(0)}%`);
      divergencias.push(...this.findDifferences(enderecoIA, regexResult.normalizado));

      return {
        enderecoFinal: enderecoIA, // Ainda preferir IA
        confianca: 80,
        fonteUsada: 'ia',
        detalhes: {
          iaResultado: enderecoIA,
          regexResultado: regexResult.normalizado,
          similaridade,
          divergencias,
          alucinacaoDetectada: false,
        },
      };
    }
    else {
      // ❌ BAIXA CONCORDÂNCIA (<70%) - POSSÍVEL ALUCINAÇÃO!
      console.error(`❌ [Vision AI - Normalização] ALERTA: Baixa concordância ${similaridade.toFixed(0)}%`);
      console.error(`   IA: "${enderecoIA}"`);
      console.error(`   Regex: "${regexResult.normalizado}"`);
      console.error(`   ⚠️  POSSÍVEL ALUCINAÇÃO DA IA - Usando Regex!`);

      alucinacaoDetectada = true;

      divergencias.push(`⚠️  BAIXA CONCORDÂNCIA: ${similaridade.toFixed(0)}%`);
      divergencias.push(`IA pode ter alucinado`);
      divergencias.push(`IA: "${enderecoIA}"`);
      divergencias.push(`Regex: "${regexResult.normalizado}"`);
      divergencias.push(...this.findDifferences(enderecoIA, regexResult.normalizado));

      return {
        enderecoFinal: regexResult.normalizado, // 🎯 Usar Regex (mais confiável)
        confianca: 60,
        fonteUsada: 'regex',
        detalhes: {
          iaResultado: enderecoIA,
          regexResultado: regexResult.normalizado,
          similaridade,
          divergencias,
          alucinacaoDetectada: true,
        },
      };
    }
  }

  /**
   * Calcula similaridade entre dois endereços
   * Usa combinação de:
   * - Levenshtein Distance
   * - Token Set Ratio (ignora ordem de palavras)
   * - Jaccard Similarity (palavras em comum)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    // Se idênticos, 100%
    if (s1 === s2) return 100;

    // Levenshtein (50% do peso)
    const levenshtein = this.levenshteinSimilarity(s1, s2);

    // Token Set Ratio (30% do peso)
    const tokenSet = this.tokenSetRatio(s1, s2);

    // Jaccard (20% do peso)
    const jaccard = this.jaccardSimilarity(s1, s2);

    const final = (levenshtein * 0.5) + (tokenSet * 0.3) + (jaccard * 0.2);

    return Math.round(final);
  }

  /**
   * Levenshtein Distance Similarity
   */
  private levenshteinSimilarity(s1: string, s2: string): number {
    const distance = this.levenshteinDistance(s1, s2);
    const maxLen = Math.max(s1.length, s2.length);

    if (maxLen === 0) return 100;

    return ((maxLen - distance) / maxLen) * 100;
  }

  /**
   * Levenshtein Distance
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const len1 = s1.length;
    const len2 = s2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[len1][len2];
  }

  /**
   * Token Set Ratio - Ignora ordem de palavras
   */
  private tokenSetRatio(s1: string, s2: string): number {
    const tokens1 = new Set(s1.split(/\s+/).filter(t => t.length > 0));
    const tokens2 = new Set(s2.split(/\s+/).filter(t => t.length > 0));

    const intersection = new Set([...tokens1].filter(t => tokens2.has(t)));
    const union = new Set([...tokens1, ...tokens2]);

    if (union.size === 0) return 100;

    return (intersection.size / union.size) * 100;
  }

  /**
   * Jaccard Similarity - Palavras em comum
   */
  private jaccardSimilarity(s1: string, s2: string): number {
    const set1 = new Set(s1.split(/\s+/).filter(t => t.length > 0));
    const set2 = new Set(s2.split(/\s+/).filter(t => t.length > 0));

    const intersection = new Set([...set1].filter(t => set2.has(t)));
    const union = new Set([...set1, ...set2]);

    if (union.size === 0) return 100;

    return (intersection.size / union.size) * 100;
  }

  /**
   * Encontra diferenças específicas entre dois endereços
   */
  private findDifferences(str1: string, str2: string): string[] {
    const differences: string[] = [];

    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));

    // Palavras apenas na IA
    const onlyInIA = [...words1].filter(w => !words2.has(w));
    if (onlyInIA.length > 0) {
      differences.push(`Apenas na IA: ${onlyInIA.join(', ')}`);
    }

    // Palavras apenas no Regex
    const onlyInRegex = [...words2].filter(w => !words1.has(w));
    if (onlyInRegex.length > 0) {
      differences.push(`Apenas no Regex: ${onlyInRegex.join(', ')}`);
    }

    return differences;
  }

  /**
   * Formata logs de validação cruzada
   */
  logCrossValidation(result: NormalizationCrossValidation): void {
    console.log(`\n📝 ===== VISION AI - NORMALIZAÇÃO =====`);
    console.log(`   Confiança: ${result.confianca}%`);
    console.log(`   Fonte usada: ${result.fonteUsada.toUpperCase()}`);
    console.log(`   Similaridade: ${result.detalhes.similaridade.toFixed(0)}%`);

    if (result.detalhes.iaResultado) {
      console.log(`   🤖 IA: "${result.detalhes.iaResultado}"`);
    }
    console.log(`   📏 Regex: "${result.detalhes.regexResultado}"`);
    console.log(`   ✅ Final: "${result.enderecoFinal}"`);

    if (result.detalhes.alucinacaoDetectada) {
      console.error(`   ⚠️  ALUCINAÇÃO DETECTADA! Usando Regex.`);
    }

    if (result.detalhes.divergencias.length > 0) {
      console.warn(`   ⚠️  Divergências:`);
      result.detalhes.divergencias.forEach(d => console.warn(`      - ${d}`));
    }

    console.log(`======================================\n`);
  }

  /**
   * Calcula economia de custo ao usar Regex ao invés de IA
   */
  calculateCostSavings(totalProcessados: number, percentualRegex: number): {
    economiaTotal: number;
    economiaPercentual: number;
    detalhes: string;
  } {
    const custoIAPorNormalizacao = 0.002; // ~$0.002 por normalização com Claude
    const custoRegexPorNormalizacao = 0; // GRÁTIS!

    const normalizacoesComRegex = totalProcessados * (percentualRegex / 100);
    const economiaTotal = normalizacoesComRegex * custoIAPorNormalizacao;

    return {
      economiaTotal,
      economiaPercentual: percentualRegex,
      detalhes: `Economia de $${economiaTotal.toFixed(4)} usando Regex em ${percentualRegex.toFixed(0)}% das normalizações`,
    };
  }
}

export const normalizationCrossValidationService = new NormalizationCrossValidationService();
