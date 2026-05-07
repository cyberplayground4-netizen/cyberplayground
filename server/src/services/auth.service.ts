import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { z } from 'zod';
import { registerSchema, loginSchema } from '../validators/auth.js';

export class AuthService {
  static async register(data: z.infer<typeof registerSchema>) {
    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email is already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(12); // cost factor 12
    const passwordHash = await bcrypt.hash(data.password, salt);

    // Generate verification token (mock sending email for now)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const isDev = process.env.NODE_ENV !== 'production';

    const user = await prisma.users.create({
      data: {
        name: data.name,
        email: data.email,
        password_hash: passwordHash,
        verification_token: isDev ? null : verificationToken,
        token_expiry: isDev ? null : tokenExpiry,
        email_verified: isDev, // auto-verify in development
      },
    });

    // In a real app, send actual email. Here we just log it for dev testing.
    console.log(`[Email Service Mock] Verification link for ${user.email} -> http://localhost:5173/verify/${verificationToken}`);

    return { id: user.id, name: user.name, email: user.email };
  }

  static async verifyEmail(token: string) {
    const user = await prisma.users.findFirst({
      where: {
        verification_token: token,
      },
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    if (user.token_expiry && user.token_expiry < new Date()) {
      throw new Error('Invalid or expired verification token');
    }

    if (user.email_verified) {
        return; // Already verified
    }

    await prisma.users.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        verification_token: null,
        token_expiry: null,
      },
    });
  }

  static async login(data: z.infer<typeof loginSchema>) {
    const user = await prisma.users.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.locked_until && user.locked_until > new Date()) {
        throw new Error('Account locked due to too many failed attempts. Try again later.');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password_hash);

    if (!isValidPassword) {
        const attempts = user.failed_login_attempts + 1;
        let lockedUntil = null;

        if (attempts >= 5) {
            lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        }

        await prisma.users.update({
            where: { id: user.id },
            data: {
                failed_login_attempts: attempts,
                locked_until: lockedUntil
            }
        });

      throw new Error('Invalid email or password');
    }

    // Skip email verification check in development mode
    if (!user.email_verified && process.env.NODE_ENV === 'production') {
      throw new Error('Please verify your email before logging in');
    }

    // Reset failed attempts on success
    await prisma.users.update({
        where: { id: user.id },
        data: {
            failed_login_attempts: 0,
            locked_until: null,
            last_active: new Date()
        }
    });

    return { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      level: user.level, 
      xp: user.xp, 
      streak: user.streak 
    };
  }
}
