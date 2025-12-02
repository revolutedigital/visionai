/**
 * Sprint 1 - Fuzzy Matching Service
 * Implementa validação de similaridade entre strings para validar dados do Google Places
 *
 * Algoritmos:
 * 1. Levenshtein Distance - Mede edições necessárias
 * 2. Jaro-Winkler - Ótimo para nomes próprios
 * 3. Token Set Ratio - Para endereços com ordem diferente
 */

export interface MatchResult {
  similarity: number; // 0-100%
  isMatch: boolean; // Se passou o threshold
  method: string;
  details?: {
    normalized1: string;
    normalized2: string;
    distance?: number;
  };
}

export class FuzzyMatchingService {
  /**
   * Normaliza string para comparação
   * Remove acentos, pontuação, lowercases, espaços extras
   */
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD') // Decompor caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^\w\s]/g, ' ') // Remover pontuação
      .replace(/\s+/g, ' ') // Normalizar espaços
      .trim();
  }

  /**
   * Levenshtein Distance - Distância de edição entre duas strings
   * Retorna número de inserções, deleções ou substituições necessárias
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    // Inicializar matriz
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Preencher matriz
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // Deleção
          matrix[i][j - 1] + 1, // Inserção
          matrix[i - 1][j - 1] + cost // Substituição
        );
      }
    }

    return matrix[len1][len2];
  }

  /**
   * Calcula similaridade baseada em Levenshtein Distance
   * Retorna 0-100%
   */
  private levenshteinSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);

    if (maxLength === 0) return 100;

    return ((maxLength - distance) / maxLength) * 100;
  }

  /**
   * Jaro-Winkler Similarity - Ótimo para nomes próprios
   * Dá peso maior para caracteres no início da string
   */
  private jaroWinklerSimilarity(str1: string, str2: string): number {
    const jaroSim = this.jaroSimilarity(str1, str2);

    // Prefixo comum (até 4 caracteres)
    let prefixLen = 0;
    for (let i = 0; i < Math.min(4, str1.length, str2.length); i++) {
      if (str1[i] === str2[i]) {
        prefixLen++;
      } else {
        break;
      }
    }

    // Jaro-Winkler usa scaling factor de 0.1
    return (jaroSim + prefixLen * 0.1 * (1 - jaroSim)) * 100;
  }

  /**
   * Jaro Similarity - Base para Jaro-Winkler
   */
  private jaroSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    if (!str1 || !str2) return 0.0;

    const matchWindow = Math.floor(Math.max(str1.length, str2.length) / 2) - 1;
    const str1Matches = new Array(str1.length).fill(false);
    const str2Matches = new Array(str2.length).fill(false);

    let matches = 0;
    let transpositions = 0;

    // Encontrar matches
    for (let i = 0; i < str1.length; i++) {
      const start = Math.max(0, i - matchWindow);
      const end = Math.min(i + matchWindow + 1, str2.length);

      for (let j = start; j < end; j++) {
        if (str2Matches[j] || str1[i] !== str2[j]) continue;
        str1Matches[i] = true;
        str2Matches[j] = true;
        matches++;
        break;
      }
    }

    if (matches === 0) return 0.0;

    // Contar transposições
    let k = 0;
    for (let i = 0; i < str1.length; i++) {
      if (!str1Matches[i]) continue;
      while (!str2Matches[k]) k++;
      if (str1[i] !== str2[k]) transpositions++;
      k++;
    }

    return (
      (matches / str1.length +
        matches / str2.length +
        (matches - transpositions / 2) / matches) /
      3.0
    );
  }

  /**
   * Token Set Ratio - Para comparar textos onde ordem das palavras pode variar
   * Exemplo: "Rua ABC, 123" vs "123, Rua ABC"
   */
  private tokenSetRatio(str1: string, str2: string): number {
    const tokens1 = new Set(str1.split(' ').filter((t) => t.length > 0));
    const tokens2 = new Set(str2.split(' ').filter((t) => t.length > 0));

    const intersection = new Set([...tokens1].filter((t) => tokens2.has(t)));
    const union = new Set([...tokens1, ...tokens2]);

    if (union.size === 0) return 100;

    return (intersection.size / union.size) * 100;
  }

  /**
   * Match Híbrido - Combina múltiplas técnicas
   * Usado para validar Places contra dados do cliente
   *
   * @param str1 String original (ex: nome do cliente)
   * @param str2 String do Google Places
   * @param threshold Limite de similaridade (0-100) para considerar match
   */
  matchStrings(
    str1: string,
    str2: string,
    threshold: number = 70
  ): MatchResult {
    const norm1 = this.normalize(str1);
    const norm2 = this.normalize(str2);

    // Se são idênticas após normalização
    if (norm1 === norm2) {
      return {
        similarity: 100,
        isMatch: true,
        method: 'exact',
        details: { normalized1: norm1, normalized2: norm2 },
      };
    }

    // Calcular similaridades com diferentes métodos
    const levenshtein = this.levenshteinSimilarity(norm1, norm2);
    const jaroWinkler = this.jaroWinklerSimilarity(norm1, norm2);
    const tokenSet = this.tokenSetRatio(norm1, norm2);

    // Usar a melhor similaridade
    const bestSimilarity = Math.max(levenshtein, jaroWinkler, tokenSet);

    let method = 'levenshtein';
    if (jaroWinkler === bestSimilarity) method = 'jaro-winkler';
    if (tokenSet === bestSimilarity) method = 'token-set';

    return {
      similarity: Math.round(bestSimilarity),
      isMatch: bestSimilarity >= threshold,
      method,
      details: {
        normalized1: norm1,
        normalized2: norm2,
      },
    };
  }

  /**
   * Validar nome do estabelecimento do Google Places
   * Compara contra nome do cliente e nome fantasia
   */
  validatePlaceName(
    clienteName: string,
    fantasyName: string | null | undefined,
    placeName: string,
    threshold: number = 70
  ): {
    valid: boolean;
    similarity: number;
    matchedAgainst: 'cliente' | 'fantasia' | 'nenhum';
    details: MatchResult;
  } {
    // Tentar match contra nome fantasia primeiro (mais específico)
    if (fantasyName) {
      const fantasyMatch = this.matchStrings(fantasyName, placeName, threshold);
      if (fantasyMatch.isMatch) {
        return {
          valid: true,
          similarity: fantasyMatch.similarity,
          matchedAgainst: 'fantasia',
          details: fantasyMatch,
        };
      }
    }

    // Tentar match contra nome do cliente
    const clienteMatch = this.matchStrings(clienteName, placeName, threshold);
    if (clienteMatch.isMatch) {
      return {
        valid: true,
        similarity: clienteMatch.similarity,
        matchedAgainst: 'cliente',
        details: clienteMatch,
      };
    }

    // Nenhum match
    return {
      valid: false,
      similarity: Math.max(
        clienteMatch.similarity,
        fantasyName ? this.matchStrings(fantasyName, placeName, threshold).similarity : 0
      ),
      matchedAgainst: 'nenhum',
      details: clienteMatch,
    };
  }

  /**
   * Validar endereço do Google Places
   * Compara contra endereço do cliente ou da Receita
   */
  validatePlaceAddress(
    clienteAddress: string,
    receitaAddress: string | null | undefined,
    placeAddress: string,
    threshold: number = 60 // Endereços podem ter mais variação
  ): {
    valid: boolean;
    similarity: number;
    matchedAgainst: 'cliente' | 'receita' | 'nenhum';
    details: MatchResult;
  } {
    // Tentar match contra endereço da Receita primeiro (mais confiável)
    if (receitaAddress) {
      const receitaMatch = this.matchStrings(
        receitaAddress,
        placeAddress,
        threshold
      );
      if (receitaMatch.isMatch) {
        return {
          valid: true,
          similarity: receitaMatch.similarity,
          matchedAgainst: 'receita',
          details: receitaMatch,
        };
      }
    }

    // Tentar match contra endereço do cliente
    const clienteMatch = this.matchStrings(clienteAddress, placeAddress, threshold);
    if (clienteMatch.isMatch) {
      return {
        valid: true,
        similarity: clienteMatch.similarity,
        matchedAgainst: 'cliente',
        details: clienteMatch,
      };
    }

    // Nenhum match
    return {
      valid: false,
      similarity: Math.max(
        clienteMatch.similarity,
        receitaAddress ? this.matchStrings(receitaAddress, placeAddress, threshold).similarity : 0
      ),
      matchedAgainst: 'nenhum',
      details: clienteMatch,
    };
  }
}

export const fuzzyMatchingService = new FuzzyMatchingService();
