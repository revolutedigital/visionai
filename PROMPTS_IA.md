# Prompts para Análise com IA - Sistema RAC

Documentação completa dos prompts que serão usados com a Claude API para análise de imagens e classificação de clientes.

---

## Estrutura de Análise

A análise com IA será dividida em 3 etapas:

1. **Análise Individual de Imagens**: Cada foto do estabelecimento é analisada separadamente
2. **Síntese de Informações**: Agregação das análises individuais
3. **Classificação Final**: Tipologia, porte, scores e recomendações

---

## Prompt 1: Análise de Imagem Individual

### Objetivo
Analisar uma única imagem do estabelecimento e extrair informações visuais.

### Prompt

```typescript
const PROMPT_ANALISE_IMAGEM = `
Você é um analista especializado em varejo e estabelecimentos comerciais.

Analise esta imagem de um estabelecimento e forneça informações detalhadas sobre:

1. TIPO DE ESTABELECIMENTO
   - Qual é o tipo de negócio? (supermercado, padaria, restaurante, farmácia, loja de roupas, etc)
   - Quais evidências visuais indicam este tipo?

2. PORTE E INFRAESTRUTURA
   - Tamanho aparente (pequeno, médio, grande)
   - Qualidade das instalações (precário, básico, bom, excelente)
   - Modernização (antigo, padrão, moderno, premium)
   - Estado de conservação (ruim, regular, bom, ótimo)

3. ELEMENTOS VISUAIS
   - Fachada (vidraças, letreiros, pintura)
   - Iluminação (adequada, insuficiente, boa)
   - Estacionamento ou área externa
   - Movimentação de pessoas (se visível)
   - Produtos em exibição (se visível)

4. LOCALIZAÇÃO E CONTEXTO
   - Tipo de localização (esquina, meio de quadra, dentro de galeria, isolado)
   - Visibilidade da rua
   - Contexto do entorno (comercial, residencial, misto)
   - Acessibilidade aparente

5. INDICADORES DE POTENCIAL
   - Público-alvo aparente (popular, classe média, premium)
   - Sortimento de produtos (se visível)
   - Organização e apresentação
   - Investimento em marketing (placas, banners, etc)

Retorne sua análise em formato JSON seguindo esta estrutura:

{
  "tipo_estabelecimento": "string",
  "evidencias_tipo": ["string"],
  "porte_aparente": "pequeno|médio|grande",
  "qualidade_instalacoes": "precário|básico|bom|excelente",
  "modernizacao": "antigo|padrão|moderno|premium",
  "conservacao": "ruim|regular|bom|ótimo",
  "fachada": {
    "descricao": "string",
    "qualidade": "ruim|regular|boa|ótima"
  },
  "iluminacao": "insuficiente|adequada|boa|excelente",
  "estacionamento": "não visível|não possui|possui",
  "movimentacao_pessoas": "não visível|baixa|média|alta",
  "produtos_visiveis": boolean,
  "descricao_produtos": "string ou null",
  "localizacao": {
    "tipo": "esquina|meio_quadra|galeria|isolado|outro",
    "visibilidade": "baixa|média|alta",
    "contexto_entorno": "residencial|comercial|misto",
    "acessibilidade": "baixa|média|alta"
  },
  "publico_alvo_aparente": "popular|classe_media|classe_media_alta|premium",
  "organizacao": "ruim|regular|boa|ótima",
  "investimento_marketing": "nenhum|baixo|médio|alto",
  "observacoes_adicionais": "string",
  "confianca_analise": 0.0 a 1.0
}

IMPORTANTE: Seja objetivo e baseie-se apenas no que é visível na imagem. Se algo não for visível, indique isso claramente.
`;
```

---

## Prompt 2: Síntese de Múltiplas Imagens

### Objetivo
Agregar informações de múltiplas análises de imagens do mesmo estabelecimento.

### Prompt

```typescript
const PROMPT_SINTESE_IMAGENS = `
Você é um analista especializado em varejo e estabelecimentos comerciais.

Você recebeu análises individuais de ${NUM_IMAGENS} imagens diferentes do mesmo estabelecimento.

ANÁLISES INDIVIDUAIS:
${JSON.stringify(analises_individuais, null, 2)}

Sua tarefa é criar uma síntese consolidada considerando todas as análises. Resolva inconsistências priorizando:
1. Informações que aparecem em múltiplas imagens
2. Imagens de melhor qualidade
3. Ângulos que mostram mais detalhes

