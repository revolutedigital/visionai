# Railway Deployment Guide - Sistema RAC PepsiCo

## 🎯 Visão Geral

Este guia detalha a estratégia completa de deploy do Sistema de Análise Inteligente de Clientes RAC para a plataforma Railway.

### Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                      RAILWAY SERVICES                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Backend    │  │  PostgreSQL  │  │    Redis     │      │
│  │  (Node.js)   │◄─┤   Database   │◄─┤   (Bull)     │      │
│  └──────┬───────┘  └──────────────┘  └──────────────┘      │
│         │                                                    │
│  ┌──────▼───────┐                                          │
│  │   Frontend   │                                           │
│  │   (Static)   │                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
├─────────────────────────────────────────────────────────────┤
│  • Google Maps API (Geocoding, Places, Photos)              │
│  • Anthropic Claude API (Vision AI, Tipologia)              │
│  • OpenAI API (optional fallback)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Checklist de Preparação

### ✅ Análise de Readiness

| Item | Status | Notas |
|------|--------|-------|
| Build scripts configurados | ✅ | `npm run build` + `npm start` presentes |
| TypeScript compilação OK | ✅ | Backend: `tsc`, Frontend: `vite build` |
| Prisma migrations | ✅ | Schema completo em `prisma/schema.prisma` |
| Variáveis de ambiente mapeadas | ✅ | 11 variáveis necessárias |
| Health check endpoint | ✅ | `GET /health` implementado |
| CORS configurado | ✅ | Precisa ajustar para produção |
| Bull queues funcionais | ✅ | 6 filas ativas com workers |
| Docker compose local | ✅ | Postgres + Redis funcionando |
| Dependências produção | ✅ | Todas em `dependencies` (não devDeps) |
| .gitignore adequado | ✅ | `.env`, `node_modules`, `dist` ignorados |

---

## 🚀 Plano de Deploy - 3 Serviços Railway

### Serviço 1: PostgreSQL Database

**Tipo**: Railway PostgreSQL Plugin

```yaml
Service Name: scampepisico-postgres
Type: PostgreSQL
Version: 16
Memory: 512 MB (mínimo) - 1 GB (recomendado)
Storage: 5 GB inicial (crescimento estimado: 1-2 GB/mês)
Backup: Ativar backups automáticos (Railway Pro)
```

**Variáveis Exportadas Automaticamente**:
- `DATABASE_URL` → Injetada automaticamente pelo Railway
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

**Migrations**:
```bash
# Executar após primeira implantação
npx prisma migrate deploy
npx prisma generate
```

---

### Serviço 2: Redis (Bull Queues)

**Tipo**: Railway Redis Plugin

```yaml
Service Name: scampepisico-redis
Type: Redis
Version: 7
Memory: 256 MB (mínimo) - 512 MB (recomendado)
Persistence: ativar AOF (append-only file)
```

**Variáveis Exportadas Automaticamente**:
- `REDIS_URL` → Formato completo: `redis://default:password@host:port`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

**Uso no Sistema**:
- 6 Bull queues ativas:
  - `receita-queue` (Receita Federal validation)
  - `normalization-queue` (Address normalization AI)
  - `geocoding-queue` (Google Geocoding)
  - `places-queue` (Google Places API)
  - `analysis-queue` (Claude Vision AI photo analysis)
  - `tipologia-queue` (PepsiCo typology classification)

---

### Serviço 3: Backend (Node.js + Express)

**Tipo**: Node.js Application

```yaml
Service Name: scampepisico-backend
Type: Node.js
Node Version: 18.x (ou 20.x)
Memory: 1 GB (mínimo) - 2 GB (recomendado para Vision AI)
Build Command: npm run build
Start Command: npm start
Health Check Path: /health
Port: 4000 (configurável via $PORT)
```

#### Build Configuration

**Root Directory**: `/backend`

**Install Command**:
```bash
npm install
npx prisma generate
```

**Build Command**:
```bash
npm run build
```
*Compila TypeScript → JavaScript em `/dist`*

**Start Command**:
```bash
npx prisma migrate deploy && npm start
```
*Executa migrations antes de iniciar o servidor*

#### Variáveis de Ambiente (Backend)

