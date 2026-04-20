import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .refine((val) => /[A-Z]/.test(val), { message: 'Must contain an uppercase letter' })
    .refine((val) => /[a-z]/.test(val), { message: 'Must contain a lowercase letter' })
    .refine((val) => /[0-9]/.test(val), { message: 'Must contain a number' }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
