# 🎯 Sprint 4 - Sistema de Confiança Universal & Vision AI

**Início**: 15 de Novembro de 2025
**Duração**: 2 semanas
**Objetivo**: Implementar validação cruzada em TODAS as etapas + Sistema de Confiança Universal

---

## 📋 Resumo Executivo

### **O Que é Vision AI?**

**Vision AI** é o algoritmo proprietário de validação cruzada e confiança desenvolvido para o sistema de enriquecimento de dados da Pepsi. Ele combina:

1. **Validação Cruzada**: Múltiplas fontes para cada dado
2. **Sistema de Confiança**: Score 0-100% em todas as etapas
3. **Detecção de Anomalias**: Identificação automática de erros
4. **Otimização de Custos**: Fontes gratuitas quando possível

---

## 🎯 Objetivos do Sprint 4

| Objetivo | Impacto | Custo | Prioridade |
|----------|---------|-------|------------|
| Validação Cruzada - Geocoding | Alto | $0 (grátis) | 🔴 CRÍTICA |
| Validação Cruzada - Normalização | Alto | $0 (grátis) | 🔴 CRÍTICA |
| Validação Cruzada - Nome Fantasia | Médio | $0 | 🔴 CRÍTICA |
| Sistema de Confiança Universal | Alto | $0 | 🔴 CRÍTICA |
| Dashboard de Confiança | Médio | $0 | 🟡 ALTA |
| Documentação Vision AI | Alto | $0 | 🟡 ALTA |

---

## 📅 Cronograma

### **Semana 1: Validações Cruzadas**

#### **Dia 1-2: Geocoding**
- [ ] Integrar Nominatim API (OpenStreetMap)
- [ ] Criar serviço de validação cruzada de coordenadas
- [ ] Comparar Google vs Nominatim vs Places
- [ ] Sistema de confiança 0-100%
- [ ] Migrations no banco
- [ ] Testes unitários + integração

#### **Dia 3-4: Normalização de Endereço**
- [ ] Criar normalizador local (Regex + Dicionário)
- [ ] Validação cruzada: IA vs Regex
- [ ] Detectar alucinações da IA
- [ ] Economia de custo (~50%)
- [ ] Migrations no banco
- [ ] Testes

#### **Dia 5: Nome Fantasia**
- [ ] Validação cruzada: Receita vs Google vs CSV
- [ ] Sistema de confiança
- [ ] Escolha inteligente do nome a usar
- [ ] Migrations
- [ ] Testes

---

### **Semana 2: Sistema Universal + Documentação**

#### **Dia 6-7: Sistema de Confiança Universal**
- [ ] Criar `UniversalConfidenceService`
- [ ] Integrar todas as validações
- [ ] Logs estruturados
- [ ] Métricas agregadas
- [ ] Dashboard endpoint

#### **Dia 8-9: Documentação Vision AI**
- [ ] Arquitetura completa
- [ ] Fluxogramas de decisão
- [ ] Exemplos de uso
- [ ] Guia de troubleshooting
- [ ] API docs

#### **Dia 10: Testes E2E + Deploy**
- [ ] Testes end-to-end completos
- [ ] Performance benchmarks
- [ ] Deploy em staging
- [ ] Validação em produção

---

## 🏗️ Arquitetura Vision AI

```
┌─────────────────────────────────────────────────────────────┐
│                      Vision AI System                        │
│                   Sistema de Confiança Universal             │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼──────┐ ┌───▼────┐ ┌──────▼──────┐
        │  Geocoding   │ │ Places │ │ Normalização│
        │  Validation  │ │Validation│ │  Validation │
        └──────┬───────┘ └────┬───┘ └──────┬──────┘
               │              │             │
        ┌──────▼──────────────▼─────────────▼──────┐
        │   Universal Confidence Service           │
        │   - Score 0-100% por campo               │
        │   - Detecção de anomalias                │
        │   - Logs estruturados                    │
        └──────────────────┬───────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Database   │
                    │  + Metrics  │
                    └─────────────┘
```

---

## 📦 Entregas Detalhadas

