-- Extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca full-text

-- Comentário
COMMENT ON DATABASE scampepisico IS 'Sistema de Análise Inteligente de Clientes RAC';

-- Log de inicialização
DO $$
BEGIN
    RAISE NOTICE 'Database scampepisico initialized successfully';
END $$;
