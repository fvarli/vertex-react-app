import { api } from '../../lib/api'
import type { ApiEnvelope } from '../../lib/contracts'
import { compactQuery } from '../../lib/query'
import type {
  Paginated,
  Student,
  StudentListParams,
  StudentPayload,
  StudentStatusPayload,
  UpdateStudentPayload,
} from './types'

export async function listStudents(params: StudentListParams): Promise<Paginated<Student>> {
  const query = compactQuery({
    ...params,
    status: params.status === 'all' ? undefined : params.status,
  })

  const response = await api.get<ApiEnvelope<Paginated<Student>>>('/students', { params: query })
  return response.data.data
}

export async function createStudent(payload: StudentPayload): Promise<Student> {
  const response = await api.post<ApiEnvelope<Student>>('/students', payload)
  return response.data.data
}

export async function updateStudent(studentId: number, payload: UpdateStudentPayload): Promise<Student> {
  const response = await api.put<ApiEnvelope<Student>>(`/students/${studentId}`, payload)
  return response.data.data
}

export async function updateStudentStatus(studentId: number, payload: StudentStatusPayload): Promise<Student> {
  const response = await api.patch<ApiEnvelope<Student>>(`/students/${studentId}/status`, payload)
  return response.data.data
}

export async function getStudentWhatsappLink(studentId: number): Promise<string> {
  const response = await api.get<ApiEnvelope<{ url: string }>>(`/students/${studentId}/whatsapp-link`, {
    params: { template: 'reminder' },
  })
  return response.data.data.url
}
