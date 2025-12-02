/**
 * Sprint 1 - Alerting Service
 * Sistema de alertas para anomalias e problemas críticos no pipeline
 *
 * Tipos de alertas:
 * - Validação de dados (divergências, baixa similaridade)
 * - Performance (tempos de execução excessivos)
 * - Qualidade de dados (campos críticos faltando)
 * - API issues (rate limits, timeouts)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum AlertaSeveridade {
  INFO = 'INFO', // Informacional apenas
  WARNING = 'WARNING', // Atenção necessária
  ERROR = 'ERROR', // Erro que precisa ação
  CRITICAL = 'CRITICAL', // Crítico - ação imediata
}

export enum AlertaCategoria {
  VALIDACAO_DADOS = 'VALIDACAO_DADOS',
  PERFORMANCE = 'PERFORMANCE',
  QUALIDADE_DADOS = 'QUALIDADE_DADOS',
  API_ISSUE = 'API_ISSUE',
  GEOCODING = 'GEOCODING',
  PLACES = 'PLACES',
  RECEITA = 'RECEITA',
  ANALYSIS = 'ANALYSIS',
}

export interface Alerta {
  severidade: AlertaSeveridade;
  categoria: AlertaCategoria;
  titulo: string;
  mensagem: string;
  clienteId?: string;
  loteId?: string;
  metadata?: Record<string, any>;
}

export class AlertingService {
  /**
   * Registrar alerta no sistema
   */
  async registrarAlerta(alerta: Alerta): Promise<void> {
    try {
      // Log no console com emoji baseado na severidade
      const emoji = this.getSeveridadeEmoji(alerta.severidade);
      console.log(`${emoji} [${alerta.severidade}] ${alerta.titulo}`);
      console.log(`   ${alerta.mensagem}`);
      if (alerta.metadata) {
        console.log(`   Metadata:`, alerta.metadata);
      }

      // TODO: Em produção, pode-se:
      // - Enviar email para equipe
      // - Integrar com Slack/Discord
      // - Salvar em tabela de alertas
      // - Disparar webhooks
      // - Integrar com serviços de monitoramento (DataDog, New Relic, etc)
    } catch (error) {
      console.error('Erro ao registrar alerta:', error);
    }
  }

  /**
   * Emoji para cada severidade
   */
  private getSeveridadeEmoji(severidade: AlertaSeveridade): string {
    switch (severidade) {
      case AlertaSeveridade.INFO:
        return 'ℹ️ ';
      case AlertaSeveridade.WARNING:
        return '⚠️ ';
      case AlertaSeveridade.ERROR:
        return '❌';
      case AlertaSeveridade.CRITICAL:
        return '🚨';
    }
  }

  /**
   * Alertas específicos para validação de Places
   */
  async alertarPlaceNaoConfere(
    clienteId: string,
    clienteNome: string,
    placeNome: string,
    similaridade: number
  ): Promise<void> {
    await this.registrarAlerta({
      severidade: AlertaSeveridade.WARNING,
      categoria: AlertaCategoria.VALIDACAO_DADOS,
      titulo: 'Nome do Place não confere com cliente',
      mensagem: `Cliente "${clienteNome}" encontrou Place "${placeNome}" com apenas ${similaridade}% de similaridade`,
      clienteId,
      metadata: {
        clienteNome,
        placeNome,
        similaridade,
      },
    });
  }

  async alertarEnderecoNaoConfere(
    clienteId: string,
    enderecoCliente: string,
    enderecoPlace: string,
    similaridade: number
  ): Promise<void> {
    await this.registrarAlerta({
      severidade: AlertaSeveridade.WARNING,
      categoria: AlertaCategoria.VALIDACAO_DADOS,
      titulo: 'Endereço do Place não confere',
      mensagem: `Endereço encontrado tem apenas ${similaridade}% de similaridade`,
      clienteId,
      metadata: {
        enderecoCliente,
        enderecoPlace,
        similaridade,
      },
    });
  }

  /**
   * Alertas de API
   */
  async alertarRateLimit(api: string, clienteId?: string): Promise<void> {
    await this.registrarAlerta({
      severidade: AlertaSeveridade.ERROR,
      categoria: AlertaCategoria.API_ISSUE,
      titulo: `Rate limit atingido: ${api}`,
      mensagem: `A API ${api} retornou erro 429. Aguardar antes de novas requisições.`,
      clienteId,
      metadata: { api },
    });
  }

  async alertarAPITimeout(api: string, tempo: number, clienteId?: string): Promise<void> {
    await this.registrarAlerta({
      severidade: AlertaSeveridade.WARNING,
      categoria: AlertaCategoria.API_ISSUE,
      titulo: `Timeout na API ${api}`,
      mensagem: `Requisição levou ${tempo}ms e expirou`,
      clienteId,
      metadata: { api, tempoMs: tempo },
    });
  }

  /**
   * Alertas de Performance
   */
  async alertarPerformanceLenta(
    etapa: string,
    tempo: number,
    limiteMs: number,
    clienteId?: string
  ): Promise<void> {
    if (tempo > limiteMs) {
      await this.registrarAlerta({
        severidade: AlertaSeveridade.WARNING,
        categoria: AlertaCategoria.PERFORMANCE,
        titulo: `Performance lenta em ${etapa}`,
        mensagem: `Processamento levou ${tempo}ms (limite: ${limiteMs}ms)`,
        clienteId,
        metadata: {
          etapa,
          tempoMs: tempo,
          limiteMs,
          excesso: tempo - limiteMs,
        },
      });
    }
  }

  /**
   * Alertas de Qualidade de Dados
   */
  async alertarDadosCriticosFaltando(
    clienteId: string,
    clienteNome: string,
    camposFaltando: string[]
  ): Promise<void> {
    await this.registrarAlerta({
      severidade: AlertaSeveridade.ERROR,
      categoria: AlertaCategoria.QUALIDADE_DADOS,
      titulo: 'Dados críticos faltando',
      mensagem: `Cliente "${clienteNome}" está sem ${camposFaltando.length} campos críticos`,
      clienteId,
      metadata: {
        clienteNome,
        camposFaltando,
      },
    });
  }

  async alertarBaixaQualidadeDados(
    clienteId: string,
    clienteNome: string,
    scoreQualidade: number
  ): Promise<void> {
    if (scoreQualidade < 50) {
      await this.registrarAlerta({
        severidade: AlertaSeveridade.WARNING,
        categoria: AlertaCategoria.QUALIDADE_DADOS,
        titulo: 'Baixa qualidade de dados',
        mensagem: `Cliente "${clienteNome}" tem score de qualidade de ${scoreQualidade}%`,
        clienteId,
        metadata: {
          clienteNome,
          scoreQualidade,
        },
      });
    }
  }

  /**
   * Alertas específicos de Geocoding
   */
  async alertarGeocodingFalhou(
    clienteId: string,
    clienteNome: string,
    endereco: string,
    erro: string
  ): Promise<void> {
    await this.registrarAlerta({
      severidade: AlertaSeveridade.ERROR,
      categoria: AlertaCategoria.GEOCODING,
      titulo: 'Falha ao geocodificar endereço',
      mensagem: `Não foi possível encontrar coordenadas para "${endereco}"`,
      clienteId,
      metadata: {
        clienteNome,
        endereco,
        erro,
      },
    });
  }

  /**
   * Alertas de divergência da Receita Federal
   */
  async alertarDivergenciaReceita(
    clienteId: string,
    clienteNome: string,
    similaridade: number,
    enderecoCliente: string,
    enderecoReceita: string
  ): Promise<void> {
    if (similaridade < 50) {
      await this.registrarAlerta({
        severidade: AlertaSeveridade.WARNING,
        categoria: AlertaCategoria.RECEITA,
        titulo: 'Divergência de endereço com Receita Federal',
        mensagem: `Endereço da planilha difere da Receita (${similaridade}% similar)`,
        clienteId,
        metadata: {
          clienteNome,
          similaridade,
          enderecoCliente,
          enderecoReceita,
        },
      });
    }
  }

  /**
   * Alertas de Places não encontrado
   */
  async alertarPlaceNaoEncontrado(
    clienteId: string,
    clienteNome: string,
    coordenadas: { lat: number; lng: number }
  ): Promise<void> {
    await this.registrarAlerta({
      severidade: AlertaSeveridade.WARNING,
      categoria: AlertaCategoria.PLACES,
      titulo: 'Google Place não encontrado',
      mensagem: `Não foi possível encontrar estabelecimento no Google Places para "${clienteNome}"`,
      clienteId,
      metadata: {
        clienteNome,
        coordenadas,
      },
    });
  }

  /**
   * Alerta de baixo rating/avaliações
   */
  async alertarBaixoPotencial(
    clienteId: string,
    clienteNome: string,
    rating: number | null,
    totalAvaliacoes: number | null
  ): Promise<void> {
    if ((rating && rating < 3) || (totalAvaliacoes && totalAvaliacoes < 5)) {
      await this.registrarAlerta({
        severidade: AlertaSeveridade.INFO,
        categoria: AlertaCategoria.PLACES,
        titulo: 'Cliente com baixo potencial digital',
        mensagem: `"${clienteNome}" tem baixo rating (${rating || 'N/A'}) ou poucas avaliações (${totalAvaliacoes || 0})`,
        clienteId,
        metadata: {
          clienteNome,
          rating,
          totalAvaliacoes,
        },
      });
    }
  }

  /**
   * Estatísticas de alertas (para dashboard futuro)
   */
  async getEstatisticasAlertas(
    loteId?: string
  ): Promise<{
    totalAlertas: number;
    porSeveridade: Record<string, number>;
    porCategoria: Record<string, number>;
  }> {
    // TODO: Implementar quando tivermos tabela de alertas
    return {
      totalAlertas: 0,
      porSeveridade: {},
      porCategoria: {},
    };
  }
}

export const alertingService = new AlertingService();
