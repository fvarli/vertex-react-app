export type WhatsAppStats = {
  today_total: number
  sent: number
  not_sent: number
  send_rate: number
}

export type DashboardTrends = {
  appointments_vs_last_week: number
  new_students: number
  completion_rate: number
  completion_rate_trend: 'up' | 'down' | 'stable'
}

export type TopTrainer = {
  trainer_id: number
  trainer_name: string
  completed_appointments: number
  completion_rate: number
}

export type DashboardSummary = {
  date: string
  students: {
    active: number
    passive: number
    total: number
  }
  appointments: {
    today_total: number
    today_done: number
    today_no_show: number
    today_planned: number
    today_cancelled: number
    upcoming_7d: number
    today_attendance_rate: number | null
  }
  programs: {
    active_this_week: number
    draft_this_week: number
  }
  reminders: {
    today_total: number
    today_sent: number
    today_missed: number
    today_escalated: number
  }
  whatsapp?: WhatsAppStats
  trends?: DashboardTrends
  top_trainers?: TopTrainer[]
}
