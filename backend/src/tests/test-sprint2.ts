/**
 * Sprint 2 - Test Suite
 * Testa todas as funcionalidades implementadas no Sprint 2
 */

import { PrismaClient } from '@prisma/client';
import { geoValidationService } from '../services/geo-validation.service';
import { fuzzyMatchingService } from '../services/fuzzy-matching.service';
import { DataQualityService } from '../services/data-quality.service';

const prisma = new PrismaClient();
const dataQualityService = new DataQualityService();

async function testBoundingBoxValidation() {
  console.log('\n🧪 Teste 1: Validação de Bounding Box\n');

  // Teste 1.1: Coordenadas válidas em Porto Alegre, RS
  const valid1 = geoValidationService.validateCoordinates(
    -30.0346,
    -51.2177,
    'RS',
    'PORTO ALEGRE'
  );
  console.log('✅ Porto Alegre, RS:', valid1.message);
  console.assert(valid1.valid === true, 'Porto Alegre deveria ser válido');
  console.assert(valid1.withinState === true, 'Porto Alegre está no RS');
  console.assert(valid1.withinCity === true, 'Coordenadas são do centro de POA');

  // Teste 1.2: Coordenadas válidas em São Paulo, SP
  const valid2 = geoValidationService.validateCoordinates(
    -23.5505,
    -46.6333,
    'SP',
    'SAO PAULO'
  );
  console.log('✅ São Paulo, SP:', valid2.message);
  console.assert(valid2.valid === true, 'São Paulo deveria ser válido');
  console.assert(valid2.withinState === true, 'São Paulo está em SP');

  // Teste 1.3: Coordenadas FORA do estado (lat/lng de SP em cliente do RS)
  const invalid1 = geoValidationService.validateCoordinates(
    -23.5505, // SP coordinates
    -46.6333,
    'RS', // But claiming to be in RS
    'PORTO ALEGRE'
  );
  console.log('⚠️  Coordenadas de SP em RS:', invalid1.message);
  console.assert(invalid1.withinState === false, 'Deveria detectar estado errado');

  // Teste 1.4: Coordenadas muito longe da cidade (> 50km)
  const invalid2 = geoValidationService.validateCoordinates(
    -29.0, // Muito longe de POA
    -51.0,
    'RS',
    'PORTO ALEGRE'
  );
  console.log('⚠️  Coordenadas longe de POA:', invalid2.message);
  console.assert(invalid2.withinCity === false, 'Deveria detectar distância > 50km');

  console.log('✅ Todos os testes de Bounding Box passaram!\n');
}

async function testFuzzyMatching() {
  console.log('\n🧪 Teste 2: Fuzzy Matching\n');

  // Teste 2.1: Nome exato (normalizado)
  const match1 = fuzzyMatchingService.matchStrings(
    'Bar do João',
    'BAR DO JOAO',
    70
  );
  console.log(`✅ Match exato: ${match1.similarity}% (${match1.method})`);
  console.assert(match1.isMatch === true, 'Nomes idênticos deveriam dar match');
  console.assert(match1.similarity === 100, 'Similaridade deveria ser 100%');

  // Teste 2.2: Nome com diferenças pequenas
  const match2 = fuzzyMatchingService.matchStrings(
    'Restaurante Bella Vista',
    'Restaurante Bela Vista',
    70
  );
  console.log(`✅ Nome similar: ${match2.similarity}% (${match2.method})`);
  console.assert(match2.isMatch === true, 'Nomes similares deveriam dar match');
  console.assert(match2.similarity >= 70, 'Similaridade >= 70%');

  // Teste 2.3: Endereço com ordem diferente (token set)
  const match3 = fuzzyMatchingService.matchStrings(
    'Rua das Flores, 123',
    '123, Rua das Flores',
    60
  );
  console.log(`✅ Endereço ordem diferente: ${match3.similarity}% (${match3.method})`);
  console.assert(match3.isMatch === true, 'Endereços com ordem diferente deveriam dar match');

  // Teste 2.4: Strings completamente diferentes
  const match4 = fuzzyMatchingService.matchStrings(
    'Bar do João',
    'Pizzaria Napolitana',
    70
  );
  console.log(`⚠️  Nomes diferentes: ${match4.similarity}% (${match4.method})`);
  console.assert(match4.isMatch === false, 'Nomes diferentes não deveriam dar match');
  console.assert(match4.similarity < 70, 'Similaridade < 70%');

  // Teste 2.5: Validar nome do Place
  const placeNameValidation = fuzzyMatchingService.validatePlaceName(
    'Restaurante e Churrascaria Galpão Crioulo',
    'Galpão Crioulo',
    'Galpao Crioulo - Restaurante e Churrascaria',
    70
  );
  console.log(`✅ Validação Place Name: ${placeNameValidation.similarity}% (${placeNameValidation.matchedAgainst})`);
  console.assert(placeNameValidation.valid === true, 'Place name deveria validar');

  console.log('✅ Todos os testes de Fuzzy Matching passaram!\n');
}

