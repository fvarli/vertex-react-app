import { describe, expect, it } from 'vitest'
import { resolvePostLoginPath } from '../features/auth/redirects'
import type { ApiUser } from '../features/auth/types'

const adminUser: ApiUser = {
  id: 1,
  name: 'Owner',
  surname: 'Admin',
  email: 'owner@vertex.local',
  system_role: 'workspace_user',
  active_workspace_role: 'owner_admin',
  permissions: [],
}

const trainerUser: ApiUser = {
  id: 2,
  name: 'Trainer',
  surname: 'User',
  email: 'trainer@vertex.local',
  system_role: 'workspace_user',
  active_workspace_role: 'trainer',
  permissions: [],
}

describe('resolvePostLoginPath', () => {
  it('keeps allowed admin from path', () => {
    expect(resolvePostLoginPath(adminUser, '/admin/dashboard')).toBe('/admin/dashboard')
  })

  it('falls back for disallowed admin from path', () => {
    expect(resolvePostLoginPath(adminUser, '/trainer/dashboard')).toBe('/admin/workspaces')
  })

  it('keeps allowed trainer from path', () => {
    expect(resolvePostLoginPath(trainerUser, '/trainer/students')).toBe('/trainer/students')
  })

  it('falls back for disallowed trainer from path', () => {
    expect(resolvePostLoginPath(trainerUser, '/admin/students')).toBe('/trainer/workspaces')
  })

  it('falls back for forbidden or login paths', () => {
    expect(resolvePostLoginPath(adminUser, '/login')).toBe('/admin/workspaces')
    expect(resolvePostLoginPath(trainerUser, '/forbidden')).toBe('/trainer/workspaces')
  })

  it('falls back for empty path', () => {
    expect(resolvePostLoginPath(adminUser, undefined)).toBe('/admin/workspaces')
    expect(resolvePostLoginPath(trainerUser, null)).toBe('/trainer/workspaces')
  })
})

