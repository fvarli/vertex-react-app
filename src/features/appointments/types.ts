export type AppointmentStatus = 'planned' | 'done' | 'cancelled' | 'no_show'

export type Appointment = {
  id: number
  workspace_id: number
  trainer_user_id: number
  student_id: number
  starts_at: string
  ends_at: string
  status: AppointmentStatus
  location: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
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
  status?: AppointmentStatus | 'all'
  student_id?: number
  page?: number
  per_page?: number
}

export type AppointmentPayload = {
  student_id: number
  starts_at: string
  ends_at: string
  location?: string | null
  notes?: string | null
  trainer_user_id?: number
}

export type AppointmentUpdatePayload = Partial<AppointmentPayload>

export type AppointmentStatusPayload = {
  status: AppointmentStatus
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
