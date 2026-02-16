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

export type Paginated<T> = {
  data: T[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export type ProgramListParams = {
  search?: string
  status?: ProgramStatus | 'all'
  page?: number
  per_page?: number
  sort?: 'id' | 'title' | 'week_start_date' | 'created_at'
  direction?: 'asc' | 'desc'
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

export type ProgramTemplateItem = {
  id?: number
  day_of_week: number
  order_no: number
  exercise: string
  sets: number | null
  reps: number | null
  rest_seconds: number | null
  notes: string | null
}

export type ProgramTemplate = {
  id: number
  workspace_id: number
  trainer_user_id: number
  name: string
  title: string
  goal: string | null
  items: ProgramTemplateItem[]
  created_at: string
  updated_at: string
}

export type ProgramTemplatePayload = {
  trainer_user_id?: number
  name: string
  title: string
  goal?: string | null
  items?: ProgramTemplateItem[]
}

export type ProgramFromTemplatePayload = {
  template_id: number
  week_start_date: string
  status?: ProgramStatus
  title?: string
  goal?: string | null
}

export type CopyProgramWeekPayload = {
  source_week_start_date: string
  target_week_start_date: string
  status?: ProgramStatus
}
