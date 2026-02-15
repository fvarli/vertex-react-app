import { api } from '../../lib/api'
import type { ApiEnvelope } from '../../lib/contracts'
import type { DashboardSummary } from './types'

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get<ApiEnvelope<DashboardSummary>>('/dashboard/summary')
  return response.data.data
}

