# Arquitetura do Sistema - Sistema RAC

Documentação da arquitetura técnica do Sistema de Análise Inteligente de Clientes RAC.

---

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────────┐   │
│  │  Upload    │  │  Dashboard   │  │  Detalhes Cliente     │   │
│  │  Planilha  │  │  Analytics   │  │  Galeria + Análise    │   │
│  └────────────┘  └──────────────┘  └───────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST API
┌────────────────────────┴────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    API LAYER                             │   │
│  │  /api/upload  /api/clientes  /api/analises  /api/export │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  SERVICE LAYER                           │   │
│  │  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐   │   │
│  │  │   Parser     │  │  Geocoding  │  │   Places     │   │   │
│  │  │   Service    │  │   Service   │  │   Service    │   │   │
│  │  └──────────────┘  └─────────────┘  └──────────────┘   │   │
│  │  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐   │   │
│  │  │   Scraping   │  │     AI      │  │   Report     │   │   │
│  │  │   Service    │  │   Analysis  │  │   Service    │   │   │
│  │  └──────────────┘  └─────────────┘  └──────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              WORKER LAYER (Bull Queues)                  │   │
│  │  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐   │   │
│  │  │  Geocoding   │  │   Places    │  │   Scraping   │   │   │
│  │  │   Worker     │  │   Worker    │  │   Worker     │   │   │
│  │  └──────────────┘  └─────────────┘  └──────────────┘   │   │
│  │  ┌──────────────┐                                       │   │
│  │  │  AI Analysis │                                       │   │
│  │  │   Worker     │                                       │   │
│  │  └──────────────┘                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   DATA LAYER (Prisma ORM)                │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────┬─────────────────────┬───────────────────────────┘
                │                     │
    ┌───────────┴───────────┐  ┌─────┴──────┐
    │  PostgreSQL (Docker)  │  │   Redis    │
    │  - Clientes           │  │  - Cache   │
    │  - Planilhas          │  │  - Queues  │
    │  - Fotos              │  │            │
    │  - Análises           │  │            │
    └───────────────────────┘  └────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                            │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐           │
│  │  Google Maps │  │   Claude    │  │  Web (HTTP)  │           │
│  │     API      │  │     API     │  │   Scraping   │           │
│  └──────────────┘  └─────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Camadas da Arquitetura

### 1. Frontend Layer (Apresentação)

**Tecnologias**: React + TypeScript + Tailwind CSS

**Responsabilidades**:
- Interface de usuário
- Upload de planilhas
- Visualização de dados
- Dashboard analítico
- Filtros e buscas
- Exportação de relatórios

**Componentes Principais**:
```
frontend/
├── src/
│   ├── components/
│   │   ├── UploadPlanilha/
│   │   ├── Dashboard/
│   │   ├── ClienteCard/
│   │   ├── MapaClientes/
│   │   ├── FiltrosAvancados/
│   │   └── GaleriaFotos/
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Upload.tsx
│   │   ├── Clientes.tsx
│   │   ├── ClienteDetalhes.tsx
│   │   └── Dashboard.tsx
│   ├── services/
│   │   ├── api.ts
│   │   └── queries.ts
│   └── hooks/
│       ├── useClientes.ts
│       ├── useUpload.ts
│       └── useAnalise.ts
```

---

### 2. API Layer (Controllers)

**Tecnologias**: Express.js + TypeScript

**Responsabilidades**:
- Receber requisições HTTP
- Validar inputs
- Autenticação e autorização
- Retornar respostas JSON

**Endpoints Principais**:

