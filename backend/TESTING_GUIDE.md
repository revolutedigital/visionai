# 🧪 Guia de Testes - Sistema de Pipeline

**Versão**: 1.0
**Data**: 14 de Novembro de 2025
**Cobertura Alvo**: 85% (Lines/Statements), 75% (Branches), 80% (Functions)

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Testes](#estrutura-de-testes)
3. [Comandos de Teste](#comandos-de-teste)
4. [Testes Unitários](#testes-unitários)
5. [Testes de Integração](#testes-de-integração)
6. [Testes de Performance](#testes-de-performance)
7. [Testes de Regressão](#testes-de-regressão)
8. [Critérios de Aceite](#critérios-de-aceite)
9. [CI/CD Integration](#cicd-integration)

---

## 🎯 Visão Geral

Este projeto utiliza uma **matriz completa de testes** para garantir qualidade e performance em todos os componentes do pipeline de enriquecimento de dados.

### Tipos de Testes

| Tipo | Quantidade | Cobertura | Tempo Médio |
|------|-----------|-----------|-------------|
| **Unitários** | ~50 testes | 85%+ | 30s |
| **Integração** | ~20 testes | E2E completo | 2min |
| **Performance** | ~10 testes | 100 clientes | 5min |
| **Regressão** | ~30 testes | Features antigas | 1min |
| **TOTAL** | ~110 testes | - | ~8min |

---

## 📁 Estrutura de Testes

```
backend/src/tests/
├── unit/                           # Testes Unitários
│   ├── cache.service.spec.ts       # Redis cache
│   ├── fuzzy-matching.service.spec.ts
│   └── tipologia-validator.service.spec.ts
├── integration/                    # Testes de Integração
│   └── pipeline-e2e.spec.ts        # Pipeline completo
├── performance/                    # Testes de Performance
│   └── load-test.spec.ts           # 100 clientes simultâneos
├── regression/                     # Testes de Regressão
│   └── features.spec.ts            # Sprints 1-3
├── test-sprint1.ts                 # Testes específicos Sprint 1
├── test-sprint2.ts                 # Testes específicos Sprint 2
├── test-sprint3.ts                 # Testes específicos Sprint 3
└── setup.ts                        # Setup global Jest
```

---

## 🚀 Comandos de Teste

### Testes Gerais

```bash
# Rodar todos os testes
npm test

# Rodar testes unitários
npm run test:unit

# Rodar testes de integração
npm run test:integration

# Rodar testes de performance
npm run test:performance

# Rodar testes de regressão
npm run test:regression

# Rodar com coverage
npm run test:coverage

# Watch mode (desenvolvimento)
npm run test:watch

# CI/CD mode
npm run test:ci
```

### Testes por Sprint

```bash
# Sprint 1: Cache + Fuzzy Matching
npm run test:sprint1

# Sprint 2: Geo Validation + Quality Score
npm run test:sprint2

# Sprint 3: IA Optimization + Tipologias
npm run test:sprint3

# Todos os sprints
npm run test:all-sprints
```

---

## 🔬 Testes Unitários

**Objetivo**: Testar componentes isolados com 85%+ de cobertura.

### Cache Service (Sprint 1)

**Arquivo**: [cache.service.spec.ts](src/tests/unit/cache.service.spec.ts)

```typescript
describe('CacheService', () => {
  it('deve gerar chave formatada corretamente');
  it('deve armazenar e recuperar dados');
  it('deve retornar null para chave inexistente');
  it('deve expirar após TTL');
  it('deve invalidar todas as chaves com prefixo');
});
```

**Cobertura Esperada**: 90%+

### Fuzzy Matching Service (Sprint 1)

**Arquivo**: [fuzzy-matching.service.spec.ts](src/tests/unit/fuzzy-matching.service.spec.ts)

```typescript
describe('FuzzyMatchingService', () => {
  // Levenshtein Distance
  it('deve calcular distância 0 para strings iguais');
  it('deve calcular distância correta');

  // Jaro-Winkler Similarity
  it('deve retornar 100 para strings iguais');
  it('deve retornar alta similaridade para nomes parecidos');

  // Token Set Ratio
  it('deve retornar 100 para ordem diferente');

  // Validações
  it('deve validar nome exato');
  it('deve validar endereço com abreviações');
});
```

**Cobertura Esperada**: 85%+

### Tipologia Validator (Sprint 3)

**Arquivo**: [tipologia-validator.service.spec.ts](src/tests/unit/tipologia-validator.service.spec.ts)

```typescript
describe('TipologiaValidatorService', () => {
  it('deve validar padaria com match perfeito');
  it('deve detectar divergência (padaria vs farmácia)');
  it('deve sugerir pizzaria para restaurant');
  it('deve encontrar keyword "padaria" no nome');
});
```

**Cobertura Esperada**: 80%+

---

## 🔗 Testes de Integração

**Objetivo**: Testar fluxo completo do pipeline E2E.

**Arquivo**: [pipeline-e2e.spec.ts](src/tests/integration/pipeline-e2e.spec.ts)

### Cenários Testados

#### 1. Cliente Novo (sem cache)
```typescript
it('deve processar pipeline completo', async () => {
  // 1. Criar cliente
  // 2. Verificar Receita Status = PENDENTE
  // 3. Verificar Geocoding Status = PENDENTE
  // 4. Verificar Places Status = PENDENTE
});
```

#### 2. Cliente com Dados Cacheados
```typescript
it('deve reutilizar cache de Receita', async () => {
  // Simular cache HIT
  // Verificar que não chamou API novamente
});
```

#### 3. Cliente com Divergências
```typescript
it('deve detectar divergências de endereço', async () => {
  // Criar cliente com endereço diferente da Receita
  // Verificar divergenciaEndereco = true
  // Verificar similaridadeEndereco < 60%
});
```

#### 4. Validação Geo (Sprint 2)
```typescript
it('deve validar coordenadas dentro do estado', async () => {
  // Coordenadas válidas (São Paulo)
  // Verificar geoValidado = true
  // Verificar geoWithinState = true
});

it('deve detectar coordenadas fora do estado', async () => {
  // Coordenadas RJ mas estado SP
  // Verificar geoValidado = false
});
```

#### 5. Tipologia (Sprint 3)
```typescript
it('deve classificar tipologia Pepsi', async () => {
  // Tipologia H3 (PADARIA)
  // Verificar confiança >= 70%
  // Verificar não divergente
});

it('deve detectar divergência IA × Places', async () => {
  // IA diz PADARIA, Places diz pharmacy
  // Verificar tipologiaDivergente = true
});
```

### Métricas do Pipeline
```typescript
it('deve calcular taxa de validação geo', async () => {
  // Taxa de validação > 90%
  // Taxa de divergência < 10%
});
```

**Tempo de Execução**: ~2min
**Critério de Sucesso**: 100% dos cenários devem passar

---

## ⚡ Testes de Performance

**Objetivo**: Validar que o sistema suporta carga e atende SLAs.

**Arquivo**: [load-test.spec.ts](src/tests/performance/load-test.spec.ts)

### Cenários de Load

#### 1. Criação em Massa
```typescript
it('deve criar 100 clientes com P95 < 2000ms', async () => {
  // Criar 100 clientes em paralelo
  // Calcular P50, P95, P99
  // Validar P95 < 2000ms
});
```

**Critérios**:
- ✅ P50 < 500ms
- ✅ P95 < 2000ms
- ✅ 0 falhas

#### 2. Busca com Filtros
```typescript
it('deve buscar clientes com P95 < 1000ms', async () => {
  // 100 queries com diferentes filtros
  // Validar P95 < 1000ms
});
```

**Critérios**:
- ✅ P95 < 1000ms
- ✅ Todas as queries retornam resultados

#### 3. Atualização em Massa
```typescript
it('deve atualizar clientes com P95 < 1500ms', async () => {
  // Atualizar 50 clientes
  // Validar P95 < 1500ms
});
```

#### 4. Agregações
```typescript
it('deve calcular estatísticas com P95 < 2000ms', async () => {
  // GroupBy por status, estado
  // Aggregate de potencial score
  // Validar P95 < 2000ms
});
```

#### 5. Stress Test - Concorrência
```typescript
it('deve suportar 50 operações simultâneas', async () => {
  // Mix de operações (read, write, aggregate)
  // Validar 0 falhas
  // Validar P95 < 3000ms
});
```

**Tempo de Execução**: ~5min
**Critérios de Aceite**:
- P95 < 5s em todas as etapas
- Taxa de sucesso = 100%
- 0 falhas de concorrência

---

## 🔄 Testes de Regressão

**Objetivo**: Garantir que features antigas ainda funcionam.

**Arquivo**: [features.spec.ts](src/tests/regression/features.spec.ts)

### Sprint 1: Fuzzy Matching
```typescript
describe('Sprint 1: Fuzzy Matching', () => {
  it('deve validar nome com alta similaridade');
  it('deve validar endereço com tokens diferentes');
  it('deve rejeitar nomes muito diferentes');
});
```

### Sprint 2: Geo Validation
```typescript
describe('Sprint 2: Geo Validation', () => {
  it('deve validar coordenadas de São Paulo');
  it('deve validar coordenadas de Porto Alegre');
  it('deve detectar coordenadas fora do estado');
  it('deve detectar coordenadas longe do centro');
});
```

### Sprint 2: Data Quality Scoring
```typescript
describe('Sprint 2: Data Quality Scoring', () => {
  it('deve calcular score de qualidade baixa');
  it('deve calcular score de qualidade alta');
  it('deve identificar campos críticos faltando');
});
```

### Database Schema
```typescript
describe('Database Schema', () => {
  it('deve salvar campos de fuzzy matching');
  it('deve salvar campos de geo validation');
  it('deve salvar campos de data quality');
  it('deve salvar campos de tipologia');
  it('deve permitir criar cliente sem novos campos');
});
```

**Tempo de Execução**: ~1min
**Critério de Sucesso**: 100% dos testes de regressão devem passar

---

## ✅ Critérios de Aceite

### Coverage Mínimo

| Métrica | Alvo | Atual |
|---------|------|-------|
| Lines | 85% | - |
| Statements | 85% | - |
| Branches | 75% | - |
| Functions | 80% | - |

### Performance

| Etapa | P95 Alvo | P95 Atual |
|-------|----------|-----------|
| Criação | < 2000ms | - |
| Busca | < 1000ms | - |
| Update | < 1500ms | - |
| Agregação | < 2000ms | - |
| Pipeline E2E | < 5000ms | - |

### Qualidade

- ✅ 0 bugs críticos
- ✅ 0 falhas de concorrência
- ✅ Taxa de sucesso = 100%
- ✅ Backward compatibility mantida

---

## 🤖 CI/CD Integration

### GitHub Actions / GitLab CI

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npx prisma migrate deploy

      - name: Run tests
        run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### Pre-commit Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Rodar testes unitários antes de commit
npm run test:unit

if [ $? -ne 0 ]; then
  echo "❌ Testes falharam. Commit abortado."
  exit 1
fi

echo "✅ Testes passaram!"
```

---

## 📊 Relatórios de Teste

### Gerar Relatório de Coverage

```bash
npm run test:coverage

# Visualizar HTML
open coverage/lcov-report/index.html
```

### Gerar Relatório de Performance

Os testes de performance geram métricas automáticas:

```
📊 Métricas de Criação:
   Total: 100 clientes
   Sucesso: 100 (100.0%)
   Falhas: 0
   P50: 450ms
   P95: 1850ms
   P99: 2100ms
   Avg: 550ms
   Min: 200ms
   Max: 2200ms
```

---

## 🐛 Debugging de Testes

### Rodar Teste Específico

```bash
# Rodar apenas um arquivo
npx jest cache.service.spec.ts

# Rodar apenas um describe
npx jest -t "CacheService"

# Rodar apenas um it
npx jest -t "deve gerar chave formatada"
```

### Debug com VSCode

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Current File",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "${fileBasename}",
        "--runInBand"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

## 📚 Boas Práticas

### 1. Organização

- ✅ Cada serviço tem seu arquivo `.spec.ts`
- ✅ Usar `describe` para agrupar testes relacionados
- ✅ Nomes descritivos: `it('deve validar...')`

### 2. Isolamento

- ✅ Cada teste é independente
- ✅ Limpar dados após testes
- ✅ Não depender de ordem de execução

### 3. Assertions

```typescript
// BOM
expect(result.valid).toBe(true);
expect(result.confidence).toBeGreaterThan(70);

// RUIM
expect(result).toBeTruthy(); // Muito genérico
```

### 4. Setup/Teardown

```typescript
beforeAll(async () => {
  // Setup único (ex: criar planilha)
});

beforeEach(() => {
  // Setup antes de cada teste
});

afterEach(() => {
  // Cleanup após cada teste
});

afterAll(async () => {
  // Cleanup final (ex: deletar dados)
  await prisma.$disconnect();
});
```

---

## 🎯 Roadmap de Testes

### Concluído ✅
- Testes unitários (Cache, Fuzzy, Tipologia)
- Testes de integração (Pipeline E2E)
- Testes de performance (Load test)
- Testes de regressão (Sprints 1-3)

### Próximos Passos 🚧
- [ ] Testes de API endpoints
- [ ] Testes de workers (BullMQ)
- [ ] Testes de Claude Service (mocks)
- [ ] Testes de alerting
- [ ] Snapshot tests (visual)

---

## 🆘 Troubleshooting

### Problema: "Connection timeout"
**Solução**: Verificar se PostgreSQL/Redis estão rodando

```bash
# Verificar PostgreSQL
psql -U postgres -d scampepisico -c "SELECT 1"

# Verificar Redis
redis-cli ping
```

### Problema: "Migration pending"
**Solução**: Aplicar migrations

```bash
npx prisma migrate deploy
npx prisma generate
```

### Problema: "Jest did not exit"
**Solução**: Desconectar Prisma e fechar connections

```typescript
afterAll(async () => {
  await prisma.$disconnect();
});
```

---

## 📞 Contato

Dúvidas sobre testes? Entre em contato com a equipe de QA ou consulte a documentação dos Sprints:

- [Sprint 1 Summary](SPRINT_1_SUMMARY.md)
- [Sprint 2 Summary](SPRINT_2_SUMMARY.md)
- [Sprint 3 Summary](SPRINT_3_SUMMARY.md)

---

**Última Atualização**: 14 de Novembro de 2025
**Versão do Guia**: 1.0
