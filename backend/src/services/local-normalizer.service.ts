/**
 * Local Normalizer Service
 *
 * Vision AI Component: Normalização de endereços usando regex (GRÁTIS!)
 * - Expande abreviações
 * - Capitaliza corretamente
 * - Remove pontuações desnecessárias
 *
 * ROI: $0 de custo vs Claude IA
 * Uso: Validação cruzada contra IA para detectar alucinações
 */

export interface NormalizationResult {
  normalizado: string;
  alteracoes: string[];
  confianca: number; // 0-100% baseado em quantas alterações foram feitas
}

export class LocalNormalizerService {
  /**
   * Dicionário de abreviações comuns em endereços brasileiros
   */
  private abbreviations: Record<string, string> = {
    // Logradouros
    'R.': 'Rua',
    'R': 'Rua',
    'AV.': 'Avenida',
    'AV': 'Avenida',
    'AL.': 'Alameda',
    'AL': 'Alameda',
    'TVS.': 'Travessa',
    'TVS': 'Travessa',
    'TRV.': 'Travessa',
    'TRV': 'Travessa',
    'PRC.': 'Praça',
    'PRC': 'Praça',
    'PC.': 'Praça',
    'PC': 'Praça',
    'ROD.': 'Rodovia',
    'ROD': 'Rodovia',
    'EST.': 'Estrada',
    'EST': 'Estrada',
    'VL.': 'Vila',
    'VL': 'Vila',
    'JD.': 'Jardim',
    'JD': 'Jardim',
    'PQ.': 'Parque',
    'PQ': 'Parque',
    'LG.': 'Largo',
    'LG': 'Largo',
    'BCO.': 'Beco',
    'BCO': 'Beco',
    'VIA': 'Via',

    // Números e complementos
    'N°': 'Número',
    'Nº': 'Número',
    'N.': 'Número',
    'NUM': 'Número',
    'S/N': 'Sem Número',
    'S/Nº': 'Sem Número',

    // Complementos
    'APTO': 'Apartamento',
    'APT': 'Apartamento',
    'AP': 'Apartamento',
    'BL': 'Bloco',
    'BLOCO': 'Bloco',
    'SL': 'Sala',
    'SALA': 'Sala',
    'CJ': 'Conjunto',
    'CONJ': 'Conjunto',
    'QD': 'Quadra',
    'QUADRA': 'Quadra',
    'LT': 'Lote',
    'LOTE': 'Lote',
    'ANDAR': 'Andar',
    'AND': 'Andar',
    'KM': 'Quilômetro',
  };

  /**
   * Normaliza endereço localmente (sem IA)
   */
  normalize(endereco: string): NormalizationResult {
    let normalized = endereco;
    const alteracoes: string[] = [];

    // 1. Remover múltiplos espaços
    normalized = normalized.replace(/\s+/g, ' ').trim();

    // 2. Expandir abreviações
    Object.entries(this.abbreviations).forEach(([abbr, full]) => {
      // Regex para encontrar abreviação como palavra completa
      const regex = new RegExp(`\\b${this.escapeRegex(abbr)}\\b`, 'gi');

      if (regex.test(normalized)) {
        const antes = normalized;
        normalized = normalized.replace(regex, full);

        if (antes !== normalized) {
          alteracoes.push(`${abbr} → ${full}`);
        }
      }
    });

    // 3. Remover pontuações desnecessárias
    normalized = normalized.replace(/\.{2,}/g, '.'); // .. → .
    normalized = normalized.replace(/,\s*,/g, ','); // ,, → ,
    normalized = normalized.replace(/\s*,\s*/g, ', '); // Normalizar vírgulas

    // 4. Capitalizar corretamente (Title Case)
    normalized = this.toTitleCase(normalized);

    // 5. Normalizar espaços novamente
    normalized = normalized.replace(/\s+/g, ' ').trim();

    // 6. Calcular confiança baseado em alterações
    const confianca = this.calculateConfidence(endereco, normalized, alteracoes);

    return {
      normalizado: normalized,
      alteracoes,
      confianca,
    };
  }

  /**
   * Capitaliza primeira letra de cada palavra (Title Case)
   * Exceções: de, da, do, dos, das, e, em, etc.
   */
  private toTitleCase(text: string): string {
    const exceptions = ['de', 'da', 'do', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas'];

    return text
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        // Primeira palavra sempre capitalizada
        if (index === 0) {
          return this.capitalize(word);
        }

        // Exceções mantém minúscula
        if (exceptions.includes(word.toLowerCase())) {
          return word.toLowerCase();
        }

        return this.capitalize(word);
      })
      .join(' ');
  }

  /**
   * Capitaliza primeira letra
   */
  private capitalize(word: string): string {
    if (!word) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  /**
   * Escapa caracteres especiais para regex
   */
  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Calcula confiança baseado em:
   * - Quantidade de alterações
   * - Tamanho do endereço
   * - Complexidade das mudanças
   */
  private calculateConfidence(
    original: string,
    normalized: string,
    alteracoes: string[]
  ): number {
    // Se nenhuma alteração, confiança alta
    if (alteracoes.length === 0) {
      return 100;
    }

    // Se muitas alterações, confiança baixa
    if (alteracoes.length > 10) {
      return 60;
    }

    // Proporção de alterações vs tamanho do endereço
    const palavras = original.split(' ').length;
    const proporcao = alteracoes.length / palavras;

    if (proporcao < 0.2) {
      return 95; // Poucas alterações
    } else if (proporcao < 0.5) {
      return 85; // Alterações moderadas
    } else {
      return 70; // Muitas alterações
    }
  }

  /**
   * Valida se normalização parece correta
   */
  validateNormalization(result: NormalizationResult): {
    valid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];

    // Verificar se ainda tem abreviações
    const hasAbbreviations = /\b[A-Z]{1,3}\./g.test(result.normalizado);
    if (hasAbbreviations) {
      warnings.push('Ainda contém abreviações não expandidas');
    }

    // Verificar se tem múltiplos espaços
    if (/\s{2,}/.test(result.normalizado)) {
      warnings.push('Contém múltiplos espaços');
    }

    // Verificar se tem pontuação duplicada
    if (/[.,]{2,}/.test(result.normalizado)) {
      warnings.push('Contém pontuação duplicada');
    }

    return {
      valid: warnings.length === 0,
      warnings,
    };
  }
}

export const localNormalizerService = new LocalNormalizerService();
