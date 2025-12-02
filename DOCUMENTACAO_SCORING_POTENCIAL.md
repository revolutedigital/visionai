# Documentação: Sistema de Scoring e Potencial de Clientes

## ⚠️ IMPORTANTE: DADOS REAIS - NÃO INVENTADOS

**Este sistema utiliza APENAS dados reais coletados de fontes verificáveis. NENHUM dado é inventado ou estimado sem base real.**

---

## 1. Sistema de Potencial (Scoring)

### Fontes de Dados Reais

O score de potencial é calculado com base em **dados objetivos** coletados do Google Places e validados por IA Vision:

#### 1.1 Rating do Google (0-15 pontos)
- **Fonte**: Google Places API (`rating`)
- **Dado Real**: Avaliação média dos usuários (0.0 a 5.0 estrelas)
- **Cálculo**:
  - 4.5+ estrelas → 15 pontos
  - 4.0-4.4 estrelas → 13 pontos
  - 3.5-3.9 estrelas → 10 pontos
  - 3.0-3.4 estrelas → 7 pontos
  - <3.0 estrelas → proporcional

**✅ Dado verificável**: Qualquer pessoa pode ver o rating no Google Maps

#### 1.2 Total de Avaliações (0-10 pontos)
- **Fonte**: Google Places API (`user_ratings_total`)
- **Dado Real**: Número total de reviews de usuários
- **Cálculo**:
  - 500+ avaliações → 10 pontos (presença digital excelente)
  - 200-499 → 8 pontos (boa presença)
  - 100-199 → 7 pontos (presença média)
  - 50-99 → 5 pontos (presença básica)
  - 20-49 → 3 pontos (presença inicial)
  - 10-19 → 2 pontos (muito baixo)
  - <10 → 0-1 pontos

**✅ Dado verificável**: Contagem pública no Google Maps

#### 1.3 Qualidade de Fotos - IA Vision (0-15 pontos)
- **Fonte**: Claude Vision AI analisando fotos do Google Places
- **Dados Reais Analisados**:
  - `qualidadeSinalizacao`: EXCELENTE, BOA, REGULAR, PRECÁRIA (baseado em fotos reais)
  - `presencaBranding`: true/false (logos/marcas visíveis nas fotos)
  - `nivelProfissionalizacao`: ALTO, MÉDIO, BAIXO (análise visual da estrutura)
  - `ambienteEstabelecimento`: MODERNO, TRADICIONAL, RÚSTICO, etc.

**✅ Não é inventado**: IA analisa fotos REAIS do Google Places (disponíveis publicamente)

#### 1.4 Horário de Funcionamento (0-10 pontos)
- **Fonte**: Google Places API (`opening_hours`)
- **Dados Reais**:
  - `diasAbertoPorSemana`: Quantos dias opera (0-7)
  - `tempoAbertoSemanal`: Total de horas abertas por semana

**✅ Dado verificável**: Horários públicos no Google Maps

#### 1.5 Presença Digital - Website (0-10 pontos)
- **Fonte**: Google Places API (`website`)
- **Dado Real**: URL do website oficial

**✅ Dado verificável**: Link público no Google Maps

#### 1.6 Densidade de Reviews (0-10 pontos)
- **Fonte**: Calculado a partir de dados reais
- **Fórmula**: `totalAvaliacoes / estimativa de meses de operação`
- **Nota**: Estimativa conservadora assume mínimo de 2 anos de operação

---

## 2. Sistema de Qualidade de Dados (Data Quality Score)

### O Que É Medido

O Data Quality Score mede a **completude e confiabilidade** dos dados coletados:

```javascript
{
  "dataQualityScore": 85,  // 0-100: % de campos importantes preenchidos
  "camposPreenchidos": 42,  // Total de campos com dados
  "camposCriticos": ["website", "telefone"],  // Campos importantes faltando
  "confiabilidadeDados": "ALTA",  // BAIXA, MÉDIA, ALTA, EXCELENTE
  "fontesValidadas": ["receita_federal", "google_places", "vision_ai"]
}
```

### Campos Críticos Verificados

1. **Dados da Receita Federal** (verificação oficial):
   - CNPJ válido
   - Razão Social
   - Situação cadastral (ATIVA/SUSPENSA/etc)
   - Endereço oficial

2. **Dados do Google Places** (presença digital):
   - Place ID verificado
   - Coordenadas geográficas
   - Rating e reviews
   - Fotos disponíveis

3. **Validações Cruzadas** (Vision AI):
   - Geocoding validado por múltiplas fontes
   - Normalização de endereço verificada
   - Nome do estabelecimento confirmado

**✅ Nenhum dado é assumido**: Se um campo está vazio, o score reflete isso honestamente

---

## 3. Sistema de Confiança (Vision AI)

### Validação Cruzada de Múltiplas Fontes

```javascript
{
  "confiancaGeral": 92,  // Score geral 0-100
  "confianciaCategoria": "EXCELENTE",  // Classificação qualitativa
  "necessitaRevisao": false,  // Se requer validação manual
  "alertasVisionAI": [  // Divergências detectadas
    "Endereço da Receita difere do Google Places em 12%"
  ]
}
```

### Como a Confiança É Calculada

