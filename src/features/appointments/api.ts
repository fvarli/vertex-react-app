import { api } from '../../lib/api'
import type { ApiEnvelope } from '../../lib/contracts'
import { compactQuery } from '../../lib/query'
import type {
  Appointment,
  AppointmentListParams,
  AppointmentPayload,
  AppointmentStatusPayload,
  AppointmentUpdatePayload,
  CalendarPayload,
  Paginated,
} from './types'

export async function listAppointments(params: AppointmentListParams): Promise<Paginated<Appointment>> {
  const query = compactQuery({
    ...params,
    status: params.status === 'all' ? undefined : params.status,
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

export async function updateAppointment(appointmentId: number, payload: AppointmentUpdatePayload): Promise<Appointment> {
  const response = await api.put<ApiEnvelope<Appointment>>(`/appointments/${appointmentId}`, payload)
  return response.data.data
}

export async function updateAppointmentStatus(appointmentId: number, payload: AppointmentStatusPayload): Promise<Appointment> {
  const response = await api.patch<ApiEnvelope<Appointment>>(`/appointments/${appointmentId}/status`, payload)
  return response.data.data
}

export async function fetchCalendar(params: { from: string; to: string; trainer_id?: number }): Promise<CalendarPayload> {
  const response = await api.get<ApiEnvelope<CalendarPayload>>('/calendar', { params: compactQuery(params) })
  return response.data.data
}

function buildAppointmentIdempotencyKey(payload: AppointmentPayload): string {
  const base = `appt:${payload.student_id}:${payload.starts_at}:${payload.ends_at}`
  return base.replace(/\s+/g, '').slice(0, 120)
}
