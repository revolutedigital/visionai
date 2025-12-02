import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Sprint 3+: Serviço de Enriquecimento Multi-Fonte
 *
 * Busca dados em múltiplas fontes para garantir máxima completude:
 * - Google Places API (já existe)
 * - Busca de site próprio via Google Search
 * - Instagram Business
 * - Facebook Pages
 * - Scraping de website (se encontrado)
 * - Validação de telefone em múltiplas bases
 */

interface EnrichmentResult {
  fonte: string;
  sucesso: boolean;
  dadosEncontrados: {
    telefone?: string[];
    website?: string;
    instagram?: string;
    facebook?: string;
    horarioFuncionamento?: string;
    descricao?: string;
    categorias?: string[];
  };
  confiabilidade: 'ALTA' | 'MEDIA' | 'BAIXA';
  timestamp: Date;
}

export class EnrichmentService {
  /**
   * Busca presença digital do cliente (site, redes sociais)
   */
  async searchDigitalPresence(nome: string, endereco: string): Promise<EnrichmentResult> {
    const query = `${nome} ${endereco}`;
    const result: EnrichmentResult = {
      fonte: 'GOOGLE_SEARCH',
      sucesso: false,
      dadosEncontrados: {},
      confiabilidade: 'BAIXA',
      timestamp: new Date(),
    };

    try {
      // Buscar no Google usando Custom Search API (se configurado)
      const googleApiKey = process.env.GOOGLE_API_KEY;
      const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

      if (!googleApiKey || !searchEngineId) {
        console.log('⚠️  Google Custom Search não configurado');
        return result;
      }

      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}`;

      const response = await axios.get(searchUrl, { timeout: 10000 });

      if (response.data.items && response.data.items.length > 0) {
        const items = response.data.items;

        // Extrair links de redes sociais e website
        for (const item of items.slice(0, 5)) {
          const link = item.link.toLowerCase();

          // Instagram
          if (link.includes('instagram.com/') && !result.dadosEncontrados.instagram) {
            result.dadosEncontrados.instagram = item.link;
          }

          // Facebook
          if (link.includes('facebook.com/') && !result.dadosEncontrados.facebook) {
            result.dadosEncontrados.facebook = item.link;
          }

          // Website próprio (não é rede social)
          if (!link.includes('instagram.com') &&
              !link.includes('facebook.com') &&
              !link.includes('twitter.com') &&
              !link.includes('linkedin.com') &&
              !result.dadosEncontrados.website) {
            result.dadosEncontrados.website = item.link;
          }
        }

        result.sucesso = true;
        result.confiabilidade = 'MEDIA';
      }
    } catch (error: any) {
      console.error('Erro ao buscar presença digital:', error.message);
    }

    return result;
  }

  /**
   * Extrai informações do Instagram Business (via scraping público)
   */
  async extractInstagramData(instagramUrl: string): Promise<EnrichmentResult> {
    const result: EnrichmentResult = {
      fonte: 'INSTAGRAM',
      sucesso: false,
      dadosEncontrados: {},
      confiabilidade: 'MEDIA',
      timestamp: new Date(),
    };

    try {
      // Extrair username do URL
      const usernameMatch = instagramUrl.match(/instagram\.com\/([^\/\?]+)/);
      if (!usernameMatch) return result;

      const username = usernameMatch[1];

      // Fazer request para página pública do Instagram
      const response = await axios.get(`https://www.instagram.com/${username}/`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });

      const html = response.data;

      // Extrair dados do script JSON-LD ou meta tags
      const $ = cheerio.load(html);

      // Buscar descrição/bio
      const description = $('meta[property="og:description"]').attr('content');
      if (description) {
        result.dadosEncontrados.descricao = description;

        // Tentar extrair telefone da bio (formato comum: (XX) XXXXX-XXXX)
        const phoneRegex = /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g;
        const phones = description.match(phoneRegex);
        if (phones) {
          result.dadosEncontrados.telefone = phones;
        }
      }

      result.sucesso = true;
      result.confiabilidade = 'MEDIA';
    } catch (error: any) {
      console.error('Erro ao extrair dados do Instagram:', error.message);
    }

