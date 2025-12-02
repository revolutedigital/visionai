import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @deprecated ⚠️ ESTE SERVIÇO ESTÁ DEPRECADO - NÃO USAR
 *
 * A classificação de tipologia agora é feita DIRETAMENTE no analysis.worker.ts
 * durante a análise de fotos com Claude Vision, eliminando duplicação de API calls.
 *
 * Novo fluxo otimizado:
 * 1. Google Places → baixa fotos
 * 2. Claude Vision analisa fotos E classifica tipologia em UMA ÚNICA chamada
 * 3. Resultado salvo direto no cliente (tipologia, subTipologia, características, etc)
 *
 * Tipologias PepsiCo agora estão no prompt do claude.service.ts (linha ~307)
 *
 * --- CONTEÚDO ORIGINAL ABAIXO (APENAS REFERÊNCIA) ---
 * Sprint 4: Serviço de Classificação de Tipologia
 * Classifica clientes em tipologias/personas baseado em dados coletados
 */

interface TipologiaResult {
  tipologia: string;
  subTipologia?: string;
  confianca: number; // 0-100%
  caracteristicas: string[];
  estrategiaSugerida: string;
}

const TIPOLOGIAS_PEPSI = [
  {
    nome: 'BAR_TRADICIONAL',
    label: 'Bar Tradicional',
    descricao: 'Bares populares, botequins, ambientes simples',
  },
  {
    nome: 'RESTAURANTE_FAMILIA',
    label: 'Restaurante Familiar',
    descricao: 'Restaurantes com foco em famílias, ambiente acolhedor',
  },
  {
    nome: 'LANCHONETE_FAST_FOOD',
    label: 'Lanchonete/Fast Food',
    descricao: 'Lanchonetes, hamburguerias, fast food moderno',
  },
  {
    nome: 'BALADA_NIGHT',
    label: 'Balada/Night Club',
    descricao: 'Casas noturnas, bares modernos, público jovem noturno',
  },
  {
    nome: 'MERCADO_CONVENIENCIA',
    label: 'Mercado/Conveniência',
    descricao: 'Mercadinhos, mercearias, lojas de conveniência',
  },
  {
    nome: 'PADARIA_CAFE',
    label: 'Padaria/Café',
    descricao: 'Padarias, cafeterias, confeitarias',
  },
  {
    nome: 'HOTEL_POUSADA',
    label: 'Hotel/Pousada',
    descricao: 'Hotéis, pousadas, hospedagem',
  },
  {
    nome: 'EVENTO_BUFFET',
    label: 'Eventos/Buffet',
    descricao: 'Espaços de eventos, buffets, festas',
  },
  {
    nome: 'ACADEMIA_ESPORTE',
    label: 'Academia/Esporte',
    descricao: 'Academias, centros esportivos',
  },
  {
    nome: 'PREMIUM_GOURMET',
    label: 'Premium/Gourmet',
    descricao: 'Restaurantes premium, alta gastronomia',
  },
];

