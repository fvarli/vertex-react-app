import { z } from 'zod'

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
