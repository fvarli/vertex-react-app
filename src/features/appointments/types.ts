export type AppointmentStatus = 'planned' | 'done' | 'cancelled' | 'no_show'
export type AppointmentWhatsappStatus = 'sent' | 'not_sent'

export type Appointment = {
  id: number
  series_id: number | null
  series_occurrence_date: string | null
  is_series_exception: boolean
  series_edit_scope_applied: 'single' | 'future' | 'all' | null
  workspace_id: number
  trainer_user_id: number
  student_id: number
  starts_at: string
  ends_at: string
  status: AppointmentStatus
  whatsapp_status: AppointmentWhatsappStatus
  whatsapp_marked_at: string | null
  whatsapp_marked_by_user_id: number | null
  next_pending_reminder_at?: string | null
  reminder_summary?: {
    pending: number
    sent: number
  }
  location: string | null
  notes: string | null
  created_at: string
  updated_at: string
}


export type Paginated<T> = {
  data: T[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export type AppointmentListParams = {
  date_from?: string
  date_to?: string
  search?: string
  status?: AppointmentStatus | 'all'
  whatsapp_status?: AppointmentWhatsappStatus | 'all'
  student_id?: number
  page?: number
  per_page?: number
  sort?: 'id' | 'starts_at' | 'ends_at' | 'status' | 'created_at'
  direction?: 'asc' | 'desc'
}

export type AppointmentPayload = {
  student_id: number
  starts_at: string
  ends_at: string
  location?: string | null
  notes?: string | null
  trainer_user_id?: number
}

export type AppointmentSeriesPayload = {
  student_id: number
  trainer_user_id?: number
  title?: string | null
  location?: string | null
  start_date: string
  starts_at_time: string
  ends_at_time: string
  recurrence_rule: {
    freq: 'weekly' | 'monthly'
    interval?: number
    count?: number
    until?: string
    byweekday?: number[]
  }
}

export type AppointmentSeries = {
  id: number
  workspace_id: number
  trainer_user_id: number
  student_id: number
  title: string | null
  location: string | null
  recurrence_rule: {
    freq: 'weekly' | 'monthly'
    interval?: number
    count?: number
    until?: string
    byweekday?: number[]
  }
  start_date: string
  starts_at_time: string
  ends_at_time: string
  status: 'active' | 'paused' | 'ended'
  created_at: string
  updated_at: string
}

export type AppointmentSeriesCreateResponse = {
  series: AppointmentSeries
  generated_count: number
  skipped_conflicts_count: number
}

export type AppointmentUpdatePayload = Partial<AppointmentPayload>

export type AppointmentStatusPayload = {
  status: AppointmentStatus
}

export type AppointmentWhatsappStatusPayload = {
  whatsapp_status: AppointmentWhatsappStatus
}

export type CalendarDay = {
  date: string
  items: Appointment[]
}

export type CalendarPayload = {
  from: string
  to: string
  appointments: Appointment[]
  days: CalendarDay[]
}
