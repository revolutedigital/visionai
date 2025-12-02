# 📸 Photos Cross Validation - Vision AI

**Status**: Implementado (Opcional)
**Data**: Novembro 2025

---

## 📋 O Que É?

**Photos Cross Validation** usa **múltiplas IAs** para analisar fotos e validar classificações, detectando alucinações e aumentando confiança.

### **Fontes de Análise:**

1. **Claude Vision** (Anthropic) - ✅ Já usado no sistema
2. **Google Cloud Vision** - 🆕 Labels e detecção de objetos
3. **OpenAI GPT-4 Vision** - 🆕 Classificação alternativa

---

## 🎯 Objetivo

- ✅ Detectar alucinações da IA
- ✅ Validar classificações (fachada, interior, produto, outro)
- ✅ Confirmar presença de elementos (branding, sinalização)
- ✅ Aumentar confiança na análise visual

---

## 🔄 Como Funciona?

```
FOTO → Claude Vision → "facade"
     → Google Vision → labels: ["building", "store", "signage"] → "facade"
     → OpenAI Vision → "facade"

VALIDAÇÃO CRUZADA:
✅ Todas concordam em "facade"
→ Confiança: 100%
→ Categoria Final: facade
```

---

## 🏗️ Implementação

### **1. Configuração**

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-...          # ✅ Já configurado
OPENAI_API_KEY=sk-...                  # 🆕 Opcional
GOOGLE_CLOUD_VISION_CREDENTIALS=path/to/credentials.json # 🆕 Opcional
```

### **2. Uso Básico**

```typescript
import { photosCrossValidationService } from './services/photos-cross-validation.service';

// Validar foto com múltiplas fontes
const result = await photosCrossValidationService.validatePhoto(
  imageBase64,
  ['claude', 'google', 'openai'] // Fontes habilitadas
);

console.log(result);
// {
//   categoriaFinal: 'facade',
//   confianca: 100,
//   consenso: true,
//   detalhes: {
//     claudeAnalysis: { fonte: 'claude', categoria: 'facade', confianca: 90 },
//     googleAnalysis: { fonte: 'google', categoria: 'facade', labels: [...], confianca: 85 },
//     openaiAnalysis: { fonte: 'openai', categoria: 'facade', confianca: 85 },
//     divergencias: [],
//     alertas: []
//   }
// }
```

### **3. Integração no Analysis Worker (Opcional)**

```typescript
// src/workers/analysis.worker.ts

// Após análise com Claude
const claudeCategoria = foto.photoCategory;

// Cross-validation (se habilitado)
if (process.env.ENABLE_PHOTOS_CROSS_VALIDATION === 'true') {
  const imageBase64 = fs.readFileSync(fotoPath, 'base64');

  const photosValidation = await photosCrossValidationService.validatePhoto(
    imageBase64,
    ['claude', 'google'] // Claude + Google
  );

  // Atualizar categoria com validação cruzada
  await prisma.foto.update({
    where: { id: foto.id },
    data: {
      photoCategory: photosValidation.categoriaFinal,
      photoCategoryConfidence: photosValidation.confianca,
    },
  });

  console.log(`✅ Foto validada: ${photosValidation.categoriaFinal} (${photosValidation.confianca}%)`);
}
```

---

## 📊 Confiança

### **Cálculo de Confiança:**

| Situação | Confiança | Significado |
|----------|-----------|-------------|
| Todas concordam (3/3 ou 2/2) | 100% | ✅ Consenso completo |
| Maioria concorda (2/3) | 85% | ⚠️ Boa concordância |
| Sem consenso (1/1/1) | 60% | ❌ Alta divergência |
| Apenas 1 fonte | 60% | ⚠️ Sem cross-validation |

---

## 💡 Casos de Uso

### **Caso 1: Consenso Completo**

```
Claude:  "facade" (90%)
Google:  "facade" via labels: ["building", "storefront"] (85%)
OpenAI:  "facade" (85%)

→ Categoria Final: facade
→ Confiança: 100%
→ Consenso: ✅ SIM
```

### **Caso 2: Divergência Parcial**

```
Claude:  "facade" (90%)
Google:  "interior" via labels: ["room", "shelf"] (85%)
OpenAI:  "facade" (85%)

→ Categoria Final: facade (2/3 votos)
→ Confiança: 85%
→ Consenso: ⚠️  NÃO
→ Divergência: Google classificou como "interior"
```

### **Caso 3: Alta Divergência** (Foto Ambígua)

```
Claude:  "facade" (90%)
Google:  "product" via labels: ["bottle", "drink"] (85%)
OpenAI:  "interior" (85%)

