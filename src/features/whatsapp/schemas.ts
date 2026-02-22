import { z } from 'zod'

export const messageTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  body: z.string().min(1).max(2000),
  is_default: z.boolean(),
})

export type MessageTemplateSchemaValues = z.infer<typeof messageTemplateSchema>
