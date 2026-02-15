type QueryValue = string | number | boolean | null | undefined

export function compactQuery<T extends Record<string, QueryValue>>(params: T): Record<string, string | number | boolean> {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  return Object.fromEntries(entries) as Record<string, string | number | boolean>
}

