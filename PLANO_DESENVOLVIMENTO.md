# Plano de Desenvolvimento - Sistema de Análise Inteligente de Clientes RAC

## Visão Geral do Projeto

Sistema para análise automatizada de clientes através de:
- Upload de planilhas RAC
- Extração e estruturação de dados
- Pesquisa geográfica (Google Maps API)
- Pesquisa web sobre o cliente
- Análise visual com IA (imagens do estabelecimento)
- Classificação de tipologia e potencial de negócio

---

## Stack Tecnológica

### Backend
- **Node.js** com **TypeScript**
- **Express.js** para API REST
- **PostgreSQL** (via Docker) para banco de dados
- **Prisma ORM** para gerenciamento de dados

### IA e Integrações
- **Claude API (Anthropic)** para análise de textos e imagens
- **Google Maps API** para geolocalização
- **Google Places API** para buscar informações do estabelecimento
- **Puppeteer** ou **Playwright** para web scraping

### Frontend
- **React** com **TypeScript**
- **Tailwind CSS** para estilização
- **React Query** para gerenciamento de estado

### Infraestrutura
- **Docker** e **Docker Compose** para banco de dados
- **Redis** para filas de processamento

---

## FASE 1: Setup Inicial e Infraestrutura

### Objetivos
- Configurar ambiente de desenvolvimento
- Setup do banco de dados PostgreSQL com Docker
- Estrutura base do projeto backend e frontend
- Configuração do Prisma ORM

### Tarefas

#### 1.1 Configuração do Ambiente
- [ ] Inicializar repositório Git
- [ ] Criar estrutura de pastas do projeto
- [ ] Configurar `.gitignore` e `.env.example`
- [ ] Documentação inicial (README.md)

#### 1.2 Docker e Banco de Dados
- [ ] Criar `docker-compose.yml` com PostgreSQL e Redis
- [ ] Configurar volumes e networks
- [ ] Scripts de inicialização do banco

#### 1.3 Backend Setup
- [ ] Inicializar projeto Node.js com TypeScript
- [ ] Configurar Express.js
- [ ] Setup Prisma ORM
- [ ] Criar schema inicial do banco
- [ ] Configurar variáveis de ambiente
- [ ] Setup de logs (Winston ou Pino)

#### 1.4 Frontend Setup
- [ ] Criar projeto React com Vite
- [ ] Configurar Tailwind CSS
- [ ] Setup React Query
- [ ] Estrutura de rotas (React Router)

### Testes da Fase 1
```bash
# Testes de infraestrutura
npm run test:infra

# Checklist de testes manuais:
□ Docker Compose sobe PostgreSQL corretamente
□ Redis está acessível
□ Backend conecta ao banco de dados
□ Migrações do Prisma executam sem erros
□ Frontend inicia e exibe página inicial
□ Requisição teste do frontend para backend funciona
□ Variáveis de ambiente são carregadas corretamente
```

### Entregáveis Fase 1
- Docker Compose funcional
- Backend rodando na porta 3000
- Frontend rodando na porta 5173
- Banco de dados com schema inicial
- Documentação de setup

---

## FASE 2: Upload e Processamento de Planilhas

### Objetivos
- Sistema de upload de planilhas Excel/CSV
- Parser de planilhas RAC
- Extração e validação de dados
- Armazenamento estruturado no banco

### Tarefas

#### 2.1 API de Upload
- [ ] Endpoint POST `/api/upload` com Multer
- [ ] Validação de tipos de arquivo (.xlsx, .xls, .csv)
- [ ] Limite de tamanho de arquivo
- [ ] Armazenamento temporário seguro

#### 2.2 Parser de Planilhas
- [ ] Integrar biblioteca `xlsx` ou `exceljs`
- [ ] Identificar colunas da planilha RAC
- [ ] Mapear dados: nome, telefone, endereço, etc.
- [ ] Tratamento de erros e dados inválidos

#### 2.3 Validação e Normalização
- [ ] Validar formato de telefones
- [ ] Normalizar endereços
- [ ] Validar dados obrigatórios
- [ ] Detectar duplicatas

