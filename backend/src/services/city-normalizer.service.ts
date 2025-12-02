/**
 * City Normalizer Service
 *
 * Vision AI Component: Normalização de nomes de cidades brasileiras
 * - Corrige abreviações (S PAULO → São Paulo)
 * - Adiciona acentos (SAO PAULO → São Paulo)
 * - Corrige erros comuns de digitação
 *
 * ROI: Melhora taxa de sucesso do Nominatim (grátis)
 */

export class CityNormalizerService {
  /**
   * Dicionário de cidades com abreviações/erros comuns
   * Formato: 'FORMA_ERRADA': 'Forma Correta'
   */
  private cityCorrections: Record<string, string> = {
    // São Paulo e região
    'SAO PAULO': 'São Paulo',
    'S PAULO': 'São Paulo',
    'SP': 'São Paulo',
    'S BERNARDO DO CAMPO': 'São Bernardo do Campo',
    'S B DO CAMPO': 'São Bernardo do Campo',
    'SBC': 'São Bernardo do Campo',
    'S CAETANO DO SUL': 'São Caetano do Sul',
    'S ANDRE': 'Santo André',
    'STO ANDRE': 'Santo André',
    'SANTO ANDRE': 'Santo André',
    'GUARULHOS': 'Guarulhos',
    'OSASCO': 'Osasco',
    'CAMPINAS': 'Campinas',
    'RIBEIRAO PRETO': 'Ribeirão Preto',
    'S J DO RIO PRETO': 'São José do Rio Preto',
    'S JOSE DO RIO PRETO': 'São José do Rio Preto',
    'SAO JOSE DO RIO PRETO': 'São José do Rio Preto',
    'S J DOS CAMPOS': 'São José dos Campos',
    'S JOSE DOS CAMPOS': 'São José dos Campos',
    'SAO JOSE DOS CAMPOS': 'São José dos Campos',
    'SOROCABA': 'Sorocaba',
    'SANTOS': 'Santos',
    'JUNDIAI': 'Jundiaí',
    'PIRACICABA': 'Piracicaba',
    'BAURU': 'Bauru',
    'FRANCA': 'Franca',
    'MARILIA': 'Marília',
    'TATUI': 'Tatuí',
    'LIMEIRA': 'Limeira',
    'AMERICANA': 'Americana',
    'ARACATUBA': 'Araçatuba',
    'ARARAQUARA': 'Araraquara',
    'PRESIDENTE PRUDENTE': 'Presidente Prudente',
    'MOGI DAS CRUZES': 'Mogi das Cruzes',
    'ITAQUAQUECETUBA': 'Itaquaquecetuba',
    'DIADEMA': 'Diadema',
    'CARAPICUIBA': 'Carapicuíba',
    'MAUA': 'Mauá',
    'COTIA': 'Cotia',
    'TABOAO DA SERRA': 'Taboão da Serra',
    'SUZANO': 'Suzano',
    'EMBU DAS ARTES': 'Embu das Artes',
    'INDAIATUBA': 'Indaiatuba',
    'BARUERI': 'Barueri',
    'ITAPEVI': 'Itapevi',
    'PEDERNEIRAS': 'Pederneiras',
    'PRAIA GRANDE': 'Praia Grande',
    'BRAGANCA PAULISTA': 'Bragança Paulista',
    'JAU': 'Jaú',
    'OLIMPIA': 'Olímpia',
    'PIRASSUNUNGA': 'Pirassununga',
    'VALPARAISO': 'Valparaíso',
    'PENAPOLIS': 'Penápolis',
    'QUELUZ': 'Queluz',

    // Rio de Janeiro
    'RIO DE JANEIRO': 'Rio de Janeiro',
    'NITEROI': 'Niterói',
    'S GONCALO': 'São Gonçalo',
    'SAO GONCALO': 'São Gonçalo',
    'DUQUE DE CAXIAS': 'Duque de Caxias',
    'NOVA IGUACU': 'Nova Iguaçu',
    'NOVA FRIBURGO': 'Nova Friburgo',
    'CPOS DOS GOYTACAZES': 'Campos dos Goytacazes',
    'CAMPOS DOS GOYTACAZES': 'Campos dos Goytacazes',
    'PETROPOLIS': 'Petrópolis',
    'VOLTA REDONDA': 'Volta Redonda',
    'MACAE': 'Macaé',
    'CABO FRIO': 'Cabo Frio',
    'ANGRA DOS REIS': 'Angra dos Reis',
    'TERESOPOLIS': 'Teresópolis',
    'RESENDE': 'Resende',
    'ITABORAI': 'Itaboraí',
    'MESQUITA': 'Mesquita',
    'NILOPOLIS': 'Nilópolis',
    'SAO JOAO DE MERITI': 'São João de Meriti',
    'S J DE MERITI': 'São João de Meriti',
    'BELFORD ROXO': 'Belford Roxo',
    'QUEIMADOS': 'Queimados',
    'MARICA': 'Maricá',
    'ITAGUAI': 'Itaguaí',

    // Minas Gerais
    'BELO HORIZONTE': 'Belo Horizonte',
    'BH': 'Belo Horizonte',
    'UBERLANDIA': 'Uberlândia',
    'CONTAGEM': 'Contagem',
    'JUIZ DE FORA': 'Juiz de Fora',
    'BETIM': 'Betim',
    'MONTES CLAROS': 'Montes Claros',
    'RIBEIRAO DAS NEVES': 'Ribeirão das Neves',
    'UBERABA': 'Uberaba',
    'GOVERNADOR VALADARES': 'Governador Valadares',
    'GOV VALADARES': 'Governador Valadares',
    'IPATINGA': 'Ipatinga',
    'SETE LAGOAS': 'Sete Lagoas',
    'DIVINOPOLIS': 'Divinópolis',
    'SANTA LUZIA': 'Santa Luzia',
    'IBIRITE': 'Ibirité',
    'POCOS DE CALDAS': 'Poços de Caldas',
    'PATOS DE MINAS': 'Patos de Minas',
    'POUSO ALEGRE': 'Pouso Alegre',
    'TEOFILO OTONI': 'Teófilo Otoni',
    'BARBACENA': 'Barbacena',
    'SABARA': 'Sabará',
    'VARGINHA': 'Varginha',
    'CONSELHEIRO LAFAIETE': 'Conselheiro Lafaiete',
    'ARAGUARI': 'Araguari',
    'PASSOS': 'Passos',
    'CORONEL FABRICIANO': 'Coronel Fabriciano',
    'MURIAE': 'Muriaé',
    'ITABIRA': 'Itabira',
    'OURO PRETO': 'Ouro Preto',
    'PARACATU': 'Paracatu',
    'SACRAMENTO': 'Sacramento',
    'SAO JOSE DO CALCADO': 'São José do Calçado',
    'S JOSE DO CALCADO': 'São José do Calçado',
    'SANTA RITA DE MINAS': 'Santa Rita de Minas',
    'ARAXA': 'Araxá',
    'VICOSA': 'Viçosa',
    'CARATINGA': 'Caratinga',
    'PONTE NOVA': 'Ponte Nova',
    'GUAXUPE': 'Guaxupé',
    'SANTANA DE PIRAPAMA': 'Santana de Pirapama',
    'CONC DO MATO DENTRO': 'Conceição do Mato Dentro',
    'CONCEICAO DO MATO DENTRO': 'Conceição do Mato Dentro',

    // Paraná
    'CURITIBA': 'Curitiba',
    'LONDRINA': 'Londrina',
    'MARINGA': 'Maringá',
    'PONTA GROSSA': 'Ponta Grossa',
    'CASCAVEL': 'Cascavel',
    'SAO JOSE DOS PINHAIS': 'São José dos Pinhais',
    'S J DOS PINHAIS': 'São José dos Pinhais',
    'FOZ DO IGUACU': 'Foz do Iguaçu',
    'COLOMBO': 'Colombo',
    'GUARAPUAVA': 'Guarapuava',
    'PARANAGUA': 'Paranaguá',
    'ARAUCARIA': 'Araucária',
    'TOLEDO': 'Toledo',
    'APUCARANA': 'Apucarana',
    'PINHAIS': 'Pinhais',
    'CAMPO LARGO': 'Campo Largo',
    'ARAPONGAS': 'Arapongas',
    'ALMIRANTE TAMANDARE': 'Almirante Tamandaré',
    'UMUARAMA': 'Umuarama',
    'PIRAQUARA': 'Piraquara',
    'CAMBE': 'Cambé',
    'CAMPO MOURAO': 'Campo Mourão',
    'FAZENDA RIO GRANDE': 'Fazenda Rio Grande',
    'GUAIRA': 'Guaíra',
    'CASTRO': 'Castro',
    'ITAPERUCU': 'Itaperuçu',
    'CAMPO DO TENENTE': 'Campo do Tenente',
    'UNIAO DA VITORIA': 'União da Vitória',
    'QUATIGUA': 'Quatiguá',

    // Rio Grande do Sul
    'PORTO ALEGRE': 'Porto Alegre',
    'POA': 'Porto Alegre',
    'CAXIAS DO SUL': 'Caxias do Sul',
    'PELOTAS': 'Pelotas',
    'CANOAS': 'Canoas',
    'SANTA MARIA': 'Santa Maria',
    'GRAVATAI': 'Gravataí',
    'VIAMAO': 'Viamão',
    'NOVO HAMBURGO': 'Novo Hamburgo',
    'SAO LEOPOLDO': 'São Leopoldo',
    'S LEOPOLDO': 'São Leopoldo',
    'RIO GRANDE': 'Rio Grande',
    'ALVORADA': 'Alvorada',
    'PASSO FUNDO': 'Passo Fundo',
    'SAPUCAIA DO SUL': 'Sapucaia do Sul',
    'URUGUAIANA': 'Uruguaiana',
    'SANTA CRUZ DO SUL': 'Santa Cruz do Sul',
    'CACHOEIRINHA': 'Cachoeirinha',
    'BAGE': 'Bagé',
    'BENTO GONCALVES': 'Bento Gonçalves',
    'ERECHIM': 'Erechim',
    'GUAIBA': 'Guaíba',
    'CACHOEIRA DO SUL': 'Cachoeira do Sul',
    'SANTANA DO LIVRAMENTO': 'Santana do Livramento',
    'ESTEIO': 'Esteio',
    'IJUI': 'Ijuí',
    'PINHAL GRANDE': 'Pinhal Grande',
    'LIBERATO SALZANO': 'Liberato Salzano',
    'IGREJINHA': 'Igrejinha',
    'FARROUPILHA': 'Farroupilha',
    'GARIBALDI': 'Garibaldi',

    // Santa Catarina
    'FLORIANOPOLIS': 'Florianópolis',
    'JOINVILLE': 'Joinville',
    'BLUMENAU': 'Blumenau',
    'SAO JOSE': 'São José',
    'S JOSE': 'São José',
    'CHAPECO': 'Chapecó',
    'CRICIUMA': 'Criciúma',
    'ITAJAI': 'Itajaí',
    'JARAGUA DO SUL': 'Jaraguá do Sul',
    'LAGES': 'Lages',
    'PALHOCA': 'Palhoça',
    'BALNEARIO CAMBORIU': 'Balneário Camboriú',
    'BRUSQUE': 'Brusque',
    'TUBARAO': 'Tubarão',
    'SAO BENTO DO SUL': 'São Bento do Sul',
    'CACADOR': 'Caçador',
    'CONCORDIA': 'Concórdia',
    'CAMBORIU': 'Camboriú',
    'NAVEGANTES': 'Navegantes',
    'RIO DO SUL': 'Rio do Sul',
    'ARARANGUA': 'Araranguá',
    'BIGUACU': 'Biguaçu',
    'FRAIBURGO': 'Fraiburgo',
    'MORRO GRANDE': 'Morro Grande',
    'PINHALZINHO': 'Pinhalzinho',

    // Bahia
    'SALVADOR': 'Salvador',
    'FEIRA DE SANTANA': 'Feira de Santana',
    'VITORIA DA CONQUISTA': 'Vitória da Conquista',
    'CAMACARI': 'Camaçari',
    'ITABUNA': 'Itabuna',
    'JUAZEIRO': 'Juazeiro',
    'LAURO DE FREITAS': 'Lauro de Freitas',
    'ILHEUS': 'Ilhéus',
    'JEQUIE': 'Jequié',
    'TEIXEIRA DE FREITAS': 'Teixeira de Freitas',
    'ALAGOINHAS': 'Alagoinhas',
    'BARREIRAS': 'Barreiras',
    'PORTO SEGURO': 'Porto Seguro',
    'SIMOES FILHO': 'Simões Filho',
    'PAULO AFONSO': 'Paulo Afonso',
    'EUNAPOLIS': 'Eunápolis',
    'SANTO ANTONIO DE JESUS': 'Santo Antônio de Jesus',
    'VALENCA': 'Valença',
    'CANDEIAS': 'Candeias',
    'GUANAMBI': 'Guanambi',
    'JACOBINA': 'Jacobina',
    'DIAS D AVILA': 'Dias d\'Ávila',
    'SEABRA': 'Seabra',

    // Ceará
    'FORTALEZA': 'Fortaleza',
    'CAUCAIA': 'Caucaia',
    'JUAZEIRO DO NORTE': 'Juazeiro do Norte',
    'MARACANAU': 'Maracanaú',
    'SOBRAL': 'Sobral',
    'CRATO': 'Crato',
    'ITAPIPOCA': 'Itapipoca',
    'MARANGUAPE': 'Maranguape',
    'IGUATU': 'Iguatu',
    'QUIXADA': 'Quixadá',
    'PACATUBA': 'Pacatuba',
    'AQUIRAZ': 'Aquiraz',
    'CANINDE': 'Canindé',
    'RUSSAS': 'Russas',
    'TIANGUA': 'Tianguá',
    'CASCAVEL CE': 'Cascavel', // Ceará (diferente de PR)
    'PACAJUS': 'Pacajus',
    'ARACATI': 'Aracati',
    'CRATEUS': 'Crateús',
    'MORADA NOVA': 'Morada Nova',
    'HORIZONTE': 'Horizonte',
    'SAO GONCALO DO AMARANTE': 'São Gonçalo do Amarante',
    'S GONCALO DO AMARANTE': 'São Gonçalo do Amarante',
    'EUSEBIO': 'Eusébio',

    // Pernambuco
    'RECIFE': 'Recife',
    'JABOATAO DOS GUARARAPES': 'Jaboatão dos Guararapes',
    'OLINDA': 'Olinda',
    'CARUARU': 'Caruaru',
    'PETROLINA': 'Petrolina',
    'PAULISTA': 'Paulista',
    'CABO DE SANTO AGOSTINHO': 'Cabo de Santo Agostinho',
    'CAMARAGIBE': 'Camaragibe',
    'GARANHUNS': 'Garanhuns',
    'VITORIA DE SANTO ANTAO': 'Vitória de Santo Antão',
    'IGARASSU': 'Igarassu',
    'SAO LOURENCO DA MATA': 'São Lourenço da Mata',
    'S LOURENCO DA MATA': 'São Lourenço da Mata',
    'ABREU E LIMA': 'Abreu e Lima',
    'IPOJUCA': 'Ipojuca',
    'SERRA TALHADA': 'Serra Talhada',
    'ARARIPINA': 'Araripina',
    'GRAVATA': 'Gravatá',
    'CARPINA': 'Carpina',
    'GOIANA': 'Goiana',
    'BELO JARDIM': 'Belo Jardim',
    'ARCOVERDE': 'Arcoverde',

    // Goiás
    'GOIANIA': 'Goiânia',
    'APARECIDA DE GOIANIA': 'Aparecida de Goiânia',
    'ANAPOLIS': 'Anápolis',
    'RIO VERDE': 'Rio Verde',
    'LUZIANIA': 'Luziânia',
    'AGUAS LINDAS DE GOIAS': 'Águas Lindas de Goiás',
    'VALPARAISO DE GOIAS': 'Valparaíso de Goiás',
    'TRINDADE': 'Trindade',
    'FORMOSA': 'Formosa',
    'NOVO GAMA': 'Novo Gama',
    'SENADOR CANEDO': 'Senador Canedo',
    'ITUMBIARA': 'Itumbiara',
    'JATAI': 'Jataí',
    'PLANALTINA': 'Planaltina',
    'CATALAO': 'Catalão',
    'CALDAS NOVAS': 'Caldas Novas',
    'GOIANESIA': 'Goianésia',
    'CIDADE OCIDENTAL': 'Cidade Ocidental',
    'INHUMAS': 'Inhumas',
    'MINEIROS': 'Mineiros',

    // Distrito Federal
    'BRASILIA': 'Brasília',
    'BSB': 'Brasília',
    'DF': 'Brasília',

    // Amazonas
    'MANAUS': 'Manaus',
    'PARINTINS': 'Parintins',
    'ITACOATIARA': 'Itacoatiara',
    'MANACAPURU': 'Manacapuru',
    'COARI': 'Coari',
    'TEFE': 'Tefé',
    'TABATINGA': 'Tabatinga',
    'MAUES': 'Maués',
    'IRANDUBA': 'Iranduba',
    'HUMAITA': 'Humaitá',
    'SAO GABRIEL DA CACHOEIRA': 'São Gabriel da Cachoeira',

    // Pará
    'BELEM': 'Belém',
    'ANANINDEUA': 'Ananindeua',
    'SANTAREM': 'Santarém',
    'MARABA': 'Marabá',
    'CASTANHAL': 'Castanhal',
    'PARAUAPEBAS': 'Parauapebas',
    'ABAETETUBA': 'Abaetetuba',
    'CAMETA': 'Cametá',
    'BRAGANCA': 'Bragança',
    'MARITUBA': 'Marituba',
    'TUCURUI': 'Tucuruí',
    'BARCARENA': 'Barcarena',
    'ALTAMIRA': 'Altamira',
    'TAILANDIA': 'Tailândia',
    'ITAITUBA': 'Itaituba',
    'REDENCAO': 'Redenção',
    'PARAGOMINAS': 'Paragominas',

    // Maranhão
    'SAO LUIS': 'São Luís',
    'S LUIS': 'São Luís',
    'IMPERATRIZ': 'Imperatriz',
    'SAO JOSE DE RIBAMAR': 'São José de Ribamar',
    'S J DE RIBAMAR': 'São José de Ribamar',
    'TIMON': 'Timon',
    'CAXIAS': 'Caxias',
    'CODÓ': 'Codó',
    'PACO DO LUMIAR': 'Paço do Lumiar',
    'ACAILANDIA': 'Açailândia',
    'BACABAL': 'Bacabal',
    'BALSAS': 'Balsas',
    'SANTA INES': 'Santa Inês',
    'BARRA DO CORDA': 'Barra do Corda',
    'PINHEIRO': 'Pinheiro',
    'CHAPADINHA': 'Chapadinha',
    'BURITICUPU': 'Buriticupu',

    // Alagoas
    'MACEIO': 'Maceió',
    'ARAPIRACA': 'Arapiraca',
    'RIO LARGO': 'Rio Largo',
    'PALMEIRA DOS INDIOS': 'Palmeira dos Índios',
    'UNIAO DOS PALMARES': 'União dos Palmares',
    'PENEDO': 'Penedo',
    'SAO MIGUEL DOS CAMPOS': 'São Miguel dos Campos',
    'CAMPO ALEGRE': 'Campo Alegre',
    'SANTANA DO IPANEMA': 'Santana do Ipanema',
    'CORURIPE': 'Coruripe',
    'DELMIRO GOUVEIA': 'Delmiro Gouveia',

    // Espírito Santo
    'VITORIA': 'Vitória',
    'VILA VELHA': 'Vila Velha',
    'SERRA': 'Serra',
    'CARIACICA': 'Cariacica',
    'CACHOEIRO DE ITAPEMIRIM': 'Cachoeiro de Itapemirim',
    'LINHARES': 'Linhares',
    'SAO MATEUS': 'São Mateus',
    'COLATINA': 'Colatina',
    'GUARAPARI': 'Guarapari',
    'ARACRUZ': 'Aracruz',
    'VIANA': 'Viana',

    // Piauí
    'TERESINA': 'Teresina',
    'PARNAIBA': 'Parnaíba',
    'PICOS': 'Picos',
    'FLORIANO': 'Floriano',
    'CAMPO MAIOR': 'Campo Maior',
    'PIRIPIRI': 'Piripiri',
    'ALTOS': 'Altos',
    'UNIAO': 'União',
    'OEIRAS': 'Oeiras',
    'PEDRO II': 'Pedro II',
    'JOSE DE FREITAS': 'José de Freitas',
    'SAO RAIMUNDO NONATO': 'São Raimundo Nonato',

    // Rio Grande do Norte
    'NATAL': 'Natal',
    'MOSSORO': 'Mossoró',
    'PARNAMIRIM': 'Parnamirim',
    'SAO GONCALO DO AMARANTE RN': 'São Gonçalo do Amarante', // RN (diferente de CE)
    'CEARA MIRIM': 'Ceará-Mirim',
    'MACAIBA': 'Macaíba',
    'CAICO': 'Caicó',
    'ACARARI': 'Açu',
    'CURRAIS NOVOS': 'Currais Novos',
    'SAO JOSE DE MIPIBU': 'São José de Mipibu',
    'SANTA CRUZ': 'Santa Cruz',
    'NOVA CRUZ': 'Nova Cruz',
    'JOAO CAMARA': 'João Câmara',
    'PAU DOS FERROS': 'Pau dos Ferros',
    'APODI': 'Apodi',
    'EXTREMOZ': 'Extremoz',

    // Paraíba
    'JOAO PESSOA': 'João Pessoa',
    'CAMPINA GRANDE': 'Campina Grande',
    'SANTA RITA': 'Santa Rita',
    'PATOS': 'Patos',
    'BAYEUX': 'Bayeux',
    'SOUSA': 'Sousa',
    'CAJAZEIRAS': 'Cajazeiras',
    'CABEDELO': 'Cabedelo',
    'GUARABIRA': 'Guarabira',
    'SAO BENTO': 'São Bento',
    'MAMANGUAPE': 'Mamanguape',
    'QUEIMADAS': 'Queimadas',
    'ESPERANCA': 'Esperança',
    'SAPÉ': 'Sapé',
    'POMBAL': 'Pombal',

    // Sergipe
    'ARACAJU': 'Aracaju',
    'NOSSA SENHORA DO SOCORRO': 'Nossa Senhora do Socorro',
    'LAGARTO': 'Lagarto',
    'ITABAIANA': 'Itabaiana',
    'SAO CRISTOVAO': 'São Cristóvão',
    'ESTANCIA': 'Estância',
    'TOBIAS BARRETO': 'Tobias Barreto',
    'ITABAIANINHA': 'Itabaianinha',
    'SIMAO DIAS': 'Simão Dias',
    'CAPELA': 'Capela',

    // Mato Grosso
    'CUIABA': 'Cuiabá',
    'VARZEA GRANDE': 'Várzea Grande',
    'RONDONOPOLIS': 'Rondonópolis',
    'SINOP': 'Sinop',
    'TANGARA DA SERRA': 'Tangará da Serra',
    'CACERES': 'Cáceres',
    'SORRISO': 'Sorriso',
    'PRIMAVERA DO LESTE': 'Primavera do Leste',
    'BARRA DO GARCAS': 'Barra do Garças',
    'LUCAS DO RIO VERDE': 'Lucas do Rio Verde',
    'ALTA FLORESTA': 'Alta Floresta',
    'NOVA MUTUM': 'Nova Mutum',
    'JUINA': 'Juína',
    'COLIDER': 'Colíder',
    'PONTES E LACERDA': 'Pontes e Lacerda',

    // Mato Grosso do Sul
    'CAMPO GRANDE': 'Campo Grande',
    'DOURADOS': 'Dourados',
    'TRES LAGOAS': 'Três Lagoas',
    'CORUMBA': 'Corumbá',
    'PONTA PORA': 'Ponta Porã',
    'NAVIRAI': 'Naviraí',
    'NOVA ANDRADINA': 'Nova Andradina',
    'AQUIDAUANA': 'Aquidauana',
    'SIDROLANDIA': 'Sidrolândia',
    'PARANAIBA': 'Paranaíba',
    'MARACAJU': 'Maracaju',
    'CASSILANDIA': 'Cassilândia',
    'COXIM': 'Coxim',
    'RIO BRILHANTE': 'Rio Brilhante',
    'SAO GABRIEL DO OESTE': 'São Gabriel do Oeste',

    // Tocantins
    'PALMAS': 'Palmas',
    'ARAGUAINA': 'Araguaína',
    'GURUPI': 'Gurupi',
    'PORTO NACIONAL': 'Porto Nacional',
    'PARAISO DO TOCANTINS': 'Paraíso do Tocantins',
    'COLINAS DO TOCANTINS': 'Colinas do Tocantins',
    'GUARAI': 'Guaraí',
    'TOCANTINOPOLIS': 'Tocantinópolis',
    'DIANOPOLIS': 'Dianópolis',
    'MIRACEMA DO TOCANTINS': 'Miracema do Tocantins',

    // Rondônia
    'PORTO VELHO': 'Porto Velho',
    'JI PARANA': 'Ji-Paraná',
    'JI-PARANA': 'Ji-Paraná',
    'ARIQUEMES': 'Ariquemes',
    'VILHENA': 'Vilhena',
    'CACOAL': 'Cacoal',
    'JARU': 'Jaru',
    'ROLIM DE MOURA': 'Rolim de Moura',
    'GUAJARA MIRIM': 'Guajará-Mirim',
    'OURO PRETO DO OESTE': 'Ouro Preto do Oeste',
    'PIMENTA BUENO': 'Pimenta Bueno',

    // Acre
    'RIO BRANCO': 'Rio Branco',
    'CRUZEIRO DO SUL': 'Cruzeiro do Sul',
    'SENA MADUREIRA': 'Sena Madureira',
    'TARAUACA': 'Tarauacá',
    'FEIJO': 'Feijó',
    'BRASILEIA': 'Brasiléia',
    'EPITACIOLANDIA': 'Epitaciolândia',
    'XAPURI': 'Xapuri',
    'PLACIDO DE CASTRO': 'Plácido de Castro',
    'SENADOR GUIOMARD': 'Senador Guiomard',

    // Amapá
    'MACAPA': 'Macapá',
    'SANTANA': 'Santana',
    'LARANJAL DO JARI': 'Laranjal do Jari',
    'OIAPOQUE': 'Oiapoque',
    'MAZAGAO': 'Mazagão',
    'PORTO GRANDE': 'Porto Grande',
    'TARTARUGALZINHO': 'Tartarugalzinho',
    'PEDRA BRANCA DO AMAPARI': 'Pedra Branca do Amapari',

    // Roraima
    'BOA VISTA': 'Boa Vista',
    'RORAINOPOLIS': 'Rorainópolis',
    'CARACARAI': 'Caracaraí',
    'ALTO ALEGRE': 'Alto Alegre',
    'MUCAJAI': 'Mucajaí',
    'PACARAIMA': 'Pacaraima',
    'CANTÁ': 'Cantá',
    'BONFIM': 'Bonfim',
  };

