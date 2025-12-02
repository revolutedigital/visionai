/**
 * Nome Fantasia Cross Validation Service
 *
 * Vision AI Component: Valida nome do estabelecimento de múltiplas fontes
 * - Nome na planilha CSV (nome fornecido pelo cliente)
 * - Nome Fantasia da Receita Federal (oficial)
 * - Nome do Google Places (público)
 *
 * Confiança:
 * - 100%: Todos concordam (similaridade > 80%)
 * - 85%: 2 de 3 concordam
 * - 70%: Apenas 1 bate com outro
 * - 50%: Todos divergem (ALERTA - possível erro)
 */

import { fuzzyMatchingService } from './fuzzy-matching.service';

export interface NomeFantasiaCrossValidation {
  nomeFinal: string;
  confianca: number; // 0-100%
  fonteUsada: 'csv' | 'receita' | 'places' | 'consenso';
  detalhes: {
    nomeCSV?: string;
    nomeReceita?: string;
    nomePlaces?: string;
    similaridades: {
      csvReceita: number;
      csvPlaces: number;
      receitaPlaces: number;
    };
    divergencias: string[];
    alertas: string[];
  };
}

export class NomeFantasiaCrossValidationService {
  /**
   * Valida nome fantasia de múltiplas fontes
   */
  async validateNomeFantasia(
    nomeCSV: string | null,
    nomeReceita: string | null,
    nomePlaces: string | null
  ): Promise<NomeFantasiaCrossValidation> {
    const divergencias: string[] = [];
    const alertas: string[] = [];

    // Coletar fontes disponíveis
    const fontes: Array<{ nome: string; fonte: string }> = [];
    if (nomeCSV) fontes.push({ nome: nomeCSV, fonte: 'csv' });
    if (nomeReceita) fontes.push({ nome: nomeReceita, fonte: 'receita' });
    if (nomePlaces) fontes.push({ nome: nomePlaces, fonte: 'places' });

    // Se nenhuma fonte disponível
    if (fontes.length === 0) {
      return {
        nomeFinal: '',
        confianca: 0,
        fonteUsada: 'csv',
        detalhes: {
          similaridades: { csvReceita: 0, csvPlaces: 0, receitaPlaces: 0 },
          divergencias: ['Nenhum nome disponível'],
          alertas: ['❌ Nenhuma fonte de nome disponível'],
        },
      };
    }

    // Se apenas 1 fonte disponível
    if (fontes.length === 1) {
      const single = fontes[0];
      return {
        nomeFinal: single.nome,
        confianca: 60, // Baixa confiança sem validação cruzada
        fonteUsada: single.fonte as any,
        detalhes: {
          nomeCSV: nomeCSV || undefined,
          nomeReceita: nomeReceita || undefined,
          nomePlaces: nomePlaces || undefined,
          similaridades: { csvReceita: 0, csvPlaces: 0, receitaPlaces: 0 },
          divergencias: [`Apenas ${single.fonte} disponível - sem validação cruzada`],
          alertas: ['⚠️  Apenas 1 fonte de nome disponível'],
        },
      };
    }

    // Calcular similaridades entre todas as fontes
    const csvReceitaSim = nomeCSV && nomeReceita
      ? fuzzyMatchingService.matchStrings(nomeCSV, nomeReceita, 0).similarity
      : 0;

    const csvPlacesSim = nomeCSV && nomePlaces
      ? fuzzyMatchingService.matchStrings(nomeCSV, nomePlaces, 0).similarity
      : 0;

    const receitaPlacesSim = nomeReceita && nomePlaces
      ? fuzzyMatchingService.matchStrings(nomeReceita, nomePlaces, 0).similarity
      : 0;

    console.log(`\n🏷️  ===== VISION AI - NOME FANTASIA =====`);
    if (nomeCSV) console.log(`   📄 CSV: "${nomeCSV}"`);
    if (nomeReceita) console.log(`   📋 Receita: "${nomeReceita}"`);
    if (nomePlaces) console.log(`   🏢 Places: "${nomePlaces}"`);

    console.log(`\n   Similaridades:`);
    if (nomeCSV && nomeReceita) console.log(`   📄 ↔️ 📋: ${csvReceitaSim}%`);
    if (nomeCSV && nomePlaces) console.log(`   📄 ↔️ 🏢: ${csvPlacesSim}%`);
    if (nomeReceita && nomePlaces) console.log(`   📋 ↔️ 🏢: ${receitaPlacesSim}%`);

    // DECISÃO: Baseado em concordância entre fontes
    const threshold = 80; // 80% de similaridade = concordância

    // Contar quantas fontes concordam
    const concordancias: string[] = [];
    if (csvReceitaSim >= threshold) concordancias.push('csv-receita');
    if (csvPlacesSim >= threshold) concordancias.push('csv-places');
    if (receitaPlacesSim >= threshold) concordancias.push('receita-places');

    // CASO 1: Todas concordam (similaridade > 80%)
    if (concordancias.length === 3) {
      console.log(`   ✅ ALTA CONCORDÂNCIA - Todas as fontes concordam!`);

      // Preferir nome mais completo
      const nomes = [nomeCSV, nomeReceita, nomePlaces].filter(Boolean) as string[];
      const nomeFinal = nomes.reduce((longest, current) =>
        current.length > longest.length ? current : longest
      );

      return {
        nomeFinal,
        confianca: 100,
        fonteUsada: 'consenso',
        detalhes: {
          nomeCSV: nomeCSV || undefined,
          nomeReceita: nomeReceita || undefined,
          nomePlaces: nomePlaces || undefined,
          similaridades: {
            csvReceita: csvReceitaSim,
            csvPlaces: csvPlacesSim,
            receitaPlaces: receitaPlacesSim,
          },
          divergencias: [],
          alertas: [],
        },
      };
    }

    // CASO 2: 2 de 3 concordam
    if (concordancias.length >= 1) {
      console.log(`   ⚠️  CONCORDÂNCIA PARCIAL - ${concordancias.length} pares concordam`);

      let nomeFinal: string;
      let fonteUsada: 'csv' | 'receita' | 'places' = 'csv';

      // Priorizar: Receita > Places > CSV
      if (concordancias.includes('receita-places') && nomeReceita) {
        nomeFinal = nomeReceita;
        fonteUsada = 'receita';
        divergencias.push(`CSV diverge, mas Receita e Places concordam`);
      } else if (concordancias.includes('csv-receita') && nomeReceita) {
        nomeFinal = nomeReceita;
        fonteUsada = 'receita';
        divergencias.push(`Places diverge, mas CSV e Receita concordam`);
      } else if (concordancias.includes('csv-places') && nomePlaces) {
        nomeFinal = nomePlaces;
        fonteUsada = 'places';
        divergencias.push(`Receita diverge, mas CSV e Places concordam`);
      } else {
        // Fallback
        nomeFinal = nomeReceita || nomePlaces || nomeCSV || '';
        fonteUsada = nomeReceita ? 'receita' : nomePlaces ? 'places' : 'csv';
      }

      return {
        nomeFinal,
        confianca: 85,
        fonteUsada,
        detalhes: {
          nomeCSV: nomeCSV || undefined,
          nomeReceita: nomeReceita || undefined,
          nomePlaces: nomePlaces || undefined,
          similaridades: {
            csvReceita: csvReceitaSim,
            csvPlaces: csvPlacesSim,
            receitaPlaces: receitaPlacesSim,
          },
          divergencias,
          alertas: ['⚠️  Divergência parcial entre nomes'],
        },
      };
    }

    // CASO 3: Baixa concordância - Todos divergem
    console.warn(`   ❌ BAIXA CONCORDÂNCIA - Nomes muito divergentes!`);

    divergencias.push(`⚠️  ALTA DIVERGÊNCIA entre nomes:`);
    if (nomeCSV) divergencias.push(`   CSV: "${nomeCSV}"`);
    if (nomeReceita) divergencias.push(`   Receita: "${nomeReceita}"`);
    if (nomePlaces) divergencias.push(`   Places: "${nomePlaces}"`);

    alertas.push('❌ Nomes muito divergentes - Verificação manual necessária');
    alertas.push('Pode indicar: estabelecimento errado, mudança de nome, ou erro nos dados');

    // Preferir Receita Federal (fonte oficial)
    const nomeFinal = nomeReceita || nomePlaces || nomeCSV || '';
    const fonteUsada = nomeReceita ? 'receita' : nomePlaces ? 'places' : 'csv';

    return {
      nomeFinal,
      confianca: 50,
      fonteUsada: fonteUsada as any,
      detalhes: {
        nomeCSV: nomeCSV || undefined,
        nomeReceita: nomeReceita || undefined,
        nomePlaces: nomePlaces || undefined,
        similaridades: {
          csvReceita: csvReceitaSim,
          csvPlaces: csvPlacesSim,
          receitaPlaces: receitaPlacesSim,
        },
        divergencias,
        alertas,
      },
    };
  }