#### 2.4 Modelo de Dados
- [ ] Criar schema Prisma para Cliente
- [ ] Criar schema para Planilha (histórico de uploads)
- [ ] Relacionamentos entre entidades
- [ ] Índices para otimização

#### 2.5 Interface de Upload
- [ ] Componente de drag-and-drop
- [ ] Preview dos dados da planilha
- [ ] Indicador de progresso
- [ ] Exibição de erros de validação

### Modelo de Dados (Prisma Schema)
```prisma
model Planilha {
  id          String   @id @default(uuid())
  nomeArquivo String
  uploadedAt  DateTime @default(now())
  status      String   // PROCESSANDO, CONCLUIDO, ERRO
  totalLinhas Int
  clientes    Cliente[]
}

model Cliente {
  id              String    @id @default(uuid())
  planilhaId      String
  planilha        Planilha  @relation(fields: [planilhaId], references: [id])

  // Dados da planilha RAC
  nome            String
  telefone        String?
  endereco        String
  cidade          String?
  estado          String?
  cep             String?
  tipoServico     String?

  // Status do processamento
  status          String    @default("PENDENTE") // PENDENTE, PROCESSANDO, CONCLUIDO, ERRO

  // Dados enriquecidos (próximas fases)
  latitude        Float?
  longitude       Float?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### Testes da Fase 2
```bash
# Testes unitários
npm run test:unit -- upload.test.ts
npm run test:unit -- parser.test.ts

# Testes de integração
npm run test:integration -- planilha.test.ts
```

**Checklist de Testes:**
```
□ Upload de arquivo .xlsx funciona
□ Upload de arquivo .csv funciona
□ Rejeita arquivos com extensão inválida
□ Rejeita arquivos acima do limite de tamanho
□ Parser extrai corretamente nome do cliente
□ Parser extrai corretamente telefone
□ Parser extrai corretamente endereço
□ Validação detecta telefones inválidos
□ Validação detecta endereços vazios
□ Detecta e marca clientes duplicados
□ Dados são salvos no banco corretamente
□ Interface exibe preview da planilha
□ Interface mostra progresso do upload
□ Interface exibe erros de validação
```

### Entregáveis Fase 2
- API de upload funcional
- Parser de planilhas RAC
- Dados armazenados no PostgreSQL
- Interface de upload com preview
- Testes unitários e de integração

---

## FASE 3: Integração Google Maps e Geolocalização

### Objetivos
- Buscar coordenadas geográficas dos endereços
- Validar e enriquecer endereços
- Armazenar dados de localização

### Tarefas

#### 3.1 Configuração Google Maps API
- [ ] Criar projeto no Google Cloud Console
- [ ] Ativar APIs necessárias:
  - Geocoding API
  - Places API
  - Maps JavaScript API
- [ ] Gerar API Key e configurar restrições
- [ ] Adicionar billing (com alertas de limite)

#### 3.2 Serviço de Geocodificação
- [ ] Criar serviço `GeocodingService`
- [ ] Integrar `@googlemaps/google-maps-services-js`
- [ ] Método para buscar coordenadas por endereço
- [ ] Método para buscar endereço completo
- [ ] Cache de resultados (Redis)
- [ ] Rate limiting e retry logic

#### 3.3 Processamento em Fila
- [ ] Setup Bull (Redis queue)
- [ ] Worker para processar geocodificação
- [ ] Job de geocodificação por cliente
- [ ] Tratamento de erros e retentativas
- [ ] Dashboard de monitoramento (Bull Board)

#### 3.4 Atualização do Modelo
- [ ] Adicionar campos de geolocalização
- [ ] Adicionar campos de endereço enriquecido
- [ ] Status de processamento de geocoding

#### 3.5 Interface de Monitoramento
- [ ] Lista de clientes com status de geocoding
- [ ] Mapa com marcadores dos clientes
- [ ] Filtros por status
- [ ] Botão para reprocessar falhas

### Modelo Atualizado
```prisma
model Cliente {
  // ... campos anteriores

  // Geolocalização
  latitude              Float?
  longitude             Float?
  enderecoCompleto      String?
  enderecoFormatado     String?
  geocodingStatus       String    @default("PENDENTE") // PENDENTE, SUCESSO, FALHA
  geocodingErro         String?
  geocodingProcessadoEm DateTime?

  // Places API
  placeId               String?

  analise               Analise?
}
```

### Testes da Fase 3
```bash
# Testes unitários
npm run test:unit -- geocoding.service.test.ts

