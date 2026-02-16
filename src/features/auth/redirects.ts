import type { ApiUser } from './types'

function defaultRouteForUser(user: ApiUser): string {
  if (user.system_role === 'platform_admin' || user.active_workspace_role === 'owner_admin') {
    return '/admin/workspaces'
  }

  return '/trainer/workspaces'
}

function isAllowedFromPath(user: ApiUser, from: string): boolean {
  const isAdmin = user.system_role === 'platform_admin' || user.active_workspace_role === 'owner_admin'

  if (from === '/login' || from === '/forbidden') {
    return false
  }

  if (isAdmin) {
    return from.startsWith('/admin/')
  }

  return from.startsWith('/trainer/')
}

export function resolvePostLoginPath(user: ApiUser, from?: string | null): string {
  if (!from) {
    return defaultRouteForUser(user)
  }

  return isAllowedFromPath(user, from) ? from : defaultRouteForUser(user)
}

