/**
 * Geocoding Cross Validation Service
 *
 * Vision AI Component: Valida coordenadas de múltiplas fontes
 * - Google Geocoding API (pago, preciso)
 * - Nominatim/OpenStreetMap (grátis)
 * - Google Places (se disponível)
 *
 * Confiança:
 * - 100%: Divergência < 50m (todas concordam)
 * - 75%: Divergência 50-200m (concordância moderada)
 * - 50%: Divergência > 200m (ALERTA - coordenadas suspeitas)
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodingCrossValidation {
  coordenadasFinais: Coordinates;
  confianca: number; // 0-100%
  fonteUsada: 'google' | 'nominatim' | 'places' | 'consenso';
  detalhes: {
    googleCoords?: Coordinates;
    nominatimCoords?: Coordinates;
    placesCoords?: Coordinates;
    distanciaMaxima: number; // em metros
    divergencias: string[];
  };
}

export class GeocodingCrossValidationService {
  /**
   * Valida coordenadas de múltiplas fontes e decide qual usar
   */
  async validateCoordinates(
    googleResult: Coordinates | null,
    nominatimResult: Coordinates | null,
    placesResult?: Coordinates | null
  ): Promise<GeocodingCrossValidation> {

    const coords: Array<{ coords: Coordinates; fonte: string }> = [];

    if (googleResult) coords.push({ coords: googleResult, fonte: 'google' });
    if (nominatimResult) coords.push({ coords: nominatimResult, fonte: 'nominatim' });
    if (placesResult) coords.push({ coords: placesResult, fonte: 'places' });

    if (coords.length === 0) {
      throw new Error('[Vision AI] Nenhuma fonte retornou coordenadas');
    }

    // Se apenas 1 fonte disponível
    if (coords.length === 1) {
      const single = coords[0];
      return {
        coordenadasFinais: single.coords,
        confianca: 70, // Confiança média sem validação cruzada
        fonteUsada: single.fonte as any,
        detalhes: {
          googleCoords: googleResult || undefined,
          nominatimCoords: nominatimResult || undefined,
          placesCoords: placesResult || undefined,
          distanciaMaxima: 0,
          divergencias: [`Apenas ${single.fonte} disponível - sem validação cruzada`],
        },
      };
    }

    // Calcular distâncias entre todas as fontes
    const distances = this.calculateAllDistances(coords);
    const maxDistance = Math.max(...distances);

    const divergencias: string[] = [];

    // DECISÃO: Baseado na concordância entre fontes
    if (maxDistance < 50) {
      // ✅ ALTA CONCORDÂNCIA (< 50m)
      console.log(`✅ [Vision AI - Geocoding] Alta concordância: ${maxDistance.toFixed(0)}m`);

      const avgLat = coords.reduce((sum, c) => sum + c.coords.lat, 0) / coords.length;
      const avgLng = coords.reduce((sum, c) => sum + c.coords.lng, 0) / coords.length;

      return {
        coordenadasFinais: { lat: avgLat, lng: avgLng },
        confianca: 100,
        fonteUsada: 'consenso',
        detalhes: {
          googleCoords: googleResult || undefined,
          nominatimCoords: nominatimResult || undefined,
          placesCoords: placesResult || undefined,
          distanciaMaxima: maxDistance,
          divergencias: [],
        },
      };
    }
    else if (maxDistance < 200) {
      // ⚠️ CONCORDÂNCIA MODERADA (50-200m)
      console.warn(`⚠️  [Vision AI - Geocoding] Concordância moderada: ${maxDistance.toFixed(0)}m`);

      divergencias.push(`Divergência moderada: ${maxDistance.toFixed(0)}m entre fontes`);

      // Preferir Google (mais confiável)
      return {
        coordenadasFinais: googleResult || coords[0].coords,
        confianca: 75,
        fonteUsada: googleResult ? 'google' : (coords[0].fonte as any),
        detalhes: {
          googleCoords: googleResult || undefined,
          nominatimCoords: nominatimResult || undefined,
          placesCoords: placesResult || undefined,
          distanciaMaxima: maxDistance,
          divergencias,
        },
      };
    }
    else {
      // ❌ ALTA DIVERGÊNCIA (> 200m)
      console.error(`❌ [Vision AI - Geocoding] ALERTA: Alta divergência ${maxDistance.toFixed(0)}m`);

      divergencias.push(`⚠️  ALTA DIVERGÊNCIA: ${maxDistance.toFixed(0)}m entre fontes`);
      divergencias.push(`Google: ${googleResult ? `${googleResult.lat}, ${googleResult.lng}` : 'N/A'}`);
      divergencias.push(`Nominatim: ${nominatimResult ? `${nominatimResult.lat}, ${nominatimResult.lng}` : 'N/A'}`);
      divergencias.push(`Places: ${placesResult ? `${placesResult.lat}, ${placesResult.lng}` : 'N/A'}`);
      divergencias.push(`⚠️  Necessita revisão manual`);

      return {
        coordenadasFinais: googleResult || coords[0].coords,
        confianca: 50,
        fonteUsada: googleResult ? 'google' : (coords[0].fonte as any),
        detalhes: {
          googleCoords: googleResult || undefined,
          nominatimCoords: nominatimResult || undefined,
          placesCoords: placesResult || undefined,
          distanciaMaxima: maxDistance,
          divergencias,
        },
      };
    }
  }

  /**
   * Calcula distâncias entre todas as combinações de coordenadas
   */
  private calculateAllDistances(coords: Array<{ coords: Coordinates; fonte: string }>): number[] {
    const distances: number[] = [];

    for (let i = 0; i < coords.length; i++) {
      for (let j = i + 1; j < coords.length; j++) {
        const dist = this.haversineDistance(
          coords[i].coords.lat,
          coords[i].coords.lng,
          coords[j].coords.lat,
          coords[j].coords.lng
        );
        distances.push(dist);
      }
    }

    return distances;
  }

  /**
   * Fórmula de Haversine - Distância entre coordenadas
   */
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distância em metros
  }

  /**
   * Formata logs de validação cruzada
   */
  logCrossValidation(result: GeocodingCrossValidation): void {
    console.log(`\n🎯 ===== VISION AI - GEOCODING =====`);
    console.log(`   Confiança: ${result.confianca}%`);
    console.log(`   Fonte usada: ${result.fonteUsada.toUpperCase()}`);
    console.log(`   Divergência máxima: ${result.detalhes.distanciaMaxima.toFixed(0)}m`);

    if (result.detalhes.googleCoords) {
      console.log(`   📍 Google: ${result.detalhes.googleCoords.lat.toFixed(6)}, ${result.detalhes.googleCoords.lng.toFixed(6)}`);
    }
    if (result.detalhes.nominatimCoords) {
      console.log(`   🌍 Nominatim: ${result.detalhes.nominatimCoords.lat.toFixed(6)}, ${result.detalhes.nominatimCoords.lng.toFixed(6)}`);
    }
    if (result.detalhes.placesCoords) {
      console.log(`   📌 Places: ${result.detalhes.placesCoords.lat.toFixed(6)}, ${result.detalhes.placesCoords.lng.toFixed(6)}`);
    }

    console.log(`   ✅ Final: ${result.coordenadasFinais.lat.toFixed(6)}, ${result.coordenadasFinais.lng.toFixed(6)}`);

    if (result.detalhes.divergencias.length > 0) {
      console.warn(`   ⚠️  Divergências:`);
      result.detalhes.divergencias.forEach(d => console.warn(`      - ${d}`));
    }

    console.log(`=====================================\n`);
  }
}

export const geocodingCrossValidationService = new GeocodingCrossValidationService();
