# 🚨 Relatório de Prontidão para Deploy - Railway
## Análise Enterprise do Sistema RAC PepsiCo

**Data**: 2025-12-01
**Equipe**: Desenvolvimento Enterprise Senior
**Status**: ❌ **NÃO PRONTO PARA DEPLOY** - Bloqueadores críticos identificados

---

## 📊 Executive Summary

O sistema **NÃO PODE** ser deployado no Railway no estado atual devido a:

- ❌ **2 build failures críticos** (backend + frontend)
- ⚠️ **8 configurações essenciais faltando**
- ⚠️ **3 riscos de segurança** identificados
- ⚠️ **1 problema arquitetural** (armazenamento de uploads)

**Tempo estimado para correção**: 4-6 horas
**Prioridade**: P0 (Crítica)

---

## 🔴 BLOQUEADORES CRÍTICOS (P0)

### 1. Backend Build Failure

**Status**: ❌ **BLOQUEADOR ABSOLUTO**
**Arquivo**: `backend/src/workers/receita.worker.enhanced.ts`

**Erro**:
```
error TS2345: Argument of type '{ correlationId: string; clienteId: string; ... }'
is not assignable to parameter of type 'LogContext'.
Property 'operacao' is missing
```

**Root Cause**:
O arquivo `receita.worker.enhanced.ts` está chamando `logger.log()` sem o campo obrigatório `operacao` no contexto.

**Impacto**:
- 🔴 Build do TypeScript falha completamente
- 🔴 Deploy no Railway falhará em 100% dos casos
- 🔴 Aplicação não inicia em produção

**Solução Requerida**:
```typescript
// ANTES (linha 55-59)
await logger.log(baseContext, {
  mensagem: 'Buscando dados do cliente no banco de dados',
  nivel: LogLevel.DEBUG,
  operacao: 'DATABASE_READ', // ← adicionado como "any"
} as any);

// CORRETO
await logger.log({
  ...baseContext,
  operacao: Operacao.DATABASE_READ, // ← adicionar ao baseContext
}, {
  mensagem: 'Buscando dados do cliente no banco de dados',
  nivel: LogLevel.DEBUG,
});
```

**Locais a corrigir**: 6 ocorrências no arquivo (linhas 55, 104, 171, 201, 237, 303)

**Estimativa**: 15 minutos

---

### 2. Frontend Build Failure

**Status**: ❌ **BLOQUEADOR ABSOLUTO**
**Arquivo**: `frontend/src/utils/sanitize.ts`

**Erro**:
```
error TS1005: '>' expected.
error TS1005: ')' expected.
error TS1161: Unterminated regular expression literal.
```

**Root Cause**:
Erro de sintaxe no arquivo `sanitize.ts`, provavelmente regex malformado ou caractere especial não escapado.

**Impacto**:
- 🔴 Build do frontend falha completamente
- 🔴 Deploy no Railway falhará
- 🔴 Aplicação web não carrega

**Investigação Necessária**:
O arquivo parece estar correto nas linhas 95-111 lidas, mas TypeScript reporta erro na linha 104. Possível problema:
- Caractere Unicode invisível
- Arquivo corrompido
- Cache do TypeScript desatualizado

**Solução Requerida**:
1. Revisar linha 104: `className={className}`
2. Verificar encoding do arquivo (deve ser UTF-8)
3. Limpar cache TypeScript: `rm -rf node_modules/.cache`
4. Rebuild completo

**Estimativa**: 30 minutos

---

## ⚠️ CONFIGURAÇÕES CRÍTICAS FALTANDO (P1)

### 3. Variáveis de Ambiente - Sem Template

**Status**: ⚠️ **CONFIGURAÇÃO FALTANDO**

**Problema**:
- ❌ Não existe `.env.example` no projeto
- ❌ Desenvolvedor não saberá quais variáveis configurar no Railway
- ❌ API keys hardcoded no `.env` atual (risco de commit acidental)

**Impacto**:
- Deploy manual propenso a erros (esquecer variáveis)
- Risco de segurança (API keys expostas)
- Onboarding de novos devs dificultado

**Solução Requerida**:

