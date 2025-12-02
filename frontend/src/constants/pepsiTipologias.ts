/**
 * Catálogo completo de 76 Tipologias PepsiCo
 * Sincronizado com backend: backend/src/config/tipologia-mapping.ts
 */

export interface TipologiaInfo {
  codigo: string;
  nome: string;
  categoria: string;
  descricao?: string;
}

/**
 * Todas as 76 tipologias da Pepsi organizadas por categoria
 */
export const PEPSI_TIPOLOGIAS: Record<string, TipologiaInfo> = {
  // ==================== SUPERMERCADOS (6) ====================
  'F1': { codigo: 'F1', nome: 'AS + DE 50 CHECK-OUT', categoria: 'Supermercados', descricao: 'Hipermercados com mais de 50 caixas' },
  'F2': { codigo: 'F2', nome: 'AS 20 A 49 CHECK-OUT', categoria: 'Supermercados' },
  'F3': { codigo: 'F3', nome: 'AS 10 A 19 CHECK-OUT', categoria: 'Supermercados' },
  'F4': { codigo: 'F4', nome: 'AS 05 A 09 CHECK-OUT', categoria: 'Supermercados' },
  'F5': { codigo: 'F5', nome: 'AS 01 A 04 CHECK-OUT', categoria: 'Supermercados' },
  'F6': { codigo: 'F6', nome: 'MINI MERCADO', categoria: 'Supermercados' },

  // ==================== LOJAS (4) ====================
  'M2': { codigo: 'M2', nome: 'LOJA DE DEPARTAMENTO', categoria: 'Lojas' },
  'J5': { codigo: 'J5', nome: 'CASH & CARRY', categoria: 'Lojas' },
  'F7': { codigo: 'F7', nome: 'CLUBE DE COMPRAS', categoria: 'Lojas' },
  'K5': { codigo: 'K5', nome: 'ATACADO AUTO SERVICO', categoria: 'Lojas' },

  // ==================== ALIMENTAÇÃO - PEQUENO VAREJO (8) ====================
  'I6': { codigo: 'I6', nome: 'AÇOUGUE', categoria: 'Pequeno Varejo' },
  'I9': { codigo: 'I9', nome: 'MERCEARIA', categoria: 'Pequeno Varejo' },
  'I7': { codigo: 'I7', nome: 'BANCA DE JORNAL', categoria: 'Pequeno Varejo' },
  'K8': { codigo: 'K8', nome: 'BAZAR', categoria: 'Pequeno Varejo' },
  'J6': { codigo: 'J6', nome: 'BOMBONIERE', categoria: 'Pequeno Varejo' },
  'J8': { codigo: 'J8', nome: 'CAMELÔ/AMBULANTE', categoria: 'Pequeno Varejo' },
  'J9': { codigo: 'J9', nome: 'TABACARIA', categoria: 'Pequeno Varejo' },
  'J2': { codigo: 'J2', nome: 'CASA LOTÉRICA', categoria: 'Pequeno Varejo' },
  'J3': { codigo: 'J3', nome: 'DEPÓSIT BEB/ÁGUA/GÁS', categoria: 'Pequeno Varejo' },

  // ==================== SERVIÇOS (7) ====================
  'H8': { codigo: 'H8', nome: 'LAN HOUSE', categoria: 'Serviços' },
  'M1': { codigo: 'M1', nome: 'LIVRARIA', categoria: 'Serviços' },
  'M3': { codigo: 'M3', nome: 'LOJA DE SORT LIMITAD', categoria: 'Serviços' },
  'M4': { codigo: 'M4', nome: 'LOJAS DE R$ 1,99', categoria: 'Serviços' },
  'J4': { codigo: 'J4', nome: 'MIUDEZAS', categoria: 'Serviços' },
  'M7': { codigo: 'M7', nome: 'PAPELARIA', categoria: 'Serviços' },
  'J1': { codigo: 'J1', nome: 'PAPELARIA / LIVRARIA', categoria: 'Serviços' },

  // ==================== RESTAURANTES (8) ====================
  'G1': { codigo: 'G1', nome: 'CHURRASCARIA', categoria: 'Restaurantes' },
  'G4': { codigo: 'G4', nome: 'LANCHONETE REDE', categoria: 'Restaurantes' },
  'G6': { codigo: 'G6', nome: 'PIZZARIA', categoria: 'Restaurantes' },
  'G5': { codigo: 'G5', nome: 'RESTAURANTE', categoria: 'Restaurantes' },
  'N2': { codigo: 'N2', nome: 'SELF SERVICE', categoria: 'Restaurantes' },
  'I3': { codigo: 'I3', nome: 'FAST FOOD INDEPEND', categoria: 'Restaurantes' },
  'G3': { codigo: 'G3', nome: 'REDE DE FAST FOOD', categoria: 'Restaurantes' },
  'I2': { codigo: 'I2', nome: 'LANCHONETE', categoria: 'Restaurantes' },

  // ==================== PADARIAS E CAFÉS (3) ====================
  'H2': { codigo: 'H2', nome: 'CAFÉ / CAFETERIA', categoria: 'Padarias e Cafés' },
  'H3': { codigo: 'H3', nome: 'PADARIA', categoria: 'Padarias e Cafés' },
  'H4': { codigo: 'H4', nome: 'CONFEITARIA', categoria: 'Padarias e Cafés' },

  // ==================== CONVENIÊNCIA (2) ====================
  'J7': { codigo: 'J7', nome: 'LOJA CONVENIENCIA', categoria: 'Conveniência' },
  'F8': { codigo: 'F8', nome: 'REDE DE CONVÊNIENCIA', categoria: 'Conveniência' },

  // ==================== FARMÁCIAS (2) ====================
  'I8': { codigo: 'I8', nome: 'DROGARIA / FARMÁCIA', categoria: 'Farmácias' },
  'F9': { codigo: 'F9', nome: 'REDE DROGARIA / FARM', categoria: 'Farmácias' },

  // ==================== BARES E VIDA NOTURNA (3) ====================
  'H1': { codigo: 'H1', nome: 'BAR', categoria: 'Bares e Vida Noturna' },
  'K7': { codigo: 'K7', nome: 'BAR NOTURNO/CHOPERIA', categoria: 'Bares e Vida Noturna' },
  'K9': { codigo: 'K9', nome: 'CASAS NOTURNAS', categoria: 'Bares e Vida Noturna' },

  // ==================== CATERING & EVENTOS (3) ====================
  'G8': { codigo: 'G8', nome: 'PASTELARIA', categoria: 'Catering & Eventos' },
  'G9': { codigo: 'G9', nome: 'CATERING', categoria: 'Catering & Eventos' },
  'L2': { codigo: 'L2', nome: 'COZINHAS INDUSTRIAIS', categoria: 'Catering & Eventos' },

  // ==================== POSTOS E QUIOSQUES (5) ====================
  'N1': { codigo: 'N1', nome: 'POSTO DE GASOLINA', categoria: 'Postos e Quiosques' },
  'I5': { codigo: 'I5', nome: 'QUIOSQUE', categoria: 'Postos e Quiosques' },
  'I4': { codigo: 'I4', nome: 'SACOLÃO/HORTIFRUTI', categoria: 'Postos e Quiosques' },
  'I1': { codigo: 'I1', nome: 'SORVETERIA', categoria: 'Postos e Quiosques' },
  'N3': { codigo: 'N3', nome: 'TRAILER', categoria: 'Postos e Quiosques' },

  // ==================== ENTRETENIMENTO (8) ====================
  'H6': { codigo: 'H6', nome: 'VIDEOLOCADORA', categoria: 'Entretenimento' },
  'G7': { codigo: 'G7', nome: 'TEATRO / CINEMA', categoria: 'Entretenimento' },
  'L1': { codigo: 'L1', nome: 'CLUBE', categoria: 'Entretenimento' },
  'G2': { codigo: 'G2', nome: 'CIA AÉREA', categoria: 'Entretenimento' },
  'L3': { codigo: 'L3', nome: 'EVENTOS ESPORTIVOS', categoria: 'Entretenimento' },
  'L4': { codigo: 'L4', nome: 'EVENTOS MUSICAIS', categoria: 'Entretenimento' },
  'H5': { codigo: 'H5', nome: 'LOCAL ESPORTIVO', categoria: 'Entretenimento' },
  'M6': { codigo: 'M6', nome: 'OUTROS EVENTOS', categoria: 'Entretenimento' },
  'M8': { codigo: 'M8', nome: 'PARQUES DIVERSAO', categoria: 'Entretenimento' },

  // ==================== HOSPEDAGEM (1) ====================
  'H9': { codigo: 'H9', nome: 'HOTEL / MOTEL', categoria: 'Hospedagem' },

  // ==================== EDUCAÇÃO E SERVIÇOS (7) ====================
  'L5': { codigo: 'L5', nome: 'INSTITUICAO DE ENSIN', categoria: 'Educação e Serviços' },
  'L6': { codigo: 'L6', nome: 'HOSPITAL / SAÚDE', categoria: 'Educação e Serviços' },
  'L7': { codigo: 'L7', nome: 'SHOPPING CENTER', categoria: 'Educação e Serviços' },
  'H7': { codigo: 'H7', nome: 'VENDING MACHINE', categoria: 'Educação e Serviços' },
  'L9': { codigo: 'L9', nome: 'INSTITUTO DE BELEZA', categoria: 'Educação e Serviços' },
  'M5': { codigo: 'M5', nome: 'MATERIAIS DE CONSTRU', categoria: 'Educação e Serviços' },
  'M9': { codigo: 'M9', nome: 'PET SHOP', categoria: 'Educação e Serviços' },
  'N4': { codigo: 'N4', nome: 'TRANSPORTADORA', categoria: 'Educação e Serviços' },

  // ==================== ATACADO (7) ====================
  'K2': { codigo: 'K2', nome: 'ATAC S/ EQUIPE EXTER', categoria: 'Atacado' },
  'K3': { codigo: 'K3', nome: 'ATACADO BEBIDAS', categoria: 'Atacado' },
  'K1': { codigo: 'K1', nome: 'ATAC C/ EQUIPE EXTER', categoria: 'Atacado' },
  'Q4': { codigo: 'Q4', nome: 'PERUEIRO', categoria: 'Atacado' },
  'K4': { codigo: 'K4', nome: 'ATAC DOCEIRO COM EQU', categoria: 'Atacado' },
  'K6': { codigo: 'K6', nome: 'ATACADO DOCERIA BALC', categoria: 'Atacado' },
};

