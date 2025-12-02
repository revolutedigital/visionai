import { PlaceSearchResult } from './places.service';
import { fuzzyMatchingService } from './fuzzy-matching.service';

export interface CrossValidationResult {
  usarResultado: 'nearby' | 'text' | 'ambos_iguais';
  confianca: number; // 0-100%
  motivoEscolha: string;
  detalhes: {
    nearbyPlaceId: string;
    textPlaceId: string;
    placeIdMatch: boolean;
    nomeSimilaridade: number;
    enderecoSimilaridade: number;
    divergencias: string[];
  };
}

/**
 * Serviço de Validação Cruzada
 * Compara resultados de Nearby Search vs Text Search para máxima confiabilidade
 */
export class CrossValidationService {
  /**
   * Compara dois Places (Nearby vs Text) e decide qual usar
   */
  validateCrossResults(
    nearbyPlace: PlaceSearchResult | null,
    textPlace: PlaceSearchResult | null
  ): CrossValidationResult | null {
    // Caso 1: Ambos falharam
    if (!nearbyPlace && !textPlace) {
      return null;
    }

    // Caso 2: Apenas Nearby funcionou
    if (nearbyPlace && !textPlace) {
      return {
        usarResultado: 'nearby',
        confianca: 75, // Média - sem validação cruzada
        motivoEscolha: 'Apenas Nearby Search retornou resultado',
        detalhes: {
          nearbyPlaceId: nearbyPlace.placeId,
          textPlaceId: 'N/A',
          placeIdMatch: false,
          nomeSimilaridade: 0,
          enderecoSimilaridade: 0,
          divergencias: ['Text Search não retornou resultado'],
        },
      };
    }

    // Caso 3: Apenas Text funcionou
    if (!nearbyPlace && textPlace) {
      return {
        usarResultado: 'text',
        confianca: 70, // Baixa - Text é menos preciso
        motivoEscolha: 'Apenas Text Search retornou resultado',
        detalhes: {
          nearbyPlaceId: 'N/A',
          textPlaceId: textPlace.placeId,
          placeIdMatch: false,
          nomeSimilaridade: 0,
          enderecoSimilaridade: 0,
          divergencias: ['Nearby Search não retornou resultado'],
        },
      };
    }

    // Caso 4: AMBOS retornaram - VALIDAÇÃO CRUZADA! 🎯
    if (nearbyPlace && textPlace) {
      return this.compareResults(nearbyPlace, textPlace);
    }

    return null;
  }