1. **Geocoding Confiança** (`geocodingConfianca`):
   - Compara coordenadas de Google Geocoding vs Nearby Search vs Text Search
   - Se todas as fontes concordam (distância <50m) → confiança 100%
   - Se há divergência → calcula divergência máxima e reduz confiança

2. **Normalização Confiança** (`normalizacaoConfianca`):
   - Compara normalização por IA vs regex
   - Detecta potencial "alucinação" da IA
   - Se IA e regex concordam → confiança 100%

3. **Cross Validation** (`crossValidationConfianca`):
   - Valida Place ID via Nearby Search E Text Search
   - Se ambos retornam o mesmo Place ID → confiança 100%
   - Se há divergência → investiga qual é correto

**✅ Transparente**: Todos os alertas e divergências são registrados

---

## 4. Tipologia PepsiCo

### 76 Tipologias Oficiais

O sistema classifica estabelecimentos em uma das **76 tipologias oficiais da PepsiCo**, como:

- **F1-F6**: Supermercados (por número de check-outs)
- **G1-G9**: Restaurantes e food service
- **H1-H9**: Bares, cafés, padarias, hotéis
- **I1-I9**: Pequeno varejo (mercearias, açougues, etc)
- **J1-J9**: Conveniências e outros
- **K1-K9**: Atacado
- **L1-L9**: Serviços e eventos
- **M1-M9**: Lojas especializadas
- **N1-N4**: Postos e transportadoras

### Como É Classificado

A IA Claude analisa **TODOS os dados reais coletados**:
- Tipo do Google Places
- Nome do estabelecimento
- Razão social da Receita Federal
- Análise visual das fotos
- Rating e número de reviews
- Público-alvo identificado

**✅ Justificativa obrigatória**: Toda classificação vem com justificativa baseada em dados reais

---

## 5. Auditabilidade e Rastreabilidade

### Todos os Processos São Logados

Cada etapa do pipeline gera logs estruturados:

```javascript
{
  "correlationId": "uuid-único",
  "etapa": "TIPOLOGIA",
  "clienteId": "...",
  "timestamp": "2025-12-01T19:00:00Z",
  "dados": {
    "tipologiaAtribuida": "H3",
    "confianca": 95,
    "justificativa": "Estabelecimento 'PADARIA CENTER PAN', Google Places tipo 'Padaria Café', 654 avaliações 4.5/5..."
  }
}
```

### Performance Tracking

Sistema registra:
- Tempo de cada etapa
- APIs consultadas
- Custos de IA
- Taxa de sucesso/falha

**✅ Auditável**: Todo dado pode ser rastreado até sua fonte original

---

## 6. Resumo: Por Que os Dados São Confiáveis

| Tipo de Dado | Fonte | Verificável | Inventado? |
|--------------|-------|-------------|------------|
| Rating | Google Places API | ✅ Sim (Google Maps público) | ❌ Não |
| Total de Avaliações | Google Places API | ✅ Sim (Google Maps público) | ❌ Não |
| Coordenadas | Google Geocoding + Places | ✅ Sim (múltiplas fontes) | ❌ Não |
| CNPJ/Razão Social | Receita Federal API | ✅ Sim (governo oficial) | ❌ Não |
| Fotos | Google Places Photos | ✅ Sim (fotos públicas) | ❌ Não |
| Análise Visual | Claude Vision AI | ✅ Sim (analisa fotos reais) | ❌ Não |
| Horários | Google Places API | ✅ Sim (Google Maps público) | ❌ Não |
| Website | Google Places API | ✅ Sim (Google Maps público) | ❌ Não |
| Tipologia | IA + dados acima | ✅ Sim (justificativa obrigatória) | ❌ Não |

---

## 7. Limitações Conhecidas e Mitigações

### Limitação 1: Estimativa de Densidade de Reviews
- **Problema**: Não temos data exata de criação do estabelecimento
- **Mitigação**: Assume conservadoramente 2 anos mínimo
- **Impacto**: Subestima densidade (mais seguro que superestimar)

### Limitação 2: Fotos Podem Estar Desatualizadas
- **Problema**: Fotos do Google podem ter meses/anos
- **Mitigação**: IA detecta inconsistências e sinaliza baixa confiança
- **Impacto**: Campo `necessitaRevisao` indica quando validação manual é necessária

### Limitação 3: Horários Podem Mudar
- **Problema**: Estabelecimento pode ter alterado horários
- **Mitigação**: Dados têm timestamp de quando foram coletados
- **Impacto**: Recomenda-se atualização periódica

**✅ Honesto**: Sistema sinaliza suas limitações

---

## Conclusão

Este sistema foi projetado para **PRODUÇÃO** e **DECISÕES ESTRATÉGICAS**. Por isso:

1. ✅ **Nenhum dado é inventado** - tudo vem de fontes verificáveis
2. ✅ **Validação cruzada** - múltiplas fontes confirmam dados
3. ✅ **Transparência total** - logs e justificativas obrigatórias
4. ✅ **Auditável** - cada decisão pode ser rastreada
5. ✅ **Limitações conhecidas** - sistema é honesto sobre o que não sabe

O scoring e potencial refletem **presença digital real** e **dados oficiais** do estabelecimento, não estimativas ou suposições.