### **1. Validação Cruzada - Geocoding**

#### **1.1 Integração Nominatim**

**Arquivo**: `/backend/src/services/nominatim.service.ts`

```typescript
export class NominatimService {
  private baseUrl = 'https://nominatim.openstreetmap.org';

  /**
   * Geocodifica endereço usando OpenStreetMap (GRÁTIS)
   */
  async geocode(endereco: string, cidade: string, estado: string): Promise<{
    latitude: number;
    longitude: number;
    display_name: string;
  }> {
    const query = `${endereco}, ${cidade}, ${estado}, Brasil`;

    const response = await axios.get(`${this.baseUrl}/search`, {
      params: {
        q: query,
        format: 'json',
        limit: 1,
        countrycodes: 'br',
      },
      headers: {
        'User-Agent': 'VisionAI/1.0', // Nominatim requer User-Agent
      },
    });

    if (response.data.length === 0) {
      throw new Error('Nenhum resultado encontrado no Nominatim');
    }

    const result = response.data[0];
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      display_name: result.display_name,
    };
  }
}
```

#### **1.2 Serviço de Validação Cruzada**

**Arquivo**: `/backend/src/services/geocoding-cross-validation.service.ts`

```typescript
export interface GeocodingCrossValidation {
  coordenadasFinais: { lat: number; lng: number };
  confianca: number; // 0-100%
  fonteUsada: 'google' | 'nominatim' | 'places' | 'consenso';
  divergencias: {
    googleCoords?: { lat: number; lng: number };
    nominatimCoords?: { lat: number; lng: number };
    placesCoords?: { lat: number; lng: number };
    distanciaMaxima: number; // em metros
  };
}

export class GeocodingCrossValidationService {
  /**
   * Valida coordenadas de múltiplas fontes
   */
  async validateCoordinates(
    googleResult: { lat: number; lng: number } | null,
    nominatimResult: { lat: number; lng: number } | null,
    placesResult?: { lat: number; lng: number } | null
  ): Promise<GeocodingCrossValidation> {

    const coords: Array<{ lat: number; lng: number; fonte: string }> = [];

    if (googleResult) coords.push({ ...googleResult, fonte: 'google' });
    if (nominatimResult) coords.push({ ...nominatimResult, fonte: 'nominatim' });
    if (placesResult) coords.push({ ...placesResult, fonte: 'places' });

    if (coords.length === 0) {
      throw new Error('Nenhuma fonte retornou coordenadas');
    }

    // Calcular distâncias entre todas as fontes
    const distances = this.calculateDistances(coords);
    const maxDistance = Math.max(...distances);

    // Decisão baseada em concordância
    if (maxDistance < 50) {
      // Todas concordam (< 50m) → ALTA CONFIANÇA
      const avgLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
      const avgLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;

      return {
        coordenadasFinais: { lat: avgLat, lng: avgLng },
        confianca: 100,
        fonteUsada: 'consenso',
        divergencias: {
          googleCoords: googleResult || undefined,
          nominatimCoords: nominatimResult || undefined,
          placesCoords: placesResult || undefined,
          distanciaMaxima: maxDistance,
        },
      };
    }
    else if (maxDistance < 200) {
      // Divergência média (50-200m) → MÉDIA CONFIANÇA
      // Usar Google como padrão (mais confiável)
      return {
        coordenadasFinais: googleResult || coords[0],
        confianca: 75,
        fonteUsada: 'google',
        divergencias: {
          googleCoords: googleResult || undefined,
          nominatimCoords: nominatimResult || undefined,
          placesCoords: placesResult || undefined,
          distanciaMaxima: maxDistance,
        },
      };
    }
    else {
      // Alta divergência (> 200m) → BAIXA CONFIANÇA
      console.error(`⚠️  ALERTA: Alta divergência entre fontes de geocoding (${maxDistance.toFixed(0)}m)`);

      return {
        coordenadasFinais: googleResult || coords[0],
        confianca: 50,
        fonteUsada: 'google',
        divergencias: {
          googleCoords: googleResult || undefined,
          nominatimCoords: nominatimResult || undefined,
          placesCoords: placesResult || undefined,
          distanciaMaxima: maxDistance,
        },
      };
    }
  }

  /**
   * Calcula distâncias entre coordenadas usando Haversine
   */
  private calculateDistances(coords: Array<{ lat: number; lng: number }>): number[] {
    const distances: number[] = [];

    for (let i = 0; i < coords.length; i++) {
      for (let j = i + 1; j < coords.length; j++) {
        const dist = this.haversineDistance(
          coords[i].lat,
          coords[i].lng,
          coords[j].lat,
          coords[j].lng
        );
        distances.push(dist);
      }
    }

    return distances;
  }

  /**
   * Fórmula de Haversine para calcular distância entre coordenadas
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
}
```