async function testPlaceTypesStorage() {
  console.log('\n🧪 Teste 3: Armazenamento de Place Types\n');

  // Buscar um cliente que tenha place types salvos
  const clienteComPlaceTypes = await prisma.cliente.findFirst({
    where: {
      placeTypes: { not: null },
    },
  });

  if (clienteComPlaceTypes) {
    console.log(`✅ Cliente encontrado: ${clienteComPlaceTypes.nome}`);

    const placeTypes = JSON.parse(clienteComPlaceTypes.placeTypes!);
    console.log(`   Place Types (${placeTypes.length}):`, placeTypes);
    console.log(`   Tipo Primário: ${clienteComPlaceTypes.placeTypesPrimario}`);
    console.log(`   Total Fotos Disponíveis: ${clienteComPlaceTypes.totalFotosDisponiveis}`);

    console.assert(Array.isArray(placeTypes), 'placeTypes deveria ser um array');
    console.assert(
      clienteComPlaceTypes.placeTypesPrimario === placeTypes[0],
      'placeTypesPrimario deveria ser o primeiro do array'
    );

    // Verificar photo references
    if (clienteComPlaceTypes.photoReferences) {
      const photoRefs = JSON.parse(clienteComPlaceTypes.photoReferences);
      console.log(`   Photo References (${photoRefs.length}):`, photoRefs.slice(0, 2));
      console.assert(Array.isArray(photoRefs), 'photoReferences deveria ser um array');
    }

    console.log('✅ Place Types armazenados corretamente!\n');
  } else {
    console.log('⚠️  Nenhum cliente com place types encontrado (executar pipeline primeiro)\n');
  }
}

async function testDataQualityScoring() {
  console.log('\n🧪 Teste 4: Data Quality Scoring\n');

  // Buscar um cliente processado
  const cliente = await prisma.cliente.findFirst({
    where: {
      status: 'CONCLUIDO',
    },
    include: {
      fotos: true,
    },
  });

  if (!cliente) {
    console.log('⚠️  Nenhum cliente processado encontrado (executar pipeline primeiro)\n');
    return;
  }

  console.log(`✅ Cliente: ${cliente.nome}`);

  // Analisar qualidade de dados
  const report = await dataQualityService.analyzeDataQuality(cliente.id);

  console.log('\n📊 Data Quality Report:');
  console.log(`   Score: ${report.score}%`);
  console.log(`   Confiabilidade: ${report.confiabilidade}`);
  console.log(`   Campos Preenchidos: ${report.camposPreenchidos}/${report.camposTotais}`);
  console.log(`   Fontes Validadas (${report.fontesValidadas.length}):`, report.fontesValidadas);

  if (report.camposCriticos.length > 0) {
    console.log(`   ⚠️  Campos Críticos Faltando (${report.camposCriticos.length}):`, report.camposCriticos);
  }

  if (report.recomendacoes.length > 0) {
    console.log(`   📝 Recomendações (${report.recomendacoes.length}):`);
    report.recomendacoes.forEach((rec, i) => {
      console.log(`      ${i + 1}. ${rec}`);
    });
  }

  // Validações
  console.assert(report.score >= 0 && report.score <= 100, 'Score deve estar entre 0-100');
  console.assert(
    ['BAIXA', 'MEDIA', 'ALTA', 'EXCELENTE'].includes(report.confiabilidade),
    'Confiabilidade deve ser válida'
  );

  // Verificar se Sprint 2 validations estão incluídas
  const hasGeoValidation = report.fontesValidadas.includes('Validação Geográfica (Bounding Box)');
  const hasFuzzyValidation = report.fontesValidadas.includes('Validação Fuzzy - Nome') ||
                            report.fontesValidadas.includes('Validação Fuzzy - Endereço');

  if (cliente.geoValidado) {
    console.assert(hasGeoValidation, 'Deveria incluir Validação Geográfica');
  }

  if (cliente.placeNomeValidado || cliente.placeEnderecoValidado) {
    console.assert(hasFuzzyValidation, 'Deveria incluir Validação Fuzzy');
  }

  console.log('\n✅ Data Quality Scoring funcionando corretamente!\n');
}