    return result;
  }

  /**
   * Extrai informações de um website próprio
   */
  async scrapeWebsite(websiteUrl: string): Promise<EnrichmentResult> {
    const result: EnrichmentResult = {
      fonte: 'WEBSITE_SCRAPING',
      sucesso: false,
      dadosEncontrados: {},
      confiabilidade: 'ALTA',
      timestamp: new Date(),
    };

    try {
      const response = await axios.get(websiteUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Buscar telefones no HTML
      const phoneRegex = /(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}/g;
      const bodyText = $('body').text();
      const phones = bodyText.match(phoneRegex);
      if (phones) {
        result.dadosEncontrados.telefone = [...new Set(phones)]; // Remove duplicatas
      }

      // Buscar horário de funcionamento
      const horarioKeywords = ['horário', 'funcionamento', 'atendimento', 'aberto'];
      $('*').each((_, element) => {
        const text = $(element).text().toLowerCase();
        if (horarioKeywords.some(kw => text.includes(kw)) && text.length < 200) {
          result.dadosEncontrados.horarioFuncionamento = $(element).text().trim();
          return false; // Break
        }
      });

      // Buscar links de redes sociais no site
      $('a[href*="instagram.com"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !result.dadosEncontrados.instagram) {
          result.dadosEncontrados.instagram = href;
        }
      });

      $('a[href*="facebook.com"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !result.dadosEncontrados.facebook) {
          result.dadosEncontrados.facebook = href;
        }
      });

      result.sucesso = true;
      result.confiabilidade = 'ALTA';
    } catch (error: any) {
      console.error('Erro ao fazer scraping do website:', error.message);
    }

    return result;
  }

  /**
   * Executa enriquecimento completo multi-fonte para um cliente
   */
  async enrichCliente(clienteId: string): Promise<{
    sucesso: boolean;
    fontesConsultadas: string[];
    dadosNovos: any;
    confiabilidade: string;
  }> {
    try {
      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
      });

      if (!cliente) {
        throw new Error('Cliente não encontrado');
      }

      console.log(`🔍 Iniciando enriquecimento multi-fonte para: ${cliente.nome}`);

      const fontesConsultadas: string[] = [];
      const dadosNovos: any = {
        telefones: [],
        websites: [],
        redesSociais: {
          instagram: null,
          facebook: null,
        },
        horarioFuncionamento: null,
        descricao: null,
      };

      // 1. Buscar presença digital (Google Search)
      const digitalPresence = await this.searchDigitalPresence(cliente.nome, cliente.endereco);
      fontesConsultadas.push('GOOGLE_SEARCH');

      if (digitalPresence.sucesso) {
        if (digitalPresence.dadosEncontrados.instagram) {
          dadosNovos.redesSociais.instagram = digitalPresence.dadosEncontrados.instagram;
        }
        if (digitalPresence.dadosEncontrados.facebook) {
          dadosNovos.redesSociais.facebook = digitalPresence.dadosEncontrados.facebook;
        }
        if (digitalPresence.dadosEncontrados.website) {
          dadosNovos.websites.push(digitalPresence.dadosEncontrados.website);
        }
      }

      // 2. Se encontrou Instagram, extrair dados
      if (dadosNovos.redesSociais.instagram) {
        const instagramData = await this.extractInstagramData(dadosNovos.redesSociais.instagram);
        fontesConsultadas.push('INSTAGRAM');

        if (instagramData.sucesso) {
          if (instagramData.dadosEncontrados.telefone) {
            dadosNovos.telefones.push(...instagramData.dadosEncontrados.telefone);
          }
          if (instagramData.dadosEncontrados.descricao) {
            dadosNovos.descricao = instagramData.dadosEncontrados.descricao;
          }
        }
      }

      // 3. Se encontrou website, fazer scraping
      if (dadosNovos.websites.length > 0) {
        const websiteData = await this.scrapeWebsite(dadosNovos.websites[0]);
        fontesConsultadas.push('WEBSITE_SCRAPING');

        if (websiteData.sucesso) {
          if (websiteData.dadosEncontrados.telefone) {
            dadosNovos.telefones.push(...websiteData.dadosEncontrados.telefone);
          }
          if (websiteData.dadosEncontrados.horarioFuncionamento) {
            dadosNovos.horarioFuncionamento = websiteData.dadosEncontrados.horarioFuncionamento;
          }
          if (websiteData.dadosEncontrados.instagram && !dadosNovos.redesSociais.instagram) {
            dadosNovos.redesSociais.instagram = websiteData.dadosEncontrados.instagram;
          }
          if (websiteData.dadosEncontrados.facebook && !dadosNovos.redesSociais.facebook) {
            dadosNovos.redesSociais.facebook = websiteData.dadosEncontrados.facebook;
          }
        }
      }

      // Remover duplicatas de telefones
      dadosNovos.telefones = [...new Set(dadosNovos.telefones)];

      // Atualizar banco de dados com dados encontrados
      const updateData: any = {
        fontesValidadas: JSON.stringify(fontesConsultadas),
        tentativasEnriquecimento: (cliente.tentativasEnriquecimento || 0) + 1,
      };

      // Atualizar telefone se não tinha e encontrou
      if (!cliente.telefone && dadosNovos.telefones.length > 0) {
        updateData.telefone = dadosNovos.telefones[0];
      }

      // Atualizar website se não tinha e encontrou
      if (!cliente.website && dadosNovos.websites.length > 0) {
        updateData.website = dadosNovos.websites[0];
      }

      // Atualizar redes sociais (criar campo JSON se não existir)
      if (dadosNovos.redesSociais.instagram || dadosNovos.redesSociais.facebook) {
        updateData.redesSociais = JSON.stringify(dadosNovos.redesSociais);
      }

      await prisma.cliente.update({
        where: { id: clienteId },
        data: updateData,
      });

      const confiabilidade = fontesConsultadas.length >= 3 ? 'ALTA' :
                             fontesConsultadas.length >= 2 ? 'MEDIA' : 'BAIXA';

      console.log(`✅ Enriquecimento completo! Fontes: ${fontesConsultadas.join(', ')}`);
      console.log(`   Telefones encontrados: ${dadosNovos.telefones.length}`);
      console.log(`   Instagram: ${dadosNovos.redesSociais.instagram ? 'Sim' : 'Não'}`);
      console.log(`   Facebook: ${dadosNovos.redesSociais.facebook ? 'Sim' : 'Não'}`);
      console.log(`   Website: ${dadosNovos.websites.length > 0 ? 'Sim' : 'Não'}`);

      return {
        sucesso: true,
        fontesConsultadas,
        dadosNovos,
        confiabilidade,
      };
    } catch (error: any) {
      console.error('❌ Erro no enriquecimento:', error);
      return {
        sucesso: false,
        fontesConsultadas: [],
        dadosNovos: {},
        confiabilidade: 'BAIXA',
      };
    }
  }
}
