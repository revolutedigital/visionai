/**
 * Enhanced Scoring Service
 * Sprint 1: Melhorias Imediatas
 *
 * Sistema de pontuação multi-dimensional para análise de potencial de clientes
 */

export interface ScoringBreakdown {
  // Dados Básicos (40 pontos)
  scoreRating: number;           // 0-15 pontos
  scoreAvaliacoes: number;       // 0-10 pontos
  scoreFotosQualidade: number;   // 0-15 pontos (IA)

  // Operação (30 pontos)
  scoreHorarioFunc: number;      // 0-10 pontos
  scoreWebsite: number;          // 0-10 pontos
  scoreDensidadeReviews: number; // 0-10 pontos

  // Total
  scoreTotal: number;            // 0-70 pontos (max Sprint 1)
  categoria: string;             // ALTO, MÉDIO, BAIXO

  // Métricas auxiliares
  densidadeAvaliacoes?: number;  // avaliações por mês
  tempoAbertoSemanal?: number;   // horas abertas por semana
  diasAbertoPorSemana?: number;  // dias que abre na semana
}

export interface HorarioFuncionamento {
  segunda?: string;
  terca?: string;
  quarta?: string;
  quinta?: string;
  sexta?: string;
  sabado?: string;
  domingo?: string;
}

export class ScoringService {
  /**
   * Calcula score baseado em rating do Google
   * 0-15 pontos
   */
  calculateRatingScore(rating?: number): number {
    if (!rating) return 0;

    // 5.0 estrelas = 15 pontos
    // 4.5 estrelas = 13 pontos
    // 4.0 estrelas = 10 pontos
    // 3.5 estrelas = 7 pontos
    // 3.0 ou menos = 0-5 pontos

    if (rating >= 4.5) return 15;
    if (rating >= 4.0) return 13;
    if (rating >= 3.5) return 10;
    if (rating >= 3.0) return 7;

    return Math.max(0, (rating / 5) * 15);
  }

  /**
   * Calcula score baseado no total de avaliações
   * 0-10 pontos
   */
  calculateAvaliacoesScore(totalAvaliacoes?: number): number {
    if (!totalAvaliacoes) return 0;

    // 500+ avaliações = 10 pontos (excelente presença)
    // 200-499 = 8 pontos (boa presença)
    // 100-199 = 7 pontos (presença média)
    // 50-99 = 5 pontos (presença básica)
    // 20-49 = 3 pontos (presença inicial)
    // 10-19 = 2 pontos (muito baixo)
    // < 10 = 0-1 pontos

    if (totalAvaliacoes >= 500) return 10;
    if (totalAvaliacoes >= 200) return 8;
    if (totalAvaliacoes >= 100) return 7;
    if (totalAvaliacoes >= 50) return 5;
    if (totalAvaliacoes >= 20) return 3;
    if (totalAvaliacoes >= 10) return 2;

    return totalAvaliacoes >= 5 ? 1 : 0;
  }

  /**
   * Calcula densidade de avaliações (reviews por mês)
   * Requer data de criação do estabelecimento (estimada por primeira review)
   * Por enquanto, baseado apenas no total de avaliações
   */
  calculateReviewDensity(totalAvaliacoes?: number): number {
    if (!totalAvaliacoes) return 0;

    // Estimativa conservadora: assumindo que o estabelecimento existe há pelo menos 2 anos
    // Se tem muitas avaliações, provavelmente tem boa densidade

    // 200+ avaliações (assumindo 2 anos) = ~8 reviews/mês = alta densidade
    // 100-199 = ~4-8 reviews/mês = média densidade
    // 50-99 = ~2-4 reviews/mês = baixa densidade
    // < 50 = < 2 reviews/mês = muito baixa

    const estimatedMonths = 24; // 2 anos
    const density = totalAvaliacoes / estimatedMonths;

    return density;
  }

  /**
   * Calcula score baseado na densidade de avaliações
   * 0-10 pontos
   */
  calculateDensidadeScore(densidadeAvaliacoes: number): number {
    // 10+ reviews/mês = 10 pontos (excelente engajamento)
    // 5-9 reviews/mês = 8 pontos (bom engajamento)
    // 2-4 reviews/mês = 5 pontos (engajamento médio)
    // 1-2 reviews/mês = 3 pontos (engajamento baixo)
    // < 1 review/mês = 0-2 pontos

    if (densidadeAvaliacoes >= 10) return 10;
    if (densidadeAvaliacoes >= 5) return 8;
    if (densidadeAvaliacoes >= 2) return 5;
    if (densidadeAvaliacoes >= 1) return 3;

    return Math.round(densidadeAvaliacoes * 2);
  }

