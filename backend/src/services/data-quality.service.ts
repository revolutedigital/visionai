import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Sprint 3: Serviço de Qualidade de Dados
 * Garante máximo aproveitamento dos dados de cada cliente
 */

interface DataQualityReport {
  score: number; // 0-100
  camposPreenchidos: number;
  camposTotais: number;
  confiabilidade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'EXCELENTE';
  camposCriticos: string[];
  fontesValidadas: string[];
  recomendacoes: string[];
}

interface CampoValidacao {
  nome: string;
  valor: any;
  peso: number; // 1-5 (5 = crítico)
  categoria: 'BASICO' | 'COMERCIAL' | 'LOCALIZACAO' | 'DIGITAL' | 'VISUAL' | 'REVIEWS';
}

export class DataQualityService {
  /**
   * Campos críticos e seus pesos para o score de qualidade
   */
  private readonly CAMPOS_VALIDACAO: CampoValidacao[] = [
    // BÁSICO (Peso Alto - essenciais para qualquer operação)
    { nome: 'nome', valor: null, peso: 5, categoria: 'BASICO' },
    { nome: 'endereco', valor: null, peso: 5, categoria: 'BASICO' },
    { nome: 'telefone', valor: null, peso: 4, categoria: 'BASICO' },
    { nome: 'cidade', valor: null, peso: 3, categoria: 'BASICO' },
    { nome: 'estado', valor: null, peso: 3, categoria: 'BASICO' },
    { nome: 'cep', valor: null, peso: 3, categoria: 'BASICO' },

    // LOCALIZAÇÃO (Peso Alto - crítico para análise geográfica)
    { nome: 'latitude', valor: null, peso: 5, categoria: 'LOCALIZACAO' },
    { nome: 'longitude', valor: null, peso: 5, categoria: 'LOCALIZACAO' },
    { nome: 'enderecoFormatado', valor: null, peso: 3, categoria: 'LOCALIZACAO' },
    { nome: 'placeId', valor: null, peso: 4, categoria: 'LOCALIZACAO' },

    // COMERCIAL (Peso Médio-Alto - importante para scoring)
    { nome: 'tipoEstabelecimento', valor: null, peso: 4, categoria: 'COMERCIAL' },
    { nome: 'rating', valor: null, peso: 4, categoria: 'COMERCIAL' },
    { nome: 'totalAvaliacoes', valor: null, peso: 4, categoria: 'COMERCIAL' },
    { nome: 'horarioFuncionamento', valor: null, peso: 3, categoria: 'COMERCIAL' },
    { nome: 'telefonePlace', valor: null, peso: 3, categoria: 'COMERCIAL' },
    { nome: 'websitePlace', valor: null, peso: 2, categoria: 'COMERCIAL' },

    // DIGITAL/VISUAL (Peso Médio - enriquece análise)
    { nome: 'qualidadeSinalizacao', valor: null, peso: 2, categoria: 'VISUAL' },
    { nome: 'presencaBranding', valor: null, peso: 2, categoria: 'VISUAL' },
    { nome: 'nivelProfissionalizacao', valor: null, peso: 2, categoria: 'VISUAL' },
    { nome: 'publicoAlvo', valor: null, peso: 3, categoria: 'VISUAL' },
    { nome: 'ambienteEstabelecimento', valor: null, peso: 2, categoria: 'VISUAL' },
    { nome: 'indicadoresVisuais', valor: null, peso: 2, categoria: 'VISUAL' },

    // REVIEWS (Peso Médio - insights valiosos)
    { nome: 'reviews', valor: null, peso: 3, categoria: 'REVIEWS' },
    { nome: 'sentimentoGeral', valor: null, peso: 2, categoria: 'REVIEWS' },
    { nome: 'problemasRecorrentes', valor: null, peso: 3, categoria: 'REVIEWS' },
    { nome: 'pontosFortes', valor: null, peso: 3, categoria: 'REVIEWS' },

    // SCORING (Peso Baixo - derivados de outros campos)
    { nome: 'scoringBreakdown', valor: null, peso: 1, categoria: 'COMERCIAL' },
    { nome: 'potencialScore', valor: null, peso: 1, categoria: 'COMERCIAL' },
  ];