#### **1.3 Integração no Worker**

**Arquivo**: `/backend/src/workers/geocoding.worker.ts`

```typescript
// ADICIONAR no processamento:

// Buscar com Google (atual)
const googleResult = await geocodingService.geocode(endereco);

// Buscar com Nominatim (novo - grátis!)
const nominatimResult = await nominatimService.geocode(
  cliente.endereco,
  cliente.cidade,
  cliente.estado
);

// Validação Cruzada
const crossValidation = await geocodingCrossValidationService.validateCoordinates(
  googleResult ? { lat: googleResult.latitude, lng: googleResult.longitude } : null,
  nominatimResult ? { lat: nominatimResult.latitude, lng: nominatimResult.longitude } : null
);

console.log(`🎯 Geocoding Confiança: ${crossValidation.confianca}%`);
console.log(`📍 Fonte usada: ${crossValidation.fonteUsada}`);
console.log(`📏 Divergência máxima: ${crossValidation.divergencias.distanciaMaxima.toFixed(0)}m`);

// Salvar com confiança
await prisma.cliente.update({
  where: { id: clienteId },
  data: {
    latitude: crossValidation.coordenadasFinais.lat,
    longitude: crossValidation.coordenadasFinais.lng,
    geocodingConfianca: crossValidation.confianca,
    geocodingFonte: crossValidation.fonteUsada,
    geocodingDivergencia: crossValidation.divergencias.distanciaMaxima,
  },
});
```

#### **1.4 Campos no Banco**

**Schema**: `/backend/prisma/schema.prisma`

```prisma
model Cliente {
  // ... campos existentes

  // Validação Cruzada - Geocoding
  geocodingConfianca    Int?    // 0-100%
  geocodingFonte        String? // 'google', 'nominatim', 'places', 'consenso'
  geocodingDivergencia  Float?  // Divergência máxima em metros
  googleLatitude        Float?  // Lat do Google (para análise)
  googleLongitude       Float?  // Lng do Google
  nominatimLatitude     Float?  // Lat do Nominatim
  nominatimLongitude    Float?  // Lng do Nominatim
}
```

---

### **2. Validação Cruzada - Normalização**

#### **2.1 Normalizador Local (Regex)**

**Arquivo**: `/backend/src/services/local-normalizer.service.ts`

```typescript
export class LocalNormalizerService {
  private abbreviations = {
    'R.': 'Rua',
    'R': 'Rua',
    'AV.': 'Avenida',
    'AV': 'Avenida',
    'AL.': 'Alameda',
    'TVS.': 'Travessa',
    'PRC.': 'Praça',
    'ROD.': 'Rodovia',
    'EST.': 'Estrada',
    'N°': 'Número',
    'Nº': 'Número',
    'S/N': 'Sem Número',
    'APTO': 'Apartamento',
    'APT': 'Apartamento',
    'BL': 'Bloco',
    'SL': 'Sala',
  };

  /**
   * Normaliza endereço localmente (sem IA - GRÁTIS!)
   */
  normalize(endereco: string): {
    normalizado: string;
    alteracoes: string[];
  } {
    let normalized = endereco;
    const alteracoes: string[] = [];

    // 1. Expandir abreviações
    Object.entries(this.abbreviations).forEach(([abbr, full]) => {
      const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
      if (regex.test(normalized)) {
        normalized = normalized.replace(regex, full);
        alteracoes.push(`${abbr} → ${full}`);
      }
    });

    // 2. Remover pontuações desnecessárias
    normalized = normalized.replace(/\.{2,}/g, '.');
    normalized = normalized.replace(/,\s*,/g, ',');

    // 3. Capitalizar primeira letra de cada palavra
    normalized = normalized
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // 4. Normalizar espaços
    normalized = normalized.replace(/\s+/g, ' ').trim();

    return {
      normalizado: normalized,
      alteracoes,
    };
  }
}
```

