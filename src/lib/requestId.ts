export function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2)
  return `req-${ts}-${rand}`
}
