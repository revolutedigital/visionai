# 🔑 Guia de Configuração das APIs

Este guia mostra exatamente onde e como adicionar suas API Keys para o sistema funcionar.

---

## 📍 Localização do Arquivo

As API Keys ficam no arquivo `.env` dentro da pasta `backend`:

```
scampepisico/
└── backend/
    └── .env  ← AQUI!
```

---

## 🛠️ Passo a Passo

### 1. Navegue até a pasta backend

```bash
cd /Users/yourapple/scampepisico/backend
```

### 2. Edite o arquivo .env

Abra o arquivo `.env` com seu editor preferido:

```bash
# Com VSCode
code .env

# Ou com nano
nano .env

# Ou com vim
vim .env
```

### 3. Adicione suas API Keys

O arquivo `.env` deve ficar assim:

```env
# ===================================
# DATABASE
# ===================================
DATABASE_URL="postgresql://scampepisico:scampepisico123@localhost:5432/scampepisico"

# ===================================
# REDIS
# ===================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# ===================================
# GOOGLE MAPS & PLACES API
# ===================================
# Coloque sua API Key do Google aqui:
GOOGLE_MAPS_API_KEY=AIzaSy...sua_key_aqui

# ===================================
# ANTHROPIC CLAUDE API
# ===================================
# Coloque sua API Key do Claude aqui:
ANTHROPIC_API_KEY=sk-ant-api03-...sua_key_aqui

# ===================================
# SERVER
# ===================================
PORT=3000
NODE_ENV=development

# ===================================
# PATHS
# ===================================
PHOTOS_DIR=./uploads/fotos
```

### 4. Salve o arquivo

- **VSCode/nano**: Ctrl+S ou Cmd+S
- **nano**: Ctrl+X, depois Y, depois Enter
- **vim**: Esc, depois :wq, depois Enter

### 5. Reinicie o Backend

```bash
# Se estiver rodando, pare com Ctrl+C
# Depois inicie novamente:
npm run dev
```

---

## 🔐 Como Obter as API Keys

### Google Maps API Key

1. **Acesse**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Crie um projeto** (ou use um existente)
3. **Ative as APIs**:
   - Vá em "APIs & Services" → "Library"
   - Busque e ative:
     - **Geocoding API**
     - **Places API**
     - **Places API (New)** (se disponível)
4. **Crie a API Key**:
   - Vá em "APIs & Services" → "Credentials"
   - Clique em "Create Credentials" → "API Key"
   - Copie a key gerada
5. **Configure restrições** (recomendado):
   - Clique na key criada
   - Em "API restrictions", selecione as APIs que você ativou
   - Salve

**Custo**:
- Geocoding: $5 por 1000 requisições (200 grátis/mês)
- Places: $17 por 1000 requisições

### Anthropic Claude API Key

