# Sistema de Análise Inteligente de Clientes RAC

Sistema automatizado para análise de clientes utilizando inteligência artificial, geolocalização e pesquisa web.

## Visão Geral

Este sistema permite:
- 📊 Upload de planilhas RAC com dados de clientes
- 🗺️ Geolocalização automática via Google Maps
- 🔍 Pesquisa web e coleta de informações
- 📸 Análise de imagens com IA (Claude Vision)
- 🏢 Classificação de tipologia de negócio
- 📈 Scores de potencial e análises detalhadas
- 📑 Relatórios exportáveis

## Stack Tecnológica

### Backend
- Node.js + TypeScript
- Express.js
- PostgreSQL (Docker)
- Prisma ORM
- Bull (Redis) para filas

### Frontend
- React + TypeScript
- Tailwind CSS
- React Query

### IA e APIs
- Claude API (Anthropic)
- Google Maps API (Geocoding + Places)
- Puppeteer (Web Scraping)

## Estrutura do Projeto

```
scampepisico/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── workers/
│   │   ├── models/
│   │   └── utils/
│   ├── prisma/
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── docker-compose.yml
├── PLANO_DESENVOLVIMENTO.md
├── CHANGELOG.md
└── README.md
```

## Começando

### Pré-requisitos

- Node.js >= 18.x
- Docker e Docker Compose
- Git
- API Keys:
  - Google Maps API
  - Claude API (Anthropic)

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd scampepisico

# Instale dependências do backend
cd backend
npm install

# Instale dependências do frontend
cd ../frontend
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas API keys

# Inicie o Docker (PostgreSQL + Redis)
docker-compose up -d

# Execute migrations
cd backend
npx prisma migrate dev

# Inicie o backend
npm run dev

# Em outro terminal, inicie o frontend
cd frontend
npm run dev
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do backend:

```env
# Banco de Dados
DATABASE_URL="postgresql://user:password@localhost:5432/scampepisico"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# Google Maps
GOOGLE_MAPS_API_KEY="sua-api-key"

# Claude API
ANTHROPIC_API_KEY="sua-api-key"

# Servidor
PORT=3000
NODE_ENV=development

# JWT (para autenticação futura)
JWT_SECRET="seu-secret-aqui"
```

## Desenvolvimento

### Rodando Testes

```bash
# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Todos os testes
npm run test

# Cobertura
npm run test:coverage
```

### Estrutura de Branches

- `main`: Código em produção
- `develop`: Código em desenvolvimento
- `feature/nome-feature`: Novas funcionalidades
- `fix/nome-bug`: Correções de bugs

### Padrões de Commit

```
feat: Nova funcionalidade
fix: Correção de bug
docs: Documentação
style: Formatação
refactor: Refatoração
test: Testes
chore: Tarefas de manutenção
```

## Documentação

- [Plano de Desenvolvimento](./PLANO_DESENVOLVIMENTO.md) - Plano completo com 8 fases
- [CHANGELOG](./CHANGELOG.md) - Histórico de mudanças
- [API Docs](./docs/API.md) - Documentação da API (em breve)

## Fases do Projeto

| Fase | Status | Descrição |
|------|--------|-----------|
| 1 | 📝 Planejado | Setup Inicial e Infraestrutura |
| 2 | 📝 Planejado | Upload e Processamento de Planilhas |
| 3 | 📝 Planejado | Google Maps e Geolocalização |
| 4 | 📝 Planejado | Pesquisa Web e Google Places |
| 5 | 📝 Planejado | Análise com IA (Claude) |
| 6 | 📝 Planejado | Dashboard e Relatórios |
| 7 | 📝 Planejado | Otimizações e Melhorias |
| 8 | 📝 Planejado | Deploy e Produção |

## Roadmap

### v0.1.0 - Setup Inicial ✅
- [x] Plano de desenvolvimento
- [x] Definição de stack
- [x] Estrutura de documentação

### v0.2.0 - MVP (Próximo)
- [ ] Docker Compose funcional
- [ ] Backend básico
- [ ] Upload de planilhas
- [ ] Geocodificação

### v1.0.0 - Primeira Versão Completa
- [ ] Todas as 8 fases implementadas
- [ ] Testes completos
- [ ] Deploy em produção

## Custos Estimados

| Serviço | Custo Mensal |
|---------|--------------|
| Google Maps API | $200-500 |
| Claude API | $100-300 |
| Servidor/VPS | $20-100 |
| Backup/Storage | $10-50 |
| **Total** | **$350-950** |

## Licença

Este projeto é privado e proprietário.

## Contato

Para dúvidas ou suporte, entre em contato com a equipe de desenvolvimento.

---

**Status do Projeto**: 📝 Em Planejamento

**Última Atualização**: 2025-11-06