```typescript
// Upload
POST   /api/upload                 // Upload de planilha
GET    /api/uploads/:id            // Status do upload
GET    /api/uploads                // Listar uploads

// Clientes
GET    /api/clientes               // Listar clientes (com filtros)
GET    /api/clientes/:id           // Detalhes do cliente
PUT    /api/clientes/:id           // Atualizar cliente
DELETE /api/clientes/:id           // Remover cliente

// Análises
GET    /api/analises/:clienteId    // Análise do cliente
POST   /api/analises/:clienteId/reprocessar  // Reprocessar

// Fotos
GET    /api/fotos/:clienteId       // Fotos do cliente

// Dashboard
GET    /api/dashboard/stats        // Estatísticas gerais
GET    /api/dashboard/tipologias   // Distribuição por tipologia
GET    /api/dashboard/scores       // Distribuição de scores

// Exportação
POST   /api/export/excel           // Exportar para Excel
POST   /api/export/pdf/:clienteId  // Exportar relatório PDF

// Workers (monitoramento)
GET    /api/workers/status         // Status dos workers
GET    /api/workers/queues         // Estatísticas das filas
```

**Estrutura**:
```
backend/
├── src/
│   ├── controllers/
│   │   ├── uploadController.ts
│   │   ├── clienteController.ts
│   │   ├── analiseController.ts
│   │   └── dashboardController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   └── routes/
│       ├── upload.routes.ts
│       ├── cliente.routes.ts
│       └── analise.routes.ts
```

---

### 3. Service Layer (Lógica de Negócio)

**Responsabilidades**:
- Lógica de negócio
- Integração com APIs externas
- Processamento de dados
- Orquestração de workflows

**Serviços**:

#### ParserService
```typescript
class ParserService {
  async parseExcel(buffer: Buffer): Promise<ClienteData[]>
  async parseCSV(buffer: Buffer): Promise<ClienteData[]>
  async validateData(data: ClienteData[]): Promise<ValidationResult>
  async detectDuplicates(data: ClienteData[]): Promise<Duplicate[]>
}
```

#### GeocodingService
```typescript
class GeocodingService {
  async geocodeAddress(address: string): Promise<Coordinates>
  async reverseGeocode(lat: number, lng: number): Promise<Address>
  async validateAddress(address: string): Promise<boolean>
}
```

#### PlacesService
```typescript
class PlacesService {
  async findPlace(name: string, location: Coordinates): Promise<Place>
  async getPlaceDetails(placeId: string): Promise<PlaceDetails>
  async getPlacePhotos(placeId: string): Promise<Photo[]>
  async downloadPhoto(photoReference: string): Promise<Buffer>
}
```

#### ScrapingService
```typescript
class ScrapingService {
  async searchGoogle(query: string): Promise<SearchResult[]>
  async captureScreenshot(url: string): Promise<Buffer>
  async extractInfo(url: string): Promise<ExtractedInfo>
}
```

#### AIAnalysisService
```typescript
class AIAnalysisService {
  async analyzeImage(image: Buffer): Promise<ImageAnalysis>
  async synthesizeAnalyses(analyses: ImageAnalysis[]): Promise<Synthesis>
  async generateFinalClassification(data: AllData): Promise<FinalAnalysis>
  async analyzeText(text: string): Promise<TextAnalysis>
}
```

**Estrutura**:
```
backend/
├── src/
│   ├── services/
│   │   ├── parser.service.ts
│   │   ├── geocoding.service.ts
│   │   ├── places.service.ts
│   │   ├── scraping.service.ts
│   │   ├── ai-analysis.service.ts
│   │   ├── report.service.ts
│   │   └── cache.service.ts
```

---

### 4. Worker Layer (Processamento Assíncrono)

**Tecnologias**: Bull (Redis-based queue)

**Responsabilidades**:
- Processamento em background
- Jobs assíncronos
- Retry automático
- Controle de concorrência

**Workers**:

#### GeocodingWorker
```typescript
// Processa geocodificação de endereços
queue.process('geocoding', async (job) => {
  const { clienteId } = job.data;
  const cliente = await getCliente(clienteId);
  const coords = await geocodingService.geocodeAddress(cliente.endereco);
  await updateCliente(clienteId, coords);
});
```

#### PlacesWorker
```typescript
// Processa busca no Google Places
queue.process('places', async (job) => {
  const { clienteId } = job.data;
  const cliente = await getCliente(clienteId);
  const place = await placesService.findPlace(cliente.nome, cliente.coords);
  const photos = await placesService.getPlacePhotos(place.placeId);
  await savePlaceInfo(clienteId, place, photos);
});
```

