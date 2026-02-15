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
    today_planned: number
    today_cancelled: number
    upcoming_7d: number
  }
  programs: {
    active_this_week: number
    draft_this_week: number
  }
}

