export const storageKeys = {
  token: 'vertex_access_token',
  activeWorkspaceId: 'vertex_active_workspace_id',
}

export function getToken(): string | null {
  return localStorage.getItem(storageKeys.token)
}

export function setToken(token: string | null): void {
  if (!token) {
    localStorage.removeItem(storageKeys.token)
    return
  }

  localStorage.setItem(storageKeys.token, token)
}

export function getActiveWorkspaceId(): number | null {
  const raw = localStorage.getItem(storageKeys.activeWorkspaceId)
  if (!raw) return null

  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

export function setActiveWorkspaceId(workspaceId: number | null): void {
  if (workspaceId === null) {
    localStorage.removeItem(storageKeys.activeWorkspaceId)
    return
  }

  localStorage.setItem(storageKeys.activeWorkspaceId, String(workspaceId))
}
