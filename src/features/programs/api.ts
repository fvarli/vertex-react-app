import { api } from '../../lib/api'
import type { ApiEnvelope } from '../../lib/contracts'
import { compactQuery } from '../../lib/query'
import type {
  CopyProgramWeekPayload,
  Paginated,
  Program,
  ProgramFromTemplatePayload,
  ProgramListParams,
  ProgramPayload,
  ProgramStatusPayload,
  ProgramTemplate,
  ProgramTemplatePayload,
  ProgramUpdatePayload,
} from './types'

export async function listPrograms(studentId: number, params: ProgramListParams = {}): Promise<Paginated<Program>> {
  const query = compactQuery({
    ...params,
    status: params.status === 'all' ? undefined : params.status,
  })

  const response = await api.get<ApiEnvelope<Paginated<Program>>>(`/students/${studentId}/programs`, { params: query })
  return response.data.data
}

export async function createProgram(studentId: number, payload: ProgramPayload): Promise<Program> {
  const response = await api.post<ApiEnvelope<Program>>(`/students/${studentId}/programs`, payload)
  return response.data.data
}

export async function updateProgram(programId: number, payload: ProgramUpdatePayload): Promise<Program> {
  const response = await api.put<ApiEnvelope<Program>>(`/programs/${programId}`, payload)
  return response.data.data
}

export async function updateProgramStatus(programId: number, payload: ProgramStatusPayload): Promise<Program> {
  const response = await api.patch<ApiEnvelope<Program>>(`/programs/${programId}/status`, payload)
  return response.data.data
}

export async function listProgramTemplates(params: { search?: string; per_page?: number } = {}): Promise<Paginated<ProgramTemplate>> {
  const response = await api.get<ApiEnvelope<Paginated<ProgramTemplate>>>('/program-templates', {
    params: compactQuery(params),
  })
  return response.data.data
}

export async function createProgramTemplate(payload: ProgramTemplatePayload): Promise<ProgramTemplate> {
  const response = await api.post<ApiEnvelope<ProgramTemplate>>('/program-templates', payload)
  return response.data.data
}

export async function createProgramFromTemplate(studentId: number, payload: ProgramFromTemplatePayload): Promise<Program> {
  const response = await api.post<ApiEnvelope<Program>>(`/students/${studentId}/programs/from-template`, payload)
  return response.data.data
}

export async function copyProgramWeek(studentId: number, payload: CopyProgramWeekPayload): Promise<Program> {
  const response = await api.post<ApiEnvelope<Program>>(`/students/${studentId}/programs/copy-week`, payload)
  return response.data.data
}
