import { api } from '../../lib/api'
import type { ApiEnvelope } from '../../lib/contracts'
import type { BulkLinkItem, MessageTemplate, MessageTemplateFormData } from './types'

export async function fetchBulkLinks(date: string): Promise<BulkLinkItem[]> {
  const response = await api.get<ApiEnvelope<BulkLinkItem[]>>('/whatsapp/bulk-links', {
    params: { date },
  })
  return response.data.data
}

export async function updateWhatsappStatus(appointmentId: number, sent: boolean): Promise<void> {
  await api.patch(`/appointments/${appointmentId}/whatsapp-status`, {
    whatsapp_sent: sent,
  })
}

export async function fetchMessageTemplates(): Promise<MessageTemplate[]> {
  const response = await api.get<ApiEnvelope<MessageTemplate[]>>('/message-templates')
  return response.data.data
}

export async function createMessageTemplate(data: MessageTemplateFormData): Promise<MessageTemplate> {
  const response = await api.post<ApiEnvelope<MessageTemplate>>('/message-templates', data)
  return response.data.data
}

export async function updateMessageTemplate(id: number, data: MessageTemplateFormData): Promise<MessageTemplate> {
  const response = await api.put<ApiEnvelope<MessageTemplate>>(`/message-templates/${id}`, data)
  return response.data.data
}

export async function deleteMessageTemplate(id: number): Promise<void> {
  await api.delete(`/message-templates/${id}`)
}