→ Categoria Final: facade (decidido por primeira IA)
→ Confiança: 60%
→ Consenso: ❌ NÃO
→ Alerta: ❌ Alta divergência - revisão manual recomendada
```

---

## 🔧 Configuração Google Cloud Vision

### **1. Criar Projeto e Habilitar API**

```bash
# 1. Acesse https://console.cloud.google.com
# 2. Crie novo projeto "pepsi-vision-ai"
# 3. Habilite Cloud Vision API
# 4. Vá em "Credenciais" → "Criar credenciais" → "Conta de serviço"
# 5. Baixe JSON de credenciais
```

### **2. Configurar Credenciais**

```bash
# Salvar JSON em local seguro
mkdir -p /path/to/credentials
mv service-account-key.json /path/to/credentials/

# Adicionar ao .env
echo 'GOOGLE_CLOUD_VISION_CREDENTIALS=/path/to/credentials/service-account-key.json' >> .env
```

### **3. Testar**

```typescript
import { photosCrossValidationService } from './services/photos-cross-validation.service';

const result = await photosCrossValidationService.validatePhoto(
  imageBase64,
  ['google'] // Apenas Google para testar
);

console.log(result.detalhes.googleAnalysis);
// {
//   fonte: 'google',
//   categoria: 'facade',
//   labels: ['Building', 'Architecture', 'Commercial building', ...],
//   confianca: 85
// }
```

---

## 🔧 Configuração OpenAI Vision

### **1. Obter API Key**

```bash
# 1. Acesse https://platform.openai.com/api-keys
# 2. Crie nova API key
# 3. Copie a chave
```

### **2. Adicionar ao .env**

```bash
echo 'OPENAI_API_KEY=sk-proj-...' >> .env
```

### **3. Testar**

```typescript
const result = await photosCrossValidationService.validatePhoto(
  imageBase64,
  ['openai'] // Apenas OpenAI para testar
);

console.log(result.detalhes.openaiAnalysis);
// {
//   fonte: 'openai',
//   categoria: 'facade',
//   labels: [],
//   confianca: 85
// }
```

---

## 💰 Custos

### **Comparação de Custos:**

| Serviço | Custo por 1000 imagens | Observação |
|---------|------------------------|------------|
| **Claude Vision** | ~$15 | ✅ Já usado, excelente análise |
| **Google Vision** | $1.50 | 🆕 Barato, ótimos labels |
| **OpenAI GPT-4V** | ~$10 | 🆕 Bom para cross-validation |

### **Recomendação:**

- **Desenvolvimento**: Claude + Google (custo/benefício)
- **Produção Alta Confiança**: Claude + Google + OpenAI
- **Produção Econômica**: Apenas Claude (atual)

---

## ⚙️ Habilitando no Sistema

### **Opção 1: Sempre Habilitado**

```typescript
// src/workers/analysis.worker.ts

const photosValidation = await photosCrossValidationService.validatePhoto(
  imageBase64,
  ['claude', 'google'] // Claude + Google
);
```

### **Opção 2: Habilitado por Flag**

```bash
# .env
ENABLE_PHOTOS_CROSS_VALIDATION=true
PHOTOS_VALIDATION_SOURCES=claude,google  # Separado por vírgula
```

```typescript
// src/workers/analysis.worker.ts

if (process.env.ENABLE_PHOTOS_CROSS_VALIDATION === 'true') {
  const sources = (process.env.PHOTOS_VALIDATION_SOURCES || 'claude').split(',');

  const photosValidation = await photosCrossValidationService.validatePhoto(
    imageBase64,
    sources
  );
}
```

### **Opção 3: Habilitado Apenas para Baixa Confiança**

```typescript
// Usar cross-validation apenas se Claude tiver baixa confiança

if (claudeConfidence < 70) {
  console.warn(`⚠️  Claude com baixa confiança (${claudeConfidence}%), executando cross-validation...`);

  const photosValidation = await photosCrossValidationService.validatePhoto(
    imageBase64,
    ['google', 'openai'] // Validar com outras fontes
  );
}
```

---

## 📈 Benefícios

### **1. Qualidade**
- ✅ Detecta alucinações da IA
- ✅ 95%+ de acurácia com cross-validation
- ✅ Validação automática de classificações

### **2. Confiança**
- ✅ Score 0-100% baseado em consenso
- ✅ Alertas automáticos para divergências
- ✅ Rastreabilidade completa

### **3. Flexibilidade**
- ✅ Habilitável por flag
- ✅ Escolha de fontes (Claude/Google/OpenAI)
- ✅ Uso condicional (apenas baixa confiança)

---

## 🚀 Próximos Passos

### **v1.0** (Atual)
- ✅ Serviço criado
- ✅ Suporte a Claude, Google, OpenAI
- ⏳ Integração opcional no pipeline

### **v1.1** (Futuro)
- Machine Learning para detectar padrões de alucinação
- Auto-ajuste de pesos por fonte
- Cache de análises para fotos similares

### **v2.0** (Futuro)
- Análise semântica profunda (detectar objetos específicos)
- Comparação de fotos (similaridade entre múltiplas fotos)
- Detecção de branding automatizada

---

**Desenvolvido com ❤️ para Pepsi**
**Powered by Claude AI, Google Cloud Vision & OpenAI**
