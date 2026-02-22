export type ReportGroupBy = 'day' | 'week' | 'month'

export type ReportFilters = {
  date_from: string
  date_to: string
  group_by: ReportGroupBy
}

export type ReportParams = {
  date_from?: string
  date_to?: string
  group_by?: ReportGroupBy
  trainer_id?: number
}

export type AppointmentTotals = {
  total: number
  planned: number
  done: number
  cancelled: number
  no_show: number
}

export type AppointmentBucket = {
  bucket: string
  total: number
  planned: number
  done: number
  cancelled: number
  no_show: number
}

export type AppointmentReport = {
  filters: ReportFilters
  totals: AppointmentTotals
  buckets: AppointmentBucket[]
}

export type StudentTotals = {
  total: number
  active: number
  passive: number
  new_in_range: number
}

export type StudentBucket = {
  bucket: string
  total: number
  active: number
  passive: number
}

export type StudentReport = {
  filters: ReportFilters
  totals: StudentTotals
  buckets: StudentBucket[]
}

export type ProgramTotals = {
  total: number
  active: number
  draft: number
  archived: number
}

export type ProgramBucket = {
  bucket: string
  total: number
  active: number
  draft: number
  archived: number
}

export type ProgramReport = {
  filters: ReportFilters
  totals: ProgramTotals
  buckets: ProgramBucket[]
}

export type ReminderTotals = {
  total: number
  sent: number
  pending: number
  ready: number
  failed: number
  missed: number
  escalated: number
  send_rate: number
  on_time_send_rate: number
  missed_rate: number
  escalated_count: number
  avg_attempt_count: number
}

export type ReminderBucket = {
  bucket: string
  total: number
  sent: number
  pending: number
  ready: number
  failed: number
  missed: number
  escalated: number
}

export type ReminderReport = {
  filters: ReportFilters
  totals: ReminderTotals
  buckets: ReminderBucket[]
}

export type TrainerPerformanceRow = {
  trainer_id: number
  trainer_name: string
  total_students: number
  completed_appointments: number
  completion_rate: number
  no_show_count: number
  reminder_success_rate: number
}

export type TrainerPerformanceReport = {
  filters: ReportFilters
  rows: TrainerPerformanceRow[]
}

export type StudentRetentionReport = {
  filters: ReportFilters
  retention_rate: number
  churn_rate: number
  new_students: number
  churned_students: number
  avg_student_lifetime_days: number
  students_without_appointment_30d: number
}

export type ReportExportFormat = 'csv' | 'pdf'

export type ReportExportType = 'appointments' | 'students' | 'programs' | 'reminders' | 'trainer-performance'