```env
# 🔴 CRÍTICAS - Obrigatórias

NODE_ENV=production
PORT=4000

# Database (injetado automaticamente pelo Railway PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (injetado automaticamente pelo Railway Redis)
REDIS_URL=${{Redis.REDIS_URL}}

# 🔴 APIs Externas - CONFIGURAR MANUALMENTE
GOOGLE_MAPS_API_KEY=<SUA_API_KEY_AQUI>
ANTHROPIC_API_KEY=<SUA_API_KEY_AQUI>

# 🟡 OPCIONAIS

OPENAI_API_KEY=<OPCIONAL_FALLBACK>

# Security
JWT_SECRET=<GERAR_RANDOM_STRING_SEGURA>

# Otimização de Custo Claude
CLAUDE_VISION_MODEL=haiku  # haiku = 73% mais barato, sonnet = máxima qualidade

# Uploads (Railway usa filesystem efêmero)
PHOTOS_DIR=/app/uploads/fotos
```

#### ⚠️ ATENÇÃO: Uploads e Armazenamento

**PROBLEMA**: Railway usa filesystem **efêmero** (dados perdidos a cada redeploy).

**SOLUÇÕES**:

1. **Opção A - Railway Volumes (Recomendado)**:
   ```yaml
   # No railway.toml ou UI
   volumes:
     - /app/uploads
   ```
   *Dados persistem entre deploys, mas limitado a 1 service por volume*

2. **Opção B - Object Storage Externo (Melhor para Produção)**:
   - AWS S3
   - Cloudflare R2 (mais barato)
   - Backblaze B2 (econômico)

   **Modificação necessária**:
   ```typescript
   // Substituir fs.writeFile por upload direto S3
   import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
   ```

3. **Opção C - Database BLOB (Temporário)**:
   ```prisma
   model Foto {
     imageData Bytes? // Armazenar fotos no PostgreSQL
   }
   ```
   *NÃO recomendado para produção (banco muito pesado)*

---

### Serviço 4: Frontend (React Static)

**Tipo**: Static Site (Vite Build)

```yaml
Service Name: scampepisico-frontend
Type: Static Site
Build Command: npm run build
Output Directory: dist
```

#### Build Configuration

**Root Directory**: `/frontend`

**Install Command**:
```bash
npm install
```

**Build Command**:
```bash
npm run build
```
*Gera build otimizado em `/dist`*

**Output Directory**: `dist`

#### Variáveis de Ambiente (Frontend)

```env
# API Backend URL
VITE_API_URL=${{scampepisico-backend.PUBLIC_URL}}

# Opcional: Sentry, PostHog, etc
VITE_SENTRY_DSN=<OPCIONAL>
VITE_POSTHOG_KEY=<OPCIONAL>
```

**⚠️ IMPORTANTE**: Variáveis `VITE_*` são injetadas **em build time**, não runtime. Qualquer mudança requer novo build.

#### Configuração do Vite para Produção

Modificar [vite.config.ts](frontend/vite.config.ts:1-11):

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  // 🔴 ADICIONAR PARA PRODUÇÃO
  build: {
    outDir: 'dist',
    sourcemap: false, // Desativar sourcemaps em prod (segurança)
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          icons: ['lucide-react'],
        },
      },
    },
  },
  // Proxy API em desenvolvimento (Railway não precisa)
  // Em produção, frontend chama diretamente VITE_API_URL
})
```

---

## 🔧 Configuração de CORS (Backend)

**CRÍTICO**: Atualizar CORS para aceitar domínio Railway do frontend.

Modificar [backend/src/index.ts](backend/src/index.ts:1-10):

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000', // Dev local
    'https://scampepisico-frontend.up.railway.app', // Railway frontend
    process.env.FRONTEND_URL || '', // Variável customizável
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

**Adicionar variável de ambiente**:
```env
FRONTEND_URL=https://scampepisico-frontend.up.railway.app
```

---

## 📦 Dependências e Pacotes

### Backend - Análise Crítica

#### ✅ Produção (Necessárias em Runtime)

```json
{
  "@anthropic-ai/sdk": "^0.68.0",           // ✅ Claude Vision AI
  "@googlemaps/google-maps-services-js": "^3.4.2", // ✅ Geocoding + Places
  "@prisma/client": "^6.19.0",              // ✅ ORM Database
  "bull": "^4.16.5",                        // ✅ Job Queues
  "ioredis": "^5.8.2",                      // ✅ Redis client
  "express": "^5.1.0",                      // ✅ API Server
  "cors": "^2.8.5",                         // ✅ CORS
  "dotenv": "^17.2.3",                      // ✅ Env vars
  "multer": "^2.0.2",                       // ✅ File upload
  "string-similarity": "^4.0.4",            // ✅ Fuzzy matching
  "xlsx": "^0.18.5",                        // ✅ Excel parsing
  "cheerio": "^1.1.2"                       // ✅ Web scraping
}
```

#### ⚠️ Revisar

```json
{
  "prisma": "^6.19.0",  // 🟡 Mover para devDependencies (só build time)
  "openai": "^6.9.0"    // 🟡 Usado? Se não, remover (peso 2MB+)
}
```

**Recomendação**:
```bash
# Mover Prisma CLI para dev
npm install prisma --save-dev
npm install @prisma/client --save

