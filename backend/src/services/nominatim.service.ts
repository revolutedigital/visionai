import axios from 'axios';
import { cityNormalizerService } from './city-normalizer.service';

export interface NominatimResult {
  latitude: number;
  longitude: number;
  display_name: string;
  boundingbox: string[];
}

/**
 * Nominatim Service - Geocoding usando OpenStreetMap (GRÁTIS!)
 *
 * Vision AI Component: Fonte alternativa para validação cruzada de geocoding
 * ROI: $0 de custo vs Google Geocoding
 *
 * Documentação: https://nominatim.org/release-docs/latest/api/Search/
 */
export class NominatimService {
  private baseUrl = 'https://nominatim.openstreetmap.org';
  private userAgent = 'VisionAI-Pepsi/1.0'; // Nominatim requer User-Agent

  /**
   * Geocodifica endereço usando OpenStreetMap
   * Com normalização de cidade/estado para melhorar taxa de sucesso
   *
   * @param endereco - Endereço completo ou parcial
   * @param cidade - Cidade
   * @param estado - Estado (UF)
   * @returns Coordenadas lat/lng
   */
  async geocode(
    endereco: string,
    cidade: string,
    estado: string
  ): Promise<NominatimResult | null> {
    try {
      // Normalizar cidade e estado para melhorar busca
      const { cidade: cidadeNormalizada, estado: estadoNormalizado } =
        cityNormalizerService.normalizeCityState(cidade, estado);

      // Limpar endereço removendo complementos que confundem
      const enderecoLimpo = this.limparEndereco(endereco);

      const query = `${enderecoLimpo}, ${cidadeNormalizada}, ${estadoNormalizado}, Brasil`;

      console.log(`🌍 [Nominatim] Geocodificando: "${query}"`);
      if (cidade !== cidadeNormalizada) {
        console.log(`   📍 Cidade normalizada: ${cidade} → ${cidadeNormalizada}`);
      }

      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: query,
          format: 'json',
          limit: 1,
          countrycodes: 'br', // Apenas Brasil
          addressdetails: 1,
        },
        headers: {
          'User-Agent': this.userAgent,
        },
        timeout: 5000, // 5 segundos
      });

      if (!response.data || response.data.length === 0) {
        // Tentar busca simplificada (só rua + cidade)
        return await this.geocodeSimplificado(enderecoLimpo, cidadeNormalizada, estadoNormalizado);
      }

      const result = response.data[0];

      console.log(`✅ [Nominatim] Encontrado: ${result.display_name}`);
      console.log(`   Lat: ${result.lat}, Lng: ${result.lon}`);

      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        display_name: result.display_name,
        boundingbox: result.boundingbox,
      };
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        console.error(`⚠️  [Nominatim] Timeout - serviço demorou muito`);
      } else if (error.response?.status === 429) {
        console.error(`⚠️  [Nominatim] Rate limit atingido`);
      } else {
        console.error(`❌ [Nominatim] Erro: ${error.message}`);
      }

      return null;
    }
  }

  /**
   * Tenta busca simplificada removendo número
   */
  private async geocodeSimplificado(
    endereco: string,
    cidade: string,
    estado: string
  ): Promise<NominatimResult | null> {
    try {
      // Remover número do endereço
      const enderecoSemNumero = endereco.replace(/\s*\d+\s*$/, '').trim();

      if (enderecoSemNumero === endereco) {
        // Já não tinha número, não adianta tentar de novo
        console.warn(`⚠️  [Nominatim] Nenhum resultado encontrado`);
        return null;
      }

      const query = `${enderecoSemNumero}, ${cidade}, ${estado}, Brasil`;
      console.log(`   🔄 [Nominatim] Tentando sem número: "${query}"`);

      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: query,
          format: 'json',
          limit: 1,
          countrycodes: 'br',
          addressdetails: 1,
        },
        headers: {
          'User-Agent': this.userAgent,
        },
        timeout: 5000,
      });

      if (!response.data || response.data.length === 0) {
        console.warn(`⚠️  [Nominatim] Nenhum resultado encontrado`);
        return null;
      }

      const result = response.data[0];

      console.log(`✅ [Nominatim] Encontrado (sem número): ${result.display_name}`);
      console.log(`   Lat: ${result.lat}, Lng: ${result.lon}`);

      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        display_name: result.display_name,
        boundingbox: result.boundingbox,
      };
    } catch (error: any) {
      console.warn(`⚠️  [Nominatim] Busca simplificada falhou: ${error.message}`);
      return null;
    }
  }

  /**
   * Limpa endereço removendo complementos que confundem o Nominatim
   */
  private limparEndereco(endereco: string): string {
    let limpo = endereco;

    // Remover TUDO após a primeira vírgula (complementos geralmente vêm depois)
    // Ex: "Rua X 123, Sala 5" → "Rua X 123"
    // Ex: "Rua X 123, CR 3968" → "Rua X 123"
    // Ex: "Rua X 123, Loja 1 e 2" → "Rua X 123"
    const partes = limpo.split(',');
    if (partes.length > 1) {
      // Pegar só a primeira parte (rua + número)
      limpo = partes[0].trim();
    }

    // Remover "Quadra X Lote Y" mesmo sem vírgula
    limpo = limpo.replace(/\s+Quadra\s*\d*\s*,?\s*Lote?\s*\d*/gi, '');
    limpo = limpo.replace(/\s+Qd\s*\d*\s*,?\s*Lt?\s*\d*/gi, '');

    // Remover "SN" ou "S/N" (sem número) - Nominatim não entende
    limpo = limpo.replace(/\s+(SN|S\/N|Sem\s*N[úu]mero)\b/gi, '');

    // Remover múltiplos espaços
    limpo = limpo.replace(/\s+/g, ' ').trim();

    return limpo;
  }

  /**
   * Geocodifica endereço com retry em caso de falha
   */
  async geocodeWithRetry(
    endereco: string,
    cidade: string,
    estado: string,
    maxRetries: number = 2
  ): Promise<NominatimResult | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await this.geocode(endereco, cidade, estado);

      if (result) {
        return result;
      }

      if (attempt < maxRetries) {
        console.log(`   🔄 Tentativa ${attempt}/${maxRetries} falhou, tentando novamente...`);
        await this.sleep(1000 * attempt); // Esperar progressivamente mais
      }
    }

    return null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const nominatimService = new NominatimService();