```bash
# Criar backend/.env.example
cat > backend/.env.example << 'EOF'
# Database (Railway injeta automaticamente)
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis (Railway injeta automaticamente)
REDIS_URL=redis://default:password@host:6379

# Google Maps API
GOOGLE_MAPS_API_KEY=your_api_key_here

# Anthropic Claude API
ANTHROPIC_API_KEY=your_api_key_here

# OpenAI (Opcional)
OPENAI_API_KEY=your_api_key_here

# Security
JWT_SECRET=generate_random_string_here

# Application
NODE_ENV=production
PORT=4000
CLAUDE_VISION_MODEL=haiku
PHOTOS_DIR=/app/uploads/fotos
EOF
```

**Estimativa**: 10 minutos

---

### 4. Railway Configuration File

**Status**: ⚠️ **CONFIGURAÇÃO FALTANDO**

**Problema**:
- ❌ Não existe `railway.toml` ou `railway.json`
- ❌ Railway usará configurações default (pode não funcionar)
- ❌ Sem healthcheck configurado
- ❌ Sem volume para uploads persistentes

**Impacto**:
- Deploy pode falhar silenciosamente
- Uploads de fotos serão perdidos a cada redeploy
- Sem monitoring de health

**Solução Requerida**:

```toml
# Criar railway.toml na raiz do projeto
[build]
builder = "NIXPACKS"
buildCommand = "cd backend && npm install && npx prisma generate && npm run build"

[deploy]
startCommand = "cd backend && npx prisma migrate deploy && npm start"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[deploy.volumes]]
mountPath = "/app/uploads"
name = "uploads-storage"
```

**Estimativa**: 20 minutos

---

### 5. CORS Configuration - Hardcoded

**Status**: ⚠️ **CRÍTICO PARA PRODUÇÃO**

**Problema** [backend/src/index.ts:50](backend/src/index.ts:50):
```typescript
app.use(cors()); // ← ACEITA QUALQUER ORIGEM!!!
```

**Impacto**:
- 🔴 **Vulnerabilidade de segurança**: CSRF, XSS, data leakage
- 🔴 Produção exposta a qualquer domínio malicioso
- 🔴 Não passa em auditoria de segurança

**Solução Requerida**:

```typescript
// backend/src/index.ts
const allowedOrigins = [
  'http://localhost:3000', // Dev local
  process.env.FRONTEND_URL, // Railway frontend
  'https://scampepisico-frontend.up.railway.app', // Fallback
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sem origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || !process.env.NODE_ENV === 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

**Estimativa**: 15 minutos

---

### 6. Frontend API URL - Hardcoded

**Status**: ⚠️ **BLOQUEADOR DE PRODUÇÃO**

**Problema**:
- ❌ Frontend não tem configuração de `VITE_API_URL`
- ❌ Provavelmente está hardcoded como `localhost:4000`
- ❌ Não funcionará após deploy no Railway

**Investigação Necessária**:
```bash
# Procurar por hardcoded URLs
grep -r "localhost:4000" frontend/src
grep -r "http://localhost" frontend/src
```

**Solução Requerida**:

```typescript
// frontend/src/config/api.ts (criar se não existir)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// frontend/.env.production (criar)
VITE_API_URL=https://scampepisico-backend.up.railway.app
```

**Estimativa**: 20 minutos

---

### 7. Database Connection Pooling

**Status**: ⚠️ **PERFORMANCE CRÍTICA**

**Problema** [backend/prisma/schema.prisma](backend/prisma/schema.prisma):
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // ← SEM CONFIGURAÇÃO DE POOL!!!
}
```

**Impacto**:
- ⚠️ Connection pool default (ilimitado)
- ⚠️ Possível esgotamento de conexões PostgreSQL
- ⚠️ Timeouts em produção sob carga

**Solução Requerida**:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["metrics"]
}
```

```typescript
// backend/src/db/prisma.ts (criar singleton)
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

**Estimativa**: 30 minutos

---

### 8. Graceful Shutdown - Não Implementado

**Status**: ⚠️ **PRODUÇÃO ESSENCIAL**

**Problema** [backend/src/index.ts:112-116](backend/src/index.ts:112-116):
```typescript
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  // ← SEM GRACEFUL SHUTDOWN!!!
});
```

**Impacto**:
- ⚠️ Jobs Bull em execução são abortados abruptamente no redeploy
- ⚠️ Conexões DB não são fechadas corretamente
- ⚠️ Possível corrupção de dados em processamento
- ⚠️ Railway mata processo com SIGTERM → perda de jobs

