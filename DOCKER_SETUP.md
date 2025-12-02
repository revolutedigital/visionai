# Setup Docker - Sistema RAC

Documentação completa para configuração do Docker Compose com PostgreSQL e Redis.

---

## Estrutura Docker

O projeto utiliza Docker Compose com os seguintes serviços:
- **PostgreSQL**: Banco de dados principal
- **Redis**: Cache e filas (Bull)
- **pgAdmin** (opcional): Interface web para PostgreSQL

---

## Arquivo docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL - Banco de Dados Principal
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
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=pt_BR.UTF-8"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - scampepisico-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U scampepisico"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis - Cache e Filas
  redis:
    image: redis:7-alpine
    container_name: scampepisico-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --requirepass redis123
    volumes:
      - redis_data:/data
    networks:
      - scampepisico-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # pgAdmin (Opcional - Interface Web para PostgreSQL)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: scampepisico-pgadmin
    restart: unless-stopped
    ports:
      - "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@scampepisico.com
      PGADMIN_DEFAULT_PASSWORD: admin123
      PGADMIN_CONFIG_SERVER_MODE: 'False'
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    networks:
      - scampepisico-network
    depends_on:
      - postgres

# Volumes Persistentes
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  pgadmin_data:
    driver: local

# Network
networks:
  scampepisico-network:
    driver: bridge
```

---

## Script de Inicialização do PostgreSQL

Crie o arquivo `docker/postgres/init.sql`:

```sql
-- Extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca full-text

-- Configurações de performance
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Comentário
COMMENT ON DATABASE scampepisico IS 'Sistema de Análise Inteligente de Clientes RAC';
```

---

## Variáveis de Ambiente (.env)

Crie o arquivo `.env` na raiz do projeto:

```env
# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=scampepisico
POSTGRES_PASSWORD=scampepisico123
POSTGRES_DB=scampepisico

# URL de conexão do Prisma
DATABASE_URL="postgresql://scampepisico:scampepisico123@localhost:5432/scampepisico?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# Redis URL para Bull
REDIS_URL="redis://:redis123@localhost:6379"

# pgAdmin
PGADMIN_EMAIL=admin@scampepisico.com
PGADMIN_PASSWORD=admin123
```

---

## Comandos Docker

### Iniciar Serviços

```bash
# Iniciar todos os serviços
docker-compose up -d

# Iniciar apenas PostgreSQL
docker-compose up -d postgres

# Iniciar apenas Redis
docker-compose up -d redis

# Iniciar com logs
docker-compose up
```

### Parar Serviços

```bash
# Parar todos os serviços
docker-compose down

# Parar e remover volumes (ATENÇÃO: apaga dados)
docker-compose down -v
```

### Ver Logs

```bash
# Ver logs de todos os serviços
docker-compose logs

# Ver logs do PostgreSQL
docker-compose logs postgres

# Ver logs do Redis
docker-compose logs redis

# Seguir logs em tempo real
docker-compose logs -f

# Ver últimas 100 linhas
docker-compose logs --tail=100
```

### Status dos Serviços

```bash
# Ver status
docker-compose ps

# Ver uso de recursos
docker stats
```

### Conectar aos Serviços

```bash
# Conectar ao PostgreSQL
docker exec -it scampepisico-postgres psql -U scampepisico -d scampepisico

# Conectar ao Redis
docker exec -it scampepisico-redis redis-cli -a redis123

# Bash no container do PostgreSQL
docker exec -it scampepisico-postgres bash
```

---

## Backup e Restore

### Backup do PostgreSQL

```bash
# Backup completo
docker exec -t scampepisico-postgres pg_dump -U scampepisico scampepisico > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup comprimido
docker exec -t scampepisico-postgres pg_dump -U scampepisico scampepisico | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Backup de schema apenas
docker exec -t scampepisico-postgres pg_dump -U scampepisico --schema-only scampepisico > schema.sql

# Backup de dados apenas
docker exec -t scampepisico-postgres pg_dump -U scampepisico --data-only scampepisico > data.sql
```

### Restore do PostgreSQL

```bash
# Restore de backup
docker exec -i scampepisico-postgres psql -U scampepisico -d scampepisico < backup.sql

# Restore de backup comprimido
gunzip -c backup.sql.gz | docker exec -i scampepisico-postgres psql -U scampepisico -d scampepisico
```

### Backup do Redis

```bash
# Criar snapshot manualmente
docker exec scampepisico-redis redis-cli -a redis123 BGSAVE