# Testes de integração
npm run test:integration -- geocoding.test.ts
```

**Checklist de Testes:**
```
□ API Key do Google Maps está configurada
□ Geocoding retorna coordenadas para endereço válido
□ Geocoding trata erro de endereço não encontrado
□ Geocoding trata erro de rate limit
□ Cache Redis armazena resultados
□ Cache Redis reutiliza resultados anteriores
□ Fila Bull processa jobs de geocoding
□ Worker atualiza status do cliente no banco
□ Retentativas funcionam para erros temporários
□ Dashboard Bull Board é acessível
□ Interface lista clientes com coordenadas
□ Mapa exibe marcadores corretamente
□ Filtro por status funciona
□ Reprocessamento de falhas funciona
```

### Entregáveis Fase 3
- Integração com Google Maps API
- Serviço de geocodificação
- Sistema de filas com Bull
- Coordenadas armazenadas no banco
- Interface com mapa de clientes
- Dashboard de monitoramento

---

## FASE 4: Pesquisa Web e Google Places

### Objetivos
- Buscar informações do estabelecimento no Google Places
- Coletar fotos do local
- Obter avaliações e informações públicas
- Web scraping complementar

### Tarefas

#### 4.1 Google Places API
- [ ] Serviço `PlacesService`
- [ ] Buscar Place Details por Place ID
- [ ] Buscar Place Details por nome + endereço
- [ ] Extrair informações: tipo, avaliação, fotos, horário
- [ ] Download de fotos do estabelecimento
- [ ] Armazenar URLs e metadados das fotos

#### 4.2 Web Scraping
- [ ] Setup Puppeteer/Playwright
- [ ] Script para buscar cliente no Google
- [ ] Capturar screenshots
- [ ] Extrair informações de sites relevantes
- [ ] Tratamento de CAPTCHA e rate limiting
- [ ] Headless browser com user-agent rotation

#### 4.3 Armazenamento de Mídia
- [ ] Sistema de armazenamento de imagens
- [ ] Organização por cliente
- [ ] Geração de thumbnails
- [ ] CDN ou storage local com Nginx

#### 4.4 Modelo de Dados
- [ ] Schema para informações do Place
- [ ] Schema para Fotos/Imagens
- [ ] Relacionamentos

#### 4.5 Worker de Pesquisa
- [ ] Job para processar Places API
- [ ] Job para web scraping
- [ ] Orquestração sequencial (após geocoding)

### Modelo Atualizado
```prisma
model Cliente {
  // ... campos anteriores

  // Google Places
  placeTipo             String[]  // ["restaurant", "cafe"]
  placeAvaliacao        Float?
  placeTotalAvaliacoes  Int?
  placeHorarioFuncionamento Json?
  placeWebsite          String?
  placeTelefone         String?

  // Pesquisa Web
  pesquisaStatus        String    @default("PENDENTE")
  pesquisaProcessadaEm  DateTime?

  fotos                 Foto[]
}