  /**
   * Analisa a qualidade dos dados de um cliente
   */
  async analyzeDataQuality(clienteId: string): Promise<DataQualityReport> {
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        fotos: true,
      },
    });

    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    let camposPreenchidos = 0;
    let pesoTotal = 0;
    let pesoPreenchido = 0;
    const camposCriticos: string[] = [];
    const fontesValidadas: string[] = [];
    const recomendacoes: string[] = [];

    // Analisar cada campo
    for (const campo of this.CAMPOS_VALIDACAO) {
      const valor = (cliente as any)[campo.nome];
      const preenchido = this.isFieldFilled(valor);

      pesoTotal += campo.peso;

      if (preenchido) {
        camposPreenchidos++;
        pesoPreenchido += campo.peso;
      } else if (campo.peso >= 4) {
        // Campo crítico faltando
        camposCriticos.push(campo.nome);
      }
    }

    // Adicionar fotos ao cálculo
    if (cliente.fotos.length > 0) {
      pesoPreenchido += 5;
      camposPreenchidos++;
    } else {
      camposCriticos.push('fotos');
    }
    pesoTotal += 5;

    // Calcular score baseado em peso ponderado
    const score = Math.round((pesoPreenchido / pesoTotal) * 100);

    // Determinar fontes validadas
    if (cliente.geocodingStatus === 'SUCESSO') fontesValidadas.push('Google Geocoding');
    if (cliente.placesStatus === 'SUCESSO') fontesValidadas.push('Google Places');
    if (cliente.status === 'CONCLUIDO') fontesValidadas.push('Análise IA (Claude Vision)');
    // SPRINT 2: Validações adicionadas
    if (cliente.geoValidado) fontesValidadas.push('Validação Geográfica (Bounding Box)');
    if (cliente.placeNomeValidado) fontesValidadas.push('Validação Fuzzy - Nome');
    if (cliente.placeEnderecoValidado) fontesValidadas.push('Validação Fuzzy - Endereço');
    if (cliente.receitaStatus === 'SUCESSO') fontesValidadas.push('Receita Federal');

    // Determinar confiabilidade
    let confiabilidade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'EXCELENTE';
    if (score >= 90) confiabilidade = 'EXCELENTE';
    else if (score >= 70) confiabilidade = 'ALTA';
    else if (score >= 50) confiabilidade = 'MEDIA';
    else confiabilidade = 'BAIXA';

    // Gerar recomendações
    if (!cliente.telefone && !cliente.telefonePlace) {
      recomendacoes.push('CRÍTICO: Nenhum telefone disponível. Buscar em fontes alternativas.');
    }
    if (!cliente.rating || !cliente.totalAvaliacoes) {
      recomendacoes.push('Dados do Google Places incompletos. Re-executar busca no Places API.');
    }
    if (cliente.fotos.length === 0) {
      recomendacoes.push('CRÍTICO: Sem fotos. Análise visual impossível. Buscar fotos alternativas.');
    }
    if (!cliente.publicoAlvo || !cliente.ambienteEstabelecimento) {
      recomendacoes.push('Análise visual incompleta. Re-executar análise de IA.');
    }
    if (!cliente.reviews || cliente.reviewsAnalisadas === 0) {
      recomendacoes.push('Reviews não analisadas. Executar análise de sentiment.');
    }
    if (!cliente.websitePlace) {
      recomendacoes.push('Website não identificado. Buscar presença digital (Instagram, Facebook).');
    }
    if (!cliente.horarioFuncionamento) {
      recomendacoes.push('Horário de funcionamento ausente. Impacta scoring.');
    }

    return {
      score,
      camposPreenchidos,
      camposTotais: this.CAMPOS_VALIDACAO.length + 1, // +1 para fotos
      confiabilidade,
      camposCriticos,
      fontesValidadas,
      recomendacoes,
    };
  }

  /**
   * Atualiza o score de qualidade no banco de dados
   */
  async updateDataQualityScore(clienteId: string): Promise<void> {
    const report = await this.analyzeDataQuality(clienteId);

    await prisma.cliente.update({
      where: { id: clienteId },
      data: {
        dataQualityScore: report.score,
        camposPreenchidos: report.camposPreenchidos,
        camposCriticos: JSON.stringify(report.camposCriticos),
        confiabilidadeDados: report.confiabilidade,
        fontesValidadas: JSON.stringify(report.fontesValidadas),
        ultimaValidacao: new Date(),
      },
    });

    console.log(
      `📊 Data Quality - ${clienteId}: ${report.score}% (${report.confiabilidade}) - ${report.camposPreenchidos}/${report.camposTotais} campos`
    );
  }

  /**
   * Recalcula qualidade de dados para todos os clientes
   */
  async recalculateAllDataQuality(): Promise<{
    total: number;
    updated: number;
    mediaScore: number;
    distribuicao: Record<string, number>;
  }> {
    const clientes = await prisma.cliente.findMany({
      select: { id: true },
    });

    let updated = 0;
    let somaScores = 0;
    const distribuicao: Record<string, number> = {
      EXCELENTE: 0,
      ALTA: 0,
      MEDIA: 0,
      BAIXA: 0,
    };

    for (const cliente of clientes) {
      try {
        const report = await this.analyzeDataQuality(cliente.id);
        somaScores += report.score;
        distribuicao[report.confiabilidade]++;

        await prisma.cliente.update({
          where: { id: cliente.id },
          data: {
            dataQualityScore: report.score,
            camposPreenchidos: report.camposPreenchidos,
            camposCriticos: JSON.stringify(report.camposCriticos),
            confiabilidadeDados: report.confiabilidade,
            fontesValidadas: JSON.stringify(report.fontesValidadas),
            ultimaValidacao: new Date(),
          },
        });

        updated++;
      } catch (error) {
        console.error(`Erro ao calcular qualidade para ${cliente.id}:`, error);
      }
    }

    const mediaScore = updated > 0 ? Math.round(somaScores / updated) : 0;

    return {
      total: clientes.length,
      updated,
      mediaScore,
      distribuicao,
    };
  }

  /**
   * Lista clientes com baixa qualidade de dados (prioritários para enriquecimento)
   */
  async getClientesComBaixaQualidade(minScore: number = 70): Promise<any[]> {
    const clientes = await prisma.cliente.findMany({
      where: {
        OR: [
          { dataQualityScore: { lt: minScore } },
          { dataQualityScore: null },
        ],
      },
      orderBy: [{ dataQualityScore: 'asc' }],
      take: 50,
    });

    const result = [];

    for (const cliente of clientes) {
      const report = await this.analyzeDataQuality(cliente.id);
      result.push({
        id: cliente.id,
        nome: cliente.nome,
        endereco: cliente.endereco,
        dataQualityScore: report.score,
        confiabilidade: report.confiabilidade,
        camposCriticos: report.camposCriticos,
        recomendacoes: report.recomendacoes,
      });
    }

    return result;
  }

  /**
   * Verifica se um campo está preenchido (não null, não vazio, não "N/A")
   */
  private isFieldFilled(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') {
      const trimmed = value.trim().toLowerCase();
      if (trimmed === '' || trimmed === 'n/a' || trimmed === 'null') return false;
    }
    if (typeof value === 'number' && value === 0) return false;
    if (typeof value === 'boolean') return value; // false conta como preenchido
    return true;
  }

  /**
   * Gera relatório consolidado de qualidade de dados
   */
  async getDataQualityReport(): Promise<{
    overview: {
      totalClientes: number;
      mediaQualidade: number;
      excelente: number;
      alta: number;
      media: number;
      baixa: number;
    };
    topPrioridades: any[];
    camposMaisFaltando: { campo: string; total: number }[];
  }> {
    const clientes = await prisma.cliente.findMany({
      select: {
        id: true,
        nome: true,
        dataQualityScore: true,
        confiabilidadeDados: true,
        camposCriticos: true,
      },
    });

    const distribuicao = { EXCELENTE: 0, ALTA: 0, MEDIA: 0, BAIXA: 0 };
    let somaScores = 0;
    const camposFaltandoCount: Record<string, number> = {};

    for (const cliente of clientes) {
      if (cliente.dataQualityScore) {
        somaScores += cliente.dataQualityScore;
      }

      if (cliente.confiabilidadeDados) {
        distribuicao[cliente.confiabilidadeDados as keyof typeof distribuicao]++;
      }

      if (cliente.camposCriticos) {
        try {
          const campos = JSON.parse(cliente.camposCriticos);
          for (const campo of campos) {
            camposFaltandoCount[campo] = (camposFaltandoCount[campo] || 0) + 1;
          }
        } catch {}
      }
    }

    const mediaQualidade = clientes.length > 0 ? Math.round(somaScores / clientes.length) : 0;

    // Top campos mais faltando
    const camposMaisFaltando = Object.entries(camposFaltandoCount)
      .map(([campo, total]) => ({ campo, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Top prioridades (baixa qualidade)
    const topPrioridades = await this.getClientesComBaixaQualidade(60);

    return {
      overview: {
        totalClientes: clientes.length,
        mediaQualidade,
        excelente: distribuicao.EXCELENTE,
        alta: distribuicao.ALTA,
        media: distribuicao.MEDIA,
        baixa: distribuicao.BAIXA,
      },
      topPrioridades: topPrioridades.slice(0, 20),
      camposMaisFaltando,
    };
  }
}