/**
 * Array de todas as tipologias (76 total)
 */
export const TODAS_TIPOLOGIAS = Object.values(PEPSI_TIPOLOGIAS);

/**
 * Categorias únicas
 */
export const CATEGORIAS_TIPOLOGIA = [
  'Supermercados',
  'Lojas',
  'Pequeno Varejo',
  'Serviços',
  'Restaurantes',
  'Padarias e Cafés',
  'Conveniência',
  'Farmácias',
  'Bares e Vida Noturna',
  'Catering & Eventos',
  'Postos e Quiosques',
  'Entretenimento',
  'Hospedagem',
  'Educação e Serviços',
  'Atacado',
] as const;

/**
 * Buscar tipologia por código
 */
export function getTipologia(codigo: string): TipologiaInfo | undefined {
  return PEPSI_TIPOLOGIAS[codigo];
}

/**
 * Obter tipologias por categoria
 */
export function getTipologiasPorCategoria(categoria: string): TipologiaInfo[] {
  return TODAS_TIPOLOGIAS.filter(tip => tip.categoria === categoria);
}

/**
 * Buscar tipologias por texto (nome ou código)
 */
export function buscarTipologias(texto: string): TipologiaInfo[] {
  const textoLower = texto.toLowerCase();
  return TODAS_TIPOLOGIAS.filter(
    tip =>
      tip.nome.toLowerCase().includes(textoLower) ||
      tip.codigo.toLowerCase().includes(textoLower)
  );
}

/**
 * Estatísticas das tipologias
 */
export const TIPOLOGIA_STATS = {
  total: TODAS_TIPOLOGIAS.length,
  porCategoria: CATEGORIAS_TIPOLOGIA.map(cat => ({
    categoria: cat,
    count: getTipologiasPorCategoria(cat).length,
  })),
};