#### **2.2 Validação Cruzada IA vs Regex**

**Arquivo**: `/backend/src/services/normalization-cross-validation.service.ts`

```typescript
export class NormalizationCrossValidationService {
  /**
   * Valida normalização da IA contra regex local
   */
  async validate(
    iaResult: string,
    regexResult: string,
    enderecoOriginal: string
  ): Promise<{
    enderecoFinal: string;
    confianca: number;
    fonteUsada: 'ia' | 'regex' | 'consenso';
    divergencias: string[];
  }> {

    // Calcular similaridade
    const similarity = fuzzyMatchingService.matchStrings(iaResult, regexResult, 70);

    const divergencias: string[] = [];

    // Se muito similares → Alta confiança
    if (similarity.similarity >= 90) {
      return {
        enderecoFinal: iaResult, // Preferir IA (mais inteligente)
        confianca: 100,
        fonteUsada: 'consenso',
        divergencias: [],
      };
    }
    // Se moderadamente similares → Média confiança
    else if (similarity.similarity >= 70) {
      divergencias.push(`IA e Regex divergem levemente (${similarity.similarity}%)`);

      return {
        enderecoFinal: iaResult,
        confianca: 80,
        fonteUsada: 'ia',
        divergencias,
      };
    }
    // Se muito diferentes → ALERTA! IA pode ter alucinado
    else {
      divergencias.push(`⚠️  ALERTA: IA e Regex muito diferentes (${similarity.similarity}%)`);
      divergencias.push(`IA: "${iaResult}"`);
      divergencias.push(`Regex: "${regexResult}"`);

      console.error(`⚠️  Possível alucinação da IA!`);
      console.error(`   Original: ${enderecoOriginal}`);
      console.error(`   IA: ${iaResult}`);
      console.error(`   Regex: ${regexResult}`);

      // Usar Regex (mais confiável neste caso)
      return {
        enderecoFinal: regexResult,
        confianca: 60,
        fonteUsada: 'regex',
        divergencias,
      };
    }
  }
}
```

#### **2.3 Campos no Banco**

```prisma
model Cliente {
  // Validação Cruzada - Normalização
  normalizacaoConfianca Int?    // 0-100%
  normalizacaoFonte     String? // 'ia', 'regex', 'consenso'
  enderecoIa           String?  // Normalizado pela IA
  enderecoRegex        String?  // Normalizado por regex
}
```

---

### **3. Sistema de Confiança Universal**

#### **Arquivo**: `/backend/src/services/universal-confidence.service.ts`

```typescript
export interface ConfidenceReport {
  overall: number; // 0-100% confiança geral
  breakdown: {
    geocoding: number;
    normalizacao: number;
    places: number;
    receita: number;
    nomeFantasia: number;
  };
  alerts: Array<{
    tipo: 'warning' | 'error' | 'info';
    mensagem: string;
    campo: string;
  }>;
  recomendacoes: string[];
}

export class UniversalConfidenceService {
  /**
   * Calcula confiança geral do cliente
   */
  async calculateOverallConfidence(clienteId: string): Promise<ConfidenceReport> {
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    const breakdown = {
      geocoding: cliente.geocodingConfianca || 0,
      normalizacao: cliente.normalizacaoConfianca || 0,
      places: cliente.crossValidationConfianca || 0,
      receita: 100, // Assumir 100% se não tiver validação
      nomeFantasia: cliente.nomeFantasiaConfianca || 0,
    };

    // Confiança geral = média ponderada
    const overall = Math.round(
      (breakdown.geocoding * 0.25 +
        breakdown.normalizacao * 0.15 +
        breakdown.places * 0.35 +
        breakdown.receita * 0.15 +
        breakdown.nomeFantasia * 0.10) / 1.0
    );

    // Gerar alertas
    const alerts = [];
    const recomendacoes = [];

    if (breakdown.geocoding < 70) {
      alerts.push({
        tipo: 'warning' as const,
        mensagem: `Baixa confiança em geocoding (${breakdown.geocoding}%)`,
        campo: 'geocoding',
      });
      recomendacoes.push('Validar coordenadas manualmente');
    }

    if (breakdown.places < 70) {
      alerts.push({
        tipo: 'warning' as const,
        mensagem: `Baixa confiança em Google Places (${breakdown.places}%)`,
        campo: 'places',
      });
      recomendacoes.push('Verificar se Place encontrado está correto');
    }

    return {
      overall,
      breakdown,
      alerts,
      recomendacoes,
    };
  }
}
```

