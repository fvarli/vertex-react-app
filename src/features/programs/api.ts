import { api } from '../../lib/api'
import type { ApiEnvelope, Program, ProgramPayload, ProgramStatusPayload, ProgramUpdatePayload } from './types'

export async function listPrograms(studentId: number): Promise<Program[]> {
  const response = await api.get<ApiEnvelope<Program[]>>(`/students/${studentId}/programs`)
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
