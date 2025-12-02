import { Client, PlaceDetailsRequest, PlaceDetailsResponse } from '@googlemaps/google-maps-services-js';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface PlaceSearchResult {
  placeId: string;
  nome: string;
  endereco: string;
  tipo: string[];
  rating?: number;
  totalAvaliacoes?: number;
  fotos?: string[];
  horarioFuncionamento?: string[];
  telefone?: string;
  website?: string;
}

export interface PlacesResult {
  success: boolean;
  place?: PlaceSearchResult;
  error?: string;
}

export interface PhotoDownloadResult {
  success: boolean;
  photoPath?: string;
  error?: string;
}

export class PlacesService {
  private client: Client;
  private apiKey: string;
  private photoDir: string;

  constructor() {
    this.client = new Client({});
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    this.photoDir = process.env.PHOTOS_DIR || path.join(__dirname, '../../uploads/fotos');

    if (!this.apiKey) {
      console.warn('⚠️  GOOGLE_MAPS_API_KEY não configurada! Places API não funcionará.');
    }

    // Criar diretório de fotos se não existir
    this.ensurePhotoDir();
  }

  private async ensurePhotoDir() {
    try {
      await fs.mkdir(this.photoDir, { recursive: true });
      console.log(`📁 Diretório de fotos: ${this.photoDir}`);
    } catch (error: any) {
      console.error('Erro ao criar diretório de fotos:', error.message);
    }
  }

