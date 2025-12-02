# Guia de Início Rápido - Sistema RAC

Guia prático para começar o desenvolvimento do Sistema de Análise Inteligente de Clientes RAC.

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- ✅ **Node.js** >= 18.x ([Download](https://nodejs.org/))
- ✅ **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- ✅ **Git** ([Download](https://git-scm.com/))
- ✅ **Editor de Código** (VS Code recomendado)

### Verificar Instalações

```bash
# Node.js
node --version  # Deve mostrar v18.x ou superior

# npm
npm --version   # Deve mostrar 9.x ou superior

# Docker
docker --version  # Deve mostrar 20.x ou superior

# Docker Compose
docker-compose --version  # Deve mostrar 2.x ou superior

# Git
git --version  # Qualquer versão recente
```

---

## Passo 1: Obter API Keys

### Google Maps API

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá para "APIs & Services" > "Library"
4. Ative as seguintes APIs:
   - ✅ Geocoding API
   - ✅ Places API
   - ✅ Maps JavaScript API
5. Vá para "Credentials" > "Create Credentials" > "API Key"
6. Copie a API Key e guarde em local seguro
7. Configure restrições (opcional mas recomendado):
   - Restrições de aplicativo: IPs (seu servidor)
   - Restrições de API: Apenas as 3 APIs acima

### Claude API (Anthropic)

1. Acesse [Anthropic Console](https://console.anthropic.com/)
2. Crie uma conta ou faça login
3. Vá para "API Keys"
4. Clique em "Create Key"
5. Copie a API Key e guarde em local seguro
6. Configure billing (cartão de crédito)
7. Defina alertas de uso (recomendado):
   - Alerta em $50
   - Limite máximo em $100

---

## Passo 2: Configurar Estrutura do Projeto

### 2.1 Criar Estrutura de Pastas

```bash
# Criar estrutura base
mkdir -p backend/src/{controllers,services,workers,models,utils,middleware,routes}
mkdir -p backend/prisma
mkdir -p backend/tests/{unit,integration,e2e}
mkdir -p backend/uploads
mkdir -p backend/storage/photos

mkdir -p frontend/src/{components,pages,services,hooks,utils,types}
mkdir -p frontend/public

mkdir -p docker/postgres
mkdir -p docker/redis

# Criar arquivos de configuração
touch docker-compose.yml
touch .gitignore
touch .env.example
```

### 2.2 Criar .gitignore

```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output/

# Production
build/
dist/

# Environment
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# IDEs
.vscode/
.idea/
*.swp
*.swo

# Uploads
uploads/*
!uploads/.gitkeep

# Storage
storage/photos/*
!storage/photos/.gitkeep

# Prisma
prisma/migrations/*
!prisma/migrations/.gitkeep

# Docker
docker/postgres/data/
docker/redis/data/
EOF
```

---

## Passo 3: Configurar Docker

### 3.1 Criar docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: scampepisico-postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: scampepisico
      POSTGRES_PASSWORD: scampepisico123
      POSTGRES_DB: scampepisico
    volumes:
      - ./docker/postgres/data:/var/lib/postgresql/data
    networks:
      - scampepisico-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U scampepisico"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: scampepisico-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --requirepass redis123
    volumes:
      - ./docker/redis/data:/data
    networks:
      - scampepisico-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:

networks:
  scampepisico-network:
    driver: bridge
```

### 3.2 Iniciar Serviços Docker

```bash
# Criar pastas de dados
mkdir -p docker/postgres/data
mkdir -p docker/redis/data

# Iniciar serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f

# Testar conexão com PostgreSQL
docker exec -it scampepisico-postgres psql -U scampepisico -d scampepisico -c "SELECT version();"

# Testar conexão com Redis
docker exec -it scampepisico-redis redis-cli -a redis123 ping
```

---

## Passo 4: Configurar Backend

### 4.1 Inicializar Projeto Node.js

```bash
cd backend

# Inicializar package.json
npm init -y

# Instalar dependências principais
npm install express cors dotenv prisma @prisma/client

# Instalar TypeScript e types
npm install -D typescript @types/node @types/express ts-node nodemon

# Instalar ferramentas de desenvolvimento
npm install -D prettier eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Instalar bibliotecas específicas
npm install multer xlsx bull @anthropic-ai/sdk @googlemaps/google-maps-services-js
npm install -D @types/multer
```

### 4.2 Configurar TypeScript

```bash
# Criar tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

### 4.3 Configurar Prisma

```bash
# Inicializar Prisma
npx prisma init

# Criar schema inicial
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Cliente {
  id        String   @id @default(uuid())
  nome      String
  endereco  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
EOF

# Criar primeira migration
npx prisma migrate dev --name init
```

### 4.4 Criar .env

```bash
cat > .env << 'EOF'
# Banco de Dados
DATABASE_URL="postgresql://scampepisico:scampepisico123@localhost:5432/scampepisico?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# Google Maps
GOOGLE_MAPS_API_KEY=sua-api-key-aqui

# Claude API
ANTHROPIC_API_KEY=sua-api-key-aqui

# Servidor
PORT=3000
NODE_ENV=development

# JWT (para futuro)
JWT_SECRET=seu-secret-super-secreto-aqui
EOF
```

### 4.5 Criar Servidor Básico

```bash
# Criar arquivo principal
cat > src/index.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
EOF
```

### 4.6 Configurar Scripts

Editar `package.json` e adicionar scripts:

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

### 4.7 Testar Backend

```bash
# Iniciar em modo desenvolvimento
npm run dev

# Em outro terminal, testar
curl http://localhost:3000/health
```

---

## Passo 5: Configurar Frontend

### 5.1 Criar Projeto React

```bash
cd ..  # Voltar para raiz do projeto

# Criar projeto com Vite
npm create vite@latest frontend -- --template react-ts

cd frontend

# Instalar dependências
npm install

# Instalar Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Instalar bibliotecas adicionais
npm install react-query axios react-router-dom
```

### 5.2 Configurar Tailwind CSS

```bash
# Editar tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Editar src/index.css
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF
```

### 5.3 Criar Página Inicial

```typescript
// src/App.tsx
import { useState } from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Sistema RAC
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            Sistema de Análise Inteligente de Clientes
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
```

### 5.4 Testar Frontend

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Abrir no navegador: http://localhost:5173
```

---

## Passo 6: Verificar Instalação Completa

### Checklist Final

```bash
# 1. Docker está rodando?
docker-compose ps
# Deve mostrar postgres e redis como "Up"

# 2. PostgreSQL está acessível?
docker exec -it scampepisico-postgres psql -U scampepisico -c "SELECT 1;"
# Deve retornar: 1

# 3. Redis está acessível?
docker exec -it scampepisico-redis redis-cli -a redis123 ping
# Deve retornar: PONG

# 4. Backend está rodando?
curl http://localhost:3000/health
# Deve retornar JSON com status: ok

# 5. Frontend está rodando?
curl http://localhost:5173
# Deve retornar HTML

# 6. Prisma está configurado?
cd backend
npx prisma studio
# Deve abrir navegador com Prisma Studio
```

---

## Estrutura Final do Projeto

```
scampepisico/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── workers/
│   │   ├── models/
│   │   └── utils/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/
│   │   └── pages/
│   ├── package.json
│   └── tailwind.config.js
├── docker/
│   ├── postgres/
│   └── redis/
├── docker-compose.yml
├── .gitignore
├── README.md
├── PLANO_DESENVOLVIMENTO.md
├── CHANGELOG.md
├── ARQUITETURA.md
└── GUIA_INICIO_RAPIDO.md
```

---

## Próximos Passos

### Fase 1: Começar Desenvolvimento

1. ✅ Ambiente configurado
2. ⬜ Implementar upload de planilhas
3. ⬜ Implementar parser de dados
4. ⬜ Criar interface de upload no frontend
5. ⬜ Conectar frontend com backend

### Comandos Úteis Durante o Desenvolvimento

```bash
# Parar todos os serviços
docker-compose down

# Reiniciar serviços
docker-compose restart

# Ver logs de um serviço específico
docker-compose logs -f postgres

# Limpar tudo (CUIDADO: apaga dados)
docker-compose down -v

# Rodar migrations
cd backend
npx prisma migrate dev

# Visualizar banco de dados
npx prisma studio

# Rodar testes (quando implementados)
npm test
```

---

## Troubleshooting

### Problema: Porta já em uso

```bash
# Encontrar processo usando a porta
lsof -i :3000  # Backend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :5173  # Frontend

# Matar processo
kill -9 <PID>
```

### Problema: Docker não inicia

```bash
# Verificar se Docker está rodando
docker ps

# Reiniciar Docker Desktop
# macOS: Cmd+Q e abrir novamente
# Windows: Fechar e reabrir

# Verificar logs
docker-compose logs
```

### Problema: Erro de permissão em volumes

```bash
# Dar permissões às pastas
chmod -R 777 docker/postgres/data
chmod -R 777 docker/redis/data
```

### Problema: Prisma não conecta ao banco

```bash
# Verificar DATABASE_URL no .env
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Tentar gerar client novamente
npx prisma generate
```

---

## Recursos Úteis

### Documentação
- [Node.js Docs](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Prisma Docs](https://www.prisma.io/docs/)
- [React Docs](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Tutoriais
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Docker Getting Started](https://docs.docker.com/get-started/)
- [Prisma Quick Start](https://www.prisma.io/docs/getting-started/quickstart)

### Ferramentas
- [Postman](https://www.postman.com/) - Testar APIs
- [DBeaver](https://dbeaver.io/) - Cliente de banco de dados
- [Redis Commander](http://joeferner.github.io/redis-commander/) - Interface para Redis

---

## Suporte

Se encontrar problemas:
1. Consulte este guia novamente
2. Verifique a documentação oficial das tecnologias
3. Procure no Stack Overflow
4. Revise os logs de erro

---

**Pronto!** Seu ambiente está configurado e você pode começar o desenvolvimento! 🚀

Próximo passo: Implementar a **Fase 2 - Upload e Processamento de Planilhas**

