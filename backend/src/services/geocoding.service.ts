import { Client, GeocodeResult } from '@googlemaps/google-maps-services-js';

export interface GeocodingResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  enderecoFormatado?: string;
  placeId?: string;
  error?: string;
}

export class GeocodingService {
  private client: Client;
  private apiKey: string;

  constructor() {
    this.client = new Client({});
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';

    if (!this.apiKey) {
      console.warn('⚠️  GOOGLE_MAPS_API_KEY não configurada! Geocoding não funcionará.');
    }
  }

  /**
   * Geocodifica um endereço (converte endereço em coordenadas)
   * Estratégia com múltiplas tentativas para aumentar taxa de sucesso
   */
  async geocodeAddress(endereco: string, cidade?: string, estado?: string, nomeEstabelecimento?: string): Promise<GeocodingResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'API Key do Google Maps não configurada',
        };
      }

      // Estratégia 1: Endereço completo tradicional
      let enderecoCompleto = endereco;
      if (cidade) enderecoCompleto += `, ${cidade}`;
      if (estado) enderecoCompleto += `, ${estado}`;
      enderecoCompleto += ', Brasil';

      console.log(`🔍 Tentativa 1 - Endereço completo: ${enderecoCompleto}`);

      let response = await this.client.geocode({
        params: {
          address: enderecoCompleto,
          key: this.apiKey,
          language: 'pt-BR',
          region: 'br',
        },
        timeout: 10000,
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        console.log(`✅ Geocodificação bem-sucedida (Estratégia 1)`);
        return {
          success: true,
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          enderecoFormatado: result.formatted_address,
          placeId: result.place_id,
        };
      }

      // Estratégia 2: Se falhou e temos nome do estabelecimento, tentar com nome + endereço
      if (nomeEstabelecimento && response.data.status === 'ZERO_RESULTS') {
        const enderecoComNome = `${nomeEstabelecimento}, ${enderecoCompleto}`;
        console.log(`🔍 Tentativa 2 - Com nome do estabelecimento: ${enderecoComNome}`);

        response = await this.client.geocode({
          params: {
            address: enderecoComNome,
            key: this.apiKey,
            language: 'pt-BR',
            region: 'br',
          },
          timeout: 10000,
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
          const result = response.data.results[0];
          console.log(`✅ Geocodificação bem-sucedida (Estratégia 2 - com nome)`);
          return {
            success: true,
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
            enderecoFormatado: result.formatted_address,
            placeId: result.place_id,
          };
        }
      }

      // Estratégia 3: Simplificar endereço (apenas cidade + estado)
      if (response.data.status === 'ZERO_RESULTS' && (cidade || estado)) {
        const enderecoSimplificado = [cidade, estado, 'Brasil'].filter(Boolean).join(', ');
        console.log(`🔍 Tentativa 3 - Endereço simplificado: ${enderecoSimplificado}`);

        response = await this.client.geocode({
          params: {
            address: enderecoSimplificado,
            key: this.apiKey,
            language: 'pt-BR',
            region: 'br',
          },
          timeout: 10000,
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
          const result = response.data.results[0];
          console.log(`✅ Geocodificação bem-sucedida (Estratégia 3 - simplificado)`);
          return {
            success: true,
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
            enderecoFormatado: result.formatted_address,
            placeId: result.place_id,
          };
        }
      }

      // Se todas estratégias falharam
      console.warn(`❌ Todas estratégias de geocodificação falharam`);
      return {
        success: false,
        error: 'Endereço não encontrado após múltiplas tentativas',
      };
    } catch (error: any) {
      console.error('Erro ao geocodificar:', error.message);

      if (error.response?.data?.error_message) {
        return {
          success: false,
          error: error.response.data.error_message,
        };
      }

      return {
        success: false,
        error: `Erro na requisição: ${error.message}`,
      };
    }
  }

  /**
   * Reverse geocoding (converte coordenadas em endereço)
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'API Key do Google Maps não configurada',
        };
      }

      const response = await this.client.reverseGeocode({
        params: {
          latlng: { lat: latitude, lng: longitude },
          key: this.apiKey,
        },
        timeout: 10000,
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];

        return {
          success: true,
          latitude,
          longitude,
          enderecoFormatado: result.formatted_address,
          placeId: result.place_id,
        };
      } else {
        return {
          success: false,
          error: `Erro: ${response.data.status}`,
        };
      }
    } catch (error: any) {
      console.error('Erro no reverse geocoding:', error.message);
      return {
        success: false,
        error: `Erro na requisição: ${error.message}`,
      };
    }
  }

  /**
   * Valida se um endereço existe
   */
  async validateAddress(endereco: string): Promise<boolean> {
    const result = await this.geocodeAddress(endereco);
    return result.success;
  }

  /**
   * Calcula distância entre dois pontos (em km)
   * Usa fórmula de Haversine
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Arredondar para 2 casas decimais
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