1. **Acesse**: [Anthropic Console](https://console.anthropic.com/)
2. **Crie uma conta** ou faça login
3. **Adicione créditos**:
   - Vá em "Settings" → "Billing"
   - Adicione pelo menos $5 de crédito
4. **Crie a API Key**:
   - Vá em "Settings" → "API Keys"
   - Clique em "Create Key"
   - Dê um nome (ex: "Sistema RAC")
   - Copie a key (começa com `sk-ant-api03-`)
   - **IMPORTANTE**: Salve em local seguro, não será mostrada novamente!

**Custo**:
- Claude 3.5 Sonnet: ~$3 por 1M de tokens de entrada
- Análise de imagem: ~$0.01 por imagem

---

## ✅ Verificar Configuração

### 1. Verifique se o backend reconhece as keys

Quando você iniciar o backend (`npm run dev`), deve ver:

```bash
# ✅ CORRETO - Keys configuradas:
👷 Worker de Geocodificação iniciado
👷 Worker de Google Places iniciado
👷 Worker de Análise de IA iniciado

# ❌ INCORRETO - Keys faltando:
⚠️  GOOGLE_MAPS_API_KEY não configurada! Geocoding não funcionará.
⚠️  ANTHROPIC_API_KEY não configurada! Claude API não funcionará.
```

### 2. Teste os endpoints

**Teste Geocoding**:
```bash
curl http://localhost:3000/api/geocoding/status
```

Resposta esperada:
```json
{
  "success": true,
  "clientes": { ... }
}
```

**Teste Places**:
```bash
curl http://localhost:3000/api/places/status
```

**Teste Analysis**:
```bash
curl http://localhost:3000/api/analysis/status
```

---

## 🚨 Problemas Comuns

### Erro: "GOOGLE_MAPS_API_KEY não configurada"

**Causa**: A key não está no arquivo `.env` ou está com nome errado

**Solução**:
1. Abra `backend/.env`
2. Verifique se a linha existe: `GOOGLE_MAPS_API_KEY=sua_key`
3. Certifique-se de que não há espaços antes/depois do `=`
4. Reinicie o backend

### Erro: "Invalid API key" ou "401 Unauthorized"

**Causa**: A API key está incorreta ou não tem permissões

**Solução**:
1. Verifique se copiou a key completa (sem espaços)
2. No Google Cloud, verifique se as APIs estão ativadas
3. No Anthropic, verifique se tem créditos disponíveis
4. Regenere a key se necessário

### Erro: "Rate limit exceeded"

**Causa**: Você fez muitas requisições muito rápido

**Solução**:
- Aguarde alguns minutos
- Para testes, use delays maiores entre requisições
- No Google Cloud, aumente os limites se necessário

---

## 💰 Gestão de Custos

### Monitorar Uso - Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Vá em "Billing" → "Reports"
3. Filtre por:
   - Serviço: "Maps"
   - Período: Last 30 days

### Monitorar Uso - Anthropic

1. Acesse [Anthropic Console](https://console.anthropic.com/)
2. Vá em "Settings" → "Usage"
3. Veja:
   - Créditos restantes
   - Uso por dia/mês
   - Custo estimado

### Dicas para Economizar

**Geocoding/Places**:
- ✅ Processe em lote (vários clientes de uma vez)
- ✅ Use cache (já implementado via Redis)
- ✅ Não reprocesse clientes já geocodificados

**Claude AI**:
- ✅ Use modo `batch` (analisa todas as fotos de uma vez)
- ✅ Limite o número de fotos (já configurado: máx 5)
- ✅ Use apenas para clientes importantes (filtro por potencial)

---

## 🔒 Segurança

### ⚠️ NUNCA faça isso:

- ❌ Não commite o arquivo `.env` no Git
- ❌ Não compartilhe as API keys publicamente
- ❌ Não use as keys no frontend (só no backend)

### ✅ Boas Práticas:

- ✅ Mantenha `.env` no `.gitignore`
- ✅ Use `.env.example` (sem as keys) para documentação
- ✅ Rotacione as keys periodicamente
- ✅ Configure alertas de uso no Google Cloud
- ✅ Limite o escopo das keys (IP whitelisting se possível)

---

## 📝 Exemplo Completo do .env

```env
# ===================================
# CONFIGURAÇÃO COMPLETA
# ===================================

# Database (NÃO ALTERAR - já configurado pelo Docker)
DATABASE_URL="postgresql://scampepisico:scampepisico123@localhost:5432/scampepisico"

# Redis (NÃO ALTERAR - já configurado pelo Docker)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# Google Maps & Places (ADICIONAR SUAS KEYS)
GOOGLE_MAPS_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Anthropic Claude (ADICIONAR SUA KEY)
ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Server (NÃO ALTERAR)
PORT=3000
NODE_ENV=development

# Paths (NÃO ALTERAR)
PHOTOS_DIR=./uploads/fotos
```

---

## 🆘 Precisa de Ajuda?

Se tiver problemas:

1. **Verifique os logs do backend**:
   ```bash
   # No terminal onde o backend está rodando
   # Procure por mensagens de erro ou warnings
   ```

2. **Teste as keys separadamente**:
   ```bash
   # Teste só o Google Maps
   curl "https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=SUA_KEY"

   # Teste o Claude
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: SUA_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json" \
     -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'
   ```

3. **Verifique as permissões das APIs** no Google Cloud Console

4. **Verifique os créditos** no Anthropic Console

---

## ✅ Checklist Final

Antes de começar a usar o sistema:

- [ ] Arquivo `.env` criado em `backend/.env`
- [ ] `GOOGLE_MAPS_API_KEY` adicionada
- [ ] Geocoding API ativada no Google Cloud
- [ ] Places API ativada no Google Cloud
- [ ] `ANTHROPIC_API_KEY` adicionada
- [ ] Créditos adicionados no Anthropic (mín. $5)
- [ ] Backend reiniciado
- [ ] Nenhum warning de "não configurada" no console
- [ ] Teste dos endpoints passou

---

**Pronto! Agora seu sistema está configurado e pronto para usar! 🚀**