model Foto {
  id           String   @id @default(uuid())
  clienteId    String
  cliente      Cliente  @relation(fields: [clienteId], references: [id])

  url          String
  urlThumbnail String?
  fonte        String   // PLACES, SCRAPING
  width        Int?
  height       Int?

  // Para análise posterior
  analisada    Boolean  @default(false)

  createdAt    DateTime @default(now())
}
```

### Testes da Fase 4
```bash
npm run test:unit -- places.service.test.ts
npm run test:integration -- pesquisa.test.ts
```

**Checklist de Testes:**
```
□ Places API retorna detalhes do estabelecimento
□ Places API retorna fotos do local
□ Download de fotos funciona
□ Thumbnails são gerados corretamente
□ Fotos são armazenadas organizadamente
□ Puppeteer realiza busca no Google
□ Screenshot é capturado corretamente
□ Web scraping extrai informações relevantes
□ Rate limiting do scraping funciona
□ Worker processa Places após geocoding
□ Worker processa scraping após Places
□ Dados são salvos no banco corretamente
□ Interface exibe fotos do estabelecimento
□ Interface exibe informações do Places
```

### Entregáveis Fase 4
- Integração Google Places API
- Sistema de web scraping
- Armazenamento de fotos
- Workers de pesquisa
- Interface com galeria de fotos

---

## FASE 5: Análise com IA (Claude API)

### Objetivos
- Analisar imagens do estabelecimento com Claude Vision
- Classificar tipologia do negócio
- Avaliar porte e potencial
- Gerar relatório de análise

### Tarefas

#### 5.1 Integração Claude API
- [ ] Setup SDK `@anthropic-ai/sdk`
- [ ] Configurar API Key
- [ ] Serviço `AIAnalysisService`
- [ ] Método para análise de imagens
- [ ] Método para análise de textos

#### 5.2 Prompts de Análise
- [ ] Prompt para classificação de tipologia
  - Segmento (mercado, padaria, restaurante, etc)
  - Porte (pequeno, médio, grande)
  - Padrão do estabelecimento
- [ ] Prompt para análise de potencial
  - Movimento aparente
  - Infraestrutura
  - Localização
- [ ] Prompt para síntese final

#### 5.3 Pipeline de Análise
- [ ] Preparar imagens para análise
- [ ] Converter imagens para base64 ou URLs
- [ ] Análise individual de cada imagem
- [ ] Agregação de resultados
- [ ] Geração de relatório estruturado

#### 5.4 Modelo de Dados
- [ ] Schema para Análise
- [ ] Campos para classificação
- [ ] Campos para scores e confiança

#### 5.5 Worker de Análise IA
- [ ] Job para análise de imagens
- [ ] Job para síntese final
- [ ] Orquestração após pesquisa web

#### 5.6 Interface de Resultados
- [ ] Card de análise por cliente
- [ ] Visualização de classificação
- [ ] Scores e indicadores
- [ ] Relatório detalhado
- [ ] Exportação de resultados

### Modelo Atualizado
```prisma
model Cliente {
  // ... campos anteriores

  analise      Analise?
}