**Solução Requerida**:

```typescript
// backend/src/index.ts
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`\n🛑 ${signal} recebido, iniciando graceful shutdown...`);

  // 1. Parar de aceitar novas requisições
  server.close(() => {
    console.log('✅ HTTP server fechado');
  });

  // 2. Pausar todas as filas Bull
  try {
    await receitaQueue.pause();
    await normalizationQueue.pause();
    await geocodingQueue.pause();
    await placesQueue.pause();
    await analysisQueue.pause();
    await tipologiaQueue.pause();
    console.log('✅ Todas as filas pausadas');
  } catch (error) {
    console.error('❌ Erro ao pausar filas:', error);
  }

  // 3. Aguardar jobs ativos finalizarem (timeout 30s)
  const timeout = setTimeout(() => {
    console.warn('⚠️  Timeout: forçando shutdown...');
    process.exit(1);
  }, 30000);

  // 4. Fechar conexões Prisma
  await prisma.$disconnect();
  console.log('✅ Database disconnected');

  clearTimeout(timeout);
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```

**Estimativa**: 45 minutos

---

### 9. Error Handler Middleware - Ausente

**Status**: ⚠️ **PRODUÇÃO ESSENCIAL**

**Problema** [backend/src/index.ts:104-109](backend/src/index.ts:104-109):
```typescript
// Rota 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada', path: req.path });
});
// ← SEM ERROR HANDLER!!!
```

**Impacto**:
- 🔴 Erros não capturados crasheiam a aplicação
- 🔴 Stack traces vazam para o cliente em produção
- 🔴 Sem logging estruturado de erros
- 🔴 Não passa em auditoria de segurança

**Solução Requerida**:

```typescript
// backend/src/middleware/error-handler.ts (criar)
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log erro
  console.error('🔴 Erro:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Se é AppError operacional
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
      path: req.path,
    });
  }

  // Erro não esperado - 500
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message,
    path: req.path,
  });
};

// backend/src/index.ts (adicionar APÓS todas as rotas)
app.use(errorHandler);
```

**Estimativa**: 30 minutos

---

### 10. Upload Storage Strategy - Não Definida

**Status**: ⚠️ **ARQUITETURA CRÍTICA**

**Problema** [backend/src/index.ts:55-56](backend/src/index.ts:55-56):
```typescript
const photosDir = process.env.PHOTOS_DIR || path.join(__dirname, '../uploads/fotos');
app.use('/api/fotos', express.static(photosDir));
```

**Impacto**:
- 🔴 **Railway filesystem é EFÊMERO** → todas as fotos serão perdidas a cada redeploy
- 🔴 Uploads de planilhas com fotos falharão após 1º deploy
- 🔴 Análise de Vision AI ficará sem fotos históricas
- 🔴 Sistema inutilizável em produção

**Opções de Solução**:

**Opção A - Railway Volumes** (Mais simples):
```toml
# railway.toml
[[deploy.volumes]]
mountPath = "/app/uploads"
name = "uploads-storage"
```
- ✅ Simples de configurar
- ✅ Sem código adicional
- ❌ Limitado a 1 instância (não escala horizontalmente)
- ❌ Custo: $0.25/GB/mês

**Opção B - Cloudflare R2** (Recomendado para produção):
```bash
npm install @aws-sdk/client-s3
```

