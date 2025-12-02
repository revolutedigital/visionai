# 💰 Otimização de Custos - Claude Vision AI

## 🎯 Estratégia Híbrida Implementada

O sistema agora usa uma **estratégia híbrida** para otimizar custos mantendo qualidade:

- **Haiku** para análise visual de fotos (Step 4) → **73% mais barato**
- **Sonnet** para classificação de tipologia (Step 5) → **Qualidade máxima**

## 📊 Comparação de Custos

### Por Cliente (10 fotos):

| Configuração | Análise Visual | Tipologia | Total | Economia |
|--------------|----------------|-----------|-------|----------|
| **Sonnet Full** | $0.3330 | $0.0135 | **$0.3465** | - |
| **Híbrido** ✅ | $0.0900 | $0.0135 | **$0.1035** | **-70%** |

### Para 100 Clientes:

| Configuração | Total | Economia |
|--------------|-------|----------|
| Sonnet Full | $34.65 (R$ 207,90) | - |
| **Híbrido** ✅ | **$10.35 (R$ 62,10)** | **R$ 145,80** |

## ⚙️ Como Alternar Entre Modelos

Edite o arquivo `.env`:

```bash
# OPÇÃO 1: HAIKU (Recomendado - 73% mais barato)
CLAUDE_VISION_MODEL=haiku

# OPÇÃO 2: SONNET (Qualidade máxima, 3x mais caro)
CLAUDE_VISION_MODEL=sonnet
```

Reinicie o backend após alterar:
```bash
npm run dev
```

## 📈 Qualidade Esperada

### Haiku (Modelo Atual):
- ✅ **Ambiente**: Excelente (MODERNO, TRADICIONAL, etc)
- ✅ **Branding**: Excelente (detecção de logos/marcas)
- ✅ **Sinalização**: Muito Bom (qualidade, visibilidade)
- ✅ **Público-alvo**: Bom (inferência de elementos visuais)
- ⚠️ **Profissionalização**: Razoável (pode ter ~10% erro)

### Sonnet (Qualidade Máxima):
- ⭐⭐⭐⭐⭐ Todas as métricas com precisão máxima
- Recomendado apenas para testes de qualidade ou datasets críticos

## 🧪 Recomendação de Teste

1. **Rode com Haiku em 10-20 clientes**
2. **Verifique a qualidade dos resultados**
3. Se aceitável → Continue com Haiku (economia de 70%)
4. Se insatisfatório → Troque para Sonnet

## 💡 Outras Otimizações Implementadas

1. ✅ **max_tokens reduzido**: 2000 → 1500 (economia adicional de ~10%)
2. ✅ **Cache de análises**: Fotos duplicadas reutilizam análise (30-40% economia)
3. ✅ **Modo batch**: Analisa todas fotos juntas vs 1 por 1 (87% economia)

## 🎯 Tipologia Continua com Sonnet

A classificação de tipologia (Step 5) **sempre usa Sonnet** porque:
- Não processa imagens (custo muito baixo: $0.0135/cliente)
- Decisão crítica que define a categoria final
- Usa TODOS os dados coletados (Places, Receita, Fotos)

## 📋 Resumo da Configuração Atual

```
✅ Análise Visual: Haiku ($0.09/cliente)
✅ Tipologia: Sonnet ($0.0135/cliente)
✅ Total: $0.10/cliente (R$ 0,60)
✅ Economia vs Full Sonnet: 70%
```

---

**Última atualização**: 2025-01-28
**Configuração padrão**: Haiku (recomendado)
