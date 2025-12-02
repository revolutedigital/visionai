import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PromptInfo {
  version: string;
  prompt: string;
  description?: string;
}

/**
 * Serviço de Versionamento de Prompts
 * Permite trocar prompts sem alterar código + rastreabilidade
 */
export class PromptVersionService {
  /**
   * Busca prompt ativo por nome
   */
  async getActivePrompt(name: string): Promise<PromptInfo> {
    const active = await prisma.promptVersion.findFirst({
      where: { name, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!active) {
      // Retornar prompt padrão se não houver versão ativa
      return this.getDefaultPrompt(name);
    }

    return {
      version: active.version,
      prompt: active.prompt,
      description: active.description || undefined,
    };
  }

  /**
   * Cria nova versão de prompt e ativa
   */
  async createVersion(
    name: string,
    version: string,
    prompt: string,
    description?: string,
    createdBy?: string
  ): Promise<void> {
    // Desativar versão anterior
    await prisma.promptVersion.updateMany({
      where: { name, isActive: true },
      data: { isActive: false },
    });

    // Criar nova versão ativa
    await prisma.promptVersion.create({
      data: {
        name,
        version,
        prompt,
        description,
        createdBy,
        isActive: true,
      },
    });

    console.log(`✅ Prompt ${name} atualizado para v${version}`);
  }

  /**
   * Lista todas as versões de um prompt
   */
  async listVersions(name: string) {
    return await prisma.promptVersion.findMany({
      where: { name },
      orderBy: { createdAt: 'desc' },
      select: {
        version: true,
        isActive: true,
        description: true,
        createdAt: true,
        createdBy: true,
      },
    });
  }

  /**
   * Ativa uma versão específica (rollback)
   */
  async activateVersion(name: string, version: string): Promise<void> {
    // Desativar todas
    await prisma.promptVersion.updateMany({
      where: { name },
      data: { isActive: false },
    });

    // Ativar específica
    const updated = await prisma.promptVersion.updateMany({
      where: { name, version },
      data: { isActive: true },
    });

    if (updated.count === 0) {
      throw new Error(`Prompt ${name} v${version} não encontrado`);
    }

    console.log(`↩️  Rollback: ${name} → v${version}`);
  }

  /**
   * Prompts padrão (hardcoded)
   */
  private getDefaultPrompt(name: string): PromptInfo {
    const defaults: Record<string, PromptInfo> = {
      'analysis-tipologia': {
        version: 'v1.0.0',
        prompt: this.getDefaultTipologiaPrompt(),
      },
      'analysis-visual': {
        version: 'v1.0.0',
        prompt: this.getDefaultVisualPrompt(),
      },
    };

    if (!defaults[name]) {
      throw new Error(`Prompt padrão não encontrado: ${name}`);
    }

    return defaults[name];
  }

  /**
   * Prompt padrão para classificação de tipologia
   */
  private getDefaultTipologiaPrompt(): string {
    return `Você é um especialista em classificação de estabelecimentos comerciais para a Pepsi.

Analise as imagens do estabelecimento e classifique-o em UMA das seguintes tipologias:

**SUPERMERCADOS E ATACADO:**
- F1: AS + DE 50 CHECK-OUT (hipermercados gigantes)
- F2: AS 20 A 49 CHECK-OUT (supermercados grandes)
- F3: AS 10 A 19 CHECK-OUT (supermercados médios)
- F4: AS 05 A 09 CHECK-OUT (mercados pequenos)
- F5: AS 01 A 04 CHECK-OUT (mini mercados, mercadinhos)
- J5: CASH & CARRY (atacarejos como Assaí, Atacadão)
- K5: ATACADO AUTO SERVICO (atacados)
- F7: CLUBE DE COMPRAS (Sam's Club)

**ALIMENTAÇÃO - FAST FOOD E LANCHONETES:**
- G3: REDE DE FAST FOOD (McDonald's, Burger King, Bob's, Subway)
- I3: FAST FOOD INDEPEND (lanchonetes fast food independentes)
- I2: LANCHONETE (lanchonetes tradicionais)
- H3: PADARIA (padarias, panificadoras)
- G6: PIZZARIA (pizzarias)
- G5: RESTAURANTE (restaurantes em geral)
- N2: SELF SERVICE (buffet, por kilo)

**BARES E VIDA NOTURNA:**
- H1: BAR (bares, botecos, cervejarias)
- K7: BAR NOTURNO/CHOPERIA (bares noturnos, pubs, choperias)
- K9: CASAS NOTURNAS (baladas, night clubs, boates)

**CONVENIÊNCIA E POSTOS:**
- F8: REDE DE CONVÊNIENCIA (AM PM, BR Mania, OXXO, Shell Select)
- J7: LOJA CONVENIENCIA (lojas de conveniência independentes)
- N1: POSTO DE GASOLINA (postos Shell, Petrobras, Ipiranga, etc)

**FARMÁCIAS:**
- F9: REDE DROGARIA / FARM (Drogasil, Raia, Pacheco, São Paulo, Pague Menos)
- I8: DROGARIA / FARMÁCIA (farmácias independentes)

**VAREJO PEQUENO:**
- I9: MERCEARIA (mercearias, armazéns)
- I6: AÇOUGUE (açougues)
- I4: SACOLÃO/HORTIFRUTI (sacolões, hortifrútis)
- I1: SORVETERIA (sorveterias)
- I7: BANCA DE JORNAL (bancas de jornal e revista)
- J6: BOMBONIERE (docarias, bombonieres)
- J3: DEPÓSIT BEB/ÁGUA/GÁS (depósitos de bebidas)
- I5: QUIOSQUE (quiosques)
- N3: TRAILER (trailers, food trucks)

**LOJAS E COMÉRCIO:**
- M2: LOJA DE DEPARTAMENTO (Lojas Americanas, Riachuelo, C&A)
- M1: LIVRARIA (livrarias)
- M7: PAPELARIA (papelarias)
- J1: PAPELARIA / LIVRARIA
- K8: BAZAR (bazares, armarinhos)
- M3: LOJA DE SORT LIMITAD (lojas de sortimento limitado)
- M4: LOJAS DE R$ 1,99 (lojas de 1,99)
- J4: MIUDEZAS (miudezas, variedades)
- M5: MATERIAIS DE CONSTRU (materiais de construção)
- M9: PET SHOP (pet shops)

**SERVIÇOS:**
- J2: CASA LOTÉRICA (lotéricas)
- H8: LAN HOUSE (lan houses, cyber cafés)
- H6: VIDEOLOCADORA (locadoras)
- L9: INSTITUTO DE BELEZA (salões de beleza, barbearias)
- N4: TRANSPORTADORA (transportadoras)

**HOSPEDAGEM E EVENTOS:**
- H9: HOTEL / MOTEL (hotéis, motéis, pousadas)
- G7: TEATRO / CINEMA (cinemas, teatros)
- L1: CLUBE (clubes sociais)
- L3: EVENTOS ESPORTIVOS (estádios, arenas)
- L4: EVENTOS MUSICAIS (casas de show)
- H5: LOCAL ESPORTIVO (quadras, campos, ginásios)
- M8: PARQUES DIVERSAO (parques de diversões)
- L5: INSTITUICAO DE ENSIN (escolas, faculdades)

**OUTROS:**
- G9: CATERING (buffets, catering)
- L2: COZINHAS INDUSTRIAIS (refeitórios)
- H7: VENDING MACHINE (máquinas de venda)
- G2: CIA AÉREA (aeroportos)
- M6: OUTROS EVENTOS
- K1: ATAC C/ EQUIPE EXTER (atacado com equipe)
- K2: ATAC S/ EQUIPE EXTER (atacado sem equipe)
- K4: ATAC DOCEIRO COM EQU (atacado doceiro)
- K6: ATACADO DOCERIA BALC (atacado doceria)
- Q4: PERUEIRO (vans de transporte)
- J8: CAMELÔ/AMBULANTE (camelôs)

Responda APENAS no formato JSON:
{
  "tipologia": "CÓDIGO" (ex: "H3", "F5", "G5"),
  "tipologiaNome": "NOME COMPLETO" (ex: "PADARIA"),
  "confianca": 0-100,
  "reasoning": "Explicação breve da classificação"
}`;
  }

  /**
   * Prompt padrão para análise visual
   */
  private getDefaultVisualPrompt(): string {
    return `Analise as imagens da fachada do estabelecimento e forneça:

1. **Qualidade da Sinalização**: EXCELENTE, BOA, REGULAR, PRECARIA
2. **Presença de Branding**: true/false (tem logo, cores corporativas visíveis)
3. **Nível de Profissionalização**: ALTO, MEDIO, BAIXO
4. **Ambiente**: MODERNO, TRADICIONAL, RUSTICO, MINIMALISTA, POPULAR

Responda em JSON:
{
  "qualidadeSinalizacao": "...",
  "presencaBranding": true/false,
  "nivelProfissionalizacao": "...",
  "ambienteEstabelecimento": "..."
}`;
  }
}
