import dotenv from 'dotenv';

// Carregar variáveis de ambiente ANTES de importar qualquer coisa
dotenv.config();

import { geocodingQueue, placesQueue, analysisQueue } from '../queues/queue.config';

async function clearAllQueues() {
  console.log('🗑️  Limpando todas as filas (queues)...');

  try {
    // Limpar fila de geocodificação
    await geocodingQueue.empty();
    await geocodingQueue.clean(0, 'completed');
    await geocodingQueue.clean(0, 'failed');
    await geocodingQueue.clean(0, 'delayed');
    await geocodingQueue.clean(0, 'active');
    await geocodingQueue.clean(0, 'wait');
    console.log('✅ Fila de geocodificação limpa');

    // Limpar fila de Places
    await placesQueue.empty();
    await placesQueue.clean(0, 'completed');
    await placesQueue.clean(0, 'failed');
    await placesQueue.clean(0, 'delayed');
    await placesQueue.clean(0, 'active');
    await placesQueue.clean(0, 'wait');
    console.log('✅ Fila de Places limpa');

    // Limpar fila de análise
    await analysisQueue.empty();
    await analysisQueue.clean(0, 'completed');
    await analysisQueue.clean(0, 'failed');
    await analysisQueue.clean(0, 'delayed');
    await analysisQueue.clean(0, 'active');
    await analysisQueue.clean(0, 'wait');
    console.log('✅ Fila de análise limpa');

    // Obter contadores finais
    const geocodingCounts = await geocodingQueue.getJobCounts();
    const placesCounts = await placesQueue.getJobCounts();
    const analysisCounts = await analysisQueue.getJobCounts();

    console.log('\n📊 Status final das filas:');
    console.log('Geocoding:', geocodingCounts);
    console.log('Places:', placesCounts);
    console.log('Analysis:', analysisCounts);

    await geocodingQueue.close();
    await placesQueue.close();
    await analysisQueue.close();

    console.log('\n✅ Todas as filas foram limpas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao limpar filas:', error);
    process.exit(1);
  }
}

clearAllQueues();
