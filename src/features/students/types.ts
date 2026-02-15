export type StudentStatus = 'active' | 'passive'

export type Student = {
  id: number
  workspace_id: number
  trainer_user_id: number
  full_name: string
  phone: string
  notes: string | null
  status: StudentStatus
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

export type StudentListParams = {
  search?: string
  status?: StudentStatus | 'all'
  page?: number
  per_page?: number
  sort?: 'id' | 'full_name' | 'status' | 'created_at'
  direction?: 'asc' | 'desc'
}

export type StudentPayload = {
  full_name: string
  phone: string
  notes?: string | null
  trainer_user_id?: number
}

export type UpdateStudentPayload = Partial<StudentPayload>

export type StudentStatusPayload = {
  status: StudentStatus
}