# Se OpenAI não é usado, remover
npm uninstall openai
```

### Frontend - Análise Crítica

#### ✅ Produção (Bundle)

```json
{
  "react": "^19.1.1",                       // ✅ Core
  "react-dom": "^19.1.1",                   // ✅ Core
  "react-router-dom": "^6.30.1",            // ✅ Routing
  "axios": "^1.13.2",                       // ✅ API calls
  "lucide-react": "^0.552.0",               // ✅ Icons
  "recharts": "^3.3.0",                     // ✅ Charts/Analytics
  "react-hot-toast": "^2.6.0",              // ✅ Notifications
  "zod": "^4.1.12",                         // ✅ Validation
  "file-saver": "^2.0.5",                   // ✅ Export Excel
  "xlsx": "^0.18.5"                         // ✅ Excel parsing
}
```

#### 🟡 Opcional (Monitoramento)

```json
{
  "@sentry/react": "^10.25.0",              // 🟡 Error tracking
  "posthog-js": "^1.292.0",                 // 🟡 Analytics
  "web-vitals": "^5.1.0"                    // 🟡 Performance
}
```

**Bundle Size Estimado**:
- Vendor: ~350 KB gzipped
- App Code: ~120 KB gzipped
- **Total**: ~470 KB (excelente)

---

## 🌐 Estrutura de URLs (Railway)

### Domínios Gerados Automaticamente

```
Backend API:
https://scampepisico-backend.up.railway.app

Frontend:
https://scampepisico-frontend.up.railway.app

PostgreSQL:
postgres://<user>:<password>@<host>:<port>/<database>
(Interno - não exposto publicamente)

Redis:
redis://default:<password>@<host>:<port>
(Interno - não exposto publicamente)
```

### Domínio Customizado (Opcional)

```
Frontend: https://rac.pepsico.com.br
Backend API: https://api.rac.pepsico.com.br
```

**Configuração**:
1. Railway Dashboard → Service → Settings → Domains
2. Adicionar CNAME no DNS:
   ```
   rac.pepsico.com.br → CNAME → scampepisico-frontend.up.railway.app
   api.rac.pepsico.com.br → CNAME → scampepisico-backend.up.railway.app
   ```

---

## 💰 Estimativa de Custos Railway

### Recursos Estimados

| Serviço | CPU | RAM | Disco | Custo Mensal |
|---------|-----|-----|-------|--------------|
| PostgreSQL | 0.1 vCPU | 1 GB | 5 GB | ~$10 |
| Redis | 0.1 vCPU | 512 MB | 1 GB | ~$5 |
| Backend | 0.5 vCPU | 2 GB | - | ~$15 |
| Frontend (Static) | - | - | 1 GB | ~$0-5 |
| **TOTAL RAILWAY** | | | | **~$30-35** |

### Custos Externos (APIs)

| Serviço | Volume Estimado | Custo Mensal |
|---------|-----------------|--------------|
| **Google Maps API** | | |
| - Geocoding | 10.000 req/mês | $50 |
| - Places API | 15.000 req/mês | $150 |
| - Photos API | 5.000 req/mês | $35 |
| **Claude API (Anthropic)** | | |
| - Vision (Haiku) | 500 imagens/mês | $50 |
| - Tipologia (Haiku) | 500 análises/mês | $25 |
| **TOTAL APIs** | | **~$310** |

### 💡 Otimizações de Custo

1. **Google Maps**:
   - Cache agressivo de geocoding (Redis)
   - Reutilizar Place IDs
   - **Economia**: -30% (~$70/mês)

2. **Claude API**:
   - Usar Haiku em vez de Sonnet (73% mais barato) ✅ JÁ IMPLEMENTADO
   - Batch processing de imagens
   - **Economia**: -50% (~$37/mês)

3. **Railway**:
   - Auto-sleep em horários ociosos (não recomendado para prod)
   - Reduzir réplicas fora de pico

**CUSTO TOTAL OTIMIZADO**: ~$240-280/mês

---

## 🔒 Segurança e Secrets

### Variáveis Secretas (Railway Environment Variables)

**NUNCA commitar no Git**:
- ✅ `.env` já está em `.gitignore`
- ✅ API keys devem estar APENAS no Railway Dashboard

**Gerenciamento**:
```bash
# Railway CLI
railway variables set ANTHROPIC_API_KEY=sk-ant-...
railway variables set GOOGLE_MAPS_API_KEY=AIza...
railway variables set JWT_SECRET=$(openssl rand -base64 32)
```

**Secrets Obrigatórias**:
- `ANTHROPIC_API_KEY` (Claude Vision)
- `GOOGLE_MAPS_API_KEY` (Geocoding + Places)
- `JWT_SECRET` (autenticação futura)

**Secrets Opcionais**:
- `OPENAI_API_KEY` (fallback)
- `SENTRY_DSN` (error tracking)
- `POSTHOG_KEY` (analytics)

---

## 🚦 Migrations e Deploy Inicial

### Sequência de Deploy

```mermaid
graph TD
    A[1. Criar PostgreSQL Service] --> B[2. Criar Redis Service]
    B --> C[3. Deploy Backend]
    C --> D[4. Executar Migrations]
    D --> E[5. Deploy Frontend]
    E --> F[6. Configurar Domínios]
    F --> G[7. Testar Health Check]
