export type TrainerOverviewSummary = {
  total_trainers: number
  active_trainers: number
  total_students: number
  today_appointments: number
  upcoming_7d_appointments: number
  avg_students_per_trainer: number | null
}

export type TrainerOverviewItem = {
  id: number
  name: string
  surname: string
  email: string
  phone: string | null
  is_active: boolean
  membership_is_active: boolean | null
  student_count: number
  today_appointments: number
  upcoming_7d_appointments: number
  created_at: string
  updated_at: string
}

export type TrainerOverviewResponse = {
  trainers: TrainerOverviewItem[]
  summary: TrainerOverviewSummary
}

export type TrainerOverviewParams = {
  include_inactive?: boolean
  search?: string
}

export type CreateTrainerPayload = {
  name: string
  surname: string
  email: string
  phone?: string
  password: string
}