  /**
   * Estados brasileiros com abreviações
   */
  private stateCorrections: Record<string, string> = {
    'AC': 'AC',
    'ACRE': 'AC',
    'AL': 'AL',
    'ALAGOAS': 'AL',
    'AP': 'AP',
    'AMAPA': 'AP',
    'AMAPÁ': 'AP',
    'AM': 'AM',
    'AMAZONAS': 'AM',
    'BA': 'BA',
    'BAHIA': 'BA',
    'CE': 'CE',
    'CEARA': 'CE',
    'CEARÁ': 'CE',
    'DF': 'DF',
    'DISTRITO FEDERAL': 'DF',
    'ES': 'ES',
    'ESPIRITO SANTO': 'ES',
    'ESPÍRITO SANTO': 'ES',
    'GO': 'GO',
    'GOIAS': 'GO',
    'GOIÁS': 'GO',
    'MA': 'MA',
    'MARANHAO': 'MA',
    'MARANHÃO': 'MA',
    'MT': 'MT',
    'MATO GROSSO': 'MT',
    'MS': 'MS',
    'MATO GROSSO DO SUL': 'MS',
    'MG': 'MG',
    'MINAS GERAIS': 'MG',
    'PA': 'PA',
    'PARA': 'PA',
    'PARÁ': 'PA',
    'PB': 'PB',
    'PARAIBA': 'PB',
    'PARAÍBA': 'PB',
    'PR': 'PR',
    'PARANA': 'PR',
    'PARANÁ': 'PR',
    'PE': 'PE',
    'PERNAMBUCO': 'PE',
    'PI': 'PI',
    'PIAUI': 'PI',
    'PIAUÍ': 'PI',
    'RJ': 'RJ',
    'RIO DE JANEIRO': 'RJ',
    'RN': 'RN',
    'RIO GRANDE DO NORTE': 'RN',
    'RS': 'RS',
    'RIO GRANDE DO SUL': 'RS',
    'RO': 'RO',
    'RONDONIA': 'RO',
    'RONDÔNIA': 'RO',
    'RR': 'RR',
    'RORAIMA': 'RR',
    'SC': 'SC',
    'SANTA CATARINA': 'SC',
    'SP': 'SP',
    'SAO PAULO': 'SP',
    'SÃO PAULO': 'SP',
    'SE': 'SE',
    'SERGIPE': 'SE',
    'TO': 'TO',
    'TOCANTINS': 'TO',
  };

