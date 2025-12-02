# 📊 Guia do Sistema de Logging Estruturado

## Visão Geral

O sistema de logging estruturado foi implementado para garantir **rastreabilidade completa**, **auditoria de dados** e **observabilidade** de todo o pipeline de processamento.

## 🎯 Principais Funcionalidades

### 1. **Correlation ID (Rastreamento de Jornada)**
- Cada processamento gera um `correlationId` único
- Permite rastrear toda a jornada de um cliente através de todas as etapas
- Exemplo: Um cliente passa por RECEITA → GEOCODING → PLACES → ANALYSIS
- Todos os logs dessas etapas compartilham o mesmo `correlationId`

### 2. **Auditoria de Dados (Antes/Depois)**
- Captura snapshot dos dados de entrada (`dadosEntrada`)
- Captura snapshot dos dados de saída (`dadosSaida`)
- Lista todas as transformações aplicadas (`transformacoes`)
- Permite rastrear exatamente o que mudou e porquê

### 3. **Métricas de Performance**
- Tracking automático de tempo de execução
- Medição de cada operação individualmente
- Estatísticas agregadas: média, min, max, percentis (p50, p95, p99)

### 4. **Validações e Alertas**
- Registra resultados de validações
- Captura alertas e warnings
- Permite identificar dados problemáticos

### 5. **Mascaramento de Dados Sensíveis**
- CNPJ, telefone e outros dados sensíveis são mascarados automaticamente
- Garante conformidade com LGPD
- Exemplo: `12.345.678/0001-90` → `1234****90`

## 📝 Como Usar

### Worker Simples com Logging Automático

```typescript
import StructuredLoggerService, { Etapa } from '../services/structured-logger.service';

const logger = new StructuredLoggerService();

// Gerar correlation ID
const correlationId = StructuredLoggerService.generateCorrelationId();

// Contexto base
const baseContext = {
  correlationId,
  clienteId: 'uuid-do-cliente',
  loteId: 'uuid-do-lote',
  jobId: String(job.id),
  etapa: Etapa.RECEITA,
  origem: 'receita.worker',
  tentativa: 1,
};

// Log de início
await logger.logInicio(baseContext, 'Iniciando processamento', {
  nome: 'Cliente Teste',
  cnpj: '12345678000190',
});

// Log de transformação
await logger.logTransformacao(
  baseContext,
  'Endereço normalizado com sucesso',
  { enderecoOriginal: 'R. ABC' },
  { enderecoNormalizado: 'Rua ABC' },
  ['Expandiu abreviação R. → Rua']
);

// Log de conclusão
await logger.logConclusao(
  baseContext,
  'Processamento concluído',
  { resultado: 'sucesso' },
  ['Dados validados', 'Endereço normalizado'],
  1500 // tempo em ms
);
```

### Com Performance Tracking

```typescript
// Iniciar tracking
const trackingId = `receita-${clienteId}`;
logger.startPerformanceTracking(trackingId, 'RECEITA_TOTAL');

// ... processar ...

// Finalizar e obter tempo
const tempoMs = logger.endPerformanceTracking(trackingId);
```

### Validações

```typescript
await logger.logValidacao(
  baseContext,
  'CNPJ validado com sucesso',
  {
    cnpjValido: true,
    situacao: 'ATIVA',
    divergenciaEndereco: false,
  },
  LogLevel.INFO
);
```

### Alertas

```typescript
await logger.logAlerta(
  baseContext,
  'Divergência de endereço detectada',
  [
    'Endereço da planilha difere da Receita Federal',
    'Similaridade: 65%',
  ],
  {
    enderecoCliente: 'Rua ABC, 123',
    enderecoReceita: 'Avenida XYZ, 456',
  }
);
```

## 🔍 APIs de Consulta

### 1. Logs por Correlation ID (Jornada Completa)

```bash
GET /api/analysis/structured-logs/correlation/:correlationId
```

Retorna todos os logs de uma jornada específica, em ordem cronológica.

**Resposta:**
```json
{
  "success": true,
  "correlationId": "abc-123",
  "totalLogs": 15,
  "logs": [
    {
      "timestamp": "2025-01-01T10:00:00Z",
      "etapa": "RECEITA",
      "operacao": "INICIO",
      "nivel": "INFO",
      "mensagem": "Iniciando enriquecimento",
      "dadosEntrada": {...},
      "tempoExecucaoMs": null
    },
    ...
  ]
}
```

### 2. Logs por Cliente (Todas as Jornadas)

```bash
GET /api/analysis/structured-logs/cliente/:clienteId?limit=100
```

Retorna todas as jornadas de um cliente, agrupadas por correlation ID.

**Resposta:**
```json
{
  "success": true,
  "clienteId": "uuid-cliente",
  "totalLogs": 45,
  "totalJourneys": 3,
  "journeys": [
    {
      "correlationId": "abc-123",
      "totalSteps": 15,
      "iniciado": "2025-01-01T10:00:00Z",
      "finalizado": "2025-01-01T10:02:30Z",
      "etapas": [...]
    },
    ...
  ]
}
```

### 3. Métricas de Performance

```bash
GET /api/analysis/performance-metrics/:etapa
```

Etapas disponíveis: `receita`, `geocoding`, `places`, `analysis`

