/**
 * Universal Confidence Service
 *
 * Vision AI Component: Sistema de Confiança Universal
 * Agrega todas as validações cruzadas em um score único de 0-100%
 *
 * Componentes (pesos):
 * - Geocoding Cross Validation (25%)
 * - Normalization Cross Validation (15%)
 * - Places Cross Validation (35%)
 * - Receita Federal (15%)
 * - Nome Fantasia (10%)
 *
 * Categorias de Confiança:
 * - 90-100%: EXCELENTE ✅
 * - 70-89%: BOA ⚠️
 * - 50-69%: MÉDIA ⚠️⚠️
 * - 0-49%: BAIXA ❌ (necessita revisão)
 */

import { GeocodingCrossValidation } from './geocoding-cross-validation.service';
import { NormalizationCrossValidation } from './normalization-cross-validation.service';
import { CrossValidationResult } from './cross-validation.service';

export interface UniversalConfidenceResult {
  confiancaGeral: number; // 0-100%
  categoria: 'EXCELENTE' | 'BOA' | 'MÉDIA' | 'BAIXA';
  nivel: 'success' | 'warning' | 'danger';
  componentes: {
    geocoding?: {
      confianca: number;
      peso: number;
      contribuicao: number;
    };
    normalizacao?: {
      confianca: number;
      peso: number;
      contribuicao: number;
    };
    places?: {
      confianca: number;
      peso: number;
      contribuicao: number;
    };
    receitaFederal?: {
      confianca: number;
      peso: number;
      contribuicao: number;
    };
    nomeFantasia?: {
      confianca: number;
      peso: number;
      contribuicao: number;
    };
  };
  alertas: string[];
  recomendacoes: string[];
  necessitaRevisao: boolean;
}

export interface ConfidenceInputs {
  geocodingValidation?: GeocodingCrossValidation;
  normalizationValidation?: NormalizationCrossValidation;
  placesValidation?: CrossValidationResult;
  receitaFederalEncontrado?: boolean;
  receitaFederalAtivo?: boolean;
  nomeFantasiaMatch?: number; // 0-100% similaridade
}

export class UniversalConfidenceService {
  // Pesos de cada componente (total = 100%)
  private readonly PESOS = {
    geocoding: 25,
    normalizacao: 15,
    places: 35,
    receitaFederal: 15,
    nomeFantasia: 10,
  };

