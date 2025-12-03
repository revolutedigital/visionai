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
   * Compara dois endereços e retorna se são similares
   * Normaliza e compara desconsiderando acentos, case, pontuação e abreviações
   */
  compararEnderecos(endereco1: string, endereco2: string): {
    similar: boolean;
    similarity: number;
    endereco1Normalizado: string;
    endereco2Normalizado: string;
  } {
    // Mapa de abreviações comuns para expansão
    const abreviacoes: { [key: string]: string } = {
      'r': 'rua',
      'av': 'avenida',
      'al': 'alameda',
      'pc': 'praca',
      'pca': 'praca',
      'tv': 'travessa',
      'rod': 'rodovia',
      'estr': 'estrada',
      'sl': 'sala',
      'cj': 'conjunto',
      'apt': 'apartamento',
      'apto': 'apartamento',
      'ap': 'apartamento',
      'lt': 'lote',
      'qd': 'quadra',
      'bl': 'bloco',
      'ed': 'edificio',
      'lj': 'loja',
      'gal': 'galeria',
      'cond': 'condominio',
      'res': 'residencial',
      'jd': 'jardim',
      'vl': 'vila',
      'pq': 'parque',
      'ctr': 'centro',
      'ste': 'setor',
      'st': 'setor',
      'n': 'numero',
      'nr': 'numero',
      'sn': 'sem numero',
      's/n': 'sem numero',
    };

    // Palavras a ignorar na comparação (muito comuns/genéricas)
    const palavrasIgnorar = new Set([
      'de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos',
      'cep', 'br', 'brasil', 'numero', 'sem',
    ]);

    // Estados brasileiros (ignorar na comparação)
    const estados = new Set([
      'ac', 'al', 'ap', 'am', 'ba', 'ce', 'df', 'es', 'go', 'ma', 'mt', 'ms',
      'mg', 'pa', 'pb', 'pr', 'pe', 'pi', 'rj', 'rn', 'rs', 'ro', 'rr', 'sc',
      'sp', 'se', 'to',
    ]);

    // Normalizar endereços
    const normalizar = (texto: string): string => {
      let normalizado = texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^\w\s]/g, ' ') // Substituir pontuação por espaço
        .replace(/\s+/g, ' ') // Normalizar espaços
        .trim();

      // Expandir abreviações
      const palavras = normalizado.split(' ');
      const palavrasExpandidas = palavras.map(p => abreviacoes[p] || p);

      return palavrasExpandidas.join(' ');
    };

    const end1 = normalizar(endereco1);
    const end2 = normalizar(endereco2);

    // Filtrar palavras significativas
    const filtrarPalavras = (texto: string): string[] => {
      return texto.split(' ')
        .filter(p => p.length > 1) // Mínimo 2 caracteres
        .filter(p => !palavrasIgnorar.has(p)) // Não está na lista de ignorar
        .filter(p => !estados.has(p)) // Não é estado
        .filter(p => !/^\d{5,}$/.test(p)); // Não é CEP (5+ dígitos)
    };

    const palavras1 = filtrarPalavras(end1);
    const palavras2 = filtrarPalavras(end2);

    // Contar palavras em comum
    const palavrasComuns = palavras1.filter(p => palavras2.includes(p));

    // Usar o MENOR conjunto como base (planilha geralmente tem menos dados)
    const baseComparacao = Math.min(palavras1.length, palavras2.length);
    const similarity = baseComparacao > 0 ? palavrasComuns.length / baseComparacao : 0;

    // Considerar similar se >= 60% das palavras do menor conjunto são comuns
    // OU se encontrou pelo menos 3 palavras em comum (endereços curtos)
    const similar = similarity >= 0.6 || palavrasComuns.length >= 3;

    return {
      similar,
      similarity: Math.round(similarity * 100),
      endereco1Normalizado: end1,
      endereco2Normalizado: end2,
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
