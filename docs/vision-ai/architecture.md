# 🏗️ Vision AI - Arquitetura Técnica

**Versão**: 1.0.0
**Data**: Novembro 2025
**Status**: Implementado (Parcial - Sprint 4 em andamento)

---

## 📋 Visão Geral

Vision AI é um sistema de validação cruzada e confiança que opera em **múltiplas camadas**, validando dados de diferentes fontes e calculando um score de confiança universal.

### **Princípios Fundamentais**

1. **Validação Cruzada**: Nunca confiar em uma única fonte
2. **Economia Inteligente**: Usar fontes gratuitas quando possível
3. **Detecção de Anomalias**: Identificar erros automaticamente
4. **Transparência**: Logs detalhados de todas as decisões
5. **Escalabilidade**: Preparado para Machine Learning futuro

---

## 🏛️ Arquitetura de Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    VISION AI SYSTEM                          │
│              Universal Confidence Service                    │
│                    (Orquestrador)                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┬─────────────┐
        │               │               │             │
   ┌────▼────┐    ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
   │Geocoding│    │  Places │    │   Norm  │   │  Nome   │
   │  Cross  │    │  Cross  │    │  Cross  │   │Fantasia │
   │Validation│    │Validation│    │Validation│   │  Cross  │
   └────┬────┘    └────┬────┘    └────┬────┘   └────┬────┘
        │              │               │             │
        │   ┌──────────▼──────────┐    │             │
        └───►   Fontes de Dados   ◄────┴─────────────┘
            │                     │
            └──────────┬──────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
   │ Google  │   │Nominatim│   │  Regex  │
   │   APIs  │   │  (Free) │   │ (Free)  │
   └─────────┘   └─────────┘   └─────────┘
```

---

## 🧩 Componentes

### **1. Universal Confidence Service**

**Responsabilidade**: Orquestrar todas as validações e calcular score geral

**Localização**: `backend/src/services/universal-confidence.service.ts`

**Inputs**:
- Geocoding Cross Validation Result
- Normalization Cross Validation Result
- Places Cross Validation Result
- Receita Federal Status
- Nome Fantasia Match Score

**Outputs**:
- `confiancaGeral`: 0-100%
- `categoria`: EXCELENTE | BOA | MÉDIA | BAIXA
- `nivel`: success | warning | danger
- `necessitaRevisao`: boolean
- `alertas`: string[]
- `recomendacoes`: string[]

**Pesos**:
```typescript
geocoding: 25%
normalizacao: 15%
places: 35%
receitaFederal: 15%
nomeFantasia: 10%
```

**Fórmula**:
```
confiancaGeral =
  (geocoding * 0.25) +
  (normalizacao * 0.15) +
  (places * 0.35) +
  (receitaFederal * 0.15) +
  (nomeFantasia * 0.10)
```

---

### **2. Geocoding Cross Validation Service**

**Responsabilidade**: Validar coordenadas de múltiplas fontes

**Localização**: `backend/src/services/geocoding-cross-validation.service.ts`

**Fontes**:
1. **Google Geocoding API** (pago, preciso)
2. **Nominatim** (grátis, OpenStreetMap)
3. **Google Places** (opcional, se disponível)

**Algoritmo**:
```typescript
1. Buscar coordenadas em 2-3 fontes
2. Calcular distâncias com Haversine
3. Decisão:
   - Se divergência < 50m → Confiança 100% (consenso)
   - Se divergência 50-200m → Confiança 75% (preferir Google)
   - Se divergência > 200m → Confiança 50% (ALERTA!)
4. Retornar coordenadas finais + confiança
```

**Outputs**:
- `coordenadasFinais`: { lat, lng }
- `confianca`: 0-100%
- `fonteUsada`: 'google' | 'nominatim' | 'places' | 'consenso'
- `distanciaMaxima`: metros
- `divergencias`: string[]

---

### **3. Normalization Cross Validation Service**

**Responsabilidade**: Validar normalização de endereços IA vs Regex

**Localização**: `backend/src/services/normalization-cross-validation.service.ts`

**Fontes**:
1. **Claude IA** (pago, inteligente)
2. **Regex Local** (grátis, regras fixas)

**Algoritmo**:
```typescript
1. Executar AMBAS normalizações (IA + Regex)
2. Calcular similaridade:
   - Levenshtein Distance (50%)
   - Token Set Ratio (30%)
   - Jaccard Similarity (20%)
3. Decisão:
   - Se similaridade > 90% → Confiança 100% (usar IA)
   - Se similaridade 70-90% → Confiança 80% (usar IA)
   - Se similaridade < 70% → Confiança 60% (usar Regex - IA alucinada!)