# Copiar arquivo RDB
docker cp scampepisico-redis:/data/dump.rdb ./backup_redis_$(date +%Y%m%d_%H%M%S).rdb
```

### Restore do Redis

```bash
# Parar Redis
docker-compose stop redis

# Restaurar arquivo
docker cp backup_redis.rdb scampepisico-redis:/data/dump.rdb

# Iniciar Redis
docker-compose start redis
```

---

## Configuração do Prisma

### Instalação

```bash
cd backend
npm install prisma @prisma/client --save-dev
```

### Inicialização

```bash
npx prisma init
```

### Schema Prisma Inicial

Arquivo `backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Modelos serão adicionados nas próximas fases
```

### Comandos Prisma

```bash
# Criar migration
npx prisma migrate dev --name init

# Aplicar migrations
npx prisma migrate deploy

# Resetar banco (ATENÇÃO: apaga dados)
npx prisma migrate reset

# Gerar Prisma Client
npx prisma generate

# Abrir Prisma Studio (interface web)
npx prisma studio

# Validar schema
npx prisma validate

# Formatar schema
npx prisma format
```

---

## Acessar Interfaces Web

### pgAdmin
- URL: http://localhost:5050
- Email: admin@scampepisico.com
- Senha: admin123

**Configurar conexão no pgAdmin:**
1. Clique em "Add New Server"
2. General > Name: scampepisico
3. Connection:
   - Host: postgres (nome do container)
   - Port: 5432
   - Database: scampepisico
   - Username: scampepisico
   - Password: scampepisico123

### Prisma Studio
```bash
npx prisma studio
```
- URL: http://localhost:5555

---

## Solução de Problemas

### Erro: Porta já em uso

```bash
# Verificar qual processo está usando a porta
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Matar processo
kill -9 <PID>

# Ou mudar a porta no docker-compose.yml
```

### Erro: Permissão negada em volumes

```bash
# Dar permissão aos volumes
sudo chmod -R 777 ./volumes
```

### PostgreSQL não inicia

```bash
# Ver logs detalhados
docker-compose logs postgres

# Remover volume e recriar
docker-compose down -v
docker-compose up -d
```

### Redis não aceita conexões

```bash
# Testar conexão
docker exec -it scampepisico-redis redis-cli -a redis123 ping

# Deve retornar: PONG
```

### Limpar tudo e recomeçar

```bash
# ATENÇÃO: Apaga TODOS os dados

# Parar e remover containers, volumes e networks
docker-compose down -v

# Remover imagens (opcional)
docker rmi postgres:16-alpine redis:7-alpine dpage/pgadmin4

# Limpar cache do Docker
docker system prune -a

# Recriar tudo
docker-compose up -d
```

---

## Monitoramento

### Ver uso de recursos

```bash
# Stats em tempo real
docker stats

# Ver uso de disco dos volumes
docker system df -v
```

### Healthchecks

```bash
# Ver status de saúde dos containers
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Logs estruturados

Configure o Docker para logs em JSON:

```json
// /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

---

## Configuração para Produção

### Docker Compose para Produção

Crie `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    networks:
      - internal
    # Não expor porta publicamente

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_prod_data:/data
    networks:
      - internal
    # Não expor porta publicamente

volumes:
  postgres_prod_data:
  redis_prod_data:

networks:
  internal:
    internal: true  # Rede apenas interna
```

### Iniciar em produção

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## Checklist de Setup

- [ ] Docker e Docker Compose instalados
- [ ] Arquivo `docker-compose.yml` criado
- [ ] Arquivo `.env` configurado
- [ ] Pasta `docker/postgres/` criada
- [ ] Arquivo `init.sql` criado
- [ ] Serviços iniciados: `docker-compose up -d`
- [ ] PostgreSQL acessível: `psql` ou pgAdmin
- [ ] Redis acessível: `redis-cli`
- [ ] Prisma configurado
- [ ] Migrations executadas
- [ ] Prisma Studio funcionando

---

## Próximos Passos

Após completar este setup:
1. ✅ Docker Compose funcional
2. ⬜ Configurar backend Node.js
3. ⬜ Conectar backend ao PostgreSQL via Prisma
4. ⬜ Configurar Bull para usar Redis
5. ⬜ Criar schemas do Prisma

---

## Referências

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
- [Prisma Docs](https://www.prisma.io/docs/)

