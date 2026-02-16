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
}