Retorne uma análise consolidada seguindo esta estrutura:

{
  "tipo_estabelecimento_final": "string",
  "subcategoria": "string (ex: mercearia de bairro, supermercado regional, padaria artesanal)",
  "confianca_tipo": 0.0 a 1.0,

  "porte": "pequeno|médio|grande",
  "justificativa_porte": "string",

  "infraestrutura": {
    "qualidade_geral": "precário|básico|bom|excelente",
    "modernizacao": "antigo|padrão|moderno|premium",
    "conservacao": "ruim|regular|bom|ótimo",
    "pontos_fortes": ["string"],
    "pontos_fracos": ["string"]
  },

  "localizacao": {
    "tipo": "string",
    "visibilidade": "baixa|média|alta",
    "acessibilidade": "baixa|média|alta",
    "contexto": "residencial|comercial|misto",
    "pontos_fortes": ["string"],
    "pontos_fracos": ["string"]
  },

  "publico_alvo": "popular|classe_media|classe_media_alta|premium",

  "descricao_completa": "string (2-3 parágrafos descrevendo o estabelecimento)",

  "inconsistencias_encontradas": ["string (se houver)"],

  "confianca_geral": 0.0 a 1.0
}
`;
```

---

## Prompt 3: Classificação e Scores Finais

### Objetivo
Gerar classificação final, scores de potencial e recomendações estratégicas.

### Prompt

```typescript
const PROMPT_CLASSIFICACAO_FINAL = `
Você é um analista de negócios especializado em varejo com experiência em prospecção comercial.

DADOS DO CLIENTE:
- Nome: ${cliente.nome}
- Endereço: ${cliente.endereco}
- Cidade: ${cliente.cidade}
- Tipo de serviço contratado: ${cliente.tipoServico}

ANÁLISE VISUAL CONSOLIDADA:
${JSON.stringify(sintese_visual, null, 2)}

INFORMAÇÕES DO GOOGLE PLACES:
${JSON.stringify(places_info, null, 2)}

Com base em todas essas informações, forneça uma análise de potencial comercial completa.

Sua análise deve considerar:
1. Compatibilidade com o tipo de serviço oferecido
2. Potencial de crescimento do cliente
3. Capacidade de investimento aparente
4. Localização estratégica
5. Infraestrutura adequada

Retorne sua análise em formato JSON:

{
  "classificacao": {
    "tipologia": {
      "segmento": "string (ex: Supermercado, Padaria, Restaurante)",
      "subcategoria": "string (ex: Mercearia de Bairro, Rede Regional)",
      "porte": "pequeno|médio|grande",
      "descricao": "string (descrição detalhada do estabelecimento)"
    }
  },

  "scores": {
    "potencial_geral": {
      "valor": 0-100,
      "justificativa": "string"
    },
    "infraestrutura": {
      "valor": 0-100,
      "justificativa": "string",
      "aspectos_positivos": ["string"],
      "aspectos_negativos": ["string"]
    },
    "localizacao": {
      "valor": 0-100,
      "justificativa": "string",
      "aspectos_positivos": ["string"],
      "aspectos_negativos": ["string"]
    },
    "movimento_aparente": {
      "valor": 0-100,
      "justificativa": "string"
    },
    "compatibilidade_servico": {
      "valor": 0-100,
      "justificativa": "string (quão bem o serviço oferecido se encaixa neste cliente)"
    }
  },

  "analise_potencial": {
    "classificacao": "baixo|médio|alto|muito_alto",
    "capacidade_investimento": "baixa|média|alta",
    "crescimento_esperado": "baixo|médio|alto",
    "prioridade_abordagem": "baixa|média|alta|crítica"
  },

  "pontos_fortes": [
    {
      "aspecto": "string",
      "descricao": "string",
      "impacto": "baixo|médio|alto"
    }
  ],

  "pontos_fracos": [
    {
      "aspecto": "string",
      "descricao": "string",
      "impacto": "baixo|médio|alto"
    }
  ],

  "oportunidades": [
    {
      "oportunidade": "string",
      "descricao": "string",
      "potencial": "baixo|médio|alto"
    }
  ],

  "recomendacoes": [
    {
      "tipo": "abordagem|produto|precificacao|timing",
      "recomendacao": "string",
      "prioridade": "baixa|média|alta"
    }
  ],

  "estrategia_abordagem": {
    "melhor_momento": "string",
    "canal_recomendado": "presencial|telefone|email|whatsapp",
    "argumentos_chave": ["string"],
    "objecoes_previstas": ["string"],
    "proposta_valor": "string"
  },

  "observacoes_finais": "string",

  "confianca_analise": 0.0 a 1.0,

  "metadata": {
    "imagens_analisadas": number,
    "fontes_dados": ["google_places", "imagens", "endereco"],
    "data_analise": "ISO 8601 timestamp"
  }
}

