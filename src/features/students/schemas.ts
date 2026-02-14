import { z } from 'zod'

export const studentCreateSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  phone: z.string().trim().min(8, 'Phone is too short').max(32),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
})

export const studentUpdateSchema = studentCreateSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field must be updated',
})

export type StudentCreateInput = z.infer<typeof studentCreateSchema>
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>