  /**
   * Calcula confiança universal baseado em todos os componentes
   */
  calculateUniversalConfidence(inputs: ConfidenceInputs): UniversalConfidenceResult {
    const componentes: UniversalConfidenceResult['componentes'] = {};
    const alertas: string[] = [];
    const recomendacoes: string[] = [];

    let somaConfianca = 0;
    let somaPesos = 0;

    // 1. GEOCODING (25%)
    if (inputs.geocodingValidation) {
      const conf = inputs.geocodingValidation.confianca;
      componentes.geocoding = {
        confianca: conf,
        peso: this.PESOS.geocoding,
        contribuicao: (conf * this.PESOS.geocoding) / 100,
      };
      somaConfianca += componentes.geocoding.contribuicao;
      somaPesos += this.PESOS.geocoding;

      if (conf < 75) {
        alertas.push(`⚠️  Geocoding com baixa confiança (${conf}%)`);
        alertas.push(`   Divergência: ${inputs.geocodingValidation.detalhes.distanciaMaxima.toFixed(0)}m entre fontes`);
        recomendacoes.push('Validar coordenadas manualmente no Google Maps');
      }
    }

    // 2. NORMALIZAÇÃO (15%)
    if (inputs.normalizationValidation) {
      const conf = inputs.normalizationValidation.confianca;
      componentes.normalizacao = {
        confianca: conf,
        peso: this.PESOS.normalizacao,
        contribuicao: (conf * this.PESOS.normalizacao) / 100,
      };
      somaConfianca += componentes.normalizacao.contribuicao;
      somaPesos += this.PESOS.normalizacao;

      if (inputs.normalizationValidation.detalhes.alucinacaoDetectada) {
        alertas.push(`⚠️  Alucinação da IA detectada na normalização`);
        alertas.push(`   Similaridade IA vs Regex: ${inputs.normalizationValidation.detalhes.similaridade.toFixed(0)}%`);
        recomendacoes.push('Validar endereço normalizado manualmente');
      }
    }

    // 3. PLACES (35%)
    if (inputs.placesValidation) {
      const conf = inputs.placesValidation.confianca;
      componentes.places = {
        confianca: conf,
        peso: this.PESOS.places,
        contribuicao: (conf * this.PESOS.places) / 100,
      };
      somaConfianca += componentes.places.contribuicao;
      somaPesos += this.PESOS.places;

      if (conf < 75) {
        alertas.push(`⚠️  Places com baixa confiança (${conf}%)`);
        if (inputs.placesValidation.detalhes.divergencias.length > 0) {
          inputs.placesValidation.detalhes.divergencias.forEach((d: string) => {
            alertas.push(`   ${d}`);
          });
        }
        recomendacoes.push('Validar estabelecimento manualmente no Google Maps');
      }
    }

    // 4. RECEITA FEDERAL (15%)
    if (inputs.receitaFederalEncontrado !== undefined) {
      let conf = 0;

      if (inputs.receitaFederalEncontrado) {
        if (inputs.receitaFederalAtivo) {
          conf = 100; // ✅ Encontrado e ativo
        } else {
          conf = 50; // ⚠️ Encontrado mas inativo
          alertas.push(`⚠️  CNPJ encontrado mas situação: INATIVA`);
          recomendacoes.push('Verificar se cliente ainda opera');
        }
      } else {
        conf = 0; // ❌ Não encontrado
        alertas.push(`❌ CNPJ não encontrado na Receita Federal`);
        recomendacoes.push('Validar CNPJ manualmente');
      }

      componentes.receitaFederal = {
        confianca: conf,
        peso: this.PESOS.receitaFederal,
        contribuicao: (conf * this.PESOS.receitaFederal) / 100,
      };
      somaConfianca += componentes.receitaFederal.contribuicao;
      somaPesos += this.PESOS.receitaFederal;
    }

    // 5. NOME FANTASIA (10%)
    if (inputs.nomeFantasiaMatch !== undefined) {
      const conf = inputs.nomeFantasiaMatch;
      componentes.nomeFantasia = {
        confianca: conf,
        peso: this.PESOS.nomeFantasia,
        contribuicao: (conf * this.PESOS.nomeFantasia) / 100,
      };
      somaConfianca += componentes.nomeFantasia.contribuicao;
      somaPesos += this.PESOS.nomeFantasia;

      if (conf < 70) {
        alertas.push(`⚠️  Nome Fantasia com baixa similaridade (${conf.toFixed(0)}%)`);
        recomendacoes.push('Validar se é o estabelecimento correto');
      }
    }

    // Calcular confiança geral
    const confiancaGeral = somaPesos > 0 ? Math.round(somaConfianca) : 0;

    // Determinar categoria e nível
    let categoria: UniversalConfidenceResult['categoria'];
    let nivel: UniversalConfidenceResult['nivel'];
    let necessitaRevisao = false;

    if (confiancaGeral >= 90) {
      categoria = 'EXCELENTE';
      nivel = 'success';
    } else if (confiancaGeral >= 70) {
      categoria = 'BOA';
      nivel = 'warning';
    } else if (confiancaGeral >= 50) {
      categoria = 'MÉDIA';
      nivel = 'warning';
      necessitaRevisao = true;
      recomendacoes.push('⚠️  Recomenda-se revisão manual dos dados');
    } else {
      categoria = 'BAIXA';
      nivel = 'danger';
      necessitaRevisao = true;
      alertas.push('❌ CONFIANÇA BAIXA - Revisão manual obrigatória');
      recomendacoes.push('❌ Dados necessitam revisão manual urgente');
    }

    return {
      confiancaGeral,
      categoria,
      nivel,
      componentes,
      alertas,
      recomendacoes,
      necessitaRevisao,
    };
  }