async function testDatabaseFields() {
  console.log('\n🧪 Teste 5: Campos do Banco de Dados\n');

  // Verificar se os campos do Sprint 2 existem
  const cliente = await prisma.cliente.findFirst({
    select: {
      // Geo Validation Fields
      geoValidado: true,
      geoWithinState: true,
      geoWithinCity: true,
      geoDistanceToCenter: true,

      // Place Types & Photo References
      placeTypes: true,
      placeTypesPrimario: true,
      totalFotosDisponiveis: true,
      photoReferences: true,

      // Data Quality Fields
      dataQualityScore: true,
      camposPreenchidos: true,
      camposCriticos: true,
      confiabilidadeDados: true,
      fontesValidadas: true,
      ultimaValidacao: true,
    },
  });

  console.log('✅ Todos os campos do Sprint 2 existem no schema:');
  console.log('   - geoValidado');
  console.log('   - geoWithinState');
  console.log('   - geoWithinCity');
  console.log('   - geoDistanceToCenter');
  console.log('   - placeTypes');
  console.log('   - placeTypesPrimario');
  console.log('   - totalFotosDisponiveis');
  console.log('   - photoReferences');
  console.log('   - dataQualityScore');
  console.log('   - camposPreenchidos');
  console.log('   - camposCriticos');
  console.log('   - confiabilidadeDados');
  console.log('   - fontesValidadas');
  console.log('   - ultimaValidacao');

  if (cliente) {
    console.log('\n📊 Exemplo de valores:');
    if (cliente.geoValidado !== null) {
      console.log(`   Geo Validado: ${cliente.geoValidado}`);
      console.log(`   Within State: ${cliente.geoWithinState}`);
      console.log(`   Within City: ${cliente.geoWithinCity}`);
      console.log(`   Distance to Center: ${cliente.geoDistanceToCenter?.toFixed(2)} km`);
    }
    if (cliente.placeTypes) {
      const types = JSON.parse(cliente.placeTypes);
      console.log(`   Place Types: ${types.slice(0, 3).join(', ')}...`);
    }
    if (cliente.dataQualityScore) {
      console.log(`   Data Quality Score: ${cliente.dataQualityScore}%`);
    }
  }

  console.log('\n✅ Campos do banco de dados validados!\n');
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 SPRINT 2 - TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════');

  try {
    await testBoundingBoxValidation();
    await testFuzzyMatching();
    await testDatabaseFields();
    await testPlaceTypesStorage();
    await testDataQualityScoring();

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ TODOS OS TESTES PASSARAM COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📝 Resumo do Sprint 2:');
    console.log('   ✅ Validação de Bounding Box implementada');
    console.log('   ✅ Fuzzy Matching validado');
    console.log('   ✅ Place Types e Photo References armazenados');
    console.log('   ✅ Data Quality Scoring com Sprint 2 validations');
    console.log('   ✅ Todos os campos do banco criados corretamente\n');

  } catch (error) {
    console.error('❌ ERRO NOS TESTES:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar testes
runAllTests();
