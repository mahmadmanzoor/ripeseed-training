import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { prisma } from '../lib/prisma';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authenticateToken = (request: AuthenticatedRequest, response: Response, next: NextFunction): void => {
  const authHeader = request.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    response.status(401).json({ error: 'Access token required' });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    response.status(403).json({ error: 'Invalid or expired token' });
    return;
  }

  request.userId = decoded.userId;
  next();
};

export const requireAdmin = async (request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<void> => {
  try {
    if (!request.userId) {
      response.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: request.userId },
      select: { isAdmin: true }
    });

    if (!user || !user.isAdmin) {
      response.status(403).json({ error: 'Admin access required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
};
