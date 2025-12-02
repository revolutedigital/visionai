/**
 * Mapeamento de Tipologias Pepsi para Google Places Types
 * Usado para validação cruzada IA × Google Places
 */

export interface TipologiaDefinition {
  codigo: string;
  nome: string;
  googlePlacesTypes: string[];
  keywords: string[]; // Palavras-chave para busca/validação
  descricao?: string;
}

/**
 * Todas as 76 tipologias da Pepsi mapeadas
 */
export const TIPOLOGIAS_PEPSI: Record<string, TipologiaDefinition> = {
  // ==================== SUPERMERCADOS ====================
  'F1': {
    codigo: 'F1',
    nome: 'AS + DE 50 CHECK-OUT',
    googlePlacesTypes: ['supermarket', 'grocery_or_supermarket', 'store'],
    keywords: ['supermercado', 'hipermercado', 'extra', 'carrefour', 'walmart'],
    descricao: 'Hipermercados com mais de 50 caixas',
  },
  'F2': {
    codigo: 'F2',
    nome: 'AS 20 A 49 CHECK-OUT',
    googlePlacesTypes: ['supermarket', 'grocery_or_supermarket', 'store'],
    keywords: ['supermercado', 'mercado'],
  },
  'F3': {
    codigo: 'F3',
    nome: 'AS 10 A 19 CHECK-OUT',
    googlePlacesTypes: ['supermarket', 'grocery_or_supermarket', 'store'],
    keywords: ['supermercado', 'mercado'],
  },
  'F4': {
    codigo: 'F4',
    nome: 'AS 05 A 09 CHECK-OUT',
    googlePlacesTypes: ['supermarket', 'grocery_or_supermarket', 'convenience_store', 'store'],
    keywords: ['mercado', 'mini mercado'],
  },
  'F5': {
    codigo: 'F5',
    nome: 'AS 01 A 04 CHECK-OUT',
    googlePlacesTypes: ['supermarket', 'grocery_or_supermarket', 'convenience_store', 'store'],
    keywords: ['mercadinho', 'mini mercado', 'mercearia'],
  },
  'F6': {
    codigo: 'F6',
    nome: 'MINI MERCADO',
    googlePlacesTypes: ['convenience_store', 'supermarket', 'grocery_or_supermarket', 'store'],
    keywords: ['mini mercado', 'minimercado', 'mercadinho'],
  },

  // ==================== LOJAS ====================
  'M2': {
    codigo: 'M2',
    nome: 'LOJA DE DEPARTAMENTO',
    googlePlacesTypes: ['department_store', 'shopping_mall', 'store'],
    keywords: ['loja de departamento', 'magazine', 'lojas americanas', 'riachuelo'],
  },
  'J5': {
    codigo: 'J5',
    nome: 'CASH & CARRY',
    googlePlacesTypes: ['supermarket', 'grocery_or_supermarket', 'wholesaler'],
    keywords: ['atacarejo', 'assai', 'atacadao'],
  },
  'F7': {
    codigo: 'F7',
    nome: 'CLUBE DE COMPRAS',
    googlePlacesTypes: ['store', 'supermarket'],
    keywords: ['sam\'s club', 'clube de compras'],
  },
  'K5': {
    codigo: 'K5',
    nome: 'ATACADO AUTO SERVICO',
    googlePlacesTypes: ['wholesaler', 'supermarket', 'store'],
    keywords: ['atacado', 'distribuidor'],
  },

  // ==================== ALIMENTAÇÃO - PEQUENO VAREJO ====================
  'I6': {
    codigo: 'I6',
    nome: 'AÇOUGUE',
    googlePlacesTypes: ['butcher', 'store', 'food'],
    keywords: ['açougue', 'acougue', 'carnes'],
  },
  'I9': {
    codigo: 'I9',
    nome: 'MERCEARIA',
    googlePlacesTypes: ['grocery_or_supermarket', 'convenience_store', 'store'],
    keywords: ['mercearia', 'mercadinho', 'armazem'],
  },
  'I7': {
    codigo: 'I7',
    nome: 'BANCA DE JORNAL',
    googlePlacesTypes: ['book_store', 'store'],
    keywords: ['banca', 'jornal', 'revista'],
  },
  'K8': {
    codigo: 'K8',
    nome: 'BAZAR',
    googlePlacesTypes: ['store', 'home_goods_store'],
    keywords: ['bazar', 'utilidades', 'armarinho'],
  },
  'J6': {
    codigo: 'J6',
    nome: 'BOMBONIERE',
    googlePlacesTypes: ['store', 'food'],
    keywords: ['bomboniere', 'doceria', 'doces'],
  },
  'J8': {
    codigo: 'J8',
    nome: 'CAMELÔ/AMBULANTE',
    googlePlacesTypes: ['store', 'establishment'],
    keywords: ['camelô', 'ambulante', 'barraca'],
  },
  'J9': {
    codigo: 'J9',
    nome: 'TABACARIA',
    googlePlacesTypes: ['store', 'point_of_interest'],
    keywords: ['tabacaria', 'cigarro', 'fumo'],
  },
  'J2': {
    codigo: 'J2',
    nome: 'CASA LOTÉRICA',
    googlePlacesTypes: ['finance', 'point_of_interest', 'establishment'],
    keywords: ['lotérica', 'loteria', 'caixa'],
  },
  'J3': {
    codigo: 'J3',
    nome: 'DEPÓSIT BEB/ÁGUA/GÁS',
    googlePlacesTypes: ['store', 'liquor_store'],
    keywords: ['deposito', 'bebidas', 'agua', 'gas'],
  },

  // ==================== SERVIÇOS ====================
  'H8': {
    codigo: 'H8',
    nome: 'LAN HOUSE',
    googlePlacesTypes: ['internet_cafe', 'point_of_interest'],
    keywords: ['lan house', 'cyber cafe', 'internet'],
  },
  'M1': {
    codigo: 'M1',
    nome: 'LIVRARIA',
    googlePlacesTypes: ['book_store', 'store'],
    keywords: ['livraria', 'livros'],
  },
  'M3': {
    codigo: 'M3',
    nome: 'LOJA DE SORT LIMITAD',
    googlePlacesTypes: ['store'],
    keywords: ['loja', 'sortimento limitado'],
  },
  'M4': {
    codigo: 'M4',
    nome: 'LOJAS DE R$ 1,99',
    googlePlacesTypes: ['store'],
    keywords: ['1,99', 'loja de 1 real', 'tudo por'],
  },
  'J4': {
    codigo: 'J4',
    nome: 'MIUDEZAS',
    googlePlacesTypes: ['store'],
    keywords: ['miudezas', 'variedades'],
  },
  'M7': {
    codigo: 'M7',
    nome: 'PAPELARIA',
    googlePlacesTypes: ['book_store', 'store'],
    keywords: ['papelaria', 'material escolar'],
  },
  'J1': {
    codigo: 'J1',
    nome: 'PAPELARIA / LIVRARIA',
    googlePlacesTypes: ['book_store', 'store'],
    keywords: ['papelaria', 'livraria', 'material escolar'],
  },

  // ==================== ALIMENTAÇÃO - RESTAURANTES ====================
  'G1': {
    codigo: 'G1',
    nome: 'CHURRASCARIA',
    googlePlacesTypes: ['restaurant', 'food', 'establishment'],
    keywords: ['churrascaria', 'churrasco', 'rodizio'],
  },
  'G4': {
    codigo: 'G4',
    nome: 'LANCHONETE REDE',
    googlePlacesTypes: ['restaurant', 'meal_takeaway', 'food'],
    keywords: ['lanchonete', 'subway', 'rede'],
  },
  'G6': {
    codigo: 'G6',
    nome: 'PIZZARIA',
    googlePlacesTypes: ['restaurant', 'meal_delivery', 'meal_takeaway', 'food'],
    keywords: ['pizzaria', 'pizza'],
  },
  'G5': {
    codigo: 'G5',
    nome: 'RESTAURANTE',
    googlePlacesTypes: ['restaurant', 'food', 'establishment'],
    keywords: ['restaurante', 'comida'],
  },
  'N2': {
    codigo: 'N2',
    nome: 'SELF SERVICE',
    googlePlacesTypes: ['restaurant', 'food'],
    keywords: ['self service', 'self-service', 'buffet', 'por kilo'],
  },
  'I3': {
    codigo: 'I3',
    nome: 'FAST FOOD INDEPEND',
    googlePlacesTypes: ['restaurant', 'meal_takeaway', 'food'],
    keywords: ['lanchonete', 'fast food', 'hamburguer'],
  },
  'G3': {
    codigo: 'G3',
    nome: 'REDE DE FAST FOOD',
    googlePlacesTypes: ['restaurant', 'meal_takeaway', 'food'],
    keywords: ['mcdonalds', 'burger king', 'bobs', 'subway'],
  },
  'I2': {
    codigo: 'I2',
    nome: 'LANCHONETE',
    googlePlacesTypes: ['restaurant', 'cafe', 'food'],
    keywords: ['lanchonete', 'snack bar'],
  },

  // ==================== PADARIAS E CAFÉS ====================
  'H2': {
    codigo: 'H2',
    nome: 'CAFÉ / CAFETERIA',
    googlePlacesTypes: ['cafe', 'coffee_shop', 'food'],
    keywords: ['cafe', 'cafeteria', 'starbucks', 'coffee'],
  },
  'H3': {
    codigo: 'H3',
    nome: 'PADARIA',
    googlePlacesTypes: ['bakery', 'cafe', 'food', 'store'],
    keywords: ['padaria', 'panificadora', 'pão'],
  },
  'H4': {
    codigo: 'H4',
    nome: 'CONFEITARIA',
    googlePlacesTypes: ['bakery', 'cafe', 'store', 'food'],
    keywords: ['confeitaria', 'bolos', 'doces'],
  },

  // ==================== CONVENIÊNCIA ====================
  'J7': {
    codigo: 'J7',
    nome: 'LOJA CONVENIENCIA',
    googlePlacesTypes: ['convenience_store', 'gas_station', 'store'],
    keywords: ['conveniencia', 'loja de conveniencia'],
  },
  'F8': {
    codigo: 'F8',
    nome: 'REDE DE CONVÊNIENCIA',
    googlePlacesTypes: ['convenience_store', 'gas_station', 'store'],
    keywords: ['am pm', 'br mania', 'oxxo', 'shell select'],
  },

  // ==================== FARMÁCIAS ====================
  'I8': {
    codigo: 'I8',
    nome: 'DROGARIA / FARMÁCIA',
    googlePlacesTypes: ['pharmacy', 'drugstore', 'health', 'store'],
    keywords: ['farmacia', 'drogaria'],
  },
  'F9': {
    codigo: 'F9',
    nome: 'REDE DROGARIA / FARM',
    googlePlacesTypes: ['pharmacy', 'drugstore', 'health', 'store'],
    keywords: ['drogasil', 'raia', 'pacheco', 'sao paulo', 'pague menos'],
  },

  // ==================== BARES E VIDA NOTURNA ====================
  'H1': {
    codigo: 'H1',
    nome: 'BAR',
    googlePlacesTypes: ['bar', 'night_club', 'food', 'establishment'],
    keywords: ['bar', 'boteco', 'cervejaria'],
  },
  'K7': {
    codigo: 'K7',
    nome: 'BAR NOTURNO/CHOPERIA',
    googlePlacesTypes: ['bar', 'night_club'],
    keywords: ['bar noturno', 'choperia', 'pub'],
  },
  'K9': {
    codigo: 'K9',
    nome: 'CASAS NOTURNAS',
    googlePlacesTypes: ['night_club', 'bar'],
    keywords: ['balada', 'casa noturna', 'night club', 'boate'],
  },

  // ==================== CATERING & EVENTOS ====================
  'G8': {
    codigo: 'G8',
    nome: 'PASTELARIA',
    googlePlacesTypes: ['restaurant', 'food', 'meal_takeaway'],
    keywords: ['pastelaria', 'pastel', 'salgados'],
  },
  'G9': {
    codigo: 'G9',
    nome: 'CATERING',
    googlePlacesTypes: ['meal_delivery', 'food'],
    keywords: ['catering', 'buffet', 'eventos'],
  },
  'L2': {
    codigo: 'L2',
    nome: 'COZINHAS INDUSTRIAIS',
    googlePlacesTypes: ['food'],
    keywords: ['cozinha industrial', 'refeitorio'],
  },

  // ==================== POSTOS E QUIOSQUES ====================
  'N1': {
    codigo: 'N1',
    nome: 'POSTO DE GASOLINA',
    googlePlacesTypes: ['gas_station', 'convenience_store'],
    keywords: ['posto', 'gasolina', 'combustivel', 'shell', 'petrobras', 'ipiranga'],
  },
  'I5': {
    codigo: 'I5',
    nome: 'QUIOSQUE',
    googlePlacesTypes: ['food', 'cafe', 'store'],
    keywords: ['quiosque', 'barraca'],
  },
  'I4': {
    codigo: 'I4',
    nome: 'SACOLÃO/HORTIFRUTI',
    googlePlacesTypes: ['grocery_or_supermarket', 'store', 'food'],
    keywords: ['sacolao', 'hortifruti', 'verduras', 'frutas'],
  },
  'I1': {
    codigo: 'I1',
    nome: 'SORVETERIA',
    googlePlacesTypes: ['store', 'food'],
    keywords: ['sorveteria', 'sorvete', 'gelato'],
  },
  'N3': {
    codigo: 'N3',
    nome: 'TRAILER',
    googlePlacesTypes: ['food'],
    keywords: ['trailer', 'food truck'],
  },

  // ==================== ENTRETENIMENTO ====================
  'H6': {
    codigo: 'H6',
    nome: 'VIDEOLOCADORA',
    googlePlacesTypes: ['store'],
    keywords: ['videolocadora', 'locadora'],
  },
  'G7': {
    codigo: 'G7',
    nome: 'TEATRO / CINEMA',
    googlePlacesTypes: ['movie_theater', 'establishment'],
    keywords: ['cinema', 'teatro', 'cinemark', 'uci'],
  },
  'L1': {
    codigo: 'L1',
    nome: 'CLUBE',
    googlePlacesTypes: ['establishment', 'point_of_interest'],
    keywords: ['clube', 'social'],
  },
  'G2': {
    codigo: 'G2',
    nome: 'CIA AÉREA',
    googlePlacesTypes: ['airport', 'establishment'],
    keywords: ['aeroporto', 'companhia aerea', 'gol', 'latam', 'azul'],
  },
  'L3': {
    codigo: 'L3',
    nome: 'EVENTOS ESPORTIVOS',
    googlePlacesTypes: ['stadium', 'establishment'],
    keywords: ['estadio', 'arena', 'ginasio'],
  },
  'L4': {
    codigo: 'L4',
    nome: 'EVENTOS MUSICAIS',
    googlePlacesTypes: ['establishment', 'point_of_interest'],
    keywords: ['show', 'evento', 'casa de show'],
  },
  'H5': {
    codigo: 'H5',
    nome: 'LOCAL ESPORTIVO',
    googlePlacesTypes: ['stadium', 'gym', 'establishment'],
    keywords: ['quadra', 'campo', 'academia', 'ginasio'],
  },
  'M6': {
    codigo: 'M6',
    nome: 'OUTROS EVENTOS',
    googlePlacesTypes: ['establishment', 'point_of_interest'],
    keywords: ['evento', 'convencao'],
  },
  'M8': {
    codigo: 'M8',
    nome: 'PARQUES DIVERSAO',
    googlePlacesTypes: ['amusement_park', 'park', 'tourist_attraction'],
    keywords: ['parque', 'parque de diversoes', 'hopi hari'],
  },

  // ==================== HOSPEDAGEM ====================
  'H9': {
    codigo: 'H9',
    nome: 'HOTEL / MOTEL',
    googlePlacesTypes: ['lodging', 'hotel', 'motel'],
    keywords: ['hotel', 'motel', 'pousada'],
  },

  // ==================== EDUCAÇÃO E SERVIÇOS ====================
  'L5': {
    codigo: 'L5',
    nome: 'INSTITUICAO DE ENSIN',
    googlePlacesTypes: ['school', 'university', 'establishment'],
    keywords: ['escola', 'faculdade', 'universidade', 'ensino'],
  },
  'L6': {
    codigo: 'L6',
    nome: 'HOSPITAL / SAÚDE',
    googlePlacesTypes: ['hospital', 'health', 'doctor'],
    keywords: ['hospital', 'clinica', 'saude', 'medico'],
  },
  'L7': {
    codigo: 'L7',
    nome: 'SHOPPING CENTER',
    googlePlacesTypes: ['shopping_mall', 'establishment'],
    keywords: ['shopping', 'shopping center', 'mall'],
  },
  'H7': {
    codigo: 'H7',
    nome: 'VENDING MACHINE',
    googlePlacesTypes: ['store'],
    keywords: ['vending machine', 'maquina de venda'],
  },
  'L9': {
    codigo: 'L9',
    nome: 'INSTITUTO DE BELEZA',
    googlePlacesTypes: ['beauty_salon', 'hair_care', 'spa'],
    keywords: ['salao de beleza', 'barbearia', 'estetica'],
  },
  'M5': {
    codigo: 'M5',
    nome: 'MATERIAIS DE CONSTRU',
    googlePlacesTypes: ['hardware_store', 'home_goods_store', 'store'],
    keywords: ['material de construcao', 'ferragem', 'tintas'],
  },
  'M9': {
    codigo: 'M9',
    nome: 'PET SHOP',
    googlePlacesTypes: ['pet_store', 'store', 'veterinary_care'],
    keywords: ['pet shop', 'petshop', 'animais'],
  },
  'N4': {
    codigo: 'N4',
    nome: 'TRANSPORTADORA',
    googlePlacesTypes: ['moving_company', 'storage'],
    keywords: ['transportadora', 'logistica'],
  },

  // ==================== ATACADO ====================
  'K2': {
    codigo: 'K2',
    nome: 'ATAC S/ EQUIPE EXTER',
    googlePlacesTypes: ['wholesaler', 'store'],
    keywords: ['atacado', 'distribuidor'],
  },
  'K3': {
    codigo: 'K3',
    nome: 'ATACADO BEBIDAS',
    googlePlacesTypes: ['wholesaler', 'liquor_store', 'store'],
    keywords: ['atacado bebidas', 'distribuidor bebidas'],
  },
  'K1': {
    codigo: 'K1',
    nome: 'ATAC C/ EQUIPE EXTER',
    googlePlacesTypes: ['wholesaler', 'store'],
    keywords: ['atacado', 'distribuidor'],
  },
  'Q4': {
    codigo: 'Q4',
    nome: 'PERUEIRO',
    googlePlacesTypes: ['bus_station', 'transit_station'],
    keywords: ['van', 'transporte'],
  },
  'K4': {
    codigo: 'K4',
    nome: 'ATAC DOCEIRO COM EQU',
    googlePlacesTypes: ['wholesaler', 'store', 'food'],
    keywords: ['atacado doces', 'distribuidor'],
  },
  'K6': {
    codigo: 'K6',
    nome: 'ATACADO DOCERIA BALC',
    googlePlacesTypes: ['wholesaler', 'store', 'food'],
    keywords: ['atacado doces', 'distribuidor'],
  },
};

/**
 * Busca tipologia pelo código
 */
export function getTipologia(codigo: string): TipologiaDefinition | undefined {
  return TIPOLOGIAS_PEPSI[codigo];
}

/**
 * Lista todas as tipologias
 */
export function getAllTipologias(): TipologiaDefinition[] {
  return Object.values(TIPOLOGIAS_PEPSI);
}

/**
 * Busca tipologias por Google Place Type
 */
export function findTipologiasByPlaceType(placeType: string): TipologiaDefinition[] {
  return getAllTipologias().filter(tip =>
    tip.googlePlacesTypes.includes(placeType)
  );
}

/**
 * Busca tipologias por keyword
 */
export function findTipologiasByKeyword(keyword: string): TipologiaDefinition[] {
  const keywordLower = keyword.toLowerCase();
  return getAllTipologias().filter(tip =>
    tip.keywords.some(k => k.includes(keywordLower) || keywordLower.includes(k))
  );
}