  /**
   * Formata logs de confiança universal
   */
  logUniversalConfidence(result: UniversalConfidenceResult, clienteNome: string): void {
    console.log(`\n🎯 ===== VISION AI - CONFIANÇA UNIVERSAL =====`);
    console.log(`   Cliente: ${clienteNome}`);
    console.log(`   Confiança Geral: ${result.confiancaGeral}%`);
    console.log(`   Categoria: ${result.categoria} ${this.getCategoriaEmoji(result.categoria)}`);
    console.log(`   Necessita Revisão: ${result.necessitaRevisao ? '⚠️  SIM' : '✅ NÃO'}`);

    console.log(`\n   📊 Componentes:`);

    if (result.componentes.geocoding) {
      console.log(`      Geocoding: ${result.componentes.geocoding.confianca}% (peso ${result.componentes.geocoding.peso}%) → contribui ${result.componentes.geocoding.contribuicao.toFixed(1)}%`);
    }

    if (result.componentes.normalizacao) {
      console.log(`      Normalização: ${result.componentes.normalizacao.confianca}% (peso ${result.componentes.normalizacao.peso}%) → contribui ${result.componentes.normalizacao.contribuicao.toFixed(1)}%`);
    }

    if (result.componentes.places) {
      console.log(`      Places: ${result.componentes.places.confianca}% (peso ${result.componentes.places.peso}%) → contribui ${result.componentes.places.contribuicao.toFixed(1)}%`);
    }

    if (result.componentes.receitaFederal) {
      console.log(`      Receita Federal: ${result.componentes.receitaFederal.confianca}% (peso ${result.componentes.receitaFederal.peso}%) → contribui ${result.componentes.receitaFederal.contribuicao.toFixed(1)}%`);
    }

    if (result.componentes.nomeFantasia) {
      console.log(`      Nome Fantasia: ${result.componentes.nomeFantasia.confianca}% (peso ${result.componentes.nomeFantasia.peso}%) → contribui ${result.componentes.nomeFantasia.contribuicao.toFixed(1)}%`);
    }

    if (result.alertas.length > 0) {
      console.warn(`\n   ⚠️  Alertas:`);
      result.alertas.forEach(a => console.warn(`      ${a}`));
    }

    if (result.recomendacoes.length > 0) {
      console.log(`\n   💡 Recomendações:`);
      result.recomendacoes.forEach(r => console.log(`      ${r}`));
    }

    console.log(`==============================================\n`);
  }

  /**
   * Retorna emoji baseado na categoria
   */
  private getCategoriaEmoji(categoria: UniversalConfidenceResult['categoria']): string {
    switch (categoria) {
      case 'EXCELENTE':
        return '✅';
      case 'BOA':
        return '⚠️';
      case 'MÉDIA':
        return '⚠️⚠️';
      case 'BAIXA':
        return '❌';
    }
  }

  /**
   * Gera relatório resumido de múltiplos clientes
   */
  generateBatchReport(results: Array<{ nome: string; confianca: UniversalConfidenceResult }>): {
    total: number;
    excelentes: number;
    boas: number;
    medias: number;
    baixas: number;
    mediaGeral: number;
    necessitamRevisao: number;
  } {
    const total = results.length;
    let somaConfianca = 0;

    const categorias = {
      excelentes: 0,
      boas: 0,
      medias: 0,
      baixas: 0,
    };

    let necessitamRevisao = 0;

    results.forEach(r => {
      somaConfianca += r.confianca.confiancaGeral;

      switch (r.confianca.categoria) {
        case 'EXCELENTE':
          categorias.excelentes++;
          break;
        case 'BOA':
          categorias.boas++;
          break;
        case 'MÉDIA':
          categorias.medias++;
          break;
        case 'BAIXA':
          categorias.baixas++;
          break;
      }

      if (r.confianca.necessitaRevisao) {
        necessitamRevisao++;
      }
    });

    const mediaGeral = total > 0 ? Math.round(somaConfianca / total) : 0;

    return {
      total,
      excelentes: categorias.excelentes,
      boas: categorias.boas,
      medias: categorias.medias,
      baixas: categorias.baixas,
      mediaGeral,
      necessitamRevisao,
    };
  }

  /**
   * Formata relatório de lote
   */
  logBatchReport(report: ReturnType<typeof this.generateBatchReport>): void {
    console.log(`\n📊 ===== RELATÓRIO VISION AI - LOTE =====`);
    console.log(`   Total processados: ${report.total}`);
    console.log(`   Confiança média: ${report.mediaGeral}%`);
    console.log(`\n   Distribuição:`);
    console.log(`      ✅ Excelentes (90-100%): ${report.excelentes} (${((report.excelentes / report.total) * 100).toFixed(1)}%)`);
    console.log(`      ⚠️  Boas (70-89%): ${report.boas} (${((report.boas / report.total) * 100).toFixed(1)}%)`);
    console.log(`      ⚠️⚠️ Médias (50-69%): ${report.medias} (${((report.medias / report.total) * 100).toFixed(1)}%)`);
    console.log(`      ❌ Baixas (0-49%): ${report.baixas} (${((report.baixas / report.total) * 100).toFixed(1)}%)`);
    console.log(`\n   ⚠️  Necessitam Revisão: ${report.necessitamRevisao} (${((report.necessitamRevisao / report.total) * 100).toFixed(1)}%)`);
    console.log(`==========================================\n`);
  }
}

export const universalConfidenceService = new UniversalConfidenceService();
