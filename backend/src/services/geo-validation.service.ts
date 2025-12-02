/**
 * Sprint 2 - Geo Validation Service
 * Validação de coordenadas geográficas usando bounding boxes
 *
 * Detecta geocoding ruins verificando se as coordenadas estão
 * dentro da região esperada (estado/cidade)
 */

export interface BoundingBox {
  norte: number;  // latitude máxima
  sul: number;    // latitude mínima
  leste: number;  // longitude máxima
  oeste: number;  // longitude mínima
}

export interface GeoValidationResult {
  valid: boolean;
  withinState: boolean;
  withinCity: boolean;
  distanceToCenter?: number; // km do centro da cidade
  message: string;
}

export class GeoValidationService {
  /**
   * Bounding boxes dos estados brasileiros
   * Fonte: IBGE
   */
  private estadosBoundingBoxes: Record<string, BoundingBox> = {
    // Região Sul
    'RS': { norte: -27.08, sul: -33.75, leste: -49.69, oeste: -57.65 },
    'SC': { norte: -25.96, sul: -29.35, leste: -48.30, oeste: -53.84 },
    'PR': { norte: -22.51, sul: -26.72, leste: -48.02, oeste: -54.62 },

    // Região Sudeste
    'SP': { norte: -19.78, sul: -25.31, leste: -44.19, oeste: -53.11 },
    'RJ': { norte: -20.76, sul: -23.37, leste: -40.96, oeste: -44.89 },
    'MG': { norte: -14.24, sul: -22.92, leste: -39.86, oeste: -51.05 },
    'ES': { norte: -17.89, sul: -21.30, leste: -39.67, oeste: -41.88 },

    // Região Centro-Oeste
    'GO': { norte: -12.39, sul: -19.48, leste: -45.90, oeste: -53.24 },
    'MT': { norte: -7.35, sul: -18.04, leste: -50.22, oeste: -61.63 },
    'MS': { norte: -17.16, sul: -24.07, leste: -51.57, oeste: -58.16 },
    'DF': { norte: -15.50, sul: -16.05, leste: -47.31, oeste: -48.28 },

    // Região Nordeste
    'BA': { norte: -8.53, sul: -18.35, leste: -37.34, oeste: -46.61 },
    'PE': { norte: -7.30, sul: -9.48, leste: -34.80, oeste: -41.35 },
    'CE': { norte: -2.79, sul: -7.86, leste: -37.26, oeste: -41.41 },
    'MA': { norte: -1.02, sul: -10.27, leste: -41.78, oeste: -48.64 },
    'PI': { norte: -2.74, sul: -10.91, leste: -40.38, oeste: -45.98 },
    'RN': { norte: -4.83, sul: -6.98, leste: -34.96, oeste: -38.57 },
    'PB': { norte: -6.02, sul: -8.28, leste: -34.79, oeste: -38.79 },
    'SE': { norte: -9.49, sul: -11.57, leste: -36.42, oeste: -38.22 },
    'AL': { norte: -8.82, sul: -10.50, leste: -35.15, oeste: -38.24 },

    // Região Norte
    'AM': { norte: 2.24, sul: -9.82, leste: -56.08, oeste: -73.79 },
    'PA': { norte: 2.61, sul: -9.84, leste: -46.04, oeste: -58.89 },
    'RO': { norte: -7.97, sul: -13.69, leste: -59.78, oeste: -66.76 },
    'AC': { norte: -7.07, sul: -11.15, leste: -66.64, oeste: -74.00 },
    'RR': { norte: 5.27, sul: -0.04, leste: -59.08, oeste: -64.82 },
    'AP': { norte: 4.43, sul: -0.04, leste: -49.85, oeste: -54.88 },
    'TO': { norte: -5.17, sul: -13.47, leste: -45.70, oeste: -50.76 },
  };

  /**
   * Centros aproximados das principais cidades brasileiras
   * Para cálculo de distância
   */
  private cidadesCentros: Record<string, { lat: number; lng: number }> = {
    // Capitais Região Sul
    'PORTO ALEGRE': { lat: -30.0346, lng: -51.2177 },
    'FLORIANOPOLIS': { lat: -27.5954, lng: -48.5480 },
    'CURITIBA': { lat: -25.4284, lng: -49.2733 },

    // Capitais Região Sudeste
    'SAO PAULO': { lat: -23.5505, lng: -46.6333 },
    'RIO DE JANEIRO': { lat: -22.9068, lng: -43.1729 },
    'BELO HORIZONTE': { lat: -19.9167, lng: -43.9345 },
    'VITORIA': { lat: -20.3155, lng: -40.3128 },

    // Capitais Região Centro-Oeste
    'GOIANIA': { lat: -16.6869, lng: -49.2648 },
    'CUIABA': { lat: -15.6014, lng: -56.0979 },
    'CAMPO GRANDE': { lat: -20.4697, lng: -54.6201 },
    'BRASILIA': { lat: -15.7939, lng: -47.8828 },

    // Capitais Região Nordeste
    'SALVADOR': { lat: -12.9714, lng: -38.5014 },
    'RECIFE': { lat: -8.0476, lng: -34.8770 },
    'FORTALEZA': { lat: -3.7172, lng: -38.5433 },
    'SAO LUIS': { lat: -2.5307, lng: -44.3068 },
    'TERESINA': { lat: -5.0919, lng: -42.8034 },
    'NATAL': { lat: -5.7945, lng: -35.2110 },
    'JOAO PESSOA': { lat: -7.1195, lng: -34.8450 },
    'ARACAJU': { lat: -10.9472, lng: -37.0731 },
    'MACEIO': { lat: -9.6658, lng: -35.7353 },

    // Capitais Região Norte
    'MANAUS': { lat: -3.1190, lng: -60.0217 },
    'BELEM': { lat: -1.4558, lng: -48.5044 },
    'PORTO VELHO': { lat: -8.7619, lng: -63.9039 },
    'RIO BRANCO': { lat: -9.9754, lng: -67.8249 },
    'BOA VISTA': { lat: 2.8235, lng: -60.6758 },
    'MACAPA': { lat: 0.0349, lng: -51.0694 },
    'PALMAS': { lat: -10.1689, lng: -48.3317 },
  };

