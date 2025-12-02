# 🎉 Sistema RAC - Análise Inteligente de Clientes v1.0

> Sistema completo de análise inteligente de clientes usando IA, geolocalização e análise de imagens

[![Versão](https://img.shields.io/badge/versão-1.0.0-blue.svg)](https://github.com)
[![Status](https://img.shields.io/badge/status-✅_Completo-success.svg)](https://github.com)
[![Fases](https://img.shields.io/badge/fases-6%2F6_concluídas-brightgreen.svg)](https://github.com)

---

## 📋 Índice

- [Sobre](#sobre)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Uso](#uso)
- [APIs e Endpoints](#apis-e-endpoints)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Fases de Desenvolvimento](#fases-de-desenvolvimento)
- [Screenshots](#screenshots)
- [Documentação](#documentação)

---

## 🎯 Sobre

O **Sistema RAC** é uma plataforma completa para análise inteligente de estabelecimentos comerciais. O sistema:

1. **Importa** planilhas RAC com dados de clientes
2. **Geocodifica** endereços usando Google Maps API
3. **Busca** informações no Google Places API
4. **Baixa** fotos dos estabelecimentos
5. **Analisa** imagens usando Claude Vision (IA)
6. **Classifica** tipologia e potencial dos negócios
7. **Gera** relatórios executivos automatizados
8. **Exibe** em dashboard moderno e interativo

---

## ✨ Funcionalidades

### 📤 Upload e Processamento
- ✅ Upload de planilhas Excel (.xlsx, .xls) e CSV
- ✅ Validação automática de dados
- ✅ Normalização de telefones, CEPs e textos
- ✅ Detecção de duplicatas por nome
- ✅ Armazenamento em PostgreSQL

### 🗺️ Geolocalização (Google Maps)
- ✅ Conversão endereço → coordenadas
- ✅ Reverse geocoding (coordenadas → endereço)
- ✅ Cálculo de distâncias (Haversine)
- ✅ Validação de endereços
- ✅ Processamento assíncrono com filas

### 🏢 Análise de Estabelecimentos (Google Places)
- ✅ Busca de informações detalhadas
- ✅ Download automático de até 5 fotos
- ✅ Classificação de tipo de negócio (35+ categorias)
- ✅ Rating e número de avaliações
- ✅ Horário de funcionamento
- ✅ Cálculo de potencial (ALTO/MÉDIO/BAIXO)

### 🤖 Inteligência Artificial (Claude Vision)
- ✅ Análise de imagens com Claude 3.5 Sonnet
- ✅ Classificação detalhada de tipologia
- ✅ Análise de estado de conservação
- ✅ Estimativa de movimentação visual
- ✅ Identificação de fatores positivos/negativos
- ✅ Recomendações estratégicas personalizadas
- ✅ Geração de relatórios executivos em Markdown
- ✅ Modo single (foto por foto) e batch (consolidado)

### 📊 Dashboard e Visualizações
- ✅ Estatísticas em tempo real
- ✅ Cards de progresso por fase
- ✅ Pipeline visual de processamento
- ✅ Lista de clientes com busca e filtros
- ✅ Indicadores visuais de potencial
- ✅ Interface responsiva e moderna
- ✅ Atualização automática (5s)

---

## 🛠️ Tecnologias

### Backend
- **Runtime**: Node.js 18+
- **Linguagem**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL 16
- **Cache/Filas**: Redis 7 + Bull
- **APIs Externas**:
  - Google Maps Geocoding API
  - Google Places API
  - Anthropic Claude API (Vision)

### Frontend
- **Framework**: React 18
- **Linguagem**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Ícones**: Lucide React
- **Gráficos**: Recharts

### DevOps
- **Containerização**: Docker + Docker Compose
- **Gerenciador de DB**: pgAdmin 4

---

## 🏗️ Arquitetura

```
Sistema RAC
│
├── Frontend (React)
│   ├── Dashboard (estatísticas em tempo real)
│   ├── Lista de Clientes (busca e filtros)
│   └── Upload de Planilhas
│
├── Backend (Node.js + Express)
│   ├── API REST (20+ endpoints)
│   ├── Services
│   │   ├── ParserService (Excel/CSV)
│   │   ├── GeocodingService (Google Maps)
│   │   ├── PlacesService (Google Places)
│   │   └── ClaudeService (IA)
│   ├── Workers (Bull Queue)
│   │   ├── GeocodingWorker
│   │   ├── PlacesWorker
│   │   └── AnalysisWorker
│   └── Database (Prisma ORM)
│
├── Infraestrutura (Docker)
│   ├── PostgreSQL (banco de dados)
│   ├── Redis (cache e filas)
│   └── pgAdmin (gerenciamento)
│
└── APIs Externas
    ├── Google Maps API
    ├── Google Places API
    └── Anthropic Claude API
```

---

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- API Keys:
  - Google Maps API Key
  - Anthropic API Key

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/scampepisico.git
cd scampepisico
```

### 2. Configure as Variáveis de Ambiente

**Backend (.env)**:
```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env`:
```env
# Database
DATABASE_URL="postgresql://scampepisico:scampepisico123@localhost:5432/scampepisico"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_key_here

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-api03-your_key_here

# Server
PORT=3000
NODE_ENV=development
```

### 3. Inicie a Infraestrutura Docker
```bash
docker-compose up -d
```

Isso iniciará:
- PostgreSQL na porta 5432
- Redis na porta 6379
- pgAdmin na porta 5050

### 4. Instale Dependências

**Backend**:
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

### 5. Acesse o Sistema

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **pgAdmin**: http://localhost:5050
  - Email: admin@admin.com
  - Senha: admin

---

## 📖 Uso

### 1. Upload de Planilha
1. Acesse o dashboard
2. Clique em "Upload" (ou vá direto para /upload)
3. Arraste ou selecione uma planilha Excel/CSV
4. Aguarde o processamento

### 2. Geocodificação
```bash
# Iniciar geocoding de todos os clientes
curl -X POST http://localhost:3000/api/geocoding/start

# Verificar status
curl http://localhost:3000/api/geocoding/status
```

### 3. Busca no Google Places
```bash
# Iniciar busca de Places
curl -X POST http://localhost:3000/api/places/start

# Verificar status
curl http://localhost:3000/api/places/status
```

### 4. Análise com IA
```bash
# Análise consolidada (recomendado)
curl -X POST http://localhost:3000/api/analysis/start \
  -H "Content-Type: application/json" \
  -d '{"mode": "batch"}'

# Verificar status
curl http://localhost:3000/api/analysis/status

# Ver resultado de um cliente
curl http://localhost:3000/api/analysis/:clienteId/resultado
```

---

## 🔌 APIs e Endpoints

### Upload
- `POST /api/upload` - Upload de planilha
- `GET /api/uploads` - Listar uploads
- `GET /api/uploads/:id` - Detalhes do upload

### Geocoding
- `POST /api/geocoding/start` - Iniciar geocoding
- `POST /api/geocoding/:id` - Geocodificar cliente específico
- `GET /api/geocoding/status` - Status da fila
- `GET /api/geocoding/clientes` - Listar geocodificados
- `POST /api/geocoding/retry-failed` - Reprocessar falhas

### Places
- `POST /api/places/start` - Iniciar busca de Places
- `POST /api/places/:id` - Buscar Places de um cliente
- `GET /api/places/status` - Status da fila
- `GET /api/places/clientes` - Listar processados
- `GET /api/places/:id/detalhes` - Detalhes completos
- `GET /api/places/estatisticas` - Estatísticas gerais
- `POST /api/places/retry-failed` - Reprocessar falhas
- `GET /api/fotos/:filename` - Servir fotos

### Analysis (IA)
- `POST /api/analysis/start` - Iniciar análise IA
- `POST /api/analysis/:id` - Analisar cliente específico
- `GET /api/analysis/status` - Status da fila
- `GET /api/analysis/clientes` - Listar analisados
- `GET /api/analysis/:id/resultado` - Resultado da análise
- `GET /api/analysis/estatisticas` - Estatísticas gerais
- `POST /api/analysis/retry-failed` - Reprocessar erros

---

## 📁 Estrutura do Projeto

```
scampepisico/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Controladores da API
│   │   ├── services/        # Lógica de negócio
│   │   ├── workers/         # Workers de background
│   │   ├── queues/          # Configuração de filas
│   │   ├── routes/          # Rotas da API
│   │   └── index.ts         # Servidor Express
│   ├── prisma/
│   │   ├── schema.prisma    # Schema do banco
│   │   └── migrations/      # Migrations
│   ├── uploads/             # Arquivos enviados
│   │   └── fotos/          # Fotos dos Places
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ClientesList.tsx
│   │   │   └── UploadPlanilha.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── docker-compose.yml       # Infraestrutura Docker
├── CHANGELOG.md            # Histórico de mudanças
├── README.md               # Este arquivo
└── documentação/           # Docs das fases
    ├── FASE1_CONCLUIDA.md
    ├── FASE2_CONCLUIDA.md
    ├── FASE3_CONCLUIDA.md
    ├── FASE4_CONCLUIDA.md
    ├── FASE5_CONCLUIDA.md
    └── FASE6_CONCLUIDA.md
```

---

## 🎯 Fases de Desenvolvimento

### ✅ Fase 1: Setup Inicial (Concluída)
- Infraestrutura Docker
- Backend Node.js + TypeScript
- Frontend React + TypeScript
- Prisma ORM configurado

### ✅ Fase 2: Upload e Processamento (Concluída)
- Upload de planilhas Excel/CSV
- Parser com validação
- Normalização de dados
- Detecção de duplicatas

### ✅ Fase 3: Geolocalização (Concluída)
- Integração Google Maps API
- Worker de geocodificação
- Sistema de filas com Bull
- Retry automático

### ✅ Fase 4: Google Places e Fotos (Concluída)
- Integração Google Places API
- Download de fotos
- Classificação de estabelecimentos
- Cálculo de potencial

### ✅ Fase 5: Análise com IA (Concluída)
- Integração Claude Vision API
- Análise de imagens
- Classificação de tipologia
- Geração de relatórios

### ✅ Fase 6: Dashboard e Relatórios (Concluída)
- Dashboard com estatísticas
- Lista de clientes
- Busca e filtros
- Interface moderna

### ⏳ Fase 7: Otimizações (Futuro)
- Autenticação JWT
- Rate limiting
- Logs e monitoramento
- Testes automatizados

### ⏳ Fase 8: Deploy (Futuro)
- Deploy em produção
- CI/CD
- Backups automáticos
- Monitoramento ativo

---

## 📊 Estatísticas do Projeto

- **Tempo de Desenvolvimento**: ~4 horas
- **Linhas de Código**: ~5,000+
- **Endpoints REST**: 20+
- **Workers**: 3
- **Serviços**: 4
- **Componentes Frontend**: 3
- **APIs Integradas**: 3
- **Fases Concluídas**: 6/8

---

## 📚 Documentação

Documentação detalhada de cada fase:

- [Fase 1 - Setup Inicial](./FASE1_CONCLUIDA.md)
- [Fase 2 - Upload e Processamento](./FASE2_CONCLUIDA.md)
- [Fase 3 - Geolocalização](./docs/fase3.md)
- [Fase 4 - Google Places](./FASE4_CONCLUIDA.md)
- [Fase 5 - Análise com IA](./FASE5_CONCLUIDA.md)
- [Fase 6 - Dashboard](./docs/fase6.md)
- [CHANGELOG Completo](./CHANGELOG.md)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

Desenvolvido por **[Seu Nome]**

---

## 🎉 Agradecimentos

- Google Maps API
- Google Places API
- Anthropic Claude API
- Comunidade Open Source

---

**Sistema RAC v1.0** - Análise Inteligente de Clientes 🚀
