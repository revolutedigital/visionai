/**
 * Testes Unitários - TipologiaValidatorService
 * Sprint 3: Validação cruzada IA × Google Places
 */

import { TipologiaValidatorService } from '../../services/tipologia-validator.service';

describe('TipologiaValidatorService', () => {
  let validator: TipologiaValidatorService;

  beforeAll(() => {
    validator = new TipologiaValidatorService();
  });

  describe('validateCrossReference', () => {
    it('deve validar padaria com match perfeito', () => {
      const result = validator.validateCrossReference(
        'H3', // PADARIA
        ['bakery', 'cafe', 'food'],
        'Padaria São José'
      );

      expect(result.valid).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(95);
      expect(result.matches.byPlaceType).toBe(true);
      expect(result.matches.byKeyword).toBe(true);
    });

    it('deve validar supermercado por place type', () => {
      const result = validator.validateCrossReference(
        'F5', // AS 01 A 04 CHECK-OUT
        ['supermarket', 'grocery_or_supermarket'],
        'Mercado Bom Preço'
      );

      expect(result.valid).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(85);
      expect(result.matches.byPlaceType).toBe(true);
    });

    it('deve validar restaurante por keyword', () => {
      const result = validator.validateCrossReference(
        'G5', // RESTAURANTE
        ['establishment'],
        'Restaurante Italiano La Nonna'
      );

      expect(result.valid).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(70);
      expect(result.matches.byKeyword).toBe(true);
    });

    it('deve detectar divergência (padaria vs farmácia)', () => {
      const result = validator.validateCrossReference(
        'H3', // PADARIA
        ['pharmacy', 'drugstore', 'health'],
        'Farmácia Popular'
      );

      expect(result.valid).toBe(false);
      expect(result.confidence).toBeLessThanOrEqual(50);
      expect(result.warning).toBeDefined();
      expect(result.suggestedTipologias).toBeDefined();
      expect(result.suggestedTipologias!.length).toBeGreaterThan(0);
      expect(result.suggestedTipologias![0].codigo).toBe('I8'); // DROGARIA
    });

    it('deve retornar erro para tipologia inexistente', () => {
      const result = validator.validateCrossReference(
        'XXX', // Inexistente
        ['restaurant'],
        'Restaurante ABC'
      );

      expect(result.valid).toBe(false);
      expect(result.confidence).toBe(0);
      expect(result.warning).toContain('não encontrada');
    });
  });

  describe('findBestMatchingTipologias', () => {
    it('deve sugerir pizzaria para restaurant', () => {
      const matches = validator.findBestMatchingTipologias(
        ['restaurant', 'meal_delivery', 'food'],
        'Pizzaria Bella Napoli'
      );

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].codigo).toBe('G6'); // PIZZARIA
    });

    it('deve sugerir posto para gas_station', () => {
      const matches = validator.findBestMatchingTipologias(
        ['gas_station', 'convenience_store'],
        'Posto Shell'
      );

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].codigo).toBe('N1'); // POSTO DE GASOLINA
    });

    it('deve retornar vazio para tipos não mapeados', () => {
      const matches = validator.findBestMatchingTipologias(
        ['unknown_type'],
        'Estabelecimento Desconhecido'
      );

      expect(matches.length).toBe(0);
    });
  });

  describe('validateNameKeywords', () => {
    it('deve encontrar keyword "padaria" no nome', () => {
      const result = validator.validateNameKeywords('H3', 'Padaria Central');

      expect(result.hasMatch).toBe(true);
      expect(result.matchedKeywords).toContain('padaria');
    });

    it('deve encontrar múltiplas keywords', () => {
      const result = validator.validateNameKeywords('H3', 'Padaria e Panificadora Central');

      expect(result.hasMatch).toBe(true);
      expect(result.matchedKeywords.length).toBeGreaterThanOrEqual(2);
    });

    it('deve não encontrar match para nome diferente', () => {
      const result = validator.validateNameKeywords('H3', 'Farmácia Popular');

      expect(result.hasMatch).toBe(false);
      expect(result.matchedKeywords.length).toBe(0);
    });
  });

  describe('suggestTipologiaFromPlaces', () => {
    it('deve sugerir tipologia baseada em places', () => {
      const suggested = validator.suggestTipologiaFromPlaces(
        ['bakery', 'cafe', 'food'],
        'Padaria do Bairro'
      );

      expect(suggested).not.toBeNull();
      expect(suggested!.codigo).toBe('H3');
    });

    it('deve retornar null para dados insuficientes', () => {
      const suggested = validator.suggestTipologiaFromPlaces(
        ['unknown'],
        'Nome Genérico'
      );

      expect(suggested).toBeNull();
    });
  });
});
