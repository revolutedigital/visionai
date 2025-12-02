# Template de Testes - Sistema RAC

Este documento serve como template para documentar os testes realizados ao final de cada fase.

---

## Template para Atualização ao Final de Cada Fase

```markdown
# Testes - Fase X: [Nome da Fase]

**Data**: AAAA-MM-DD
**Versão**: X.Y.Z
**Responsável**: [Nome]

## Resumo da Fase

Breve descrição do que foi implementado nesta fase.

## Testes Unitários

### Arquivo: `nome-do-arquivo.test.ts`

| Teste | Status | Observações |
|-------|--------|-------------|
| Deve fazer X | ✅ PASSOU | - |
| Deve fazer Y | ✅ PASSOU | - |
| Deve rejeitar Z | ✅ PASSOU | - |

**Cobertura**: X%

### Arquivo: `outro-arquivo.test.ts`

| Teste | Status | Observações |
|-------|--------|-------------|
| Deve fazer X | ✅ PASSOU | - |

**Cobertura**: X%

## Testes de Integração

### Cenário: Upload de Planilha

| Teste | Status | Tempo | Observações |
|-------|--------|-------|-------------|
| Upload de .xlsx válido | ✅ PASSOU | 120ms | - |
| Upload de .csv válido | ✅ PASSOU | 80ms | - |
| Rejeição de arquivo inválido | ✅ PASSOU | 50ms | - |

### Cenário: Processamento de Dados

| Teste | Status | Tempo | Observações |
|-------|--------|-------|-------------|
| Parser extrai dados corretamente | ✅ PASSOU | 200ms | - |
| Validação detecta erros | ✅ PASSOU | 150ms | - |

## Testes End-to-End (E2E)

### Fluxo: Upload e Visualização

| Passo | Status | Observações |
|-------|--------|-------------|
| 1. Usuário acessa página de upload | ✅ PASSOU | - |
| 2. Usuário seleciona arquivo | ✅ PASSOU | - |
| 3. Upload é realizado | ✅ PASSOU | - |
| 4. Preview é exibido | ✅ PASSOU | - |
| 5. Dados são salvos | ✅ PASSOU | - |

## Testes Manuais

### Checklist de Funcionalidades

- [x] Funcionalidade A funciona conforme esperado
- [x] Funcionalidade B funciona conforme esperado
- [x] Funcionalidade C funciona conforme esperado
- [ ] Funcionalidade D apresentou problema (ver Issues)

### Checklist de UI/UX

- [x] Interface é responsiva
- [x] Feedbacks visuais são claros
- [x] Mensagens de erro são compreensíveis
- [x] Loading states funcionam

## Testes de Performance

| Métrica | Objetivo | Resultado | Status |
|---------|----------|-----------|--------|
| Tempo de resposta API | <200ms | 150ms | ✅ OK |
| Tempo de upload (10MB) | <5s | 3.2s | ✅ OK |
| Processamento de 100 clientes | <2min | 1.5min | ✅ OK |
| Uso de memória | <512MB | 380MB | ✅ OK |

## Testes de APIs Externas

### Google Maps API

| Teste | Status | Observações |
|-------|--------|-------------|
| Geocoding retorna coordenadas | ✅ PASSOU | - |
| Rate limit é respeitado | ✅ PASSOU | - |
| Retry funciona em caso de erro | ✅ PASSOU | - |

### Claude API

| Teste | Status | Observações |
|-------|--------|-------------|
| Análise de imagem retorna resultado | ✅ PASSOU | - |
| Parsing de JSON funciona | ✅ PASSOU | - |

## Issues Encontrados

### Issue #1: [Título]
- **Severidade**: Alta/Média/Baixa
- **Descrição**: Breve descrição do problema
- **Passos para reproduzir**:
  1. Passo 1
  2. Passo 2
- **Comportamento esperado**: X
- **Comportamento atual**: Y
- **Status**: Aberto/Resolvido
- **Solução**: Descrição da solução (se resolvido)

## Métricas Gerais

- **Cobertura de Testes Total**: X%
- **Testes Unitários**: X passaram, Y falharam
- **Testes de Integração**: X passaram, Y falharam
- **Testes E2E**: X passaram, Y falharam
- **Total de Issues**: X abertos, Y resolvidos

## Melhorias Sugeridas

1. Melhoria A
2. Melhoria B
3. Melhoria C

## Próximos Passos

- [ ] Resolver issues pendentes
- [ ] Implementar melhorias sugeridas
- [ ] Iniciar próxima fase

## Aprovação

- [ ] Todos os testes críticos passaram
- [ ] Cobertura de testes >= meta definida
- [ ] Performance está dentro dos parâmetros
- [ ] Issues críticos foram resolvidos
- [ ] Documentação foi atualizada

**Fase aprovada para prosseguir**: ✅ SIM / ❌ NÃO

---

**Observações Adicionais**:

(Espaço para observações livres)
```

---

## Exemplo de Uso

Ao final de cada fase, copie o template acima e preencha com os dados reais dos testes realizados. Salve o arquivo como:

- `TESTES_FASE_1.md`
- `TESTES_FASE_2.md`
- `TESTES_FASE_3.md`
- etc.

---

## Comandos Úteis para Testes

### Backend

```bash
# Rodar todos os testes
npm test

# Rodar testes unitários
npm run test:unit

# Rodar testes de integração
npm run test:integration

# Rodar testes E2E
npm run test:e2e

# Rodar com cobertura
npm run test:coverage

# Rodar em modo watch
npm run test:watch

# Rodar testes específicos
npm test -- nome-do-arquivo

# Rodar testes com verbose
npm test -- --verbose
```

### Frontend

```bash
# Rodar testes do frontend
npm test

# Rodar testes E2E com Playwright
npx playwright test

# Rodar com UI do Playwright
npx playwright test --ui

# Rodar em modo debug
npx playwright test --debug
```

### Docker

```bash
# Rodar testes no container
docker-compose run backend npm test

# Rodar testes de integração (com banco)
docker-compose run backend npm run test:integration
```

---

## Critérios de Aceitação por Fase

### Fase 1: Setup Inicial
- [ ] Docker sobe sem erros
- [ ] Backend conecta ao banco
- [ ] Frontend carrega
- [ ] Comunicação frontend-backend funciona

### Fase 2: Upload e Processamento
- [ ] Upload de Excel funciona
- [ ] Parser extrai dados corretamente
- [ ] Validação detecta erros
- [ ] Dados são salvos no banco

### Fase 3: Geolocalização
- [ ] Google Maps API responde
- [ ] Coordenadas são obtidas
- [ ] Dados são salvos no banco
- [ ] Mapa exibe marcadores

### Fase 4: Pesquisa Web
- [ ] Places API retorna dados
- [ ] Fotos são baixadas
- [ ] Scraping funciona
- [ ] Interface exibe fotos

### Fase 5: Análise com IA
- [ ] Claude API responde
- [ ] Imagens são analisadas
- [ ] Classificação é correta
- [ ] Scores são calculados

### Fase 6: Dashboard
- [ ] Dashboard exibe dados
- [ ] Filtros funcionam
- [ ] Exportação funciona
- [ ] Performance é aceitável

### Fase 7: Otimizações
- [ ] Cobertura >= 80%
- [ ] Performance dentro dos limites
- [ ] Segurança implementada
- [ ] Logs funcionam

### Fase 8: Deploy
- [ ] Deploy bem-sucedido
- [ ] HTTPS funciona
- [ ] CI/CD funciona
- [ ] Monitoramento ativo

---

## Contato

Para dúvidas sobre testes, consulte a documentação ou entre em contato com a equipe.