```

### Passo a Passo Detalhado

#### 1. PostgreSQL
```bash
# Railway Dashboard
New → Database → PostgreSQL
Name: scampepisico-postgres
Region: US West (ou mais próximo do Brasil: não disponível)
```

#### 2. Redis
```bash
# Railway Dashboard
New → Database → Redis
Name: scampepisico-redis
Region: mesma do PostgreSQL
```

#### 3. Backend
```bash
# Railway Dashboard
New → GitHub Repo → scampepisico
Root Directory: /backend
Build Command: npm run build
Start Command: npx prisma migrate deploy && npm start
```

**Configurar Variáveis**:
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
GOOGLE_MAPS_API_KEY=<PREENCHER>
ANTHROPIC_API_KEY=<PREENCHER>
JWT_SECRET=<GERAR>
CLAUDE_VISION_MODEL=haiku
PHOTOS_DIR=/app/uploads/fotos
```

**Conectar Serviços**:
- Link PostgreSQL → Backend
- Link Redis → Backend

#### 4. Executar Migrations

**Opção A - Automático (Start Command)**:
```bash
npx prisma migrate deploy && npm start
```

**Opção B - Manual (Railway CLI)**:
```bash
railway run npx prisma migrate deploy
railway run npx prisma generate
```

**Verificar Schema**:
```bash
railway run npx prisma studio
# Abre interface web para visualizar tabelas
```

#### 5. Frontend
```bash
# Railway Dashboard
New → GitHub Repo → scampepisico
Root Directory: /frontend
Build Command: npm run build
Output Directory: dist
```

**Configurar Variáveis**:
```env
VITE_API_URL=https://scampepisico-backend.up.railway.app
```

**⚠️ IMPORTANTE**: Se mudar domínio do backend, **rebuild frontend completo** (variáveis baked-in).

#### 6. Configurar CORS

Após obter URL do frontend, atualizar backend:

```env
# Backend Railway Environment
FRONTEND_URL=https://scampepisico-frontend.up.railway.app
```

E modificar `backend/src/index.ts` conforme mostrado anteriormente.

#### 7. Health Check

```bash
# Backend
curl https://scampepisico-backend.up.railway.app/health
# Esperado: {"status":"ok","timestamp":"...","uptime":123,"environment":"production"}

# Frontend
curl -I https://scampepisico-frontend.up.railway.app
# Esperado: HTTP/2 200
```

---

## 🧪 Testes Pré-Deploy

### Checklist de Validação

```bash
# 1. Build local
cd backend
npm run build
# Deve compilar sem erros

cd ../frontend
npm run build
# Deve gerar /dist

# 2. Testar produção localmente
cd ../backend
NODE_ENV=production npm start
# Server deve iniciar na porta 4000

# 3. Testar migrations
npx prisma migrate deploy
# Deve executar sem erros

# 4. Testar workers
# Verificar logs de cada queue:
# ✅ Todas as filas despausadas e prontas para processar

# 5. Testar uploads
# POST /api/upload com arquivo Excel
# Verificar se processa corretamente

# 6. Testar pipeline completo
npm run test:all-sprints
# Todos os testes devem passar
```