```typescript
// backend/src/services/storage.service.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT, // Cloudflare R2
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadPhoto(file: Buffer, filename: string) {
  await s3.send(new PutObjectCommand({
    Bucket: 'scampepisico-uploads',
    Key: `fotos/${filename}`,
    Body: file,
    ContentType: 'image/jpeg',
  }));

  return `https://uploads.scampepisico.com/fotos/${filename}`;
}
```

- ✅ Escalável horizontalmente
- ✅ CDN global (Cloudflare)
- ✅ Custo baixo ($0.015/GB/mês armazenamento, $0/egress até 10TB)
- ❌ Requer refactor do código de upload

**Opção C - Database BLOB** (NÃO RECOMENDADO):
- ❌ PostgreSQL ficará muito pesado (GBs de fotos)
- ❌ Backups lentos
- ❌ Performance ruim

**Decisão Requerida**: Escolher entre Opção A (deploy rápido) ou Opção B (produção robusta)

**Estimativa**:
- Opção A: 10 minutos
- Opção B: 3-4 horas (refactor completo)

---

## 🟡 MELHORIAS IMPORTANTES (P2)

### 11. Health Check Incompleto

**Status**: 🟡 **BOAS PRÁTICAS**

**Problema** [backend/src/index.ts:60-67](backend/src/index.ts:60-67):
```typescript
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    // ← NÃO VERIFICA CONEXÃO COM DB/REDIS!!!
  });
});
```

**Melhor Prática**:
```typescript
app.get('/health', async (req: Request, res: Response) => {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    checks: {
      database: 'unknown',
      redis: 'unknown',
      queues: 'unknown',
    }
  };

  // Verificar DB
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = 'healthy';
  } catch (error) {
    checks.checks.database = 'unhealthy';
    checks.status = 'degraded';
  }

  // Verificar Redis
  try {
    await receitaQueue.client.ping();
    checks.checks.redis = 'healthy';
  } catch (error) {
    checks.checks.redis = 'unhealthy';
    checks.status = 'degraded';
  }

  // Verificar filas
  const queueStatus = await receitaQueue.getJobCounts();
  checks.checks.queues = `${queueStatus.active} active, ${queueStatus.waiting} waiting`;

  const statusCode = checks.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(checks);
});
```

**Estimativa**: 30 minutos

---

### 12. Logging em Produção - Console.log

**Status**: 🟡 **BOAS PRÁTICAS**

**Problema**:
Sistema usa `console.log()` em toda parte. Em produção Railway:
- ❌ Logs não estruturados (difícil de buscar)
- ❌ Sem levels (tudo é INFO)
- ❌ Sem correlation IDs entre requests
- ❌ Railway cobra por volume de logs

**Recomendação**: Implementar logger estruturado (Winston ou Pino)

```bash
npm install pino pino-pretty
```

```typescript
// backend/src/utils/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
});
```

**Estimativa**: 2 horas (refactor global)

---

### 13. Rate Limiting - Não Implementado

**Status**: 🟡 **SEGURANÇA**

**Problema**: APIs públicas sem rate limiting
- ⚠️ Vulnerável a DDoS
- ⚠️ Custos de API externa podem explodir (Google Maps, Claude)
- ⚠️ Abuse de upload de planilhas

**Solução**:
```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: 'Muitas requisições, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Upload mais restritivo
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 uploads por hora
});

