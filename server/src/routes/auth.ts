import express from 'express';
import { AuthService } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../validators/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';
import prisma from '../config/database.js';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();

// Stricter rate limits for auth routes
const registerLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many accounts created from this IP, please try again later' });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many login attempts, please try again later' });
const verifyLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

router.post('/register', registerLimiter, async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const user = await AuthService.register(validatedData);
    res.status(201).json({ message: 'Registration successful. Please check your email.', user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const user = await AuthService.login(validatedData);
    
    // Regenerate session to prevent session fixation
    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: 'Could not log in' });

      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) return res.status(500).json({ error: 'Could not log in' });
        res.json({ message: 'Login successful', user });
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/verify', verifyLimiter, async (req, res) => {
  try {
    const token = req.query.token as string;
    if (!token) return res.status(400).json({ error: 'Token is required' });
    
    await AuthService.verifyEmail(token);
    res.json({ message: 'Email verified successfully. You can now login.' });
  } catch (error) {
    if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Could not log out' });
    res.clearCookie('connect.sid'); // default name
    res.json({ message: 'Logged out successfully' });
  });
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.session.userId },
      select: {
          id: true,
          name: true,
          email: true,
          xp: true,
          level: true,
          streak: true,
          created_at: true 
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
