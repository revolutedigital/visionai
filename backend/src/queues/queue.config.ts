import Queue from 'bull';
import Redis from 'ioredis';

// Configuração do Redis - suporta REDIS_URL do Railway ou config individual
const redisConfig = process.env.REDIS_URL
  ? {
      // Railway Redis URL
      url: process.env.REDIS_URL,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      // Timeouts agressivos para evitar travar
      connectTimeout: 5000,
      commandTimeout: 5000,
      // TLS pode ser necessário no Railway
      tls: process.env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
    }
  : {
      // Config local
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };

// Criar client Redis para o Bull
const createRedisClient = (type: 'client' | 'subscriber' | 'bclient') => {
  return new Redis(redisConfig);
};

// Opções padrão para as filas
const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: 500, // Manter últimos 500 jobs completados
  removeOnFail: 500, // Manter últimos 500 jobs falhados
};

// Fila de Geocodificação
export const geocodingQueue = new Queue('geocoding', {
  createClient: createRedisClient,
  defaultJobOptions,
});

// Log de eventos da fila
geocodingQueue.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completado:`, result);
});

geocodingQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} falhou:`, err.message);
});

geocodingQueue.on('error', (error) => {
  console.error('❌ Erro na fila:', error);
});

geocodingQueue.on('waiting', (jobId) => {
  console.log(`⏳ Job ${jobId} aguardando processamento`);
});

console.log('📦 Fila de Geocodificação configurada');

// Fila de Receita Federal e Normalização
export const receitaQueue = new Queue('receita', {
  createClient: createRedisClient,
  defaultJobOptions: {
    ...defaultJobOptions,
    attempts: 2, // Menos tentativas pois API tem rate limit
    timeout: 60000, // 1 minuto timeout
  },
});

// Log de eventos da fila Receita
receitaQueue.on('completed', (job, result) => {
  console.log(`✅ Receita Job ${job.id} completado:`, result);
});

receitaQueue.on('failed', (job, err) => {
  console.error(`❌ Receita Job ${job?.id} falhou:`, err.message);
});

receitaQueue.on('error', (error) => {
  console.error('❌ Erro na fila Receita:', error);
});

receitaQueue.on('waiting', (jobId) => {
  console.log(`⏳ Receita Job ${jobId} aguardando processamento`);
});

console.log('📦 Fila de Receita Federal configurada');

// Fila de Normalização (entre Receita e Geocoding)
export const normalizationQueue = new Queue('normalization', {
  createClient: createRedisClient,
  defaultJobOptions: {
    ...defaultJobOptions,
    attempts: 2,
    timeout: 30000, // 30 segundos timeout (IA é rápida)
  },
});

// Log de eventos da fila Normalização
normalizationQueue.on('completed', (job, result) => {
  console.log(`✅ Normalization Job ${job.id} completado:`, result);
});

normalizationQueue.on('failed', (job, err) => {
  console.error(`❌ Normalization Job ${job?.id} falhou:`, err.message);
});

normalizationQueue.on('error', (error) => {
  console.error('❌ Erro na fila Normalization:', error);
});

normalizationQueue.on('waiting', (jobId) => {
  console.log(`⏳ Normalization Job ${jobId} aguardando processamento`);
});

console.log('📦 Fila de Normalização configurada');

// Fila de Google Places
export const placesQueue = new Queue('places', {
  createClient: createRedisClient,
  defaultJobOptions: {
    ...defaultJobOptions,
    attempts: 2, // Menos tentativas pois API tem custo
  },
});

// Log de eventos da fila Places
placesQueue.on('completed', (job, result) => {
  console.log(`✅ Places Job ${job.id} completado:`, result);
});

placesQueue.on('failed', (job, err) => {
  console.error(`❌ Places Job ${job?.id} falhou:`, err.message);
});

placesQueue.on('error', (error) => {
  console.error('❌ Erro na fila Places:', error);
});

placesQueue.on('waiting', (jobId) => {
  console.log(`⏳ Places Job ${jobId} aguardando processamento`);
});

console.log('📦 Fila de Google Places configurada');

// Fila de Análise de IA
export const analysisQueue = new Queue('analysis', {
  createClient: createRedisClient,
  defaultJobOptions: {
    ...defaultJobOptions,
    attempts: 2, // Menos tentativas pois tem custo alto
    timeout: 120000, // 2 minutos timeout
  },
});

// Log de eventos da fila Analysis
analysisQueue.on('completed', (job, result) => {
  console.log(`✅ Analysis Job ${job.id} completado:`, result);
});

analysisQueue.on('failed', (job, err) => {
  console.error(`❌ Analysis Job ${job?.id} falhou:`, err.message);
});

analysisQueue.on('error', (error) => {
  console.error('❌ Erro na fila Analysis:', error);
});

analysisQueue.on('waiting', (jobId) => {
  console.log(`⏳ Analysis Job ${jobId} aguardando processamento`);
});

console.log('📦 Fila de Análise de IA configurada');

// Fila de Tipologia (após análise de fotos)
export const tipologiaQueue = new Queue('tipologia', {
  createClient: createRedisClient,
  defaultJobOptions: {
    ...defaultJobOptions,
    attempts: 2,
    timeout: 60000, // 1 minuto timeout (agente IA)
  },
});

// Log de eventos da fila Tipologia
tipologiaQueue.on('completed', (job, result) => {
  console.log(`✅ Tipologia Job ${job.id} completado:`, result);
});

tipologiaQueue.on('failed', (job, err) => {
  console.error(`❌ Tipologia Job ${job?.id} falhou:`, err.message);
});

tipologiaQueue.on('error', (error) => {
  console.error('❌ Erro na fila Tipologia:', error);
});

tipologiaQueue.on('waiting', (jobId) => {
  console.log(`⏳ Tipologia Job ${jobId} aguardando processamento`);
});

console.log('📦 Fila de Tipologia configurada');

export default geocodingQueue;
