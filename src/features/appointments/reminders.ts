import { api } from '../../lib/api'
import type { ApiEnvelope } from '../../lib/contracts'
import { compactQuery } from '../../lib/query'

export type ReminderStatus = 'pending' | 'ready' | 'sent' | 'missed' | 'cancelled' | 'failed'

export type Reminder = {
  id: number
  workspace_id: number
  appointment_id: number
  channel: 'whatsapp'
  scheduled_for: string
  status: ReminderStatus
  attempt_count: number
  opened_at: string | null
  marked_sent_at: string | null
  marked_sent_by_user_id: number | null
  payload: Record<string, unknown> | null
  appointment?: {
    id: number
    student_id: number
    trainer_user_id: number
    starts_at: string
    ends_at: string
    status: 'planned' | 'done' | 'cancelled' | 'no_show'
  }
}

type Paginated<T> = {
  data: T[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export type ReminderListParams = {
  status?: ReminderStatus | 'all'
  student_id?: number
  trainer_id?: number
  from?: string
  to?: string
  page?: number
  per_page?: number
}

export async function listReminders(params: ReminderListParams): Promise<Paginated<Reminder>> {
  const query = compactQuery({
    ...params,
    status: params.status === 'all' ? undefined : params.status,
  })

  const response = await api.get<ApiEnvelope<Paginated<Reminder>>>('/reminders', { params: query })
  return response.data.data
}

export async function openReminder(reminderId: number): Promise<Reminder> {
  const response = await api.patch<ApiEnvelope<Reminder>>(`/reminders/${reminderId}/open`)
  return response.data.data
}

export async function markReminderSent(reminderId: number): Promise<Reminder> {
  const response = await api.patch<ApiEnvelope<Reminder>>(`/reminders/${reminderId}/mark-sent`)
  return response.data.data
}

export async function cancelReminder(reminderId: number): Promise<Reminder> {
  const response = await api.patch<ApiEnvelope<Reminder>>(`/reminders/${reminderId}/cancel`)
  return response.data.data
}