#### ScrapingWorker
```typescript
// Processa web scraping
queue.process('scraping', async (job) => {
  const { clienteId } = job.data;
  const cliente = await getCliente(clienteId);
  const results = await scrapingService.searchGoogle(cliente.nome);
  await saveScrapingResults(clienteId, results);
});
```

#### AIAnalysisWorker
```typescript
// Processa análise com IA
queue.process('ai-analysis', async (job) => {
  const { clienteId } = job.data;
  const fotos = await getFotos(clienteId);
  const analyses = await Promise.all(
    fotos.map(f => aiService.analyzeImage(f.buffer))
  );
  const synthesis = await aiService.synthesizeAnalyses(analyses);
  const final = await aiService.generateFinalClassification({...});
  await saveAnalise(clienteId, final);
});
```

**Estrutura**:
```
backend/
├── src/
│   ├── workers/
│   │   ├── geocoding.worker.ts
│   │   ├── places.worker.ts
│   │   ├── scraping.worker.ts
│   │   ├── ai-analysis.worker.ts
│   │   └── index.ts
│   └── queues/
│       ├── queue.config.ts
│       └── queue.types.ts
```

---

### 5. Data Layer (Persistência)

**Tecnologias**: Prisma ORM + PostgreSQL

**Responsabilidades**:
- Acesso ao banco de dados
- Queries e mutations
- Transações
- Relacionamentos

**Schemas Principais**:

```prisma
model Planilha {
  id          String   @id @default(uuid())
  nomeArquivo String
  uploadedAt  DateTime @default(now())
  status      String
  totalLinhas Int
  clientes    Cliente[]
}

model Cliente {
  id                    String    @id @default(uuid())
  planilhaId            String
  planilha              Planilha  @relation(fields: [planilhaId], references: [id])

  // Dados básicos
  nome                  String
  telefone              String?
  endereco              String
  cidade                String?
  estado                String?
  cep                   String?
  tipoServico           String?

  // Geocodificação
  latitude              Float?
  longitude             Float?
  geocodingStatus       String    @default("PENDENTE")

  // Places
  placeId               String?
  placeTipo             String[]

  // Relacionamentos
  fotos                 Foto[]
  analise               Analise?

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([nome])
  @@index([cidade, estado])
  @@index([geocodingStatus])
}

model Foto {
  id           String   @id @default(uuid())
  clienteId    String
  cliente      Cliente  @relation(fields: [clienteId], references: [id])
  url          String
  fonte        String
  analisada    Boolean  @default(false)
  createdAt    DateTime @default(now())
}

model Analise {
  id                       String   @id @default(uuid())
  clienteId                String   @unique
  cliente                  Cliente  @relation(fields: [clienteId], references: [id])

  tipologiaSegmento        String?
  tipologiaPorte           String?

  scorePotencial           Int?
  scoreInfraestrutura      Int?
  scoreLocalizacao         Int?

  descricaoEstabelecimento String?
  pontosFortes             String[]
  pontosFracos             String[]
  recomendacoes            String[]

  confiancaAnalise         Float?

  createdAt                DateTime @default(now())
  updatedAt                DateTime @updatedAt
}
```

**Estrutura**:
```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
```

---

## Fluxo de Dados

### Fluxo Completo: Upload até Análise

```
1. UPLOAD
   Usuario → Frontend → API (/api/upload) → Multer → Storage
                                          → ParserService
                                          → Validação
                                          → Save Planilha + Clientes (DB)

2. GEOCODIFICAÇÃO
   Trigger → GeocodingWorker → GeocodingService → Google Maps API
                             → Update Cliente (coords)
                             → Trigger próximo worker

3. PLACES
   Trigger → PlacesWorker → PlacesService → Google Places API
                         → Download Fotos
                         → Save Fotos (DB/Storage)
                         → Trigger próximo worker

4. SCRAPING (Opcional)
   Trigger → ScrapingWorker → ScrapingService → Puppeteer
                            → Busca Google
                            → Screenshots
                            → Save Info (DB)

5. ANÁLISE IA
   Trigger → AIAnalysisWorker → AIAnalysisService → Claude API
                              → Análise de Imagens
                              → Síntese
                              → Classificação Final
                              → Save Analise (DB)

6. VISUALIZAÇÃO
   Usuario → Frontend → API (/api/clientes/:id) → DB
                                                 → Response
                     → Renderiza Dashboard/Detalhes
```

