import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  surname: z.string().trim().max(120).optional().or(z.literal('')),
  phone: z.string().trim().max(32).optional().or(z.literal('')),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