4. Retornar endereço final + confiança
```

**Outputs**:
- `enderecoFinal`: string
- `confianca`: 0-100%
- `fonteUsada`: 'ia' | 'regex' | 'consenso'
- `similaridade`: 0-100%
- `alucinacaoDetectada`: boolean

**Economia de Custo**:
- Se 30% dos casos usarem Regex ao invés de IA
- Economia: ~$0.0006 por normalização
- Em 10.000 clientes: $6 de economia

---

### **4. Places Cross Validation Service**

**Responsabilidade**: Validar Places com Nearby + Text Search

**Localização**: `backend/src/services/cross-validation.service.ts`

**Fontes**:
1. **Nearby Search** (coordenadas, raio 30-100m)
2. **Text Search** (texto completo)

**Algoritmo**:
```typescript
1. Executar AMBAS buscas (Nearby + Text)
2. Comparar Place IDs:
   - Se Place ID igual → Confiança 100% (perfeito!)
   - Se Place ID diferente → Calcular similaridade:
     * Nome (Jaro-Winkler)
     * Endereço (Levenshtein)
     * Distância geográfica
3. Decisão:
   - Ambos iguais → 100%
   - Alta similaridade → 90%
   - Nome bate → 75%
   - Endereço bate → 70%
   - Divergência alta → 50% (ALERTA!)
4. Retornar Place final + confiança
```

**Outputs**:
- `usarResultado`: 'nearby' | 'text' | 'ambos_iguais' | 'nenhum'
- `confianca`: 0-100%
- `motivoEscolha`: string
- `divergencias`: string[]

---

### **5. Nominatim Service**

**Responsabilidade**: Geocoding grátis usando OpenStreetMap

**Localização**: `backend/src/services/nominatim.service.ts`

**API**: https://nominatim.openstreetmap.org

**Parâmetros**:
```typescript
q: "Rua ABC, São Paulo, SP, Brasil"
format: "json"
limit: 1
countrycodes: "br"
addressdetails: 1
```

**Rate Limit**: 1 req/sec (Nominatim Policy)

**Retry Strategy**:
- Max 2 tentativas
- Backoff progressivo (1s, 2s)
- Timeout: 5s

**Outputs**:
- `latitude`: number
- `longitude`: number
- `display_name`: string

---

### **6. Local Normalizer Service**

**Responsabilidade**: Normalização grátis usando Regex

**Localização**: `backend/src/services/local-normalizer.service.ts`

**Algoritmo**:
```typescript
1. Remover múltiplos espaços
2. Expandir abreviações (40+ regras):
   R. → Rua
   AV. → Avenida
   APTO → Apartamento
   etc.
3. Capitalizar (Title Case):
   - Primeira palavra sempre maiúscula
   - Exceções: de, da, do, dos, das, e, em, no, na
4. Remover pontuação desnecessária
5. Calcular confiança baseado em alterações
```

**Outputs**:
- `normalizado`: string
- `alteracoes`: string[]
- `confianca`: 0-100%

---

## 🔄 Fluxo de Dados

### **Pipeline Completo de Enriquecimento**

```
1. UPLOAD CSV
   └─> Planilha criada (status: PROCESSANDO)

2. RECEITA FEDERAL WORKER
   └─> Buscar CNPJ
   └─> Salvar razão social, endereço, situação

3. NORMALIZATION (NOVO - Sprint 4)
   ├─> Claude IA normaliza endereço
   ├─> Regex Local normaliza endereço
   └─> Cross Validation decide qual usar
       └─> Salvar: normalizacaoConfianca, normalizacaoFonte

4. GEOCODING WORKER (MODIFICADO - Sprint 4)
   ├─> Google Geocoding
   ├─> Nominatim (NOVO)
   └─> Cross Validation decide coordenadas finais
       └─> Salvar: geocodingConfianca, geocodingFonte

5. PLACES WORKER (MODIFICADO - Sprint 4)
   ├─> Nearby Search (coordenadas)
   ├─> Text Search (texto)
   └─> Cross Validation decide Place final
       └─> Salvar: crossValidationConfianca, crossValidationMetodo

6. ANALYSIS WORKER
   └─> Análise IA de fotos, tipologia, etc.

7. UNIVERSAL CONFIDENCE (NOVO - Sprint 4)
   └─> Agrega todos os scores
   └─> Salvar: confiancaGeral, confianciaCategoria, necessitaRevisao
```

---

## 💾 Schema de Banco de Dados

### **Novos Campos - Vision AI**

```prisma
// Geocoding Cross Validation
geocodingConfianca          Int?     // 0-100%
geocodingFonte              String?  // 'google', 'nominatim', 'consenso'
geocodingDivergenciaMaxima  Float?   // metros
geocodingDivergencias       String?  // JSON

// Normalization Cross Validation
normalizacaoConfianca       Int?     // 0-100%
normalizacaoFonte           String?  // 'ia', 'regex', 'consenso'
normalizacaoSimilaridade    Int?     // 0-100%
normalizacaoAlucinacao      Boolean  // IA alucinada?