---

## Integração com APIs Externas

### Google Maps API

```typescript
// Configuração
const mapsClient = new Client({
  apiKey: process.env.GOOGLE_MAPS_API_KEY,
});

// Geocoding
const coords = await mapsClient.geocode({
  params: {
    address: endereco,
    key: API_KEY,
  },
});

// Places Search
const places = await mapsClient.placesNearby({
  params: {
    location: { lat, lng },
    name: nomeCliente,
    key: API_KEY,
  },
});

// Place Photos
const photo = await mapsClient.placePhoto({
  params: {
    photoreference: photoRef,
    maxwidth: 1600,
    key: API_KEY,
  },
});
```

### Claude API (Anthropic)

```typescript
// Configuração
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Análise de Imagem
const response = await anthropic.messages.create({
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
            data: imageBase64,
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
```

---

## Segurança

### Camadas de Segurança

1. **API Layer**
   - JWT Authentication
   - Rate Limiting (express-rate-limit)
   - CORS configurado
   - Helmet.js (headers de segurança)
   - Validação de inputs (Zod)

2. **Banco de Dados**
   - Prepared statements (Prisma)
   - Encriptação de dados sensíveis
   - Backup automático
   - SSL/TLS na conexão

3. **APIs Externas**
   - API Keys em variáveis de ambiente
   - Rate limiting próprio
   - Retry com backoff exponencial
   - Timeout configurado

4. **Docker**
   - Redes isoladas
   - Volumes com permissões restritas
   - Secrets management
   - Não expor portas desnecessáamente

---

## Monitoramento e Observabilidade

### Logs

```typescript
// Winston Logger
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Uso
logger.info('Cliente processado', { clienteId, duration });
logger.error('Erro na geocodificação', { clienteId, error });
```

### Métricas

```typescript
// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  const metrics = {
    clientes_total: await prisma.cliente.count(),
    clientes_processados: await prisma.cliente.count({
      where: { status: 'CONCLUIDO' },
    }),
    analises_total: await prisma.analise.count(),
    filas: await getQueueStats(),
  };
  res.json(metrics);
});
```

### Bull Board (Dashboard de Filas)

```typescript
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';

const serverAdapter = new ExpressAdapter();

createBullBoard({
  queues: [
    new BullAdapter(geocodingQueue),
    new BullAdapter(placesQueue),
    new BullAdapter(aiAnalysisQueue),
  ],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());
```

---

## Escalabilidade

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
services:
  worker:
    image: scampepisico-worker
    deploy:
      replicas: 4  # 4 workers em paralelo
    environment:
      - WORKER_CONCURRENCY=2
```

### Vertical Scaling

```typescript
// Configuração de workers
const workerOptions = {
  concurrency: 5,  // 5 jobs simultâneos por worker
  limiter: {
    max: 100,      // máximo 100 jobs
    duration: 60000, // por minuto
  },
};
```

---

## Backup e Recuperação

### Backup Automático

```bash
# Script de backup (cron diário)
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker exec scampepisico-postgres pg_dump \
  -U scampepisico scampepisico \
  | gzip > /backups/backup_${TIMESTAMP}.sql.gz

# Manter apenas últimos 30 dias
find /backups -name "backup_*.sql.gz" -mtime +30 -delete
```

### Restore

```bash
#!/bin/bash
gunzip -c backup.sql.gz | \
docker exec -i scampepisico-postgres \
  psql -U scampepisico -d scampepisico
```

---

## Próximos Passos

1. ✅ Arquitetura definida
2. ⬜ Implementar camada API
3. ⬜ Implementar camada Service
4. ⬜ Configurar Workers
5. ⬜ Implementar Frontend
6. ⬜ Testes de integração
7. ⬜ Deploy

---

## Referências

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

