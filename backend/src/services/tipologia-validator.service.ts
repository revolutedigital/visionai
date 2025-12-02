import { TIPOLOGIAS_PEPSI, TipologiaDefinition } from '../config/tipologia-mapping';

export interface CrossValidationResult {
  valid: boolean;
  confidence: number; // 0-100
  warning?: string;
  matches: {
    byPlaceType: boolean;
    byKeyword: boolean;
  };
  suggestedTipologias?: TipologiaDefinition[];
}

/**
 * Serviço de Validação Cruzada
 * Compara tipologia detectada pela IA com dados do Google Places
 */
export class TipologiaValidatorService {
  /**
   * Valida se tipologia da IA está consistente com Google Places
   */
  validateCrossReference(
    tipologiaCodigo: string,
    placesTypes: string[],
    placeName?: string
  ): CrossValidationResult {
    const tipologia = TIPOLOGIAS_PEPSI[tipologiaCodigo];

    if (!tipologia) {
      return {
        valid: false,
        confidence: 0,
        warning: `Tipologia ${tipologiaCodigo} não encontrada no mapeamento`,
        matches: { byPlaceType: false, byKeyword: false },
      };
    }

    // 1. Verificar match por Place Type
    const hasPlaceTypeMatch = placesTypes.some(placeType =>
      tipologia.googlePlacesTypes.includes(placeType)
    );

    // 2. Verificar match por keywords no nome
    let hasKeywordMatch = false;
    if (placeName) {
      const placeNameLower = placeName.toLowerCase();
      hasKeywordMatch = tipologia.keywords.some(keyword =>
        placeNameLower.includes(keyword.toLowerCase())
      );
    }

    // 3. Calcular confiança
    let confidence = 50; // Base

    if (hasPlaceTypeMatch && hasKeywordMatch) {
      confidence = 95; // Altíssima confiança
    } else if (hasPlaceTypeMatch) {
      confidence = 85; // Alta confiança
    } else if (hasKeywordMatch) {
      confidence = 70; // Média-alta confiança
    } else {
      // Divergência detectada
      confidence = 30;

      // Buscar tipologias sugeridas baseadas nos Places Types
      const suggested = this.findBestMatchingTipologias(placesTypes, placeName);

      return {
        valid: false,
        confidence,
        warning: `IA detectou ${tipologia.nome} mas Google Places indica ${placesTypes.join(', ')}`,
        matches: { byPlaceType: false, byKeyword: false },
        suggestedTipologias: suggested.slice(0, 3),
      };
    }

    return {
      valid: true,
      confidence,
      matches: { byPlaceType: hasPlaceTypeMatch, byKeyword: hasKeywordMatch },
    };
  }

  /**
   * Busca melhores tipologias que casam com os Places Types
   */
  findBestMatchingTipologias(
    placesTypes: string[],
    placeName?: string
  ): TipologiaDefinition[] {
    const scores: Array<{ tipologia: TipologiaDefinition; score: number }> = [];

    for (const tipologia of Object.values(TIPOLOGIAS_PEPSI)) {
      let score = 0;

      // Score por Place Type match
      const matchingTypes = placesTypes.filter(pt =>
        tipologia.googlePlacesTypes.includes(pt)
      );
      score += matchingTypes.length * 10;

      // Score por keyword match
      if (placeName) {
        const placeNameLower = placeName.toLowerCase();
        const matchingKeywords = tipologia.keywords.filter(kw =>
          placeNameLower.includes(kw.toLowerCase())
        );
        score += matchingKeywords.length * 15;
      }

      if (score > 0) {
        scores.push({ tipologia, score });
      }
    }

    // Ordenar por score e retornar
    return scores
      .sort((a, b) => b.score - a.score)
      .map(s => s.tipologia);
  }

  /**
   * Sugere tipologia baseada APENAS em Google Places
   * (útil quando IA falha completamente)
   */
  suggestTipologiaFromPlaces(
    placesTypes: string[],
    placeName: string
  ): TipologiaDefinition | null {
    const matches = this.findBestMatchingTipologias(placesTypes, placeName);
    return matches.length > 0 ? matches[0] : null;
  }

  /**
   * Valida se nome do estabelecimento contém keywords da tipologia
   */
  validateNameKeywords(tipologiaCodigo: string, placeName: string): {
    hasMatch: boolean;
    matchedKeywords: string[];
  } {
    const tipologia = TIPOLOGIAS_PEPSI[tipologiaCodigo];
    if (!tipologia) {
      return { hasMatch: false, matchedKeywords: [] };
    }

    const placeNameLower = placeName.toLowerCase();
    const matched = tipologia.keywords.filter(kw =>
      placeNameLower.includes(kw.toLowerCase())
    );

    return {
      hasMatch: matched.length > 0,
      matchedKeywords: matched,
    };
  }
}