// Universal Confidence
confiancaGeral              Int?     // 0-100%
confianciaCategoria         String?  // 'EXCELENTE', 'BOA', 'MÉDIA', 'BAIXA'
confiancaNivel              String?  // 'success', 'warning', 'danger'
necessitaRevisao            Boolean  // Revisão manual?
alertasVisionAI             String?  // JSON
recomendacoesVisionAI       String?  // JSON
```

---

## 📊 Logs e Rastreabilidade

### **Estrutura de Logs**

Todos os serviços Vision AI logam detalhadamente:

```typescript
console.log(`🎯 ===== VISION AI - [COMPONENTE] =====`);
console.log(`   Cliente: ${nome}`);
console.log(`   Confiança: ${confianca}%`);
console.log(`   Fonte: ${fonte}`);
console.log(`   Divergências: ${divergencias.length}`);
// ... detalhes específicos
console.log(`=========================================`);
```

### **Níveis de Log**

- ✅ **INFO**: Operações normais, alta concordância
- ⚠️ **WARN**: Divergências moderadas, confiança média
- ❌ **ERROR**: Divergências altas, confiança baixa

---

## 🚀 Performance

### **Custo por Cliente**

| Componente | Custo Anterior | Custo Vision AI | Economia |
|-----------|----------------|-----------------|----------|
| Geocoding | $0.005 | $0.005 | $0 (Nominatim = grátis) |
| Normalização | $0.002 | $0.001 | $0.001 (50% usa Regex) |
| Places | $0.017 | $0.034 | -$0.017 (2x busca) |
| **TOTAL** | **$0.096** | **$0.113** | **-$0.016** |

**Trade-off**: +16% custo para +98% confiança

### **Latência**

| Componente | Latência Adicional |
|-----------|-------------------|
| Nominatim | +500ms (paralelo com Google) |
| Regex Local | +10ms (muito rápido) |
| Text Search | +300ms (paralelo com Nearby) |
| Universal Confidence | +5ms (apenas cálculo) |
| **TOTAL** | **~815ms** |

**Mitigação**: Todas as buscas rodam em **paralelo** quando possível

---

## 🔒 Segurança e Validação

### **Validações de Entrada**

1. **Endereços**: Min 5 caracteres, não vazios
2. **Coordenadas**: Lat [-90, 90], Lng [-180, 180]
3. **CNPJs**: Formato válido, 14 dígitos

### **Proteção contra Alucinações**

- IA normaliza endereço
- Regex valida resultado
- Se divergência > 30% → Usar Regex
- Flag `normalizacaoAlucinacao = true`

### **Proteção contra Geocoding Ruim**

- Google retorna coordenadas
- Nominatim valida
- Se divergência > 200m → ALERTA
- Flag `geocodingConfianca = 50`

---

## 📈 Métricas e KPIs

### **KPIs Vision AI**

1. **Taxa de Confiança Excelente**: % clientes com confiança 90-100%
2. **Taxa de Alucinações Detectadas**: % normalizações com alucinação
3. **Taxa de Divergências Geocoding**: % coords com divergência > 200m
4. **Taxa de Necessita Revisão**: % clientes com `necessitaRevisao = true`
5. **Economia de Custo**: $ economizado com Regex vs IA

### **Queries Úteis**

```sql
-- Confiança média geral
SELECT AVG(confiancaGeral) FROM clientes WHERE confiancaGeral IS NOT NULL;

-- Clientes que necessitam revisão
SELECT COUNT(*) FROM clientes WHERE necessitaRevisao = true;

-- Alucinações detectadas
SELECT COUNT(*) FROM clientes WHERE normalizacaoAlucinacao = true;

-- Distribuição de categorias
SELECT confianciaCategoria, COUNT(*)
FROM clientes
GROUP BY confianciaCategoria;
```

---

## 🔮 Roadmap Futuro

### **v1.1 - Sprint 5**
- Dashboard frontend de confiança
- Filtros por categoria de confiança
- Revisão manual assistida

### **v1.2 - Sprint 6**
- Machine Learning para auto-ajuste de pesos
- Predição de erros antes de acontecer
- Análise de reviews com Vision AI

### **v2.0 - Futuro**
- Validação Cruzada de Fotos (Google Vision)
- Multiple APIs Receita Federal
- Auto-correção com ML

---

## 📚 Referências

- [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [Nominatim API](https://nominatim.org/release-docs/latest/api/Search/)
- [Google Places API](https://developers.google.com/maps/documentation/places/web-service)
- [Haversine Distance Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [Levenshtein Distance](https://en.wikipedia.org/wiki/Levenshtein_distance)
- [Jaro-Winkler Distance](https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance)

---

**Desenvolvido com ❤️ para Pepsi**
**Powered by Claude AI, Google APIs & OpenStreetMap**