IMPORTANTE:
- Seja objetivo e baseado em dados
- Scores devem ser justificados
- Recomendações devem ser práticas e acionáveis
- Considere o contexto do tipo de serviço oferecido
`;
```

---

## Prompt 4: Análise de Texto (Informações Web)

### Objetivo
Analisar informações textuais coletadas da web (descrições, reviews, etc).

### Prompt

```typescript
const PROMPT_ANALISE_TEXTO = `
Você é um analista de informações comerciais.

Analise as seguintes informações textuais sobre o estabelecimento:

INFORMAÇÕES DO GOOGLE PLACES:
- Nome: ${places.name}
- Tipos: ${places.types}
- Avaliação: ${places.rating} (${places.user_ratings_total} avaliações)
- Telefone: ${places.phone}
- Website: ${places.website}
- Horário de funcionamento: ${places.opening_hours}

REVIEWS (primeiras 5):
${places.reviews.map(r => `- ${r.rating}⭐ "${r.text}"`).join('\n')}

INFORMAÇÕES DA WEB:
${web_scraping_results}

Com base nessas informações textuais, extraia insights sobre:

{
  "reputacao_online": {
    "avaliacao_geral": "ruim|regular|boa|excelente",
    "volume_avaliacoes": "baixo|médio|alto",
    "sentimento_geral": "negativo|neutro|positivo",
    "principais_elogios": ["string"],
    "principais_reclamacoes": ["string"]
  },

  "presenca_digital": {
    "possui_website": boolean,
    "qualidade_website": "não possui|básico|bom|profissional",
    "redes_sociais": ["string"],
    "nivel_engajamento": "baixo|médio|alto"
  },

  "informacoes_operacionais": {
    "horario_funcionamento": "string",
    "dias_funcionamento": "string",
    "servicos_oferecidos": ["string"],
    "diferenciais_mencionados": ["string"]
  },

  "insights_clientes": {
    "perfil_clientes": "string",
    "satisfacao_geral": "baixa|média|alta",
    "aspectos_mais_valorizados": ["string"],
    "problemas_recorrentes": ["string"]
  },

  "posicionamento_mercado": {
    "diferencial_competitivo": "string",
    "nivel_concorrencia": "baixo|médio|alto",
    "vantagens_competitivas": ["string"]
  },

  "resumo_executivo": "string (2 parágrafos)",

  "confianca_analise": 0.0 a 1.0
}
`;
```

---

## Exemplo de Implementação em TypeScript

