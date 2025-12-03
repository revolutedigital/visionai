import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'scampepisico-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Middleware de autenticação JWT
 * Aceita token via:
 * 1. Header Authorization: Bearer <token>
 * 2. Query string: ?token=<token> (para SSE/EventSource que não suporta headers)
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // 1. Tentar pegar do header Authorization
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const [bearer, headerToken] = authHeader.split(' ');
      if (bearer === 'Bearer' && headerToken) {
        token = headerToken;
      }
    }

    // 2. Se não tiver no header, tentar pegar da query string (para SSE)
    if (!token && req.query.token) {
      token = req.query.token as string;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token não fornecido',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
    };

    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado',
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Token inválido',
    });
  }
};

/**
 * Middleware opcional - não bloqueia se não tiver token
 */
export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const [bearer, token] = authHeader.split(' ');

      if (bearer === 'Bearer' && token) {
        const decoded = jwt.verify(token, JWT_SECRET) as {
          id: string;
          email: string;
          name: string;
        };
        req.user = decoded;
      }
    }

    next();
  } catch {
    // Token inválido, mas continua sem autenticação
    next();
  }
};