export class TipologiaService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Classifica um cliente em uma tipologia usando IA
   */
  async classificarTipologia(clienteId: string): Promise<TipologiaResult> {
    try {
      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
        include: {
          fotos: {
            where: { analisadaPorIA: true },
            take: 3,
          },
        },
      });

      if (!cliente) {
        throw new Error('Cliente não encontrado');
      }

      // Construir contexto completo do cliente
      const contexto = this.construirContexto(cliente);

      // Prompt para Claude classificar
      const prompt = `Você é um especialista em classificação de estabelecimentos para a PepsiCo.

Analise os dados abaixo e classifique este estabelecimento em UMA das tipologias disponíveis:

${TIPOLOGIAS_PEPSI.map((t, i) => `${i + 1}. ${t.label}: ${t.descricao}`).join('\n')}

**DADOS DO ESTABELECIMENTO:**
${contexto}

**INSTRUÇÕES:**
1. Escolha a tipologia que MELHOR se encaixa
2. Se necessário, sugira uma sub-tipologia mais específica
3. Indique seu nível de confiança (0-100%)
4. Liste 3-5 características principais
5. Sugira estratégia comercial (ex: "Visita semanal, foco em volume", "Parceria para eventos", etc)

Responda APENAS em JSON válido neste formato:
{
  "tipologia": "NOME_DA_TIPOLOGIA",
  "subTipologia": "Sub-categoria específica (opcional)",
  "confianca": 85,
  "caracteristicas": ["característica 1", "característica 2", ...],
  "estrategiaSugerida": "Descrição da estratégia comercial ideal"
}`;

      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Resposta inválida da IA');
      }

      // Extrair JSON da resposta
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Não foi possível extrair JSON da resposta');
      }

      const resultado: TipologiaResult = JSON.parse(jsonMatch[0]);

      console.log(`✅ Cliente "${cliente.nome}" classificado como: ${resultado.tipologia}`);
      console.log(`   Confiança: ${resultado.confianca}%`);

      return resultado;
    } catch (error: any) {
      console.error('Erro ao classificar tipologia:', error);
      throw error;
    }
  }

  /**
   * Constrói contexto rico do cliente para análise
   */
  private construirContexto(cliente: any): string {
    const partes: string[] = [];

    partes.push(`Nome: ${cliente.nome}`);
    partes.push(`Endereço: ${cliente.endereco}`);

    if (cliente.tipoEstabelecimento) {
      partes.push(`Tipo (Google): ${cliente.tipoEstabelecimento}`);
    }

    if (cliente.rating) {
      partes.push(`Rating: ${cliente.rating} ⭐ (${cliente.totalAvaliacoes || 0} avaliações)`);
    }

    if (cliente.publicoAlvo) {
      partes.push(`Público-alvo: ${cliente.publicoAlvo}`);
    }

    if (cliente.nivelProfissionalizacao) {
      partes.push(`Profissionalização: ${cliente.nivelProfissionalizacao}`);
    }

    if (cliente.ambienteEstabelecimento) {
      partes.push(`Ambiente: ${cliente.ambienteEstabelecimento}`);
    }

    if (cliente.qualidadeSinalizacao) {
      partes.push(`Sinalização: ${cliente.qualidadeSinalizacao}`);
    }

    if (cliente.presencaBranding) {
      partes.push(`Branding visível: ${cliente.presencaBranding ? 'Sim' : 'Não'}`);
    }

    if (cliente.indicadoresVisuais) {
      try {
        const indicadores = JSON.parse(cliente.indicadoresVisuais);
        partes.push(`Indicadores visuais:`);
        if (indicadores.tecnologiaAparente?.length > 0) {
          partes.push(`  - Tecnologia: ${indicadores.tecnologiaAparente.join(', ')}`);
        }
        partes.push(`  - Iluminação: ${indicadores.iluminacao}`);
        partes.push(`  - Limpeza: ${indicadores.limpeza}`);
        partes.push(`  - Organização: ${indicadores.organizacaoEspacial}`);
      } catch (e) {}
    }

    if (cliente.horarioFuncionamento) {
      try {
        const horarios = JSON.parse(cliente.horarioFuncionamento);
        const temHorarioNoturno = horarios.some((h: any) =>
          h.close && parseInt(h.close.time) >= 2200
        );
        if (temHorarioNoturno) {
          partes.push(`Horário: Funciona até tarde (noturno)`);
        }
      } catch (e) {}
    }

    if (cliente.diasAbertoPorSemana) {
      partes.push(`Dias abertos: ${cliente.diasAbertoPorSemana}/7`);
    }

    if (cliente.fotos && cliente.fotos.length > 0) {
      partes.push(`\nFotos disponíveis: ${cliente.fotos.length}`);
      cliente.fotos.forEach((foto: any, i: number) => {
        if (foto.analiseResultado) {
          try {
            const analise = JSON.parse(foto.analiseResultado);
            partes.push(`\nAnálise foto ${i + 1}:`);
            if (analise.descricao) {
              partes.push(`  ${analise.descricao.substring(0, 200)}`);
            }
          } catch (e) {}
        }
      });
    }

    return partes.join('\n');
  }

  /**
   * Recalcula tipologia para todos os clientes analisados
   */
  async recalcularTodasTipologias(): Promise<{
    total: number;
    processados: number;
    erros: number;
  }> {
    const clientes = await prisma.cliente.findMany({
      where: {
        // Apenas clientes que já foram analisados
        potencialScore: { not: null },
      },
      select: { id: true, nome: true },
      orderBy: { potencialScore: 'desc' },
    });

    let processados = 0;
    let erros = 0;

    console.log(`🔄 Iniciando classificação de tipologia para ${clientes.length} clientes...`);

    for (const cliente of clientes) {
      try {
        const resultado = await this.classificarTipologia(cliente.id);

        // Salvar no banco
        await prisma.cliente.update({
          where: { id: cliente.id },
          data: {
            tipologia: resultado.tipologia,
            subTipologia: resultado.subTipologia,
            tipologiaConfianca: resultado.confianca,
            caracteristicasCliente: JSON.stringify(resultado.caracteristicas),
            estrategiaComercial: resultado.estrategiaSugerida,
          },
        });

        processados++;

        // Delay para não sobrecarregar API
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        console.error(`Erro ao processar ${cliente.nome}:`, error.message);
        erros++;
      }
    }

    console.log(`✅ Classificação concluída: ${processados} sucesso, ${erros} erros`);

    return {
      total: clientes.length,
      processados,
      erros,
    };
  }

  /**
   * Gera relatório de distribuição por tipologia
   */
  async getDistribuicaoTipologias(): Promise<any> {
    const distribuicao = await prisma.cliente.groupBy({
      by: ['tipologia'],
      _count: true,
      where: {
        tipologia: { not: null },
      },
    });

    const total = distribuicao.reduce((sum: number, item: any) => sum + item._count, 0);

    return {
      total,
      distribuicao: distribuicao.map((item: any) => ({
        tipologia: item.tipologia,
        quantidade: item._count,
        percentual: Math.round((item._count / total) * 100),
        label: TIPOLOGIAS_PEPSI.find(t => t.nome === item.tipologia)?.label || item.tipologia,
      })).sort((a: any, b: any) => b.quantidade - a.quantidade),
    };
  }
}