```typescript
import Anthropic from "@anthropic-ai/sdk";

interface AnaliseImagem {
  tipo_estabelecimento: string;
  porte_aparente: string;
  qualidade_instalacoes: string;
  // ... outros campos
}

interface ResultadoFinal {
  classificacao: {
    tipologia: {
      segmento: string;
      subcategoria: string;
      porte: string;
    };
  };
  scores: {
    potencial_geral: { valor: number; justificativa: string };
    infraestrutura: { valor: number; justificativa: string };
    // ... outros scores
  };
  // ... outros campos
}

class AIAnalysisService {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  /**
   * Analisa uma única imagem
   */
  async analisarImagem(imagemBase64: string): Promise<AnaliseImagem> {
    const response = await this.client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: imagemBase64,
              },
            },
            {
              type: "text",
              text: PROMPT_ANALISE_IMAGEM,
            },
          ],
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("Resposta inválida da API");
    }

    // Extrair JSON da resposta
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("JSON não encontrado na resposta");
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Sintetiza múltiplas análises de imagens
   */
  async sintetizarAnalises(
    analises: AnaliseImagem[]
  ): Promise<SinteseVisual> {
    const prompt = PROMPT_SINTESE_IMAGENS
      .replace("${NUM_IMAGENS}", String(analises.length))
      .replace(
        "${JSON.stringify(analises_individuais, null, 2)}",
        JSON.stringify(analises, null, 2)
      );

    const response = await this.client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return this.extrairJSON(response);
  }

  /**
   * Gera classificação final com scores
   */
  async classificacaoFinal(
    cliente: Cliente,
    sintese: SinteseVisual,
    placesInfo: any
  ): Promise<ResultadoFinal> {
    const prompt = this.construirPromptFinal(cliente, sintese, placesInfo);

    const response = await this.client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return this.extrairJSON(response);
  }

  /**
   * Analisa informações textuais
   */
  async analisarTexto(
    placesInfo: any,
    webScrapingResults: string
  ): Promise<AnaliseTexto> {
    const prompt = this.construirPromptTexto(placesInfo, webScrapingResults);

    const response = await this.client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return this.extrairJSON(response);
  }

  /**
   * Extrai JSON da resposta da API
   */
  private extrairJSON(response: any): any {
    const textContent = response.content.find((c: any) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("Resposta inválida da API");
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("JSON não encontrado na resposta");
    }

    return JSON.parse(jsonMatch[0]);
  }
}

// Uso do serviço
const aiService = new AIAnalysisService(process.env.ANTHROPIC_API_KEY!);

// Pipeline completo de análise
async function analisarCliente(clienteId: string) {
  // 1. Buscar fotos do cliente
  const fotos = await buscarFotosCliente(clienteId);

  // 2. Analisar cada imagem individualmente
  const analisesIndividuais = await Promise.all(
    fotos.map((foto) => aiService.analisarImagem(foto.base64))
  );

  // 3. Sintetizar análises
  const sintese = await aiService.sintetizarAnalises(analisesIndividuais);

  // 4. Buscar informações adicionais
  const placesInfo = await buscarPlacesInfo(clienteId);
  const cliente = await buscarCliente(clienteId);

  // 5. Classificação final
  const resultadoFinal = await aiService.classificacaoFinal(
    cliente,
    sintese,
    placesInfo
  );

  // 6. Salvar no banco
  await salvarAnalise(clienteId, resultadoFinal);

  return resultadoFinal;
}
```

---

## Custos Estimados (Claude API)

### Modelo: Claude 3.5 Sonnet

**Preços (a partir de janeiro 2025):**
- Input: $3.00 / 1M tokens
- Output: $15.00 / 1M tokens

**Estimativa por cliente:**
- Análise de 5 imagens: ~15,000 tokens input (imagens) + 2,000 tokens output
- Síntese: ~3,000 tokens input + 1,000 tokens output
- Classificação final: ~5,000 tokens input + 2,000 tokens output

**Total por cliente: ~$0.10 - $0.15**

**Volume mensal:**
- 1,000 clientes: ~$100-150
- 5,000 clientes: ~$500-750
- 10,000 clientes: ~$1,000-1,500

---

## Otimizações de Custo

1. **Cache de resultados**: Não reprocessar clientes já analisados
2. **Batch processing**: Processar múltiplos clientes em paralelo
3. **Rate limiting**: Controlar número de requisições
4. **Fallback**: Se não houver imagens, análise apenas com dados textuais
5. **Qualidade de imagens**: Comprimir imagens antes de enviar
6. **Modelo alternativo**: Usar Claude Haiku para análises mais simples

---

## Exemplo de Response

```json
{
  "classificacao": {
    "tipologia": {
      "segmento": "Supermercado",
      "subcategoria": "Supermercado de Bairro",
      "porte": "médio",
      "descricao": "Supermercado de médio porte localizado em área comercial de bairro..."
    }
  },
  "scores": {
    "potencial_geral": {
      "valor": 78,
      "justificativa": "Estabelecimento bem localizado com boa infraestrutura..."
    },
    "infraestrutura": {
      "valor": 75,
      "justificativa": "Instalações em bom estado de conservação...",
      "aspectos_positivos": [
        "Fachada bem mantida",
        "Iluminação adequada",
        "Estacionamento disponível"
      ],
      "aspectos_negativos": ["Necessita modernização na pintura"]
    },
    "localizacao": {
      "valor": 85,
      "justificativa": "Excelente localização em esquina movimentada...",
      "aspectos_positivos": [
        "Alta visibilidade",
        "Fácil acesso",
        "Área comercial consolidada"
      ],
      "aspectos_negativos": ["Concorrência próxima"]
    }
  },
  "recomendacoes": [
    {
      "tipo": "abordagem",
      "recomendacao": "Agendar visita presencial no período da manhã",
      "prioridade": "alta"
    }
  ]
}
```

---

## Próximos Passos

1. ✅ Prompts definidos
2. ⬜ Implementar AIAnalysisService
3. ⬜ Criar workers para processamento
4. ⬜ Testar com imagens reais
5. ⬜ Ajustar prompts baseado em resultados