---

## 🔍 Monitoramento e Logs

### Railway Logs

**Visualizar em Tempo Real**:
```bash
# CLI
railway logs --service scampepisico-backend
railway logs --service scampepisico-postgres
railway logs --service scampepisico-redis
```

**Dashboard**:
- Railway UI → Service → Deployments → Logs
- Filtros: `error`, `warning`, `Bull`, `Prisma`

### Logs Importantes

**Backend Inicialização**:
```
✅ Todas as filas despausadas e prontas para processar
📁 Servindo fotos de: /app/uploads/fotos
🚀 Server running on http://localhost:4000
🔌 Database conectado: PostgreSQL
🔴 Redis conectado: redis://...
```

**Processamento de Clientes**:
```
📊 Data Quality - <id>: 80% (ALTA) - 42/50 campos
🏷️  Tipologia atribuída: H3 - Padaria/Confeitaria (95% confiança)
📍 Geocoding - <nome>: -23.550520, -46.633308 (100% confiança)
🔍 Places - <nome>: 4.5★, 654 reviews (Place ID: ChIJ...)
📸 Análise Visual - <id>: 5 fotos processadas (Haiku)
```

**Erros Críticos**:
```
❌ Geocoding failed: ZERO_RESULTS
⚠️  Places API rate limit exceeded
🔴 Claude API error: insufficient_quota
```

### Alertas e Notificações

**Sentry (Opcional)**:
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% de transactions
});
```

**Railway Webhooks**:
```json
{
  "event": "deployment.failed",
  "webhook_url": "https://hooks.slack.com/services/..."
}
```

---

## 🐛 Troubleshooting Comum

### Problema 1: Build Falha

**Erro**:
```
error TS2307: Cannot find module '@prisma/client'
```

**Solução**:
```bash
# Adicionar ao Build Command
npm install && npx prisma generate && npm run build
```

---

### Problema 2: Migrations Falham

**Erro**:
```
Migration engine error: Connection refused
```

**Solução**:
```bash
# Verificar que DATABASE_URL está conectado corretamente
railway variables get DATABASE_URL

# Tentar migration manual
railway run npx prisma migrate deploy --schema=./prisma/schema.prisma
```

---

### Problema 3: Bull Queues Pausadas

**Sintoma**: Jobs não processam

**Solução**:
```typescript
// backend/src/index.ts já tem:
await receitaQueue.resume();
await geocodingQueue.resume();
// ... etc

// Ou via Redis CLI:
railway run redis-cli
> KEYS *paused*
> DEL bull:receita-queue:paused
```

---

### Problema 4: CORS Error

**Erro**:
```
Access to fetch at 'https://backend...' from origin 'https://frontend...' has been blocked by CORS policy
```

**Solução**:
```typescript
// backend/src/index.ts
app.use(cors({
  origin: [
    'https://scampepisico-frontend.up.railway.app',
    process.env.FRONTEND_URL,
  ],
  credentials: true,
}));
```

---

### Problema 5: Uploads Perdidos

**Sintoma**: Fotos desaparecem após redeploy

**Solução**:
```yaml
# railway.toml
[deploy]
volumes = ["/app/uploads"]
```

Ou implementar S3/R2 (recomendado).

---

### Problema 6: Out of Memory

**Erro**:
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solução**:
```bash
# Railway Dashboard → Settings → Resources
Memory: 1 GB → 2 GB

# Ou limitar Node.js
Start Command: node --max-old-space-size=1536 dist/index.js
```

---

## 📊 Performance e Otimizações

### Database Indexing

```sql
-- Adicionar índices para queries frequentes
CREATE INDEX idx_cliente_status ON "clientes" ("status");
CREATE INDEX idx_cliente_tipologia ON "clientes" ("tipologia");
CREATE INDEX idx_cliente_potencial ON "clientes" ("potencialCategoria", "potencialScore");
CREATE INDEX idx_cliente_cidade ON "clientes" ("cidade", "estado");
```

Adicionar ao schema Prisma:

```prisma
model Cliente {
  // ...

  @@index([status])
  @@index([tipologia])
  @@index([potencialCategoria, potencialScore])
  @@index([cidade, estado])
}
```

### Redis Caching

```typescript
// Exemplo: Cache de Geocoding
const cacheKey = `geocoding:${endereco}:${cidade}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const result = await googleMapsClient.geocode({ address });
await redis.setex(cacheKey, 86400 * 30, JSON.stringify(result)); // 30 dias
```

