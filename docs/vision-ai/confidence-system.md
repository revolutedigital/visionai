# 📊 Vision AI - Sistema de Confiança

**Versão**: 1.0.0
**Data**: Novembro 2025

---

## 📋 Índice

1. [O Que é o Sistema de Confiança?](#o-que-é-o-sistema-de-confiança)
2. [Como Funciona?](#como-funciona)
3. [Componentes e Pesos](#componentes-e-pesos)
4. [Categorias de Confiança](#categorias-de-confiança)
5. [Interpretação dos Scores](#interpretação-dos-scores)
6. [Exemplos Práticos](#exemplos-práticos)
7. [Dashboard e UI](#dashboard-e-ui)

---

## 🎯 O Que é o Sistema de Confiança?

O **Sistema de Confiança Universal** do Vision AI é um algoritmo que **agrega múltiplas validações** em um **score único de 0-100%**.

### **Objetivo**

Responder a pergunta:

> **"Quão confiáveis são os dados enriquecidos deste cliente?"**

### **Benefícios**

✅ **Priorização**: Revisar manualmente apenas clientes com baixa confiança
✅ **Auditoria**: Rastrear qualidade dos dados ao longo do tempo
✅ **Decisão**: Aprovar automaticamente clientes com confiança excelente
✅ **Melhoria**: Identificar quais componentes precisam de calibração

---

## 🔄 Como Funciona?

### **Fórmula**

```
Confiança Geral =
  (Geocoding × 25%) +
  (Normalização × 15%) +
  (Places × 35%) +
  (Receita Federal × 15%) +
  (Nome Fantasia × 10%)
```

### **Fluxo**

```
1. Cada componente retorna sua confiança (0-100%)
   ├─> Geocoding: 100% (alta concordância)
   ├─> Normalização: 100% (IA e Regex concordam)
   ├─> Places: 90% (Place IDs diferentes mas alta similaridade)
   ├─> Receita Federal: 100% (encontrado e ativo)
   └─> Nome Fantasia: 85% (similaridade alta)

2. Universal Confidence Service calcula score geral
   └─> (100×0.25) + (100×0.15) + (90×0.35) + (100×0.15) + (85×0.10)
   └─> 25 + 15 + 31.5 + 15 + 8.5 = 95%

3. Determina categoria baseado no score
   └─> 95% → EXCELENTE ✅

4. Gera alertas e recomendações
   └─> Nenhum alerta (score > 90%)
```

---

## 🧩 Componentes e Pesos

### **1. Geocoding (25% do peso)**

**O que valida**: Coordenadas geográficas

**Fontes comparadas**:
- Google Geocoding API (pago, preciso)
- Nominatim/OpenStreetMap (grátis)
- Google Places (se disponível)

**Como calcular confiança**:

| Divergência | Confiança | Significado |
|-------------|-----------|-------------|
| < 50m | 100% | ✅ Todas as fontes concordam |
| 50-200m | 75% | ⚠️ Concordância moderada |
| > 200m | 50% | ❌ Alta divergência (ALERTA!) |

**Por que 25%?**
- Coordenadas são críticas para busca no Google Places
- Erros de geocoding causam fotos de lugares errados
- Mas podem ser validadas visualmente depois

**Exemplo**:
```
Google: -23.5505, -46.6333
Nominatim: -23.5508, -46.6335
Divergência: 45m
→ Confiança: 100%
→ Contribuição: 100 × 0.25 = 25 pontos
```

---

### **2. Normalização (15% do peso)**

**O que valida**: Endereço normalizado (sem abreviações)

**Fontes comparadas**:
- Claude IA (pago, inteligente)
- Regex Local (grátis, regras fixas)

**Como calcular confiança**:

| Similaridade IA vs Regex | Confiança | Significado |
|--------------------------|-----------|-------------|
| > 90% | 100% | ✅ IA e Regex concordam |
| 70-90% | 80% | ⚠️ Concordância moderada |
| < 70% | 60% | ❌ IA pode ter alucinado |

**Por que 15%?**
- Normalização é importante mas não crítica
- Erros de normalização não afetam tanto o resultado final
- Endereço original ainda está disponível

**Exemplo**:
```
IA: "Rua São João, Número 123, Apartamento 45"
Regex: "Rua São João, Número 123, Apartamento 45"
Similaridade: 100%
→ Confiança: 100%
→ Contribuição: 100 × 0.15 = 15 pontos
```

---

### **3. Places (35% do peso)**

**O que valida**: Match do Google Places

**Fontes comparadas**:
- Nearby Search (busca por coordenadas)
- Text Search (busca por texto)

**Como calcular confiança**:

| Situação | Confiança | Significado |
|----------|-----------|-------------|
| Mesmo Place ID | 100% | ✅ Perfeito! |
| Place ID diferente, alta similaridade | 90% | ✅ Muito bom |
| Apenas nome bate | 75% | ⚠️ Possível |
| Apenas endereço bate | 70% | ⚠️ Possível |
| Alta divergência | 50% | ❌ ALERTA! |

**Por que 35%?**
- **Componente mais importante!**
- Places fornece fotos, reviews, rating, horário
- Erro aqui significa dados de outro estabelecimento
- Impacto direto na qualidade final

**Exemplo**:
```
Nearby Search: place_id = "ChIJ123..."
Text Search: place_id = "ChIJ123..." (MESMO!)
→ Confiança: 100%
→ Contribuição: 100 × 0.35 = 35 pontos
```

---

### **4. Receita Federal (15% do peso)**

**O que valida**: CNPJ existe e está ativo

**Fontes**:
- API Receita Federal

**Como calcular confiança**:

| Situação | Confiança | Significado |
|----------|-----------|-------------|
| Encontrado e ATIVO | 100% | ✅ Perfeito |
| Encontrado mas INATIVO | 50% | ⚠️ Empresa inativa |
| Não encontrado | 0% | ❌ CNPJ inválido |

**Por que 15%?**
- Valida existência legal do cliente
- CNPJ inválido é red flag
- Mas não afeta dados de Places/Fotos

**Exemplo**:
```
CNPJ: 12.345.678/0001-90
Status: ATIVA
→ Confiança: 100%
→ Contribuição: 100 × 0.15 = 15 pontos
```

---

### **5. Nome Fantasia (10% do peso)**

**O que valida**: Nome do cliente bate com Google Places

**Fontes comparadas**:
- Nome na planilha CSV
- Nome Fantasia da Receita
- Nome no Google Places

**Como calcular confiança**:

| Similaridade | Confiança | Significado |
|--------------|-----------|-------------|
| > 80% | 100% | ✅ Nomes muito similares |
| 70-80% | 80% | ⚠️ Similaridade moderada |
| < 70% | 60% | ❌ Nomes divergem |

**Por que 10%?**
- Peso menor pois nomes podem variar legitimamente
- Ex: "Padaria Central" vs "Padaria e Confeitaria Central"
- Não afeta tanto a qualidade final

**Exemplo**:
```
CSV: "PADARIA CENTRAL"
Receita: "PADARIA CENTRAL LTDA"
Places: "Padaria Central"
Similaridade: 95%
→ Confiança: 100%
→ Contribuição: 100 × 0.10 = 10 pontos
```

---

## 📊 Categorias de Confiança

### **EXCELENTE (90-100%)** ✅

**Significado**: Dados altamente confiáveis

**Ação recomendada**:
- ✅ Aprovar automaticamente
- ✅ Não necessita revisão manual
- ✅ Pronto para uso

**Características**:
- Todas as fontes concordam
- Sem divergências significativas
- Sem alertas

**Exemplo**:
```
Geocoding: 100%
Normalização: 100%
Places: 100%
Receita: 100%
Nome: 100%
→ Geral: 100% (EXCELENTE)
```

---

### **BOA (70-89%)** ⚠️

**Significado**: Dados confiáveis com pequenas divergências

**Ação recomendada**:
- ⚠️ Revisão rápida recomendada
- ✅ Pode ser aprovado com validação leve
- ⚠️ Verificar alertas

**Características**:
- Maioria das fontes concorda
- Divergências moderadas em 1-2 componentes
- Poucos alertas

**Exemplo**:
```
Geocoding: 75% (divergência 150m)
Normalização: 100%
Places: 90% (Place IDs diferentes)
Receita: 100%
Nome: 85%
→ Geral: 87% (BOA)
```

---

### **MÉDIA (50-69%)** ⚠️⚠️

**Significado**: Dados com divergências significativas

**Ação recomendada**:
- ⚠️⚠️ Revisão manual obrigatória
- ❌ Não aprovar automaticamente
- 🔍 Investigar divergências

**Características**:
- Várias fontes divergem
- Alertas importantes
- Possíveis erros

**Exemplo**:
```
Geocoding: 50% (divergência 300m!)
Normalização: 60% (alucinação detectada)
Places: 75%
Receita: 100%
Nome: 70%
→ Geral: 65% (MÉDIA)
```

---

### **BAIXA (0-49%)** ❌

**Significado**: Dados não confiáveis

**Ação recomendada**:
- ❌ BLOQUEIO AUTOMÁTICO
- 🚨 Revisão manual urgente
- 🔄 Reprocessar se possível

**Características**:
- Múltiplas fontes divergem fortemente
- Vários alertas críticos
- Dados provavelmente incorretos

**Exemplo**:
```
Geocoding: 50% (divergência 500m!)
Normalização: 60% (alucinação)
Places: 50% (alta divergência)
Receita: 0% (CNPJ não encontrado!)
Nome: 60%
→ Geral: 48% (BAIXA)
```

---

## 🔍 Interpretação dos Scores

### **Scores de Componentes Individuais**

Cada componente também tem seu próprio score 0-100%:

```typescript
cliente.geocodingConfianca = 75
cliente.normalizacaoConfianca = 100
cliente.crossValidationConfianca = 90
cliente.confiancaGeral = 87
```

### **Análise de Divergências**

Se score baixo, verificar:

1. **Qual componente está baixo?**
   - `geocodingConfianca < 75` → Coordenadas divergem
   - `normalizacaoConfianca < 80` → IA vs Regex divergem
   - `crossValidationConfianca < 75` → Nearby vs Text divergem

2. **Por que está baixo?**
   - Verificar `geocodingDivergencias` (JSON)
   - Verificar `crossValidationDivergencias` (JSON)
   - Verificar `alertasVisionAI` (JSON)

3. **O que fazer?**
   - Verificar `recomendacoesVisionAI` (JSON)
   - Ex: "Validar coordenadas manualmente no Google Maps"

---

## 📋 Exemplos Práticos

### **Exemplo 1: Cliente Perfeito**

```json
{
  "nome": "PADARIA CENTRAL",
  "geocodingConfianca": 100,
  "geocodingFonte": "consenso",
  "normalizacaoConfianca": 100,
  "normalizacaoFonte": "consenso",
  "crossValidationConfianca": 100,
  "crossValidationMetodo": "ambos_iguais",
  "confiancaGeral": 100,
  "confianciaCategoria": "EXCELENTE",
  "necessitaRevisao": false,
  "alertasVisionAI": [],
  "recomendacoesVisionAI": []
}
```

**Interpretação**:
- ✅ Todas as fontes concordam 100%
- ✅ Sem divergências
- ✅ Pronto para aprovação automática

---

### **Exemplo 2: Cliente com Alucinação da IA**

```json
{
  "nome": "BAR DO ZÉ",
  "geocodingConfianca": 100,
  "normalizacaoConfianca": 60,
  "normalizacaoFonte": "regex",
  "normalizacaoAlucinacao": true,
  "crossValidationConfianca": 90,
  "confiancaGeral": 82,
  "confianciaCategoria": "BOA",
  "necessitaRevisao": false,
  "alertasVisionAI": [
    "⚠️  Alucinação da IA detectada na normalização",
    "   Similaridade IA vs Regex: 65%"
  ],
  "recomendacoesVisionAI": [
    "Validar endereço normalizado manualmente"
  ]
}
```

**Interpretação**:
- ⚠️ IA alucinada detectada
- ✅ Regex foi usado (seguro)
- ⚠️ Recomenda validação mas não bloqueia

---

### **Exemplo 3: Cliente com Geocoding Ruim**

```json
{
  "nome": "LANCHONETE CENTRAL",
  "geocodingConfianca": 50,
  "geocodingDivergenciaMaxima": 450.5,
  "geocodingDivergencias": [
    "⚠️  ALTA DIVERGÊNCIA: 451m entre fontes",
    "Google: -23.5505, -46.6333",
    "Nominatim: -23.5545, -46.6380"
  ],
  "normalizacaoConfianca": 100,
  "crossValidationConfianca": 75,
  "confiancaGeral": 68,
  "confianciaCategoria": "MÉDIA",
  "necessitaRevisao": true,
  "alertasVisionAI": [
    "⚠️  Geocoding com baixa confiança (50%)",
    "   Divergência: 451m entre fontes"
  ],
  "recomendacoesVisionAI": [
    "Validar coordenadas manualmente no Google Maps"
  ]
}
```

**Interpretação**:
- ❌ Coordenadas divergem muito (450m)
- ⚠️ Pode ter geocodificado lugar errado
- 🚨 Necessita revisão manual obrigatória

---

### **Exemplo 4: CNPJ Inválido**

```json
{
  "nome": "EMPRESA FANTASMA",
  "geocodingConfianca": 100,
  "normalizacaoConfianca": 100,
  "crossValidationConfianca": 90,
  "receitaStatus": "FALHA",
  "confiancaGeral": 42,
  "confianciaCategoria": "BAIXA",
  "necessitaRevisao": true,
  "alertasVisionAI": [
    "❌ CNPJ não encontrado na Receita Federal",
    "❌ CONFIANÇA BAIXA - Revisão manual obrigatória"
  ],
  "recomendacoesVisionAI": [
    "Validar CNPJ manualmente",
    "❌ Dados necessitam revisão manual urgente"
  ]
}
```

**Interpretação**:
- ❌ CNPJ não existe na Receita
- 🚨 Bloqueio automático
- ⚠️ Pode ser fraude ou erro de digitação

---

## 🎨 Dashboard e UI

### **Indicadores Visuais**

```
EXCELENTE (90-100%) → Badge verde ✅
BOA (70-89%)        → Badge amarelo ⚠️
MÉDIA (50-69%)      → Badge laranja ⚠️⚠️
BAIXA (0-49%)       → Badge vermelho ❌
```

### **Filtros Recomendados**

```typescript
// Apenas clientes excelentes
WHERE confianciaGeral >= 90

// Necessitam revisão
WHERE necessitaRevisao = true

// Por categoria
WHERE confianciaCategoria = 'EXCELENTE'

// Com alertas
WHERE alertasVisionAI IS NOT NULL AND alertasVisionAI != '[]'
```

### **Cards de Resumo**

```
┌─────────────────────────────┐
│ 📊 Confiança Geral: 95%     │
│ ✅ Categoria: EXCELENTE      │
│                             │
│ 📍 Geocoding: 100%          │
│ 📝 Normalização: 100%       │
│ 🏢 Places: 90%              │
│ 📋 Receita: 100%            │
│ 🏷️  Nome: 100%              │
│                             │
│ ✅ Não necessita revisão    │
└─────────────────────────────┘
```

---

## 🔧 Calibração de Pesos

### **Como Ajustar Pesos?**

Se detectar que um componente é mais/menos importante:

1. Editar `universal-confidence.service.ts`:

```typescript
private readonly PESOS = {
  geocoding: 25,      // Ajustar aqui
  normalizacao: 15,   // Ajustar aqui
  places: 35,         // Ajustar aqui
  receitaFederal: 15, // Ajustar aqui
  nomeFantasia: 10,   // Ajustar aqui
};
```

2. Garantir que soma = 100%
3. Reprocessar clientes existentes

### **Sugestões de Calibração**

- Se muitos **falsos positivos** (confiança alta mas dados ruins):
  - Aumentar peso do componente problemático
  - Ex: Se Places ruins passam → aumentar peso de Places

- Se muitos **falsos negativos** (confiança baixa mas dados bons):
  - Diminuir peso do componente muito restritivo
  - Ex: Se normalizacaoAlucinacao bloqueia muito → diminuir peso

---

## 📚 Referências

- [architecture.md](architecture.md) - Arquitetura completa
- [cross-validation.md](cross-validation.md) - Validações cruzadas
- [troubleshooting.md](troubleshooting.md) - Solução de problemas

---

**Desenvolvido com ❤️ para Pepsi**
**Powered by Claude AI & Vision AI**
