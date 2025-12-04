import { Router } from 'express';
import { GeocodingController } from '../controllers/geocoding.controller';

const router = Router();
const geocodingController = new GeocodingController();

// Rotas de geocodificação
router.post('/start', (req, res) => geocodingController.startGeocodingAll(req, res));
router.get('/status', (req, res) => geocodingController.getQueueStatus(req, res));
router.get('/clientes', (req, res) => geocodingController.listarGeocodificados(req, res));
router.post('/retry-failed', (req, res) => geocodingController.retryFailed(req, res));
router.post('/reset-stuck', (req, res) => geocodingController.resetStuckClients(req, res));
router.post('/:id', (req, res) => geocodingController.geocodeSingle(req, res));

export default router;