  /**
   * Verifica se coordenadas estão dentro de um bounding box
   */
  private isWithinBoundingBox(
    lat: number,
    lng: number,
    bbox: BoundingBox
  ): boolean {
    return (
      lat <= bbox.norte &&
      lat >= bbox.sul &&
      lng <= bbox.leste &&
      lng >= bbox.oeste
    );
  }

  /**
   * Calcula distância entre dois pontos (Haversine formula)
   * Retorna distância em km
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // 2 casas decimais
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Normaliza nome da cidade para busca
   */
  private normalizeCidadeName(cidade: string): string {
    return cidade
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^A-Z\s]/g, '') // Remove caracteres especiais
      .trim();
  }

  /**
   * Valida coordenadas geográficas
   *
   * SPRINT 2: Validação com bounding box
   * Detecta geocoding ruins comparando com limites do estado/cidade
   */
  validateCoordinates(
    latitude: number,
    longitude: number,
    estado?: string,
    cidade?: string
  ): GeoValidationResult {
    // Validação básica de coordenadas
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return {
        valid: false,
        withinState: false,
        withinCity: false,
        message: 'Coordenadas inválidas (fora dos limites globais)',
      };
    }

    let withinState = true;
    let withinCity = false;
    let distanceToCenter: number | undefined;
    let message = 'Coordenadas válidas';

    // Validar bounding box do estado
    if (estado) {
      const estadoUpper = estado.toUpperCase();
      const bbox = this.estadosBoundingBoxes[estadoUpper];

      if (bbox) {
        withinState = this.isWithinBoundingBox(latitude, longitude, bbox);

        if (!withinState) {
          message = `Coordenadas FORA do estado ${estadoUpper}! Possível erro de geocoding.`;
        }
      }
    }

    // Validar distância do centro da cidade
    if (cidade) {
      const cidadeNormalizada = this.normalizeCidadeName(cidade);
      const centro = this.cidadesCentros[cidadeNormalizada];

      if (centro) {
        distanceToCenter = this.calculateDistance(
          latitude,
          longitude,
          centro.lat,
          centro.lng
        );

        // Considerar válido se estiver dentro de 50km do centro
        // (cidades grandes podem ter raio de até 30-40km)
        withinCity = distanceToCenter <= 50;

        if (!withinCity && withinState) {
          message = `Coordenadas longe do centro de ${cidade} (${distanceToCenter}km). Verificar geocoding.`;
        } else if (withinCity) {
          message = `Coordenadas válidas: ${distanceToCenter}km do centro de ${cidade}`;
        }
      }
    }

    const valid = withinState;

    return {
      valid,
      withinState,
      withinCity,
      distanceToCenter,
      message,
    };
  }

  /**
   * Adiciona nova cidade ao dicionário (para cidades não-capitais)
   */
  addCidadeCentro(cidade: string, lat: number, lng: number): void {
    const cidadeNormalizada = this.normalizeCidadeName(cidade);
    this.cidadesCentros[cidadeNormalizada] = { lat, lng };
  }

  /**
   * Estatísticas de validação para relatório
   */
  getValidationStats(results: GeoValidationResult[]): {
    total: number;
    validos: number;
    invalidosEstado: number;
    invalidosCidade: number;
    distanciaMedia: number;
  } {
    const total = results.length;
    const validos = results.filter(r => r.valid).length;
    const invalidosEstado = results.filter(r => !r.withinState).length;
    const invalidosCidade = results.filter(r => r.withinCity === false).length;

    const distancias = results
      .map(r => r.distanceToCenter)
      .filter((d): d is number => d !== undefined);

    const distanciaMedia = distancias.length > 0
      ? Math.round((distancias.reduce((a, b) => a + b, 0) / distancias.length) * 100) / 100
      : 0;

    return {
      total,
      validos,
      invalidosEstado,
      invalidosCidade,
      distanciaMedia,
    };
  }
}

export const geoValidationService = new GeoValidationService();