  /**
   * Parse horário de funcionamento do Google Places
   * Exemplo: "Monday: 8:00 AM – 10:00 PM"
   */
  parseBusinessHours(weekdayText?: string[]): HorarioFuncionamento {
    const horario: HorarioFuncionamento = {};

    if (!weekdayText || weekdayText.length === 0) return horario;

    const dayMap: { [key: string]: keyof HorarioFuncionamento } = {
      'Monday': 'segunda',
      'Tuesday': 'terca',
      'Wednesday': 'quarta',
      'Thursday': 'quinta',
      'Friday': 'sexta',
      'Saturday': 'sabado',
      'Sunday': 'domingo',
    };

    weekdayText.forEach((text) => {
      const [dayPart, ...timeParts] = text.split(':');
      const day = dayPart.trim();
      const time = timeParts.join(':').trim();

      const brazilianDay = dayMap[day];
      if (brazilianDay) {
        horario[brazilianDay] = time;
      }
    });

    return horario;
  }

  /**
   * Calcula total de horas abertas por semana
   */
  calculateWeeklyHours(weekdayText?: string[]): number {
    if (!weekdayText || weekdayText.length === 0) return 0;

    let totalHours = 0;

    weekdayText.forEach((text) => {
      // Extrair horários: "Monday: 8:00 AM – 10:00 PM"
      const timeMatch = text.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);

      if (timeMatch) {
        const [_, startHour, startMin, startPeriod, endHour, endMin, endPeriod] = timeMatch;

        // Converter para 24h
        let start = parseInt(startHour);
        let end = parseInt(endHour);

        if (startPeriod.toUpperCase() === 'PM' && start !== 12) start += 12;
        if (startPeriod.toUpperCase() === 'AM' && start === 12) start = 0;
        if (endPeriod.toUpperCase() === 'PM' && end !== 12) end += 12;
        if (endPeriod.toUpperCase() === 'AM' && end === 12) end = 0;

        // Calcular horas (considerando minutos)
        const startTotal = start + parseInt(startMin) / 60;
        const endTotal = end + parseInt(endMin) / 60;

        let dailyHours = endTotal - startTotal;
        if (dailyHours < 0) dailyHours += 24; // Caso cruze meia-noite

        totalHours += dailyHours;
      } else if (text.toLowerCase().includes('open 24 hours') || text.toLowerCase().includes('24 horas')) {
        // Aberto 24h
        totalHours += 24;
      } else if (text.toLowerCase().includes('closed')) {
        // Fechado
        totalHours += 0;
      }
    });

