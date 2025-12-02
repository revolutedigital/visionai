import { Router } from 'express';
import { PlacesController } from '../controllers/places.controller';

const router = Router();
const placesController = new PlacesController();

// Rotas de Google Places
router.post('/start', (req, res) => placesController.startPlacesAll(req, res));
router.post('/:id', (req, res) => placesController.placesSingle(req, res));
router.get('/status', (req, res) => placesController.getQueueStatus(req, res));
router.get('/clientes', (req, res) => placesController.listarProcessados(req, res));
router.get('/estatisticas', (req, res) => placesController.getEstatisticas(req, res));
router.get('/:id/detalhes', (req, res) => placesController.getClienteDetalhes(req, res));
router.post('/retry-failed', (req, res) => placesController.retryFailed(req, res));

export default router;
