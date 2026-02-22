export type BulkLinkItem = {
  appointment_id: number
  student_name: string
  starts_at: string
  whatsapp_link: string
  whatsapp_sent: boolean
}

export type MessageTemplate = {
  id: number
  workspace_id: number
  name: string
  channel: string
  body: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export type MessageTemplateFormData = {
  name: string
  channel: string
  body: string
  is_default: boolean
}