**Resposta:**
```json
{
  "success": true,
  "etapa": "RECEITA",
  "metrics": {
    "totalExecucoes": 1000,
    "tempoMedio": 2500,
    "tempoMinimo": 850,
    "tempoMaximo": 15000,
    "percentil50": 2200,
    "percentil95": 4500,
    "percentil99": 8000,
    "porNivel": [
      {
        "nivel": "INFO",
        "count": 950,
        "tempoMedio": 2300
      },
      {
        "nivel": "ERROR",
        "count": 50,
        "tempoMedio": 5000
      }
    ]
  }
}
```

### 4. Estatísticas de Integridade de Dados

```bash
GET /api/analysis/data-integrity-stats
```

**Resposta:**
```json
{
  "success": true,
  "stats": {
    "RECEITA": {
      "validacoes": 500,
      "transformacoes": 450,
      "alertas": 25,
      "erros": 10
    },
    "GEOCODING": {...},
    ...
  },
  "totalLogs": 2000
}
```

## 📊 Tabela do Banco de Dados

### ProcessamentoLog

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do log |
| `correlationId` | String | ID de correlação (rastreia jornada completa) |
| `clienteId` | String? | ID do cliente |
| `loteId` | String? | ID do lote de processamento |
| `jobId` | String? | ID do job do Bull Queue |
| `etapa` | Enum | RECEITA, GEOCODING, PLACES, ANALYSIS |
| `operacao` | Enum | INICIO, PROCESSAMENTO, VALIDACAO, etc. |
| `nivel` | Enum | DEBUG, INFO, WARN, ERROR, FATAL |
| `mensagem` | String | Mensagem descritiva |
| `detalhes` | JSON | Informações adicionais |
| `dadosEntrada` | JSON | Snapshot dos dados antes |
| `dadosSaida` | JSON | Snapshot dos dados depois |
| `transformacoes` | JSON | Lista de transformações aplicadas |
| `validacoes` | JSON | Resultados de validações |
| `alertas` | JSON | Alertas e warnings |
| `tempoExecucaoMs` | Int? | Tempo de execução em ms |
| `tentativa` | Int | Número da tentativa (retry) |
| `origem` | String | Worker/Service que gerou o log |
| `versao` | String | Versão do sistema |
| `timestamp` | DateTime | Quando foi criado |

### Índices

Para queries rápidas, os seguintes índices foram criados:
- `correlationId` - Para buscar jornadas completas
- `clienteId` - Para histórico de cliente
- `loteId` - Para logs de lote
- `etapa` - Para filtrar por pipeline stage
- `nivel` - Para filtrar por severidade
- `timestamp` - Para ordenação temporal
- `operacao` - Para filtrar por tipo de operação

## 🎨 Níveis de Log

- **DEBUG**: Informações detalhadas para debugging
- **INFO**: Eventos normais do fluxo (padrão)
- **WARN**: Situações atípicas mas não críticas
- **ERROR**: Erros recuperáveis
- **FATAL**: Erros irrecuperáveis que impedem o processamento

## 🔒 Segurança e Privacidade

### Dados Mascarados Automaticamente:

1. **CNPJ**: `12.345.678/0001-90` → `1234****90`
2. **Telefone**: `(11) 98765-4321` → `(11) ****-****`

### Boas Práticas:

- ❌ **NÃO** logar senhas, tokens ou chaves de API
- ✅ **SIM** logar IDs, status, métricas
- ✅ **SIM** logar validações e transformações
- ✅ **SIM** logar erros com contexto suficiente

## 📈 Casos de Uso

### 1. Rastrear Divergência de Endereço

```typescript
// Buscar logs do cliente
GET /api/analysis/structured-logs/cliente/{clienteId}

// Filtrar por validações
logs.filter(l => l.operacao === 'VALIDACAO' && l.validacoes?.divergenciaEndereco)
```

### 2. Identificar Gargalos de Performance

```typescript
// Ver métricas por etapa
GET /api/analysis/performance-metrics/geocoding

// Percentil 95 alto indica gargalo
if (metrics.percentil95 > 5000) {
  console.log('Geocoding está lento!');
}
```

### 3. Auditoria de Transformações

```typescript
// Buscar jornada completa
GET /api/analysis/structured-logs/correlation/{correlationId}

// Ver todas as transformações
logs
  .filter(l => l.operacao === 'TRANSFORMACAO')
  .map(l => l.transformacoes)
```

### 4. Análise de Qualidade de Dados

```typescript
// Ver estatísticas de integridade
GET /api/analysis/data-integrity-stats

// Identificar etapas problemáticas
Object.entries(stats).forEach(([etapa, stat]) => {
  const taxaErro = stat.erros / (stat.validacoes || 1);
  if (taxaErro > 0.1) {
    console.log(`${etapa} tem ${taxaErro * 100}% de erro!`);
  }
});
```

## 🚀 Exemplo Completo: Worker da Receita

Veja o arquivo `receita.worker.enhanced.ts` para um exemplo completo de implementação com:

- ✅ Correlation ID tracking
- ✅ Performance metrics
- ✅ Auditoria de dados (antes/depois)
- ✅ Validações estruturadas
- ✅ Alertas para divergências
- ✅ Logs de API calls
- ✅ Tratamento de erros com contexto

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Logs estruturados no banco: tabela `processamento_logs`
- APIs de consulta documentadas acima
- Código-fonte: `/src/services/structured-logger.service.ts`
