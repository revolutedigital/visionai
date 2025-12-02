/**
 * Setup global para testes Jest
 */

import '@jest/globals';

// Configurar timeout global
jest.setTimeout(30000);

// Suprimir logs durante testes (opcional)
if (process.env.SILENT_TESTS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
}

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/scampepisico_test';

// Limpar mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});