---

## 📊 Métricas de Sucesso

| Métrica | Atual | Meta Sprint 4 |
|---------|-------|---------------|
| **Confiança Média** | ~90% | ~98% |
| **Erros Detectados** | ~70% | ~95% |
| **Custo por Cliente** | $0.096 | $0.096 (mesmo!) |
| **Geocoding Ruins Detectados** | 0% | 100% |
| **Alucinações IA Detectadas** | 0% | 95% |
| **Taxa de Processamento** | ~95% | ~98% |

---

## 📁 Estrutura de Arquivos

```
backend/
├── src/
│   ├── services/
│   │   ├── nominatim.service.ts                    [NOVO]
│   │   ├── geocoding-cross-validation.service.ts   [NOVO]
│   │   ├── local-normalizer.service.ts             [NOVO]
│   │   ├── normalization-cross-validation.service.ts [NOVO]
│   │   ├── universal-confidence.service.ts         [NOVO]
│   │   └── vision-ai.service.ts                    [NOVO - Orquestrador]
│   └── workers/
│       ├── geocoding.worker.ts                      [MODIFICADO]
│       └── normalization.worker.ts                  [MODIFICADO]
└── docs/
    └── vision-ai/
        ├── README.md                                [NOVO]
        ├── architecture.md                          [NOVO]
        ├── confidence-system.md                     [NOVO]
        ├── cross-validation.md                      [NOVO]
        └── troubleshooting.md                       [NOVO]
```

---

## 🧪 Plano de Testes

### **Testes Unitários**
- [ ] Nominatim Service
- [ ] Geocoding Cross Validation
- [ ] Local Normalizer
- [ ] Normalization Cross Validation
- [ ] Universal Confidence Service

### **Testes de Integração**
- [ ] Geocoding Worker com validação cruzada
- [ ] Normalization Worker com validação cruzada
- [ ] Sistema de confiança end-to-end

### **Testes E2E**
- [ ] Pipeline completo com Vision AI
- [ ] Cenários de divergência
- [ ] Performance benchmarks

---

## 📚 Documentação Vision AI

### **Estrutura da Documentação:**

1. **README.md** - Visão geral
2. **architecture.md** - Arquitetura detalhada
3. **confidence-system.md** - Sistema de confiança
4. **cross-validation.md** - Validações cruzadas
5. **troubleshooting.md** - Solução de problemas

---

## ✅ Checklist de Conclusão

- [ ] Todas as validações cruzadas implementadas
- [ ] Sistema de confiança universal funcionando
- [ ] Migrations executadas
- [ ] Testes passando (>90% coverage)
- [ ] Documentação completa
- [ ] Deploy em staging validado
- [ ] Performance dentro do esperado
- [ ] Sprint 4 CONCLUÍDO

---

## 🚀 Próximos Passos (Sprint 5)

1. Dashboard de Confiança (Frontend)
2. Machine Learning para auto-ajuste de thresholds
3. Análise de Reviews (Sentiment Analysis)
4. Tipologia de Clientes Pepsi

---

**Meta Final**: Sistema com **98% de confiança** e **100% de detecção de erros**! 🎯