  /**
   * Formata logs de validação cruzada
   */
  logCrossValidation(result: NomeFantasiaCrossValidation): void {
    console.log(`\n🏷️  ===== VISION AI - NOME FANTASIA VALIDADO =====`);
    console.log(`   Nome Final: "${result.nomeFinal}"`);
    console.log(`   Confiança: ${result.confianca}%`);
    console.log(`   Fonte usada: ${result.fonteUsada.toUpperCase()}`);

    if (result.detalhes.divergencias.length > 0) {
      console.warn(`   ⚠️  Divergências:`);
      result.detalhes.divergencias.forEach(d => console.warn(`      ${d}`));
    }

    if (result.detalhes.alertas.length > 0) {
      console.warn(`   ⚠️  Alertas:`);
      result.detalhes.alertas.forEach(a => console.warn(`      ${a}`));
    }

    console.log(`================================================\n`);
  }

  /**
   * Detecta possíveis razões para divergência
   */
  detectDivergenceReasons(
    nomeCSV: string,
    nomeReceita: string,
    nomePlaces: string
  ): string[] {
    const reasons: string[] = [];

    // Detectar mudança de nome (palavras completamente diferentes)
    const csvWords = new Set(nomeCSV.toLowerCase().split(/\s+/));
    const receitaWords = new Set(nomeReceita.toLowerCase().split(/\s+/));
    const placesWords = new Set(nomePlaces.toLowerCase().split(/\s+/));

    const csvReceitaIntersection = [...csvWords].filter(w => receitaWords.has(w));
    const csvPlacesIntersection = [...csvWords].filter(w => placesWords.has(w));

    if (csvReceitaIntersection.length === 0) {
      reasons.push('Possível mudança de razão social');
    }

    if (csvPlacesIntersection.length === 0) {
      reasons.push('Possível estabelecimento diferente no Google Places');
    }

    // Detectar abreviações vs nome completo
    if (nomeCSV.length < nomeReceita.length / 2) {
      reasons.push('Nome CSV pode ser abreviação da Receita');
    }

    if (nomePlaces.length > nomeReceita.length * 1.5) {
      reasons.push('Nome Places pode incluir descrição adicional');
    }

    return reasons;
  }
}

export const nomeFantasiaCrossValidationService = new NomeFantasiaCrossValidationService();
