export type ProgramStatus = 'draft' | 'active' | 'archived'

export type ProgramItem = {
  id?: number
  day_of_week: number
  order_no: number
  exercise: string
  sets: number | null
  reps: number | null
  rest_seconds: number | null
  notes: string | null
}

export type Program = {
  id: number
  workspace_id: number
  student_id: number
  trainer_user_id: number
  title: string
  goal: string | null
  week_start_date: string
  status: ProgramStatus
  items: ProgramItem[]
  created_at: string
  updated_at: string
}

export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export type ProgramPayload = {
  title: string
  goal?: string | null
  week_start_date: string
  status?: ProgramStatus
  items?: ProgramItem[]
}

export type ProgramUpdatePayload = Partial<ProgramPayload>

export type ProgramStatusPayload = {
  status: ProgramStatus
}
