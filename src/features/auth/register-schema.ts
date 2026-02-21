import { z } from 'zod'

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
    surname: z.string().trim().max(120).optional().or(z.literal('')),
    email: z.string().trim().email('Invalid email address'),
    phone: z.string().trim().max(32).optional().or(z.literal('')),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

export type RegisterInput = z.infer<typeof registerSchema>
