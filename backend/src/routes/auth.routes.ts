import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// Rotas públicas
router.post('/login', authController.login.bind(authController));

// Rotas protegidas
router.get('/me', authMiddleware, authController.me.bind(authController));
router.post('/refresh', authMiddleware, authController.refresh.bind(authController));

export default router;
