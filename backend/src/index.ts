import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import uploadRoutes from './routes/upload.routes';
import geocodingRoutes from './routes/geocoding.routes';
import placesRoutes from './routes/places.routes';
import analysisRoutes from './routes/analysis.routes';
import dataQualityRoutes from './routes/data-quality.routes';
import enrichmentRoutes from './routes/enrichment.routes';
import tipologiaRoutes from './routes/tipologia.routes';
import { errorHandler, notFoundHandler } from './middleware/error-handler';

// Carregar variáveis de ambiente
dotenv.config();

// Iniciar workers
import './workers/geocoding.worker';
import './workers/receita.worker';
import './workers/normalization.worker';
import './workers/places.worker';
import './workers/analysis.worker';
import './workers/enrichment.worker';
import './workers/tipologia.worker';

// Import das filas para despausar ao iniciar
import { geocodingQueue, receitaQueue, normalizationQueue, placesQueue, analysisQueue, tipologiaQueue } from './queues/queue.config';

// Despausar todas as filas ao iniciar (caso tenham sido pausadas em sessão anterior)
async function resumeAllQueues() {
  try {
    await receitaQueue.resume();
    await normalizationQueue.resume();
    await geocodingQueue.resume();
    await placesQueue.resume();
    await analysisQueue.resume();
    await tipologiaQueue.resume();
    console.log('✅ Todas as filas despausadas e prontas para processar');
  } catch (error) {
    console.error('⚠️  Erro ao despausar filas:', error);
  }
}

// Executar ao iniciar
resumeAllQueues();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration para produção
const allowedOrigins = [
  'http://localhost:3000', // Dev local
  'http://localhost:5173', // Vite dev server
  process.env.FRONTEND_URL || '', // Railway frontend (configurável)
  'https://scampepisico-frontend.up.railway.app', // Fallback Railway
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sem origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);

    // Em desenvolvimento, permitir qualquer origem
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Em produção, verificar whitelist
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS bloqueou origem: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (fotos)
const photosDir = process.env.PHOTOS_DIR || path.join(__dirname, '../uploads/fotos');
app.use('/api/fotos', express.static(photosDir));
console.log(`📁 Servindo fotos de: ${photosDir}`);

// Rota de health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Rota inicial
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Sistema RAC - API',
    version: '0.5.0',
    endpoints: {
      health: '/health',
      upload: '/api/upload',
      uploads: '/api/uploads',
      geocoding: '/api/geocoding',
      geocodingStatus: '/api/geocoding/status',
      places: '/api/places',
      placesStatus: '/api/places/status',
      analysis: '/api/analysis',
      analysisStatus: '/api/analysis/status',
      dataQuality: '/api/data-quality',
      dataQualityReport: '/api/data-quality/report',
      enrichment: '/api/enrichment',
      enrichmentStatus: '/api/enrichment/status',
      tipologia: '/api/tipologia',
      tipologiaDistribuicao: '/api/tipologia/distribuicao',
    },
  });
});

// Rotas da API
app.use('/api/upload', uploadRoutes);
app.use('/api/geocoding', geocodingRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/data-quality', dataQualityRoutes);
app.use('/api/enrichment', enrichmentRoutes);
app.use('/api/tipologia', tipologiaRoutes);

// Error handling middlewares (must be AFTER all routes)
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================
// Garante que o servidor encerra de forma limpa em produção
// Railway envia SIGTERM ao fazer redeploy

async function gracefulShutdown(signal: string) {
  console.log(`\n⚠️  ${signal} recebido. Iniciando graceful shutdown...`);

  // Timeout de segurança (30 segundos)
  const shutdownTimeout = setTimeout(() => {
    console.error('❌ Shutdown timeout! Forçando encerramento...');
    process.exit(1);
  }, 30000);

  try {
    // 1. Parar de aceitar novas conexões
    console.log('1️⃣ Fechando servidor HTTP...');
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 2. Pausar todas as filas do Bull
    console.log('2️⃣ Pausando filas do Bull...');
    await Promise.all([
      receitaQueue.pause(),
      normalizationQueue.pause(),
      geocodingQueue.pause(),
      placesQueue.pause(),
      analysisQueue.pause(),
      tipologiaQueue.pause(),
    ]);

    // 3. Desconectar Prisma
    console.log('3️⃣ Desconectando Prisma...');
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$disconnect();

    console.log('✅ Shutdown concluído com sucesso');
    clearTimeout(shutdownTimeout);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante shutdown:', error);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
}

// Capturar sinais de término
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Capturar erros não tratados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});