### Connection Pooling

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Railway: connection_limit=10 (padrão)
}
```

Railway PostgreSQL já tem pooling automático (PgBouncer).

---

## 🔄 CI/CD e Deployments

### Railway Auto-Deploy

**Configuração**:
```yaml
# railway.toml (criar na raiz do projeto)
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npx prisma migrate deploy && npm start"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[deploy.volumes]]
mountPath = "/app/uploads"
```

**Branches**:
- `main` → Produção (deploy automático)
- `develop` → Staging (deploy manual)
- `feature/*` → Preview Environments (opcional)

### GitHub Actions (Opcional)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Deploy Backend
        run: railway up --service scampepisico-backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

      - name: Deploy Frontend
        run: railway up --service scampepisico-frontend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 🎯 Próximos Passos

### Pré-Deploy (Antes de ir para Railway)

- [ ] Revisar e mover `prisma` para `devDependencies`
- [ ] Remover `openai` se não usado
- [ ] Testar build local completo
- [ ] Executar `npm run test:all-sprints`
- [ ] Implementar estratégia de uploads (Volume ou S3)
- [ ] Gerar `JWT_SECRET` seguro
- [ ] Documentar API keys necessárias

### Deploy Inicial

- [ ] Criar projeto Railway
- [ ] Provisionar PostgreSQL
- [ ] Provisionar Redis
- [ ] Deploy Backend com variáveis
- [ ] Executar migrations
- [ ] Deploy Frontend
- [ ] Configurar CORS
- [ ] Testar health check
- [ ] Upload planilha teste

### Pós-Deploy

- [ ] Configurar domínio customizado (opcional)
- [ ] Implementar Sentry (error tracking)
- [ ] Implementar PostHog (analytics)
- [ ] Configurar backups automáticos
- [ ] Documentar URLs de produção
- [ ] Treinar equipe no sistema

### Otimizações Futuras

- [ ] Implementar CDN para frontend (Cloudflare)
- [ ] Migrar uploads para S3/R2
- [ ] Implementar rate limiting (express-rate-limit)
- [ ] Adicionar autenticação/autorização
- [ ] Implementar audit logs
- [ ] Cache de API responses (Redis)
- [ ] Horizontal scaling (múltiplas instâncias backend)

---

## 📚 Recursos e Referências

### Documentação

- [Railway Docs](https://docs.railway.app)
- [Prisma Deploy](https://www.prisma.io/docs/guides/deployment)
- [Bull Queue](https://github.com/OptimalBits/bull)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

### Comandos Railway CLI

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Iniciar projeto
railway init

# Conectar serviço
railway link

# Ver logs
railway logs

# Executar comando remoto
railway run npx prisma studio

# Abrir dashboard
railway open
```

### Custos e Pricing

- [Railway Pricing](https://railway.app/pricing) - $5/mês + recursos usados
- [Google Maps Pricing](https://cloud.google.com/maps-platform/pricing)
- [Anthropic Pricing](https://www.anthropic.com/pricing)

---

## ✅ Resumo Executivo

### Sistema Pronto para Deploy?

**✅ SIM**, com as seguintes ressalvas:

1. **Configurações Mínimas Necessárias**:
   - Adicionar 11 variáveis de ambiente no Railway
   - Configurar CORS com URL do frontend
   - Escolher estratégia de uploads (Volume ou S3)

2. **Custo Estimado**: $240-280/mês (Railway + APIs)

3. **Arquitetura**: 4 serviços Railway (Postgres, Redis, Backend, Frontend)

4. **Complexidade**: Média (Bull queues, Prisma migrations, AI APIs)

5. **Tempo de Deploy**: 2-3 horas (primeira vez)

### Recomendações Finais

1. **Iniciar com Railway Hobby Plan** ($5/mês) → validar funcionamento
2. **Migrar para Pro Plan** ($20/mês) quando em produção (backups automáticos)
3. **Implementar S3/R2** para uploads (não usar Railway Volumes em prod)
4. **Configurar Sentry** para monitoramento de erros
5. **Testar localmente** com `NODE_ENV=production` antes do deploy

---

**Última Atualização**: 2025-12-01
**Versão do Sistema**: 0.5.0
**Status**: ✅ Pronto para Deploy
