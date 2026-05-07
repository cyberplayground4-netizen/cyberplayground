import { Request, Response, NextFunction } from 'express';

// SessionData augmentation lives in src/types/express.d.ts.
// This file only exports the middleware function.

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  next();
};
