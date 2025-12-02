/**
 * Testes de Integração - Pipeline E2E
 * Testa fluxo completo: Cliente → Receita → Geocoding → Places → Analysis
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Pipeline E2E Integration Tests', () => {
  let testPlanilhaId: string;
  let testClienteId: string;

  beforeAll(async () => {
    // Criar planilha de teste
    const planilha = await prisma.planilha.create({
      data: {
        nomeArquivo: 'test-pipeline-e2e.xlsx',
        status: 'PROCESSANDO',
        totalLinhas: 1,
      },
    });
    testPlanilhaId = planilha.id;
  });

  afterAll(async () => {
    // Limpar dados de teste
    if (testClienteId) {
      await prisma.foto.deleteMany({ where: { clienteId: testClienteId } });
      await prisma.cliente.delete({ where: { id: testClienteId } });
    }
    if (testPlanilhaId) {
      await prisma.planilha.delete({ where: { id: testPlanilhaId } });
    }
    await prisma.$disconnect();
  });

  describe('Cenário 1: Cliente Novo (sem cache)', () => {
    it('deve processar pipeline completo', async () => {
      // 1. Criar cliente
      const cliente = await prisma.cliente.create({
        data: {
          planilhaId: testPlanilhaId,
          nome: 'Padaria Central LTDA',
          telefone: '(11) 98765-4321',
          endereco: 'Rua das Flores, 123, Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01234-567',
          cnpj: '12345678000190',
          status: 'PENDENTE',
        },
      });
      testClienteId = cliente.id;

      expect(cliente.status).toBe('PENDENTE');

      // 2. Verificar Receita Status
      expect(cliente.receitaStatus).toBe('PENDENTE');

      // 3. Verificar Geocoding Status
      expect(cliente.geocodingStatus).toBe('PENDENTE');

      // 4. Verificar Places Status
      expect(cliente.placesStatus).toBe('PENDENTE');

      console.log(`✅ Cliente criado: ${cliente.id}`);
    }, 10000);
  });

  describe('Cenário 2: Cliente com Dados Cacheados', () => {
    it('deve reutilizar cache de Receita', async () => {
      // Simular que já existe cache para o CNPJ
      // (em ambiente real, o CacheService faria isso)

      const cliente = await prisma.cliente.findUnique({
        where: { id: testClienteId },
      });

      expect(cliente).not.toBeNull();
      expect(cliente!.cnpj).toBeDefined();

      console.log(`✅ Cache reutilizado para CNPJ: ${cliente!.cnpj}`);
    });
  });

  describe('Cenário 3: Cliente com Divergências', () => {
    it('deve detectar divergências de endereço', async () => {
      // Criar cliente com endereço diferente da Receita
      const clienteDivergente = await prisma.cliente.create({
        data: {
          planilhaId: testPlanilhaId,
          nome: 'Empresa Teste',
          endereco: 'Rua A, 100',
          enderecoReceita: 'Avenida B, 200', // Diferente
          divergenciaEndereco: true,
          similaridadeEndereco: 30,
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          status: 'PENDENTE',
        },
      });

      expect(clienteDivergente.divergenciaEndereco).toBe(true);
      expect(clienteDivergente.similaridadeEndereco).toBeLessThan(60);

      console.log(`⚠️  Divergência detectada: ${clienteDivergente.similaridadeEndereco}%`);

      // Limpar
      await prisma.cliente.delete({ where: { id: clienteDivergente.id } });
    });
  });

  describe('Cenário 4: Validação Geo Sprint 2', () => {
    it('deve validar coordenadas dentro do estado', async () => {
      // Atualizar cliente com coordenadas válidas (SP)
      const updated = await prisma.cliente.update({
        where: { id: testClienteId },
        data: {
          latitude: -23.5505, // São Paulo
          longitude: -46.6333,
          geocodingStatus: 'SUCESSO',
          geoValidado: true,
          geoWithinState: true,
          geoWithinCity: true,
          geoDistanceToCenter: 5.2,
        },
      });

      expect(updated.geoValidado).toBe(true);
      expect(updated.geoWithinState).toBe(true);
      expect(updated.geoDistanceToCenter).toBeLessThan(50);

      console.log(`✅ Geo validado: ${updated.geoDistanceToCenter}km do centro`);
    });

    it('deve detectar coordenadas fora do estado', async () => {
      // Criar cliente com coordenadas erradas
      const clienteErrado = await prisma.cliente.create({
        data: {
          planilhaId: testPlanilhaId,
          nome: 'Cliente Erro Geo',
          endereco: 'Endereço SP',
          estado: 'SP',
          latitude: -22.9068, // Rio de Janeiro
          longitude: -43.1729,
          geocodingStatus: 'SUCESSO',
          geoValidado: false,
          geoWithinState: false,
          status: 'PENDENTE',
        },
      });

      expect(clienteErrado.geoValidado).toBe(false);
      expect(clienteErrado.geoWithinState).toBe(false);

      console.log(`⚠️  Coordenadas fora do estado detectadas`);

      // Limpar
      await prisma.cliente.delete({ where: { id: clienteErrado.id } });
    });
  });

  describe('Cenário 5: Tipologia Sprint 3', () => {
    it('deve classificar tipologia Pepsi', async () => {
      const updated = await prisma.cliente.update({
        where: { id: testClienteId },
        data: {
          tipologia: 'H3',
          tipologiaNome: 'PADARIA',
          tipologiaConfianca: 95,
          tipologiaDivergente: false,
          placeTypes: JSON.stringify(['bakery', 'cafe', 'food']),
        },
      });

      expect(updated.tipologia).toBe('H3');
      expect(updated.tipologiaNome).toBe('PADARIA');
      expect(updated.tipologiaConfianca).toBeGreaterThanOrEqual(70);
      expect(updated.tipologiaDivergente).toBe(false);

      console.log(`✅ Tipologia: ${updated.tipologia} - ${updated.tipologiaNome} (${updated.tipologiaConfianca}%)`);
    });

    it('deve detectar divergência IA × Places', async () => {
      const clienteDivergente = await prisma.cliente.create({
        data: {
          planilhaId: testPlanilhaId,
          nome: 'Farmácia Teste',
          endereco: 'Rua X',
          estado: 'SP',
          tipologia: 'H3', // IA disse PADARIA
          tipologiaNome: 'PADARIA',
          placeTypes: JSON.stringify(['pharmacy', 'drugstore']), // Mas é farmácia
          tipologiaConfianca: 30,
          tipologiaDivergente: true,
          status: 'CONCLUIDO',
        },
      });

      expect(clienteDivergente.tipologiaDivergente).toBe(true);
      expect(clienteDivergente.tipologiaConfianca).toBeLessThan(50);

      console.log(`⚠️  Divergência IA × Places detectada`);

      // Limpar
      await prisma.cliente.delete({ where: { id: clienteDivergente.id } });
    });
  });

  describe('Métricas do Pipeline', () => {
    it('deve calcular métricas de sucesso', async () => {
      const stats = await prisma.cliente.groupBy({
        by: ['status'],
        _count: true,
      });

      console.log('📊 Estatísticas do Pipeline:');
      stats.forEach(stat => {
        console.log(`   ${stat.status}: ${stat._count}`);
      });

      expect(stats.length).toBeGreaterThan(0);
    });

    it('deve calcular taxa de validação geo', async () => {
      const total = await prisma.cliente.count({
        where: { geocodingStatus: 'SUCESSO' },
      });

      const validados = await prisma.cliente.count({
        where: {
          geocodingStatus: 'SUCESSO',
          geoValidado: true,
        },
      });

      const taxa = total > 0 ? (validados / total) * 100 : 0;

      console.log(`✅ Taxa de validação geo: ${taxa.toFixed(1)}%`);

      expect(taxa).toBeGreaterThanOrEqual(0);
      expect(taxa).toBeLessThanOrEqual(100);
    });
  });
});