  /**
   * Normaliza nome da cidade
   */
  normalizeCity(cidade: string): string {
    if (!cidade) return cidade;

    const cidadeUpper = cidade.toUpperCase().trim();

    // Primeiro, verificar se está no dicionário
    if (this.cityCorrections[cidadeUpper]) {
      return this.cityCorrections[cidadeUpper];
    }

    // Se não encontrou, aplicar normalização genérica
    return this.genericNormalize(cidade);
  }

  /**
   * Normaliza sigla do estado
   */
  normalizeState(estado: string): string {
    if (!estado) return estado;

    const estadoUpper = estado.toUpperCase().trim();

    if (this.stateCorrections[estadoUpper]) {
      return this.stateCorrections[estadoUpper];
    }

    return estado.toUpperCase();
  }

  /**
   * Normalização genérica com acentos e title case
   */
  private genericNormalize(text: string): string {
    // Dicionário de substituições de acentos
    const accentMap: Record<string, string> = {
      'SAO': 'São',
      'SANTO': 'Santo',
      'SANTA': 'Santa',
      'JOSE': 'José',
      'JOAO': 'João',
      'ANTONIO': 'Antônio',
      'GONCALO': 'Gonçalo',
      'GONCALVES': 'Gonçalves',
      'SEBASTIAO': 'Sebastião',
      'CANDIDO': 'Cândido',
      'AMERICO': 'Américo',
      'IBIRITE': 'Ibirité',
      'RIBEIRAO': 'Ribeirão',
      'LONDRINA': 'Londrina',
      'MARINGA': 'Maringá',
      'UBERLANDIA': 'Uberlândia',
      'GOIANIA': 'Goiânia',
      'CURITIBA': 'Curitiba',
      'FLORIANOPOLIS': 'Florianópolis',
      'BRASILIA': 'Brasília',
      'BELEM': 'Belém',
      'MACAPA': 'Macapá',
      'MACEIO': 'Maceió',
      'TERESINA': 'Teresina',
      'NATAL': 'Natal',
      'ARACAJU': 'Aracaju',
      'SALVADOR': 'Salvador',
      'VITORIA': 'Vitória',
      'NITEROI': 'Niterói',
    };

    // Converter para title case
    let result = text
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        const wordUpper = word.toUpperCase();

        // Verificar se há substituição com acento
        if (accentMap[wordUpper]) {
          return accentMap[wordUpper];
        }

        // Preposições em minúsculo (exceto primeira palavra)
        const prepositions = ['de', 'da', 'do', 'dos', 'das', 'e'];
        if (index > 0 && prepositions.includes(word)) {
          return word;
        }

        // Capitalizar primeira letra
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');

    return result;
  }

  /**
   * Normaliza cidade e estado juntos
   */
  normalizeCityState(cidade: string, estado: string): { cidade: string; estado: string } {
    return {
      cidade: this.normalizeCity(cidade),
      estado: this.normalizeState(estado),
    };
  }
}

export const cityNormalizerService = new CityNormalizerService();
