import { api } from '../../lib/api'
import type { ApiEnvelope } from '../../lib/contracts'
import type { CreateTrainerPayload, TrainerOverviewParams, TrainerOverviewResponse } from './types'

export async function getTrainerOverview(params: TrainerOverviewParams = {}): Promise<TrainerOverviewResponse> {
  const response = await api.get<ApiEnvelope<TrainerOverviewResponse>>('/trainers/overview', { params })
  return response.data.data
}

export async function createTrainer(payload: CreateTrainerPayload) {
  const response = await api.post('/trainers', payload)
  return response.data.data
}