model Analise {
  id                    String   @id @default(uuid())
  clienteId             String   @unique
  cliente               Cliente  @relation(fields: [clienteId], references: [id])

  // Classificação
  tipologiaSegmento     String?  // "Supermercado", "Padaria", "Restaurante"
  tipologiaPorte        String?  // "Pequeno", "Médio", "Grande"
  tipologiaSubcategoria String?  // "Mercearia de Bairro", "Rede Regional"

  // Scores (0-100)
  scorePotencial        Int?
  scoreInfraestrutura   Int?
  scoreLocalizacao      Int?
  scoreMovimento        Int?

  // Análise detalhada
  descricaoEstabelecimento String?
  pontosFortes             String[]
  pontosFracos             String[]
  recomendacoes            String[]

  // Confiança da análise
  confiancaAnalise      Float?   // 0.0 a 1.0

  // Metadados
  status                String   @default("PENDENTE")
  processadaEm          DateTime?
  tempoProcessamento    Int?     // milissegundos

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

### Exemplo de Prompt
```typescript
const PROMPT_ANALISE = `
Você é um analista de negócios especializado em varejo e estabelecimentos comerciais.

Analise as imagens fornecidas deste estabelecimento e forneça uma análise estruturada:

1. TIPOLOGIA
   - Segmento do negócio (supermercado, padaria, restaurante, farmácia, etc)
   - Porte (pequeno, médio, grande)
   - Subcategoria específica

2. INFRAESTRUTURA (score 0-100)
   - Qualidade das instalações
   - Modernização
   - Conservação

3. LOCALIZAÇÃO (score 0-100)
   - Tipo de localização (esquina, meio de quadra, shopping, etc)
   - Visibilidade
   - Acessibilidade

4. POTENCIAL (score 0-100)
   - Movimento aparente
   - Sortimento de produtos
   - Público-alvo

5. DESCRIÇÃO
   - Descrição detalhada do estabelecimento
   - Pontos fortes identificados
   - Pontos fracos identificados
   - Recomendações

Retorne em formato JSON estruturado.
`;
```

### Testes da Fase 5
```bash
npm run test:unit -- ai-analysis.service.test.ts
npm run test:integration -- analise.test.ts
```

**Checklist de Testes:**
```
□ Claude API está configurada corretamente
□ SDK Anthropic funciona
□ Análise de imagem retorna resultados
□ Prompt de tipologia funciona
□ Prompt de potencial funciona
□ JSON de resposta é parseado corretamente
□ Scores estão no range correto (0-100)
□ Análise é salva no banco de dados
□ Worker processa análise após pesquisa
□ Worker trata erros da API
□ Interface exibe classificação
□ Interface exibe scores com gráficos
□ Relatório detalhado é exibido
□ Exportação de resultados funciona (PDF/Excel)
```

### Entregáveis Fase 5
- Integração com Claude API
- Sistema de análise de imagens
- Classificação de tipologia
- Scores de potencial
- Interface de resultados
- Relatórios exportáveis

---

## FASE 6: Dashboard e Relatórios

### Objetivos
- Dashboard analítico completo
- Visualização de dados agregados
- Filtros e busca avançada
- Exportação de relatórios

### Tarefas

#### 6.1 Dashboard Analítico
- [ ] Visão geral (KPIs)
  - Total de clientes processados
  - Distribuição por tipologia
  - Distribuição por porte
  - Score médio de potencial
- [ ] Gráficos e visualizações
  - Gráfico de pizza (segmentos)
  - Gráfico de barras (porte)
  - Mapa de calor (scores)
- [ ] Integrar biblioteca de gráficos (Chart.js ou Recharts)

#### 6.2 Lista de Clientes
- [ ] Tabela com todos os clientes
- [ ] Colunas: nome, endereço, tipologia, scores
- [ ] Ordenação por colunas
- [ ] Paginação
- [ ] Busca por nome/endereço

#### 6.3 Filtros Avançados
- [ ] Filtro por tipologia
- [ ] Filtro por porte
- [ ] Filtro por range de score
- [ ] Filtro por status de processamento
- [ ] Filtro geográfico (cidade, estado)

#### 6.4 Detalhes do Cliente
- [ ] Página individual do cliente
- [ ] Todas as informações consolidadas
- [ ] Galeria de fotos
- [ ] Análise completa
- [ ] Histórico de processamento

#### 6.5 Exportação
- [ ] Exportar lista filtrada para Excel
- [ ] Exportar relatório individual (PDF)
- [ ] Exportar relatório consolidado (PDF)
- [ ] API endpoint para exportação

#### 6.6 Sistema de Notificações
- [ ] Notificações de processamento concluído
- [ ] Notificações de erros
- [ ] Toast/Snackbar no frontend

### Testes da Fase 6
```bash
npm run test:e2e -- dashboard.test.ts
npm run test:e2e -- relatorios.test.ts
```

**Checklist de Testes:**
```
□ Dashboard exibe KPIs corretamente
□ Gráficos renderizam com dados reais
□ Gráfico de tipologia mostra distribuição correta
□ Gráfico de porte mostra distribuição correta
□ Mapa de calor funciona
□ Tabela lista todos os clientes
□ Ordenação por coluna funciona
□ Paginação funciona
□ Busca retorna resultados corretos
□ Filtro por tipologia funciona
□ Filtro por porte funciona
□ Filtro por score funciona
□ Filtro por status funciona
□ Filtro geográfico funciona
□ Combinação de filtros funciona
□ Página de detalhes carrega corretamente
□ Galeria de fotos exibe imagens
□ Exportação Excel funciona
□ Exportação PDF individual funciona
□ Exportação PDF consolidado funciona
□ Notificações são exibidas corretamente
```

### Entregáveis Fase 6
- Dashboard analítico completo
- Sistema de filtros avançados
- Página de detalhes do cliente
- Sistema de exportação
- Notificações em tempo real

---

## FASE 7: Otimizações e Melhorias

### Objetivos
- Performance e escalabilidade
- Tratamento de erros robusto
- Logs e monitoramento
- Segurança
- Testes end-to-end

### Tarefas

#### 7.1 Performance
- [ ] Indexação no banco de dados
- [ ] Query optimization
- [ ] Lazy loading de imagens
- [ ] Paginação server-side
- [ ] Compressão de respostas (gzip)
- [ ] Cache de resultados frequentes

#### 7.2 Escalabilidade
- [ ] Horizontal scaling dos workers
- [ ] Pool de conexões do banco
- [ ] Rate limiting na API
- [ ] Throttling de requisições externas

#### 7.3 Logs e Monitoramento
- [ ] Logs estruturados (JSON)
- [ ] Níveis de log (error, warn, info, debug)
- [ ] Log de todas as chamadas de API externa
- [ ] Métricas de performance
- [ ] Health check endpoint

#### 7.4 Segurança
- [ ] Autenticação JWT
- [ ] Autorização por roles
- [ ] Validação de inputs
- [ ] Sanitização de dados
- [ ] CORS configurado
- [ ] Rate limiting por usuário
- [ ] Helmet.js para headers de segurança
- [ ] Encriptação de dados sensíveis

#### 7.5 Tratamento de Erros
- [ ] Error handling global
- [ ] Mensagens de erro amigáveis
- [ ] Retry automático com backoff
- [ ] Dead letter queue para jobs falhados
- [ ] Alertas para erros críticos

#### 7.6 Testes
- [ ] Aumentar cobertura de testes unitários (>80%)
- [ ] Testes de integração completos
- [ ] Testes end-to-end (Playwright/Cypress)
- [ ] Testes de carga (k6 ou Artillery)
- [ ] CI/CD com testes automatizados

#### 7.7 Documentação
- [ ] Documentação da API (Swagger/OpenAPI)
- [ ] README completo
- [ ] Guia de deploy
- [ ] Documentação de ambiente dev
- [ ] Diagrama de arquitetura

### Testes da Fase 7
```bash
# Todos os testes
npm run test

# Testes de carga
npm run test:load

# Análise de cobertura
npm run test:coverage
```

**Checklist de Testes:**
```
□ Cobertura de testes >80%
□ Todos os testes unitários passam
□ Todos os testes de integração passam
□ Testes E2E passam
□ Testes de carga indicam performance aceitável
□ API responde <200ms para queries simples
□ Processamento de 1000 clientes <10min
□ Health check retorna status correto
□ Logs são gerados corretamente
□ Autenticação JWT funciona
□ Rate limiting bloqueia requisições excessivas
□ Validação rejeita inputs inválidos
□ CORS está configurado
□ Headers de segurança estão presentes
□ Documentação Swagger está acessível
```

### Entregáveis Fase 7
- Sistema otimizado e escalável
- Logs e monitoramento
- Segurança implementada
- Cobertura de testes >80%
- Documentação completa

---

## FASE 8: Deploy e Produção

### Objetivos
- Deploy em ambiente de produção
- Configuração de CI/CD
- Monitoramento em produção
- Backup e recuperação

### Tarefas

#### 8.1 Ambiente de Produção
- [ ] Escolher provedor (AWS, GCP, DigitalOcean, etc)
- [ ] Configurar servidor/VPS
- [ ] Configurar domínio e DNS
- [ ] Certificado SSL (Let's Encrypt)
- [ ] Nginx como reverse proxy

#### 8.2 Docker em Produção
- [ ] Dockerfile otimizado (multi-stage)
- [ ] Docker Compose para produção
- [ ] Volumes para persistência
- [ ] Redes isoladas
- [ ] Secrets management

#### 8.3 CI/CD
- [ ] GitHub Actions ou GitLab CI
- [ ] Pipeline de testes
- [ ] Pipeline de build
- [ ] Pipeline de deploy
- [ ] Rollback automático em caso de falha

#### 8.4 Banco de Dados
- [ ] Backup automático diário
- [ ] Retenção de backups (30 dias)
- [ ] Teste de restore
- [ ] Replicação (opcional)

#### 8.5 Monitoramento
- [ ] Setup de monitoramento (Prometheus + Grafana)
- [ ] Alertas (email, Slack, etc)
- [ ] Uptime monitoring
- [ ] Error tracking (Sentry)

#### 8.6 Segurança em Produção
- [ ] Firewall configurado
- [ ] Apenas portas necessárias abertas
- [ ] Fail2ban
- [ ] Atualizações automáticas de segurança
- [ ] Rotação de secrets e API keys

### Testes da Fase 8
**Checklist de Testes:**
```
□ Deploy foi bem-sucedido
□ Aplicação está acessível via HTTPS
□ Certificado SSL é válido
□ Backend está respondendo
□ Frontend carrega corretamente
□ Banco de dados está acessível
□ Redis está funcionando
□ Workers estão processando jobs
□ Backup automático está funcionando
□ Restore de backup funciona
□ CI/CD pipeline executa corretamente
□ Testes passam no CI
□ Deploy automático funciona
□ Rollback funciona
□ Monitoramento está ativo
□ Alertas são enviados corretamente
□ Logs são coletados
□ Error tracking captura erros
```

### Entregáveis Fase 8
- Aplicação em produção
- CI/CD configurado
- Backups automáticos
- Monitoramento ativo
- Sistema de alertas

---

## Cronograma Estimado

| Fase | Descrição | Duração Estimada | Dependências |
|------|-----------|------------------|--------------|
| 1 | Setup Inicial | 3-5 dias | - |
| 2 | Upload e Processamento | 5-7 dias | Fase 1 |
| 3 | Google Maps | 5-7 dias | Fase 2 |
| 4 | Pesquisa Web e Places | 7-10 dias | Fase 3 |
| 5 | Análise com IA | 7-10 dias | Fase 4 |
| 6 | Dashboard e Relatórios | 7-10 dias | Fase 5 |
| 7 | Otimizações | 5-7 dias | Fase 6 |
| 8 | Deploy | 3-5 dias | Fase 7 |

**Total estimado: 42-61 dias (~2-3 meses)**

---

## Recursos e APIs Necessários

### APIs Pagas
1. **Google Maps Platform**
   - Geocoding API
   - Places API
   - Maps JavaScript API
   - Custo estimado: $200-500/mês (depende do volume)

2. **Claude API (Anthropic)**
   - Claude 3.5 Sonnet (visão + texto)
   - Custo estimado: $100-300/mês (depende do volume)

### Serviços
- Servidor/VPS: $20-100/mês
- Domínio: ~$15/ano
- Backup/Storage: $10-50/mês

### Total Estimado: $350-950/mês

---

## Riscos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Limite de APIs externas | Alto | Médio | Rate limiting, cache, retry logic |
| Custo elevado de APIs | Médio | Médio | Monitoramento de uso, alertas |
| Qualidade das imagens ruins | Médio | Alto | Fallback para análise de texto |
| Endereços incorretos | Alto | Médio | Validação manual, confidence score |
| Performance com muitos clientes | Médio | Alto | Otimização, processamento assíncrono |
| Dados sensíveis | Alto | Baixo | Encriptação, LGPD compliance |

---

## Próximos Passos

1. ✅ Revisar e aprovar este plano
2. ⬜ Configurar repositório e ambientes
3. ⬜ Obter API keys (Google, Anthropic)
4. ⬜ Iniciar Fase 1

---

## Observações Finais

- Cada fase termina com testes obrigatórios
- CHANGELOG será atualizado ao final de cada fase
- Código deve seguir padrões de clean code
- Commits devem ser descritivos
- Code review antes de merge (se trabalho em equipe)