app.use('/api/upload', uploadLimiter);
```

**Estimativa**: 20 minutos

---

### 14. Dependências - Otimização

**Status**: 🟡 **OTIMIZAÇÃO**

**Problema**: `prisma` em `dependencies` (deveria ser `devDependencies`)

```json
// backend/package.json
"dependencies": {
  "prisma": "^6.19.0",  // ← MOVER PARA devDependencies
  "@prisma/client": "^6.19.0" // ← CORRETO
}
```

**Impacto**:
- Aumenta tamanho do deploy desnecessariamente (+50MB)
- Railway cobra por storage

**Solução**:
```bash
cd backend
npm uninstall prisma
npm install -D prisma
```

**Estimativa**: 5 minutos

---

### 15. Node Version - Não Especificada

**Status**: 🟡 **BOA PRÁTICA**

**Problema**: Sem `.nvmrc` ou `engines` no `package.json`
- Railway pode usar versão incompatível do Node.js
- Comportamento inconsistente dev vs prod

**Solução**:

```json
// backend/package.json
{
  "engines": {
    "node": ">=18.0.0 <21.0.0",
    "npm": ">=9.0.0"
  }
}
```

```bash
# .nvmrc (raiz do projeto)
echo "18.19.0" > .nvmrc
```

**Estimativa**: 5 minutos

---

## 📋 CHECKLIST DE DEPLOY

### Pré-Requisitos

- [ ] **BLOQUEADOR**: Corrigir build do backend (`receita.worker.enhanced.ts`)
- [ ] **BLOQUEADOR**: Corrigir build do frontend (`sanitize.ts`)
- [ ] Criar `.env.example`
- [ ] Criar `railway.toml`
- [ ] Configurar CORS para produção
- [ ] Configurar `VITE_API_URL` no frontend
- [ ] Implementar graceful shutdown
- [ ] Implementar error handler middleware
- [ ] Decidir estratégia de storage (Volume ou R2)

### Segurança

- [ ] Gerar `JWT_SECRET` seguro (`openssl rand -base64 32`)
- [ ] Remover API keys hardcoded do código
- [ ] Configurar rate limiting
- [ ] Revisar permissões CORS
- [ ] Adicionar helmet.js para security headers

### Performance

- [ ] Configurar connection pool Prisma
- [ ] Implementar graceful shutdown
- [ ] Otimizar dependências (mover `prisma` para devDeps)
- [ ] Health check com verificações reais

### Testes

- [ ] Build local do backend (`npm run build`)
- [ ] Build local do frontend (`npm run build`)
- [ ] Testar migrations (`npx prisma migrate deploy`)
- [ ] Executar `npm run test:all-sprints`
- [ ] Testar graceful shutdown local

---

## 🚀 PLANO DE AÇÃO RECOMENDADO

### Fase 1: Correções Críticas (2-3 horas)

1. **[P0] Corrigir builds** (1 hora)
   - Fix `receita.worker.enhanced.ts` (6 locais)
   - Fix `sanitize.ts` (investigar + corrigir)
   - Validar builds: `npm run build` em ambos

2. **[P1] Configurações essenciais** (1 hora)
   - Criar `.env.example`
   - Criar `railway.toml`
   - Configurar CORS
   - Configurar `VITE_API_URL`

3. **[P1] Storage decision** (30min ou 3h)
   - Se Railway Volume: 30 minutos
   - Se Cloudflare R2: 3 horas (refactor)

### Fase 2: Produção-Ready (2-3 horas)

4. **[P1] Error handling** (1 hora)
   - Implementar error handler middleware
   - Implementar graceful shutdown
   - Health check robusto

5. **[P2] Segurança** (1 hora)
   - Rate limiting
   - Security headers (helmet)
   - Audit de secrets

6. **[P2] Performance** (30 min)
   - Prisma connection pooling
   - Otimizar dependências
   - Node version pinning

### Fase 3: Deploy e Validação (1 hora)

7. **Deploy no Railway**
   - Provisionar PostgreSQL
   - Provisionar Redis
   - Deploy backend
   - Deploy frontend
   - Configurar variáveis de ambiente

8. **Smoke Tests**
   - Health check 200 OK
   - Upload planilha teste
   - Verificar pipeline completo
   - Verificar logs no Railway

---

## 💰 ESTIMATIVA DE ESFORÇO

| Prioridade | Tarefa | Tempo |
|------------|--------|-------|
| P0 | Build failures | 1h |
| P1 | Configurações essenciais | 1h |
| P1 | Storage strategy (Volume) | 0.5h |
| P1 | Error handling | 1h |
| P1 | Graceful shutdown | 0.75h |
| P2 | Segurança (CORS, rate limit) | 1h |
| P2 | Performance (pooling, deps) | 0.5h |
| P2 | Health check robusto | 0.5h |
| | **TOTAL MÍNIMO (Volume)** | **6.25h** |
| | **TOTAL COMPLETO (R2)** | **9h** |

---

## 🎯 RECOMENDAÇÃO FINAL

**Decisão**: Implementar **Fase 1 + Fase 2** antes de qualquer deploy.

**Justificativa**:
1. Builds quebrados = deploy impossível
2. CORS aberto = vulnerabilidade crítica de segurança
3. Sem graceful shutdown = perda de jobs em processamento
4. Sem error handling = crashes frequentes em produção

**Timeline sugerido**:
- **Dia 1**: Corrigir bloqueadores (Fase 1) → 3h
- **Dia 2**: Implementar produção-ready (Fase 2) → 3h
- **Dia 3**: Deploy + testes (Fase 3) → 1h

**Total**: 1-2 dias de desenvolvimento full-time

---

## 📞 PRÓXIMOS PASSOS

1. **IMEDIATO**: Corrigir os 2 build failures
2. **HOJE**: Implementar configurações essenciais (CORS, env vars)
3. **AMANHÃ**: Implementar error handling e graceful shutdown
4. **DIA 3**: Deploy no Railway

**Após deploy**:
- Monitorar logs Railway por 24-48h
- Executar load testing básico
- Documentar runbook de troubleshooting
- Configurar alertas (opcional: Sentry)

---

**Preparado por**: Equipe de Desenvolvimento Enterprise Senior
**Próxima revisão**: Após correção dos bloqueadores P0
