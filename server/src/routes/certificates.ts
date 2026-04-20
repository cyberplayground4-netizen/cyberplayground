import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.session.userId }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Simple logic: if XP > 1000, they have a foundational certificate
    const certificates = [];
    if (user.xp >= 100) {
        certificates.push({
            id: 'cert_1',
            title: 'Cybersecurity Awareness Foundations',
            issuedAt: new Date().toISOString(),
            level: user.level
        });
    }

    res.json({ certificates });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

export default router;