    return Math.round(totalHours * 10) / 10; // Arredondar para 1 casa decimal
  }

  /**
   * Conta dias que o estabelecimento abre na semana
   */
  countOpenDays(weekdayText?: string[]): number {
    if (!weekdayText || weekdayText.length === 0) return 0;

    let openDays = 0;

    weekdayText.forEach((text) => {
      if (!text.toLowerCase().includes('closed')) {
        openDays++;
      }
    });

    return openDays;
  }

  /**
   * Calcula score baseado em horário de funcionamento
   * 0-10 pontos
   */
  calculateHorarioScore(tempoAbertoSemanal: number, diasAbertos: number): number {
    // Aberto 7 dias, 70+ horas/semana = 10 pontos (disponibilidade máxima)
    // Aberto 6 dias, 60+ horas/semana = 8 pontos (excelente)
    // Aberto 5-6 dias, 40-60 horas/semana = 6 pontos (bom)
    // Aberto 5 dias, < 40 horas/semana = 3-4 pontos (comercial padrão)
    // < 5 dias = 0-2 pontos (disponibilidade limitada)

    let score = 0;

    // Pontos por dias abertos (max 5 pontos)
    if (diasAbertos >= 7) score += 5;
    else if (diasAbertos >= 6) score += 4;
    else if (diasAbertos >= 5) score += 3;
    else if (diasAbertos >= 4) score += 2;
    else score += Math.max(0, diasAbertos - 1);

    // Pontos por horas totais (max 5 pontos)
    if (tempoAbertoSemanal >= 70) score += 5;
    else if (tempoAbertoSemanal >= 60) score += 4;
    else if (tempoAbertoSemanal >= 50) score += 3;
    else if (tempoAbertoSemanal >= 40) score += 2;
    else if (tempoAbertoSemanal >= 30) score += 1;

    return Math.min(10, score);
  }

  /**
   * Calcula score baseado em presença de website
   * 0-10 pontos
   */
  calculateWebsiteScore(website?: string): number {
    if (!website) return 0;

    // Tem website próprio = 10 pontos
    // Indica profissionalização e presença digital
    return 10;
  }

  /**
   * Calcula score de qualidade de fotos baseado em análise de IA
   * 0-15 pontos
   * Por enquanto, baseado apenas na quantidade de fotos disponíveis
   * Será aprimorado quando a análise de IA estiver completa
   */
  calculateFotosScore(totalFotos: number, fotosAnalisadas?: number, analiseIA?: any): number {
    // Ter fotos = indicador de presença visual
    // 5+ fotos = 5 pontos base
    // Fotos analisadas pela IA com score alto = +10 pontos

    let score = 0;

    // Pontos por ter fotos (0-5 pontos)
    if (totalFotos >= 5) score += 5;
    else if (totalFotos >= 3) score += 3;
    else if (totalFotos >= 1) score += 1;

    // Pontos por qualidade identificada pela IA (0-10 pontos)
    // Será implementado quando houver dados de análise de IA consolidados
    if (fotosAnalisadas && fotosAnalisadas > 0 && analiseIA) {
      // Por enquanto, dar 8 pontos se tem fotos analisadas
      // TODO: Refinar baseado em indicadoresPotencial.score da análise de IA
      score += 8;
    }

    return Math.min(15, score);
  }

  /**
   * Calcula categoria baseado no score total
   */
  calculateCategoria(scoreTotal: number): string {
    // Sprint 1 max: 70 pontos
    // ALTO: 50+ pontos (>70%)
    // MÉDIO: 30-49 pontos (40-70%)
    // BAIXO: < 30 pontos (<40%)

    if (scoreTotal >= 50) return 'ALTO';
    if (scoreTotal >= 30) return 'MÉDIO';
    return 'BAIXO';
  }

  /**
   * Calcula scoring completo para um cliente
   */
  calculateEnhancedScoring(clienteData: {
    rating?: number;
    totalAvaliacoes?: number;
    horarioFuncionamento?: string; // JSON string
    website?: string;
    totalFotos: number;
    fotosAnalisadas?: number;
    analiseIA?: any;
  }): ScoringBreakdown {
    // Parse horário se disponível
    let weekdayText: string[] | undefined;
    if (clienteData.horarioFuncionamento) {
      try {
        const parsed = JSON.parse(clienteData.horarioFuncionamento);
        weekdayText = Array.isArray(parsed) ? parsed : undefined;
      } catch {
        weekdayText = undefined;
      }
    }

    // Calcular métricas
    const densidadeAvaliacoes = this.calculateReviewDensity(clienteData.totalAvaliacoes);
    const tempoAbertoSemanal = this.calculateWeeklyHours(weekdayText);
    const diasAbertoPorSemana = this.countOpenDays(weekdayText);

    // Calcular scores individuais
    const scoreRating = this.calculateRatingScore(clienteData.rating);
    const scoreAvaliacoes = this.calculateAvaliacoesScore(clienteData.totalAvaliacoes);
    const scoreDensidadeReviews = this.calculateDensidadeScore(densidadeAvaliacoes);
    const scoreHorarioFunc = this.calculateHorarioScore(tempoAbertoSemanal, diasAbertoPorSemana);
    const scoreWebsite = this.calculateWebsiteScore(clienteData.website);
    const scoreFotosQualidade = this.calculateFotosScore(
      clienteData.totalFotos,
      clienteData.fotosAnalisadas,
      clienteData.analiseIA
    );

    // Score total
    const scoreTotal =
      scoreRating +
      scoreAvaliacoes +
      scoreDensidadeReviews +
      scoreHorarioFunc +
      scoreWebsite +
      scoreFotosQualidade;

    // Categoria
    const categoria = this.calculateCategoria(scoreTotal);

    return {
      scoreRating,
      scoreAvaliacoes,
      scoreFotosQualidade,
      scoreHorarioFunc,
      scoreWebsite,
      scoreDensidadeReviews,
      scoreTotal,
      categoria,
      densidadeAvaliacoes,
      tempoAbertoSemanal,
      diasAbertoPorSemana,
    };
  }
}
