import axios from 'axios';
import { cacheService, CachePrefixes } from './cache.service';

export interface ReceitaResult {
  success: boolean;
  data?: {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia?: string;
    endereco: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    enderecoCompleto: string;
    situacao: string;
    dataAbertura: string;
    naturezaJuridica: string;
    atividadePrincipal?: string;
  };
  error?: string;
}

export class ReceitaService {
  private baseUrl = 'https://www.receitaws.com.br/v1/cnpj';

  /**
   * Busca dados da empresa na Receita Federal via CNPJ
   * API pública ReceitaWS - limite de ~3 requisições por minuto
   *
   * Sprint 1: Implementado cache Redis com TTL de 30 dias
   * ROI: 80% redução de chamadas API (dados CNPJ são estáveis)
   */
  async consultarCNPJ(cnpj: string): Promise<ReceitaResult> {
    try {
      // Limpar CNPJ (remover pontos, barras, traços)
      const cnpjLimpo = cnpj.replace(/[^\d]/g, '');

      if (cnpjLimpo.length !== 14) {
        return {
          success: false,
          error: 'CNPJ inválido - deve conter 14 dígitos',
        };
      }

      // SPRINT 1: Tentar buscar no cache primeiro
      const cached = await cacheService.get<ReceitaResult>(
        CachePrefixes.RECEITA_CNPJ,
        cnpjLimpo
      );

      if (cached) {
        console.log(`🎯 Cache HIT - CNPJ ${cnpjLimpo} (evitou chamada à API)`);
        return cached;
      }

      console.log(`🔍 Cache MISS - Consultando CNPJ na Receita Federal: ${cnpjLimpo}`);

      const response = await axios.get(`${this.baseUrl}/${cnpjLimpo}`, {
        timeout: 30000, // 30 segundos - API pode ser lenta
        headers: {
          'User-Agent': 'ScampePepsiCo-Vision-AI/1.0',
        },
      });

      const data = response.data;

      // Verificar se houve erro na resposta
      if (data.status === 'ERROR') {
        return {
          success: false,
          error: data.message || 'Erro ao consultar CNPJ',
        };
      }

      // Montar endereço completo
      const enderecoCompleto = [
        data.logradouro,
        data.numero,
        data.complemento,
        data.bairro,
        `${data.municipio}/${data.uf}`,
        `CEP: ${data.cep}`,
      ]
        .filter(Boolean)
        .join(', ');

      console.log(`✅ CNPJ encontrado: ${data.nome}`);

      const result: ReceitaResult = {
        success: true,
        data: {
          cnpj: data.cnpj,
          razaoSocial: data.nome,
          nomeFantasia: data.fantasia || data.nome,
          endereco: data.logradouro || '',
          numero: data.numero || 'S/N',
          complemento: data.complemento || '',
          bairro: data.bairro || '',
          cidade: data.municipio || '',
          estado: data.uf || '',
          cep: data.cep || '',
          enderecoCompleto,
          situacao: data.situacao || 'DESCONHECIDA',
          dataAbertura: data.abertura || '',
          naturezaJuridica: data.natureza_juridica || '',
          atividadePrincipal: data.atividade_principal?.[0]?.text || '',
        },
      };

      // SPRINT 1: Salvar no cache (TTL 30 dias - dados CNPJ são estáveis)
      await cacheService.set(
        CachePrefixes.RECEITA_CNPJ,
        cnpjLimpo,
        result,
        60 * 60 * 24 * 30 // 30 dias
      );

      return result;
    } catch (error: any) {
      console.error('Erro ao consultar Receita Federal:', error.message);

      // Detectar erro de rate limit
      if (error.response?.status === 429) {
        return {
          success: false,
          error: 'Limite de requisições atingido - aguarde 1 minuto',
        };
      }

      // Detectar CNPJ não encontrado
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'CNPJ não encontrado na base da Receita Federal',
        };
      }

