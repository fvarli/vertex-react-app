import { api } from '../../lib/api'
import type { ApiEnvelope } from '../../lib/contracts'
import { compactQuery } from '../../lib/query'
import type {
  AppointmentReport,
  ProgramReport,
  ReminderReport,
  ReportParams,
  StudentReport,
} from './types'

export async function getAppointmentReport(params: ReportParams = {}): Promise<AppointmentReport> {
  const response = await api.get<ApiEnvelope<AppointmentReport>>('/reports/appointments', {
    params: compactQuery(params),
  })
  return response.data.data
}

export async function getStudentReport(params: ReportParams = {}): Promise<StudentReport> {
  const response = await api.get<ApiEnvelope<StudentReport>>('/reports/students', {
    params: compactQuery(params),
  })
  return response.data.data
}

export async function getProgramReport(params: ReportParams = {}): Promise<ProgramReport> {
  const response = await api.get<ApiEnvelope<ProgramReport>>('/reports/programs', {
    params: compactQuery(params),
  })
  return response.data.data
}

export async function getReminderReport(params: ReportParams = {}): Promise<ReminderReport> {
  const response = await api.get<ApiEnvelope<ReminderReport>>('/reports/reminders', {
    params: compactQuery(params),
  })
  return response.data.data
}
