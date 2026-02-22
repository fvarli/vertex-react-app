import { api } from '../../lib/api'
import type { ApiEnvelope } from '../../lib/contracts'
import { compactQuery } from '../../lib/query'
import type {
  AppointmentReport,
  ProgramReport,
  ReminderReport,
  ReportExportFormat,
  ReportExportType,
  ReportParams,
  StudentReport,
  StudentRetentionReport,
  TrainerPerformanceReport,
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

export async function getTrainerPerformanceReport(params: ReportParams = {}): Promise<TrainerPerformanceReport> {
  const response = await api.get<ApiEnvelope<TrainerPerformanceReport>>('/reports/trainer-performance', {
    params: compactQuery(params),
  })
  return response.data.data
}

export async function getStudentRetentionReport(params: ReportParams = {}): Promise<StudentRetentionReport> {
  const response = await api.get<ApiEnvelope<StudentRetentionReport>>('/reports/student-retention', {
    params: compactQuery(params),
  })
  return response.data.data
}

export async function downloadReportExport(type: ReportExportType, format: ReportExportFormat, params: ReportParams = {}): Promise<void> {
  const response = await api.get(`/reports/${type}/export`, {
    params: { ...compactQuery(params), format },
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.download = `${type}-report.${format}`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