      return {
        success: false,
        error: `Erro na consulta: ${error.message}`,
      };
    }
  }

  /**
   * ENTERPRISE ADDRESS MATCHING ENGINE v2.0
   *
   * Compara dois endereços brasileiros usando múltiplas técnicas:
   * 1. Normalização com expansão de abreviações
   * 2. Extração de componentes estruturados (logradouro, número, complemento, cidade)
   * 3. Análise de similaridade por Levenshtein Distance
   * 4. Matching de números críticos (número do imóvel)
   * 5. Scoring ponderado por importância dos componentes
   *
   * @returns similarity 0-100 e análise detalhada
   */
  compararEnderecos(endereco1: string, endereco2: string): {
    similar: boolean;
    similarity: number;
    endereco1Normalizado: string;
    endereco2Normalizado: string;
    analise?: {
      logradouroMatch: boolean;
      numeroMatch: boolean;
      cidadeMatch: boolean;
      motivoDivergencia?: string;
    };
  } {
    // ========================================
    // CONFIGURAÇÕES E DICIONÁRIOS
    // ========================================

    // Mapa completo de abreviações brasileiras
    const abreviacoes: { [key: string]: string } = {
      // Tipos de logradouro
      'r': 'rua', 'rua': 'rua',
      'av': 'avenida', 'avda': 'avenida', 'avenida': 'avenida',
      'al': 'alameda', 'alameda': 'alameda',
      'pc': 'praca', 'pca': 'praca', 'praca': 'praca', 'pç': 'praca',
      'tv': 'travessa', 'trav': 'travessa', 'travessa': 'travessa',
      'rod': 'rodovia', 'rodovia': 'rodovia',
      'estr': 'estrada', 'est': 'estrada', 'estrada': 'estrada',
      'lg': 'largo', 'largo': 'largo',
      'bc': 'beco', 'beco': 'beco',
      'vd': 'viaduto', 'viaduto': 'viaduto',
      'pte': 'ponte', 'ponte': 'ponte',
      'via': 'via',
      'trecho': 'trecho', 'trch': 'trecho',
      'linha': 'linha', 'ln': 'linha',

      // Complementos
      'sl': 'sala', 'sala': 'sala',
      'cj': 'conjunto', 'conj': 'conjunto', 'conjunto': 'conjunto',
      'apt': 'apartamento', 'apto': 'apartamento', 'ap': 'apartamento', 'apartamento': 'apartamento',
      'lt': 'lote', 'lote': 'lote',
      'qd': 'quadra', 'quadra': 'quadra',
      'bl': 'bloco', 'bloco': 'bloco',
      'ed': 'edificio', 'edf': 'edificio', 'edificio': 'edificio', 'predio': 'edificio',
      'lj': 'loja', 'loja': 'loja',
      'gal': 'galeria', 'galeria': 'galeria',
      'cond': 'condominio', 'condominio': 'condominio',
      'res': 'residencial', 'residencial': 'residencial',
      'com': 'comercial', 'comercial': 'comercial',
      'gp': 'grupo', 'grupo': 'grupo',
      'andar': 'andar', 'and': 'andar',
      'piso': 'piso',
      'box': 'box',
      'dep': 'deposito', 'deposito': 'deposito',
      'gj': 'garagem', 'gar': 'garagem', 'garagem': 'garagem',
      'cobertura': 'cobertura', 'cob': 'cobertura',
      'fundos': 'fundos', 'fds': 'fundos',
      'frente': 'frente', 'frt': 'frente',
      'sobreloja': 'sobreloja', 'slj': 'sobreloja',
      'mezanino': 'mezanino', 'mez': 'mezanino',
      'terreo': 'terreo', 'terr': 'terreo', 'ter': 'terreo',

      // Bairros comuns
      'jd': 'jardim', 'jardim': 'jardim', 'jrdm': 'jardim',
      'vl': 'vila', 'vila': 'vila',
      'pq': 'parque', 'parque': 'parque',
      'ctr': 'centro', 'centro': 'centro', 'ctro': 'centro',
      'ste': 'setor', 'st': 'setor', 'setor': 'setor',
      'cid': 'cidade', 'cidade': 'cidade',
      'nuc': 'nucleo', 'nucleo': 'nucleo',
      'lot': 'loteamento', 'loteamento': 'loteamento',
      'chac': 'chacara', 'chacara': 'chacara', 'ch': 'chacara',
      'sit': 'sitio', 'sitio': 'sitio',
      'faz': 'fazenda', 'fazenda': 'fazenda',

      // Numeração
      'n': 'numero', 'nr': 'numero', 'num': 'numero', 'no': 'numero', 'nro': 'numero',
      'sn': 'semnumero', 's/n': 'semnumero', 's n': 'semnumero', 'sem numero': 'semnumero',

      // Outros
      'km': 'km', 'br': 'br',
    };

    // Palavras a ignorar completamente (não afetam matching)
    const stopWords = new Set([
      'de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos',
      'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'para', 'por', 'com',
      'cep', 'br', 'brasil', 'numero', 'sem', 'the', 'and', 'or',
    ]);

    // Estados brasileiros (ignorar na comparação de logradouro)
    const estados = new Set([
      'ac', 'al', 'ap', 'am', 'ba', 'ce', 'df', 'es', 'go', 'ma', 'mt', 'ms',
      'mg', 'pa', 'pb', 'pr', 'pe', 'pi', 'rj', 'rn', 'rs', 'ro', 'rr', 'sc',
      'sp', 'se', 'to',
      'acre', 'alagoas', 'amapa', 'amazonas', 'bahia', 'ceara', 'distrito federal',
      'espirito santo', 'goias', 'maranhao', 'mato grosso', 'mato grosso do sul',
      'minas gerais', 'para', 'paraiba', 'parana', 'pernambuco', 'piaui',
      'rio de janeiro', 'rio grande do norte', 'rio grande do sul', 'rondonia',
      'roraima', 'santa catarina', 'sao paulo', 'sergipe', 'tocantins',
    ]);

    // ========================================
    // FUNÇÕES AUXILIARES
    // ========================================

    // Normalização básica de texto
    const normalizar = (texto: string): string => {
      return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^\w\s]/g, ' ')        // Remove pontuação
        .replace(/\s+/g, ' ')            // Normaliza espaços
        .trim();
    };

    // Expande abreviações em um texto
    const expandirAbreviacoes = (texto: string): string => {
      const palavras = texto.split(' ');
      return palavras.map(p => abreviacoes[p] || p).join(' ');
    };

    // Extrai números do endereço (crítico para matching)
    const extrairNumeros = (texto: string): string[] => {
      const matches = texto.match(/\b\d+\b/g) || [];
      // Filtra CEPs (8 dígitos) e números muito longos
      return matches.filter(n => n.length <= 5 && n.length >= 1);
    };

    // Extrai cidade do endereço (geralmente após última vírgula ou barra)
    const extrairCidade = (texto: string): string | null => {
      // Tenta encontrar padrão "CIDADE/UF" ou "CIDADE - UF"
      const cidadeUfMatch = texto.match(/([a-z\s]+)\s*[\/\-]\s*[a-z]{2}(?:\s|$|,)/i);
      if (cidadeUfMatch) {
        return normalizar(cidadeUfMatch[1]).trim();
      }

      // Tenta última parte após vírgula (excluindo CEP)
      const partes = texto.split(/[,;]/);
      for (let i = partes.length - 1; i >= 0; i--) {
        const parte = normalizar(partes[i]).trim();
        // Ignora se for CEP, estado isolado, ou muito curto
        if (parte.length > 3 && !parte.match(/^\d+$/) && !estados.has(parte)) {
          // Remove estado se presente
          const semEstado = parte.replace(/\s+(ac|al|ap|am|ba|ce|df|es|go|ma|mt|ms|mg|pa|pb|pr|pe|pi|rj|rn|rs|ro|rr|sc|sp|se|to)$/i, '').trim();
          if (semEstado.length > 2) {
            return semEstado;
          }
        }
      }
      return null;
    };

    // Extrai logradouro (nome da rua/avenida)
    const extrairLogradouro = (texto: string): string => {
      let normalizado = normalizar(texto);
      normalizado = expandirAbreviacoes(normalizado);

      // Remove números, CEP, estado, cidade conhecida
      const palavras = normalizado.split(' ')
        .filter(p => p.length > 1)
        .filter(p => !stopWords.has(p))
        .filter(p => !estados.has(p))
        .filter(p => !/^\d+$/.test(p));     // Remove números puros

      return palavras.join(' ');
    };

    // Calcula distância de Levenshtein (edit distance)
    const levenshtein = (a: string, b: string): number => {
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;

      const matrix: number[][] = [];

      for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
      }

      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1, // substituição
              matrix[i][j - 1] + 1,     // inserção
              matrix[i - 1][j] + 1      // deleção
            );
          }
        }
      }

      return matrix[b.length][a.length];
    };

    // Calcula similaridade por Levenshtein (0-100)
    const similaridadeLevenshtein = (a: string, b: string): number => {
      if (!a && !b) return 100;
      if (!a || !b) return 0;

      const maxLen = Math.max(a.length, b.length);
      if (maxLen === 0) return 100;

      const dist = levenshtein(a, b);
      return Math.round((1 - dist / maxLen) * 100);
    };

    // Verifica se arrays de números têm match crítico
    const numerosMatch = (nums1: string[], nums2: string[]): { match: boolean; score: number } => {
      if (nums1.length === 0 && nums2.length === 0) {
        return { match: true, score: 100 };
      }
      if (nums1.length === 0 || nums2.length === 0) {
        return { match: true, score: 50 }; // Um não tem número, não é divergência
      }

      // Verifica se o primeiro número (geralmente o principal) bate
      const primeiroMatch = nums1[0] === nums2[0];

      // Verifica se algum número bate
      const algumMatch = nums1.some(n => nums2.includes(n));

      if (primeiroMatch) {
        return { match: true, score: 100 };
      } else if (algumMatch) {
        return { match: true, score: 80 };
      } else {
        return { match: false, score: 0 };
      }
    };

    // ========================================
    // PROCESSAMENTO PRINCIPAL
    // ========================================

    // Normaliza os endereços
    const end1Norm = normalizar(endereco1);
    const end2Norm = normalizar(endereco2);

    const end1Expandido = expandirAbreviacoes(end1Norm);
    const end2Expandido = expandirAbreviacoes(end2Norm);

    // Extrai componentes
    const numeros1 = extrairNumeros(end1Norm);
    const numeros2 = extrairNumeros(end2Norm);

    const cidade1 = extrairCidade(endereco1);
    const cidade2 = extrairCidade(endereco2);

    const logradouro1 = extrairLogradouro(endereco1);
    const logradouro2 = extrairLogradouro(endereco2);

    // ========================================
    // SCORING PONDERADO
    // ========================================

    // 1. Score de números (peso 35%) - CRÍTICO
    const numeroAnalise = numerosMatch(numeros1, numeros2);
    const scoreNumero = numeroAnalise.score;

    // 2. Score de logradouro (peso 40%)
    const scoreLogradouro = similaridadeLevenshtein(logradouro1, logradouro2);

    // 3. Score de cidade (peso 25%)
    let scoreCidade = 100; // Default: assume mesma cidade se não extraiu
    if (cidade1 && cidade2) {
      scoreCidade = similaridadeLevenshtein(cidade1, cidade2);
    } else if (cidade1 || cidade2) {
      scoreCidade = 70; // Um tem cidade, outro não - penalidade leve
    }

    // Cálculo ponderado
    const scoreTotal = Math.round(
      (scoreNumero * 0.35) +
      (scoreLogradouro * 0.40) +
      (scoreCidade * 0.25)
    );

    // ========================================
    // DECISÃO FINAL E ANÁLISE
    // ========================================

    // Regras de decisão:
    // - Se número principal diverge → DIVERGENTE (regra crítica)
    // - Se score >= 70 → SIMILAR
    // - Se logradouro >= 80 E cidade >= 70 → SIMILAR (mesmo sem número perfeito)

    let similar = false;
    let motivoDivergencia: string | undefined;

    // Regra crítica: número divergente é sempre divergência
    if (!numeroAnalise.match && numeros1.length > 0 && numeros2.length > 0) {
      similar = false;
      motivoDivergencia = `Número divergente: ${numeros1[0]} vs ${numeros2[0]}`;
    }
    // Score alto = similar
    else if (scoreTotal >= 70) {
      similar = true;
    }
    // Logradouro muito similar com cidade ok = similar
    else if (scoreLogradouro >= 80 && scoreCidade >= 70) {
      similar = true;
    }
    // Cidade muito diferente = divergente
    else if (scoreCidade < 50 && cidade1 && cidade2) {
      similar = false;
      motivoDivergencia = `Cidade divergente: ${cidade1} vs ${cidade2}`;
    }
    // Logradouro muito diferente = divergente
    else if (scoreLogradouro < 50) {
      similar = false;
      motivoDivergencia = `Logradouro divergente (${scoreLogradouro}% similar)`;
    }
    // Caso default: usa score total
    else {
      similar = scoreTotal >= 60;
      if (!similar) {
        motivoDivergencia = `Similaridade baixa: ${scoreTotal}%`;
      }
    }

    return {
      similar,
      similarity: scoreTotal,
      endereco1Normalizado: end1Expandido,
      endereco2Normalizado: end2Expandido,
      analise: {
        logradouroMatch: scoreLogradouro >= 70,
        numeroMatch: numeroAnalise.match,
        cidadeMatch: scoreCidade >= 70,
        motivoDivergencia,
      },
    };
  }

  /**
   * Valida CNPJ (algoritmo oficial)
   */
  validarCNPJ(cnpj: string): boolean {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');

    if (cnpjLimpo.length !== 14) return false;

    // Validar dígitos verificadores
    const calcularDigito = (cnpjParcial: string, pesos: number[]): number => {
      const soma = cnpjParcial
        .split('')
        .reduce((acc, digit, index) => acc + parseInt(digit) * pesos[index], 0);
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };

    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const digito1 = calcularDigito(cnpjLimpo.substring(0, 12), pesos1);
    const digito2 = calcularDigito(cnpjLimpo.substring(0, 13), pesos2);

    return (
      parseInt(cnpjLimpo[12]) === digito1 &&
      parseInt(cnpjLimpo[13]) === digito2
    );
  }
}