  /**
   * Busca informações de um place usando Place ID
   */
  async getPlaceDetails(placeId: string): Promise<PlacesResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'API Key do Google Maps não configurada',
        };
      }

      console.log(`🔍 Buscando detalhes do Place ID: ${placeId}`);

      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          key: this.apiKey,
          fields: [
            'place_id',
            'name',
            'formatted_address',
            'types',
            'rating',
            'user_ratings_total',
            'photos',
            'opening_hours',
            'formatted_phone_number',
            'website',
          ],
        },
        timeout: 10000,
      });

      if (response.data.status === 'OK' && response.data.result) {
        const place = response.data.result;

        // Extrair URLs das fotos (limitado a 10 fotos para melhor análise)
        const fotos: string[] = [];
        if (place.photos && place.photos.length > 0) {
          const maxFotos = Math.min(10, place.photos.length);
          for (let i = 0; i < maxFotos; i++) {
            const photoReference = place.photos[i].photo_reference;
            if (photoReference) {
              fotos.push(photoReference);
            }
          }
        }

        return {
          success: true,
          place: {
            placeId: place.place_id || placeId,
            nome: place.name || 'Nome não disponível',
            endereco: place.formatted_address || '',
            tipo: place.types || [],
            rating: place.rating,
            totalAvaliacoes: place.user_ratings_total,
            fotos,
            horarioFuncionamento: place.opening_hours?.weekday_text,
            telefone: place.formatted_phone_number,
            website: place.website,
          },
        };
      } else if (response.data.status === 'NOT_FOUND') {
        return {
          success: false,
          error: 'Place ID não encontrado',
        };
      } else {
        return {
          success: false,
          error: `Erro do Google Places: ${response.data.status}`,
        };
      }
    } catch (error: any) {
      console.error('Erro ao buscar detalhes do place:', error.message);

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
   * Busca nearby places usando coordenadas
   * Útil quando não temos Place ID mas temos coordenadas
   * Estratégia com múltiplos raios para aumentar taxa de sucesso
   */
  async searchNearbyPlaces(
    latitude: number,
    longitude: number,
    nome?: string
  ): Promise<PlacesResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'API Key do Google Maps não configurada',
        };
      }

      console.log(`🔍 Buscando places próximos a: ${latitude}, ${longitude}`);

      // Tentar com raios progressivamente maiores mas conservadores
      // Foco em encontrar o estabelecimento ESPECÍFICO daquele endereço
      // CALIBRADO: Raios ainda mais conservadores após Sprint 3
      const raios = [30, 50, 100]; // metros - muito conservador para evitar matches errados

      for (const raio of raios) {
        console.log(`🔍 Tentando busca com raio de ${raio}m`);

        const response = await this.client.placesNearby({
          params: {
            location: { lat: latitude, lng: longitude },
            radius: raio,
            key: this.apiKey,
            keyword: nome, // Usar nome como filtro importante
          },
          timeout: 10000,
        });

        const status = response.data.status as string;

        if (status === 'OK' && response.data.results.length > 0) {
          // Se temos o nome, filtrar por similaridade
          if (nome) {
            const nomeNormalizado = nome.toLowerCase().trim();
            // Procurar resultado que melhor corresponde ao nome
            const melhorMatch = response.data.results.find(place =>
              place.name?.toLowerCase().includes(nomeNormalizado) ||
              nomeNormalizado.includes(place.name?.toLowerCase() || '')
            );

            if (melhorMatch && melhorMatch.place_id) {
              console.log(`✅ Place encontrado com raio de ${raio}m (match por nome: ${melhorMatch.name})`);
              return await this.getPlaceDetails(melhorMatch.place_id);
            }
          }

          // Se não achou por nome ou não tem nome, pegar o mais próximo
          const place = response.data.results[0];
          if (place.place_id) {
            console.log(`✅ Place encontrado com raio de ${raio}m (mais próximo: ${place.name})`);
            return await this.getPlaceDetails(place.place_id);
          }
        }

        // Se não encontrou, tentar próximo raio
        if (status === 'ZERO_RESULTS') {
          console.log(`⚠️  Nada encontrado com raio de ${raio}m, tentando raio maior...`);
          continue;
        }

        // Se deu erro diferente, retornar
        if (status !== 'OK') {
          return {
            success: false,
            error: `Erro do Google Places: ${status}`,
          };
        }
      }

      // Se tentou todos os raios e não encontrou
      console.warn(`❌ Nenhum place encontrado mesmo com raio de ${raios[raios.length - 1]}m`);
      return {
        success: false,
        error: 'Nenhum place encontrado nas proximidades (testado até 150m)',
      };
    } catch (error: any) {
      console.error('Erro ao buscar places próximos:', error.message);

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
   * Text Search - Busca por texto completo (FALLBACK quando não tem coordenadas)
   * Menos preciso que Nearby Search, mas funciona sem coordenadas
   */
  async textSearch(query: string): Promise<PlacesResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'API Key do Google Maps não configurada',
        };
      }

      console.log(`🔍 [FALLBACK] Buscando via Text Search: "${query}"`);

      const response = await this.client.textSearch({
        params: {
          query: query,
          key: this.apiKey,
        },
        timeout: 10000,
      });

      const status = response.data.status as string;

      if (status === 'OK' && response.data.results.length > 0) {
        const place = response.data.results[0]; // Pegar primeiro resultado

        if (place.place_id) {
          console.log(`✅ Place encontrado via Text Search: ${place.name}`);
          console.warn(`⚠️  Text Search é menos preciso - validação rigorosa será aplicada`);
          return await this.getPlaceDetails(place.place_id);
        }
      }

      console.warn(`❌ Nenhum place encontrado via Text Search`);
      return {
        success: false,
        error: 'Nenhum place encontrado via Text Search',
      };
    } catch (error: any) {
      console.error('Erro ao buscar via Text Search:', error.message);

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
   * Download de foto do Google Places usando photo_reference
   */
  async downloadPhoto(
    photoReference: string,
    clienteId: string,
    index: number
  ): Promise<PhotoDownloadResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'API Key do Google Maps não configurada',
        };
      }

      // URL da Place Photo API
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${this.apiKey}`;

      console.log(`📸 Baixando foto ${index + 1} do cliente ${clienteId}`);

      // Fazer download da foto
      const response = await axios.get(photoUrl, {
        responseType: 'arraybuffer',
        timeout: 60000, // 60 segundos
      });

      // Gerar nome do arquivo
      const fileName = `${clienteId}_${index}.jpg`;
      const filePath = path.join(this.photoDir, fileName);

      // Salvar arquivo
      await fs.writeFile(filePath, response.data);

      console.log(`✅ Foto salva: ${fileName}`);

      return {
        success: true,
        photoPath: fileName, // Retornar apenas o nome do arquivo
      };
    } catch (error: any) {
      console.error(`Erro ao baixar foto ${index + 1}:`, error.message);

      return {
        success: false,
        error: `Erro no download: ${error.message}`,
      };
    }
  }

  /**
   * Download de todas as fotos de um place
   *
   * SPRINT 1: Limitado às primeiras 10 fotos para reduzir custos
   * Google Places retorna fotos ordenadas por relevância/tamanho
   */
  async downloadAllPhotos(
    photoReferences: string[],
    clienteId: string,
    maxPhotos: number = 10 // SPRINT 1: Limitar a 10 fotos
  ): Promise<string[]> {
    const downloadedPhotos: string[] = [];

    // SPRINT 1: Limitar quantidade de fotos
    const photosToDownload = photoReferences.slice(0, maxPhotos);

    if (photoReferences.length > maxPhotos) {
      console.log(
        `📸 Limitando download de ${photoReferences.length} → ${maxPhotos} fotos (otimização custos)`
      );
    }

    for (let i = 0; i < photosToDownload.length; i++) {
      const result = await this.downloadPhoto(photosToDownload[i], clienteId, i);

      if (result.success && result.photoPath) {
        downloadedPhotos.push(result.photoPath);
      } else {
        console.warn(`⚠️  Falha ao baixar foto ${i + 1}: ${result.error}`);
      }

      // Delay de 200ms entre downloads para não sobrecarregar API
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return downloadedPhotos;
  }

  /**
   * Busca completa: tenta usar Place ID, senão usa coordenadas
   */
  async searchPlace(
    placeId?: string,
    latitude?: number,
    longitude?: number,
    nome?: string
  ): Promise<PlacesResult> {
    // Se tiver Place ID, usar diretamente
    if (placeId) {
      return await this.getPlaceDetails(placeId);
    }

    // Senão, buscar por coordenadas
    if (latitude && longitude) {
      return await this.searchNearbyPlaces(latitude, longitude, nome);
    }

    return {
      success: false,
      error: 'Place ID ou coordenadas são necessários para busca',
    };
  }

  /**
   * Classifica tipo de estabelecimento baseado nos types do Google
   */
  classifyBusinessType(types: string[]): string {
    const typeMap: { [key: string]: string } = {
      // Alimentação
      restaurant: 'Restaurante',
      cafe: 'Cafeteria',
      bar: 'Bar',
      bakery: 'Padaria',
      food: 'Alimentação',
      meal_takeaway: 'Alimentação',
      meal_delivery: 'Alimentação',

      // Varejo
      store: 'Loja',
      clothing_store: 'Loja de Roupas',
      shoe_store: 'Loja de Calçados',
      jewelry_store: 'Joalheria',
      electronics_store: 'Loja de Eletrônicos',
      furniture_store: 'Loja de Móveis',
      home_goods_store: 'Loja de Utilidades',
      supermarket: 'Supermercado',
      convenience_store: 'Conveniência',

      // Serviços
      hair_care: 'Salão de Beleza',
      beauty_salon: 'Salão de Beleza',
      spa: 'Spa',
      gym: 'Academia',
      laundry: 'Lavanderia',
      car_wash: 'Lava Rápido',
      car_repair: 'Oficina Mecânica',

      // Saúde
      hospital: 'Hospital',
      doctor: 'Clínica Médica',
      dentist: 'Clínica Odontológica',
      pharmacy: 'Farmácia',
      veterinary_care: 'Veterinária',

      // Outros
      school: 'Escola',
      church: 'Igreja',
      gas_station: 'Posto de Combustível',
      bank: 'Banco',
      atm: 'Banco',
      lodging: 'Hotel/Pousada',
    };

    // Procurar primeiro match
    for (const type of types) {
      if (typeMap[type]) {
        return typeMap[type];
      }
    }

    // Se não encontrar, retornar o primeiro tipo ou "Outro"
    return types[0] ? types[0].replace(/_/g, ' ') : 'Outro';
  }

  /**
   * Calcula potencial baseado em rating e número de avaliações
   */
  calculatePotential(rating?: number, totalAvaliacoes?: number): {
    score: number;
    categoria: string;
  } {
    let score = 0;

    // Rating (peso 40%)
    if (rating) {
      score += (rating / 5) * 40;
    }

    // Total de avaliações (peso 60%)
    if (totalAvaliacoes) {
      // Escala logarítmica: 1-10 avaliações = baixo, 10-100 = médio, 100+ = alto
      if (totalAvaliacoes < 10) {
        score += 10;
      } else if (totalAvaliacoes < 100) {
        score += 30;
      } else {
        score += 60;
      }
    }

    // Classificar categoria
    let categoria = 'BAIXO';
    if (score >= 70) {
      categoria = 'ALTO';
    } else if (score >= 40) {
      categoria = 'MÉDIO';
    }

    return {
      score: Math.round(score),
      categoria,
    };
  }
}