  /**
   * Compara em detalhe os dois resultados
   */
  private compareResults(
    nearby: PlaceSearchResult,
    text: PlaceSearchResult
  ): CrossValidationResult {
    const divergencias: string[] = [];

    // 1. Comparar Place IDs (mais confiável)
    const placeIdMatch = nearby.placeId === text.placeId;

    if (placeIdMatch) {
      // ✅ PERFEITO - Mesmo estabelecimento!
      console.log(`✅ VALIDAÇÃO CRUZADA: Ambos métodos retornaram o MESMO Place (${nearby.placeId})`);

      return {
        usarResultado: 'ambos_iguais',
        confianca: 100, // MÁXIMA - ambos concordam
        motivoEscolha: 'Nearby e Text retornaram o mesmo Place ID - máxima confiança',
        detalhes: {
          nearbyPlaceId: nearby.placeId,
          textPlaceId: text.placeId,
          placeIdMatch: true,
          nomeSimilaridade: 100,
          enderecoSimilaridade: 100,
          divergencias: [],
        },
      };
    }

    // 2. Place IDs diferentes - Analisar similaridade
    console.warn(`⚠️  DIVERGÊNCIA: Nearby e Text retornaram Places DIFERENTES`);
    console.warn(`   Nearby: ${nearby.nome} (${nearby.placeId})`);
    console.warn(`   Text:   ${text.nome} (${text.placeId})`);

    divergencias.push(`Place IDs diferentes: ${nearby.placeId} vs ${text.placeId}`);

    // 3. Comparar nomes
    const nomeMatch = fuzzyMatchingService.matchStrings(nearby.nome, text.nome, 70);
    const nomeSimilaridade = nomeMatch.similarity;

    if (nomeSimilaridade < 70) {
      divergencias.push(`Nomes muito diferentes: "${nearby.nome}" vs "${text.nome}" (${nomeSimilaridade}%)`);
    }

    // 4. Comparar endereços
    const enderecoMatch = fuzzyMatchingService.matchStrings(nearby.endereco, text.endereco, 60);
    const enderecoSimilaridade = enderecoMatch.similarity;

    if (enderecoSimilaridade < 60) {
      divergencias.push(`Endereços muito diferentes: "${nearby.endereco}" vs "${text.endereco}" (${enderecoSimilaridade}%)`);
    }

    // 5. Decidir qual usar baseado em similaridade
    let usarResultado: 'nearby' | 'text';
    let confianca: number;
    let motivoEscolha: string;

    // Se nome E endereço batem bem (mesmo com place_id diferente)
    if (nomeSimilaridade >= 85 && enderecoSimilaridade >= 75) {
      // Provavelmente são o mesmo lugar (Google pode ter IDs duplicados)
      usarResultado = 'nearby'; // Preferir Nearby (mais preciso por coordenadas)
      confianca = 90;
      motivoEscolha = `Places diferentes mas alta similaridade (nome: ${nomeSimilaridade}%, endereço: ${enderecoSimilaridade}%) - usando Nearby (mais preciso)`;
    }
    // Se apenas nome bate
    else if (nomeSimilaridade >= 80) {
      usarResultado = 'nearby';
      confianca = 75;
      motivoEscolha = `Nome similar (${nomeSimilaridade}%) mas endereços diferentes - usando Nearby (coordenadas mais confiáveis)`;
    }
    // Se apenas endereço bate
    else if (enderecoSimilaridade >= 70) {
      usarResultado = 'text';
      confianca = 70;
      motivoEscolha = `Endereço similar (${enderecoSimilaridade}%) mas nomes diferentes - usando Text (pode ser nome fantasia vs razão social)`;
    }
    // Nenhum bate bem - escolher o mais confiável
    else {
      // Calcular score combinado
      const nearbyScore = (nomeSimilaridade + enderecoSimilaridade) / 2;
      const textScore = (nomeSimilaridade + enderecoSimilaridade) / 2;

      // Preferir Nearby (mais preciso) em caso de empate
      if (nearbyScore >= textScore) {
        usarResultado = 'nearby';
        confianca = 60;
        motivoEscolha = `Divergência significativa - preferindo Nearby (mais preciso por coordenadas) - score: ${nearbyScore.toFixed(1)}%`;
      } else {
        usarResultado = 'text';
        confianca = 55;
        motivoEscolha = `Divergência significativa - preferindo Text - score: ${textScore.toFixed(1)}%`;
      }

      divergencias.push('⚠️  ALERTA: Alta divergência entre resultados - necessita revisão manual');
    }

    return {
      usarResultado,
      confianca,
      motivoEscolha,
      detalhes: {
        nearbyPlaceId: nearby.placeId,
        textPlaceId: text.placeId,
        placeIdMatch: false,
        nomeSimilaridade,
        enderecoSimilaridade,
        divergencias,
      },
    };
  }

  /**
   * Formata logs de validação cruzada
   */
  logCrossValidation(result: CrossValidationResult): void {
    console.log(`\n🔍 ===== VALIDAÇÃO CRUZADA =====`);
    console.log(`   Confiança: ${result.confianca}%`);
    console.log(`   Usar resultado: ${result.usarResultado.toUpperCase()}`);
    console.log(`   Motivo: ${result.motivoEscolha}`);

    if (result.detalhes.placeIdMatch) {
      console.log(`   ✅ Place IDs IDÊNTICOS - Máxima confiança!`);
    } else {
      console.log(`   📍 Nearby Place ID: ${result.detalhes.nearbyPlaceId}`);
      console.log(`   🔍 Text Place ID: ${result.detalhes.textPlaceId}`);
      console.log(`   📊 Nome: ${result.detalhes.nomeSimilaridade}%`);
      console.log(`   📊 Endereço: ${result.detalhes.enderecoSimilaridade}%`);

      if (result.detalhes.divergencias.length > 0) {
        console.warn(`   ⚠️  Divergências:`);
        result.detalhes.divergencias.forEach((div) => {
          console.warn(`      - ${div}`);
        });
      }
    }

    console.log(`================================\n`);
  }
}

export const crossValidationService = new CrossValidationService();
