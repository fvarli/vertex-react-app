import { api } from '../../lib/api'
import type { ApiEnvelope } from '../../lib/contracts'
import { compactQuery } from '../../lib/query'
import type {
  Appointment,
  AppointmentListParams,
  AppointmentPayload,
  AppointmentSeriesCreateResponse,
  AppointmentSeriesPayload,
  AppointmentStatusPayload,
  AppointmentWhatsappStatusPayload,
  AppointmentUpdatePayload,
  CalendarPayload,
  Paginated,
} from './types'

export async function fetchAppointment(appointmentId: number): Promise<Appointment> {
  const response = await api.get<ApiEnvelope<Appointment>>(`/appointments/${appointmentId}`)
  return response.data.data
}

export async function listAppointments(params: AppointmentListParams): Promise<Paginated<Appointment>> {
  const query = compactQuery({
    ...params,
    status: params.status === 'all' ? undefined : params.status,
    whatsapp_status: params.whatsapp_status === 'all' ? undefined : params.whatsapp_status,
  })

  const response = await api.get<ApiEnvelope<Paginated<Appointment>>>('/appointments', { params: query })
  return response.data.data
}

export async function createAppointment(payload: AppointmentPayload): Promise<Appointment> {
  const idemKey = buildAppointmentIdempotencyKey(payload)
  const response = await api.post<ApiEnvelope<Appointment>>('/appointments', payload, {
    headers: {
      'Idempotency-Key': idemKey,
    },
  })
  return response.data.data
}

export async function createAppointmentSeries(payload: AppointmentSeriesPayload): Promise<AppointmentSeriesCreateResponse> {
  const idemKey = buildAppointmentSeriesIdempotencyKey(payload)
  const response = await api.post<ApiEnvelope<AppointmentSeriesCreateResponse>>('/appointments/series', payload, {
    headers: {
      'Idempotency-Key': idemKey,
    },
  })
  return response.data.data
}

export async function updateAppointment(appointmentId: number, payload: AppointmentUpdatePayload): Promise<Appointment> {
  const response = await api.put<ApiEnvelope<Appointment>>(`/appointments/${appointmentId}`, payload)
  return response.data.data
}

export async function updateAppointmentStatus(appointmentId: number, payload: AppointmentStatusPayload): Promise<Appointment> {
  const response = await api.patch<ApiEnvelope<Appointment>>(`/appointments/${appointmentId}/status`, payload)
  return response.data.data
}

export async function updateAppointmentWhatsappStatus(appointmentId: number, payload: AppointmentWhatsappStatusPayload): Promise<Appointment> {
  const response = await api.patch<ApiEnvelope<Appointment>>(`/appointments/${appointmentId}/whatsapp-status`, payload)
  return response.data.data
}

export async function getAppointmentWhatsappLink(appointmentId: number): Promise<string> {
  const response = await api.get<ApiEnvelope<{ url: string }>>(`/appointments/${appointmentId}/whatsapp-link`, {
    params: { template: 'reminder' },
  })
  return response.data.data.url
}

export async function fetchCalendar(params: { from: string; to: string; trainer_id?: number }): Promise<CalendarPayload> {
  const response = await api.get<ApiEnvelope<CalendarPayload>>('/calendar', { params: compactQuery(params) })
  return response.data.data
}

function buildAppointmentIdempotencyKey(payload: AppointmentPayload): string {
  const base = `appt:${payload.student_id}:${payload.starts_at}:${payload.ends_at}`
  return base.replace(/\s+/g, '').slice(0, 120)
}

function buildAppointmentSeriesIdempotencyKey(payload: AppointmentSeriesPayload): string {
  const base = `series:${payload.student_id}:${payload.start_date}:${payload.starts_at_time}:${payload.ends_at_time}:${payload.recurrence_rule.freq}`
  return base.replace(/\s+/g, '').slice(0, 120)
}
