# Vertex React App — Architecture Documentation

> **Last updated:** 2026-02-23
> **Related project:** [Vertex Laravel API](https://github.com/fvarli/vertex-laravel-api/blob/main/docs/architecture.md)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Directory Structure](#3-directory-structure)
4. [Application Bootstrap Flow](#4-application-bootstrap-flow)
5. [Authentication](#5-authentication)
6. [Routing Architecture](#6-routing-architecture)
7. [State Management](#7-state-management)
8. [API Integration Layer](#8-api-integration-layer)
9. [Feature Module Structure](#9-feature-module-structure)
10. [Component Architecture](#10-component-architecture)
11. [Form Management](#11-form-management)
12. [Internationalization (i18n)](#12-internationalization-i18n)
13. [Theme System](#13-theme-system)
14. [Core User Flows](#14-core-user-flows)
15. [Testing Approach](#15-testing-approach)
16. [Adding a New Feature Guide](#16-adding-a-new-feature-guide)

---

## 1. Project Overview

**Vertex React App** is the **SPA (Single Page Application)** management panel of the Vertex platform. It consumes the Vertex Laravel API and provides two different role experiences:

- **Admin area** (`/admin/*`) — For gym owners / managers. Sees all students, trainers, appointments, and reports.
- **Trainer area** (`/trainer/*`) — For trainers. Manages only their own students and appointments.

**Key features:**
- Student, program, appointment, and reminder CRUD operations
- Recurring appointment series creation
- Calendar view with FullCalendar
- Dashboard KPIs
- WhatsApp integration
- Multi-workspace support
- Turkish / English language support
- Light / Dark / System theme support

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 19.x |
| Language | TypeScript | 5.6+ |
| Build Tool | Vite | 5.4 |
| Routing | React Router | 6.30 |
| Server State | TanStack React Query | 5.90 |
| HTTP Client | Axios | 1.13 |
| Form Management | React Hook Form | 7.71 |
| Validation | Zod | 3.24 |
| CSS | Tailwind CSS | 3.4 |
| Calendar | FullCalendar | 6.1 |
| i18n | i18next + react-i18next | 25.x |
| Push Notifications | Firebase SDK | 12.x |
| Testing | Vitest + Testing Library | 3.x |
| Package Manager | npm | 10+ |
| Node.js | — | 18.20+ |

**Key dependencies:**

```
@tanstack/react-query    — Server state management, cache, retry
react-hook-form          — Performant form management
zod                      — Schema-based validation
@fullcalendar/*          — Calendar components (month/week/day)
i18next                  — Internationalization infrastructure
tailwindcss              — Utility-first CSS
firebase                 — Push notifications (FCM)
```

---

## 3. Directory Structure

```
src/
├── app/                              # Application configuration
│   ├── router.tsx                    # React Router definitions
│   └── query-client.ts              # React Query client settings
│
├── components/                       # Shared components
│   ├── AppLayout.tsx                # Main layout (sidebar + topbar + content)
│   ├── RouteGuards.tsx              # Protected/Admin/Trainer/Workspace guard
│   ├── RoleAwareRedirect.tsx        # Role-based redirect
│   ├── LoadingScreen.tsx            # Loading screen
│   ├── LanguageToggle.tsx           # Language selector (EN/TR)
│   ├── ThemeToggle.tsx              # Theme selector (Light/Dark/System)
│   ├── useAnchoredDropdown.ts       # Dropdown positioning hook
│   └── ui/                          # Core UI components
│       ├── button.tsx               # CVA variant button
│       ├── input.tsx                # Form input
│       ├── dialog.tsx               # Modal dialog
│       ├── badge.tsx                # Status badges
│       ├── table.tsx                # Table components
│       ├── select.tsx               # Select dropdown
│       └── skeleton.tsx             # Loading skeleton
│
├── features/                         # Feature modules
│   ├── auth/                        # Authentication
│   │   ├── auth-context.tsx         # AuthProvider + useAuth hook
│   │   ├── types.ts                 # ApiUser, SystemRole, WorkspaceRole
│   │   └── redirects.ts            # Post-login redirect logic
│   ├── workspace/                   # Workspace management
│   │   ├── types.ts
│   │   └── api.ts
│   ├── students/                    # Student management
│   │   ├── types.ts
│   │   ├── api.ts
│   │   ├── schemas.ts
│   │   └── components/
│   │       ├── StudentsTable.tsx
│   │       ├── StudentFormDialog.tsx
│   │       └── StatusDialog.tsx
│   ├── trainers/                    # Trainer management
│   │   ├── types.ts
│   │   └── api.ts
│   ├── appointments/                # Appointment management
│   │   ├── types.ts
│   │   ├── api.ts
│   │   └── reminders.ts
│   ├── programs/                    # Program management
│   │   ├── types.ts
│   │   └── api.ts
│   ├── dashboard/                   # Dashboard
│   │   ├── types.ts
│   │   └── api.ts
│   └── theme/                       # Theme management
│       └── theme.ts
│
├── lib/                              # Utility libraries
│   ├── api.ts                       # Axios instance + interceptors
│   ├── api-errors.ts                # Error extraction helpers
│   ├── contracts.ts                 # ApiEnvelope type
│   ├── storage.ts                   # localStorage helpers
│   ├── requestId.ts                 # UUID generator
│   ├── query.ts                     # Query param helpers
│   └── utils.ts                     # cn() (clsx + tailwind-merge)
│
├── i18n/                             # Internationalization
│   ├── index.ts                     # i18next configuration
│   └── resources/
│       ├── en/                      # English
│       │   ├── common.json
│       │   ├── layout.json
│       │   ├── auth.json
│       │   └── pages.json
│       └── tr/                      # Turkish
│           ├── common.json
│           ├── layout.json
│           ├── auth.json
│           └── pages.json
│
├── pages/                            # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── StudentsPage.tsx
│   ├── TrainersPage.tsx
│   ├── ProgramsPage.tsx
│   ├── AppointmentsPage.tsx
│   ├── RemindersPage.tsx
│   ├── CalendarPage.tsx
│   ├── WorkspacePage.tsx
│   ├── DocumentationPage.tsx
│   ├── ForbiddenPage.tsx
│   └── NotFoundPage.tsx
│
├── test/                             # Test infrastructure
│   └── setup.ts
│
├── main.tsx                          # Application entry point
├── index.css                         # Global styles + theme variables
└── vite-env.d.ts                     # Vite type definitions
```

---

## 4. Application Bootstrap Flow

```
main.tsx
   │
   ├── 1. initTheme()                  ← Load theme from localStorage, set <html> class
   │
   ├── 2. import './i18n'              ← Initialize i18next, detect language
   │
   ├── 3. import './index.css'         ← Tailwind + CSS variables
   │
   └── 4. createRoot().render()
           │
           ├── <StrictMode>
           │   ├── <QueryClientProvider>    ← React Query cache
           │   │   └── <AuthProvider>       ← Auth context (token, user)
           │   │       └── <RouterProvider> ← React Router
           │   │           └── Route tree
```

**Source code:**

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './features/auth/auth-context'
import { queryClient } from './app/query-client'
import { router } from './app/router'
import { initTheme } from './features/theme/theme'
import './i18n'
import './index.css'

initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
```

**Provider order matters:**

| Order | Provider | Reason |
|-------|----------|--------|
| 1 | `QueryClientProvider` | All API calls depend on this |
| 2 | `AuthProvider` | Uses API client for token management |
| 3 | `RouterProvider` | Route guards depend on auth state |

---

## 5. Authentication

### 5.1 Auth Context

```tsx
// src/features/auth/auth-context.tsx
type AuthContextValue = {
  user: ApiUser | null          // Logged-in user
  token: string | null          // Bearer token
  isReady: boolean              // Bootstrap completed?
  isAuthenticated: boolean      // Token exists?
  systemRole: SystemRole | null // platform_admin | workspace_user
  workspaceRole: WorkspaceRole  // owner_admin | trainer | null
  isAdminArea: boolean          // Has admin area access?
  login: (payload) => Promise<ApiUser>
  logout: () => Promise<void>
  refreshProfile: () => Promise<ApiUser | null>
}
```

### 5.2 Bootstrap Process

```
Application started
       │
       ▼
  Token in localStorage?
       │
  ┌────┴────┐
  │ No      │ Yes
  ▼         ▼
isReady=  GET /me
true      (fetch profile)
          │
     ┌────┴────┐
     │ Success │ Error
     ▼          ▼
   user=data  delete token
   isReady=   user=null
   true       isReady=true
```

### 5.3 Token Refresh

Automatic token refresh is triggered when a 401 response is received:

```
Request → 401 response
          │
          ▼
    Auth endpoint? ──── Yes ──→ Reject (loop prevention)
          │
         No
          │
          ▼
    Already retried? ── Yes ──→ Reject
          │
         No
          │
          ▼
    POST /refresh-token
          │
     ┌────┴────┐
     │ Success │ Error
     ▼          ▼
   Retry with  AUTH_EXPIRED_EVENT
   new token   → Redirect to login
```

**AUTH_EXPIRED_EVENT:** A custom window event. Fired when token refresh fails, causing `AuthProvider` to reset state.

```typescript
// src/lib/api.ts
export const AUTH_EXPIRED_EVENT = 'vertex:auth:expired'

// When refresh fails:
window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
```

### 5.4 Role Resolution

```typescript
// Inside AuthProvider
const systemRole = user?.system_role ?? null
const workspaceRole = user?.active_workspace_role ?? null
const isAdminArea = systemRole === 'platform_admin' || workspaceRole === 'owner_admin'
```

| system_role | active_workspace_role | isAdminArea | Access Area |
|------------|----------------------|-------------|------------|
| `platform_admin` | any | `true` | `/admin/*` |
| `workspace_user` | `owner_admin` | `true` | `/admin/*` |
| `workspace_user` | `trainer` | `false` | `/trainer/*` |

---

## 6. Routing Architecture

### 6.1 Route Tree

```
/login                         ← Public
│
├── / (ProtectedRoute)         ← Auth required
│   │
│   ├── (AdminRoute)           ← isAdminArea === true
│   │   └── (AppLayout area="admin")
│   │       ├── /admin/workspaces        ← Workspace selection
│   │       ├── /admin/documentation     ← Help
│   │       └── (WorkspaceRoute)         ← Active workspace required
│   │           ├── /admin/dashboard
│   │           ├── /admin/trainers      ← Admin only
│   │           ├── /admin/students
│   │           ├── /admin/programs
│   │           ├── /admin/appointments
│   │           ├── /admin/reminders
│   │           └── /admin/calendar
│   │
│   ├── (TrainerRoute)         ← isAdminArea === false
│   │   └── (AppLayout area="trainer")
│   │       ├── /trainer/workspaces
│   │       ├── /trainer/documentation
│   │       └── (WorkspaceRoute)
│   │           ├── /trainer/dashboard
│   │           ├── /trainer/students
│   │           ├── /trainer/programs
│   │           ├── /trainer/appointments
│   │           ├── /trainer/reminders
│   │           └── /trainer/calendar
│   │
│   ├── / → RoleAwareRedirect → /admin/workspaces or /trainer/workspaces
│   ├── /dashboard → RoleAwareRedirect
│   ├── /students → RoleAwareRedirect
│   ├── ... (other shortcuts)
│   └── /forbidden             ← 403 page
│
└── /* → NotFoundPage          ← 404 page
```

### 6.2 Route Guards

```tsx
// src/components/RouteGuards.tsx

// 1. Authentication check
export function ProtectedRoute() {
  const { isReady, isAuthenticated } = useAuth()
  if (!isReady) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

// 2. Admin access check
export function AdminRoute() {
  const { isAdminArea } = useAuth()
  if (!isAdminArea) return <Navigate to="/forbidden" replace />
  return <Outlet />
}

// 3. Trainer access check (not admin)
export function TrainerRoute() {
  const { isAdminArea } = useAuth()
  if (isAdminArea) return <Navigate to="/forbidden" replace />
  return <Outlet />
}

// 4. Workspace selection check
export function WorkspaceRoute({ area }: { area: 'admin' | 'trainer' }) {
  const workspaceId = getActiveWorkspaceId()
  if (!workspaceId) return <Navigate to={`/${area}/workspaces`} replace />
  return <Outlet />
}
```

**Guard chain order:** `ProtectedRoute` → `AdminRoute`/`TrainerRoute` → `WorkspaceRoute`

### 6.3 RoleAwareRedirect

Redirects role-agnostic shortcut URLs (e.g., `/students`) to the correct area:

```tsx
// / → /admin/workspaces (if admin) or /trainer/workspaces (if trainer)
<RoleAwareRedirect
  adminPath="/admin/workspaces"
  trainerPath="/trainer/workspaces"
/>
```

---

## 7. State Management

Vertex uses a three-layer state management strategy:

```
┌─────────────────────────────────────────┐
│       React Query (Server State)        │
│                                         │
│  All data from the API lives here      │
│  Cache, retry, invalidation, refetch   │
│  → students, appointments, programs... │
└───────────────────┬─────────────────────┘
                    │
┌───────────────────┼─────────────────────┐
│     Context API (Application State)     │
│                                         │
│  Auth state: user, token, role          │
│  → AuthProvider                         │
└───────────────────┬─────────────────────┘
                    │
┌───────────────────┼─────────────────────┐
│     localStorage (Persistent State)     │
│                                         │
│  vertex_access_token                    │
│  vertex_active_workspace_id             │
│  vertex_theme_mode                      │
│  vertex_locale (managed by i18next)     │
└─────────────────────────────────────────┘
```

### 7.1 React Query Configuration

```typescript
// src/app/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status
        // 4xx errors → don't retry (client error)
        if (status && status >= 400 && status < 500) return false
        // 5xx errors → max 2 retries
        return failureCount < 2
      },
      refetchOnWindowFocus: false,   // Don't refetch on tab switch
    },
  },
})
```

### 7.2 localStorage Keys

```typescript
// src/lib/storage.ts
export const storageKeys = {
  token:             'vertex_access_token',
  activeWorkspaceId: 'vertex_active_workspace_id',
  themeMode:         'vertex_theme_mode',
}
// Managed by i18next: 'vertex_locale'
```

---

## 8. API Integration Layer

### 8.1 Axios Instance

```typescript
// src/lib/api.ts
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1',
  headers: { Accept: 'application/json' },
})
```

### 8.2 Request Interceptor

Every request automatically receives these headers:

```
Authorization: Bearer <token>     ← From localStorage
X-Request-Id: <uuid>              ← Unique per request
Accept: application/json          ← Default
```

```typescript
api.interceptors.request.use((config) => {
  config.headers.set('X-Request-Id', generateRequestId())
  const token = getToken()
  setAuthHeader(config, token)
  return config
})
```

### 8.3 Response Interceptor

Automatic token refresh on 401 responses:

```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 401 + first attempt + not auth endpoint → refresh token
    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint(url)) {
      original._retry = true
      const token = await refreshToken()
      if (token) {
        setAuthHeader(original, token)
        return api.request(original)   // Retry original request
      }
    }
    return Promise.reject(error)
  },
)
```

**Concurrent refresh protection:** When multiple 401 responses arrive simultaneously, only one refresh request is sent:

```typescript
let refreshInFlight: Promise<string | null> | null = null

async function refreshToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      // ... refresh logic
    })()
  }
  return refreshInFlight  // Share the same promise
}
```

### 8.4 ApiEnvelope Type

All responses from the backend follow this envelope format:

```typescript
// src/lib/contracts.ts
export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  request_id?: string
  meta?: Record<string, unknown>
  links?: Record<string, unknown>
}
```

### 8.5 Error Helpers

```typescript
// src/lib/api-errors.ts
extractApiMessage(error, fallback)    // Extract API error message
isForbidden(error)                    // Is 403?
isValidationError(error)              // Is 422?
extractValidationErrors(error)        // { field: ["error"] } format
```

---

## 9. Feature Module Structure

Each feature module is a self-contained structure under `src/features/<module>/`.

### 9.1 Standard Module Template

```
features/<module>/
├── types.ts           # TypeScript type definitions
├── api.ts             # API call functions
├── schemas.ts         # Zod validation schemas (optional)
└── components/        # Module-specific components (optional)
    ├── <ModuleName>Table.tsx
    ├── <ModuleName>FormDialog.tsx
    └── StatusDialog.tsx
```

### 9.2 Example: Students Module

**types.ts — Type definitions:**

```typescript
// src/features/students/types.ts
export type StudentStatus = 'active' | 'passive'

export type Student = {
  id: number
  workspace_id: number
  trainer_user_id: number
  full_name: string
  phone: string
  notes: string | null
  status: StudentStatus
  created_at: string
  updated_at: string
}

export type Paginated<T> = {
  data: T[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export type StudentListParams = {
  search?: string
  status?: StudentStatus | 'all'
  page?: number
  per_page?: number
  sort?: 'id' | 'full_name' | 'status' | 'created_at'
  direction?: 'asc' | 'desc'
}
```

**api.ts — API functions:**

```typescript
// src/features/students/api.ts
import { api } from '../../lib/api'
import type { ApiEnvelope } from '../../lib/contracts'

export async function listStudents(params: StudentListParams): Promise<Paginated<Student>> {
  const response = await api.get<ApiEnvelope<Paginated<Student>>>('/students', { params })
  return response.data.data
}

export async function createStudent(payload: StudentPayload): Promise<Student> {
  const response = await api.post<ApiEnvelope<Student>>('/students', payload)
  return response.data.data
}

export async function updateStudent(studentId: number, payload: UpdateStudentPayload): Promise<Student> {
  const response = await api.put<ApiEnvelope<Student>>(`/students/${studentId}`, payload)
  return response.data.data
}
```

**schemas.ts — Validation schemas:**

```typescript
// src/features/students/schemas.ts
import { z } from 'zod'

export const studentCreateSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  phone: z.string().trim().min(8, 'Phone is too short').max(32),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
})

export const studentUpdateSchema = studentCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'At least one field must be updated' },
)
```

### 9.3 Existing Feature Modules

| Module | File Count | Content |
|--------|-----------|---------|
| `auth` | 3 | AuthProvider, types, redirect logic |
| `workspace` | 2 | Workspace API and types |
| `students` | 6 | CRUD + timeline + table/form/status components |
| `trainers` | 2 | Trainer list and creation |
| `appointments` | 3 | Appointment CRUD + series + reminder API |
| `programs` | 2 | Program CRUD + template |
| `dashboard` | 2 | Dashboard KPI data |
| `reports` | 2 | Report tabs + export |
| `whatsapp` | 3 | WhatsApp API + BulkLinksTab + message templates |
| `devices` | 2 | Device token API + types |
| `notifications` | 2 | Notification API + bell component |
| `profile` | 2 | Profile API + password |
| `toast` | 1 | Global toast notifications |
| `theme` | 1 | Theme resolution and application |

---

## 10. Component Architecture

Vertex uses a three-layer component hierarchy:

```
┌─────────────────────────────────────┐
│  Page Components (Pages)            │
│                                     │
│  StudentsPage, DashboardPage, ...   │
│  → Bound to route, fetches data    │
│  → Uses feature components         │
└───────────────┬─────────────────────┘
                │ uses
┌───────────────┼─────────────────────┐
│  Feature Components                  │
│                                     │
│  StudentsTable, StudentFormDialog   │
│  → Contains business logic         │
│  → Uses UI components              │
└───────────────┬─────────────────────┘
                │ uses
┌───────────────┼─────────────────────┐
│  UI Components (components/ui/)      │
│                                     │
│  Button, Input, Dialog, Table, ...  │
│  → No business logic, pure display │
│  → Styled with Tailwind + CVA      │
└─────────────────────────────────────┘
```

### 10.1 UI Components (`components/ui/`)

Shadcn/ui style, with variant support via `class-variance-authority`:

| Component | File | Variants |
|-----------|------|----------|
| `Button` | `button.tsx` | default, outline, ghost, danger; sm, md, lg |
| `Input` | `input.tsx` | Standard form input |
| `Dialog` | `dialog.tsx` | Modal overlay |
| `Badge` | `badge.tsx` | Status labels (success, warning, danger) |
| `Table` | `table.tsx` | Table, TableHeader, TableBody, TableRow, TableCell |
| `Select` | `select.tsx` | Native select wrapper |
| `Skeleton` | `skeleton.tsx` | Loading skeleton |

### 10.2 Layout Component

`AppLayout` is the main application shell:

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  ┌──────────┐  ┌──────────────────────────────┐  │
│  │ Sidebar  │  │ Topbar                       │  │
│  │          │  │ [Menu] Area | Name | EN | 🌙 │  │
│  │ Vertex   │  ├──────────────────────────────┤  │
│  │ Platform │  │                              │  │
│  │          │  │        Content               │  │
│  │ Dashboard│  │       (Outlet)               │  │
│  │ Students │  │                              │  │
│  │ Programs │  │   ┌──────────────────────┐   │  │
│  │ Appts    │  │   │   Page Component     │   │  │
│  │ Reminders│  │   │   (from router)      │   │  │
│  │ Calendar │  │   └──────────────────────┘   │  │
│  │ Workspaces│ │                              │  │
│  │          │  │                              │  │
│  │ ──────── │  │                              │  │
│  │ User Card│  │                              │  │
│  └──────────┘  └──────────────────────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Mobile:** Sidebar opens as a drawer with a backdrop overlay. Closes with ESC key and outside click.

---

## 11. Form Management

### 11.1 Libraries Used

```
React Hook Form  →  Form state management, performance
Zod              →  Schema-based validation
@hookform/resolvers/zod  →  Zod ↔ RHF integration
```

### 11.2 Form + Dialog Pattern

In Vertex, forms are typically presented inside dialogs (modals):

```tsx
// Typical usage pattern
function StudentFormDialog({ student, open, onClose }) {
  const { t } = useTranslation(['pages'])

  const form = useForm<StudentCreateInput>({
    resolver: zodResolver(studentCreateSchema),
    defaultValues: student ?? { full_name: '', phone: '', notes: '' },
  })

  const mutation = useMutation({
    mutationFn: student
      ? (data) => updateStudent(student.id, data)
      : createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      onClose()
    },
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
        <Input {...form.register('full_name')} error={form.formState.errors.full_name} />
        <Input {...form.register('phone')} error={form.formState.errors.phone} />
        <Button type="submit" disabled={mutation.isPending}>
          {t('pages:students.form.save')}
        </Button>
      </form>
    </Dialog>
  )
}
```

### 11.3 Mutation + Invalidation Flow

```
Form submit
     │
     ▼
Zod validation
     │
  ┌──┴──┐
  │Error │ Valid
  ▼      ▼
Field  mutation.mutate()
error    │
         ▼
    API request (POST/PUT)
         │
    ┌────┴────┐
    │ Success │ Error
    ▼          ▼
invalidate  extractApiMessage()
Queries     → Show toast
  │
  ▼
Automatically
refetch list
```

---

## 12. Internationalization (i18n)

### 12.1 Configuration

```typescript
// src/i18n/index.ts
i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: { en: {...}, tr: {...} },
  fallbackLng: 'tr',                    // Default: Turkish
  supportedLngs: ['tr', 'en'],
  defaultNS: 'common',
  ns: ['common', 'layout', 'auth', 'pages'],
  detection: {
    order: ['localStorage', 'navigator'],
    lookupLocalStorage: 'vertex_locale',
    caches: ['localStorage'],
  },
})
```

### 12.2 Namespaces

| Namespace | File | Content |
|-----------|------|---------|
| `common` | `common.json` | General terms (save, cancel, delete, error messages) |
| `layout` | `layout.json` | Menu items, app name, area labels |
| `auth` | `auth.json` | Login form, error messages |
| `pages` | `pages.json` | All page content (table headers, form labels, etc.) |

### 12.3 Language Detection Order

```
1. localStorage ('vertex_locale')  → User's previous preference
2. navigator.language              → Browser language
3. fallbackLng                     → 'tr' (Turkish)
```

### 12.4 Usage

```tsx
// Inside a component
const { t } = useTranslation(['pages', 'common'])

// With namespace prefix
t('pages:students.table.name')       // "Ad Soyad" or "Name"
t('common:actions.save')             // "Kaydet" or "Save"
t('layout:menu.dashboard')           // "Kontrol Paneli" or "Dashboard"

// With parameter
t('pages:appointments.series.created', { generated: 5 })
// "Series created. Generated: 5"
```

---

## 13. Theme System

### 13.1 Supported Modes

| Mode | Description |
|------|-------------|
| `light` | Light theme |
| `dark` | Dark theme |
| `system` | Follow OS preference |

### 13.2 Theme Resolution

```typescript
// src/features/theme/theme.ts
export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'light' || mode === 'dark') return mode
  // 'system' → check prefers-color-scheme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyThemeToDocument(theme: ResolvedTheme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
```

### 13.3 CSS Variables

```css
/* src/index.css */
:root {
  --background:          245 247 252;    /* Light blue */
  --foreground:          21 26 48;       /* Dark blue */
  --primary:             38 82 255;      /* Bright blue */
  --success:             20 137 95;      /* Green */
  --danger:              198 48 48;      /* Red */
  --sidebar:             17 24 39;       /* Dark slate */
  --sidebar-foreground:  255 255 255;
  /* ... */
}

.dark {
  --background:          15 18 30;       /* Very dark blue */
  --foreground:          230 234 245;    /* Light gray */
  /* ... all variables dark variant */
}
```

### 13.4 Tailwind Integration

```html
<!-- Blue in light mode, dark background in dark mode -->
<div className="bg-background text-foreground">

<!-- Dark mode specific class -->
<div className="border-border dark:border-border/50">
```

### 13.5 localStorage Persistence

```typescript
// src/lib/storage.ts
export function getThemeMode(): ThemeMode {
  const raw = localStorage.getItem('vertex_theme_mode')
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  return 'system'  // Default
}
```

---

## 14. Core User Flows

### 14.1 Login → Workspace Selection → Dashboard

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐     ┌───────────┐
│ /login   │────>│ POST /login  │────>│ /admin/     │────>│ /admin/   │
│          │     │              │     │ workspaces  │     │ dashboard │
│ Email +  │     │ Returns token│     │             │     │           │
│ Password │     │ Returns user │     │ Select/     │     │ KPIs      │
│          │     │              │     │ create ws   │     │ displayed │
└──────────┘     └──────────────┘     └─────────────┘     └───────────┘

Flow detail:
1. User enters email + password
2. POST /login → { user, token }
3. Token is saved to localStorage
4. isAdminArea is computed (based on role)
5. RoleAwareRedirect → /admin/workspaces or /trainer/workspaces
6. User selects workspace → active_workspace_id is updated
7. WorkspaceRoute passes → Dashboard is displayed
```

### 14.2 Student CRUD

```
StudentsPage
     │
     ├── useQuery(['students', params])      ← Fetch list
     │       │
     │       ▼
     │   StudentsTable                        ← Display table
     │       │
     │       ├── "New Student" button
     │       │       │
     │       │       ▼
     │       │   StudentFormDialog (create)
     │       │       │
     │       │       └── useMutation → POST /students
     │       │               │
     │       │               └── invalidateQueries(['students'])
     │       │
     │       ├── Row edit button
     │       │       │
     │       │       ▼
     │       │   StudentFormDialog (edit)
     │       │       │
     │       │       └── useMutation → PUT /students/{id}
     │       │
     │       └── Change status button
     │               │
     │               ▼
     │           StatusDialog
     │               │
     │               └── useMutation → PATCH /students/{id}/status
     │
     └── Pagination → params.page changes → automatic refetch
```

### 14.3 Appointment Creation

```
AppointmentsPage
     │
     ├── New appointment form
     │       │
     │       ├── Select student (dropdown)
     │       ├── Select date/time
     │       ├── Enter location
     │       │
     │       └── Submit
     │             │
     │             ▼
     │         POST /appointments
     │         Header: Idempotency-Key: <uuid>
     │             │
     │        ┌────┴────┐
     │        │201      │409/422
     │        ▼         ▼
     │    Success    Conflict error
     │    Toast      or validation
     │               error shown
     │
     └── invalidateQueries(['appointments'])
```

### 14.4 Workspace Switching

```
WorkspacePage
     │
     ├── GET /me/workspaces              ← Fetch workspace list
     │       │
     │       ▼
     │   Display workspace cards
     │       │
     │       └── "Select" button
     │               │
     │               ▼
     │           POST /workspaces/{id}/switch
     │               │
     │               ▼
     │           setActiveWorkspaceId(id)  ← Update localStorage
     │           refreshProfile()          ← Refresh profile (new role)
     │               │
     │               ▼
     │           Redirect to dashboard
```

---

## 15. Testing Approach

### 15.1 Test Infrastructure

| Tool | Usage |
|------|-------|
| Vitest | Test runner, assertions |
| @testing-library/react | Component render + query |
| @testing-library/user-event | User interaction simulation |
| jsdom | DOM environment |

### 15.2 Test Configuration

```typescript
// vite.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

### 15.3 Running Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Single file
npx vitest run src/features/students/__tests__/api.test.ts
```

### 15.4 Test Conventions

- Test files are in `__tests__/` directories or have `*.test.ts(x)` extension
- Every test should be isolated (mock API, render cleanup)
- API calls are mocked (MSW or vi.mock)
- Write tests from user perspective (query by aria-label, text content)

---

## 16. Adding a New Feature Guide

Steps to follow when adding a new feature module (e.g., "Payments"):

### Step 1: Create Feature Module

```
src/features/payments/
├── types.ts
├── api.ts
├── schemas.ts
└── components/
    ├── PaymentsTable.tsx
    └── PaymentFormDialog.tsx
```

### Step 2: Define Types

```typescript
// src/features/payments/types.ts
export type PaymentStatus = 'pending' | 'completed' | 'refunded'

export type Payment = {
  id: number
  workspace_id: number
  student_id: number
  amount: number
  status: PaymentStatus
  created_at: string
  updated_at: string
}
```

### Step 3: Write API Functions

```typescript
// src/features/payments/api.ts
import { api } from '../../lib/api'
import type { ApiEnvelope } from '../../lib/contracts'
import type { Paginated } from '../students/types'  // Shared type
import type { Payment } from './types'

export async function listPayments(params: Record<string, unknown>): Promise<Paginated<Payment>> {
  const response = await api.get<ApiEnvelope<Paginated<Payment>>>('/payments', { params })
  return response.data.data
}

export async function createPayment(payload: { student_id: number; amount: number }): Promise<Payment> {
  const response = await api.post<ApiEnvelope<Payment>>('/payments', payload)
  return response.data.data
}
```

### Step 4: Create Zod Schema

```typescript
// src/features/payments/schemas.ts
import { z } from 'zod'

export const paymentCreateSchema = z.object({
  student_id: z.number().int().positive(),
  amount: z.number().positive('Amount must be positive'),
})

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>
```

### Step 5: Create Page Component

```typescript
// src/pages/PaymentsPage.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { listPayments, createPayment } from '../features/payments/api'

export function PaymentsPage() {
  const { t } = useTranslation(['pages'])
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['payments', { page: 1 }],
    queryFn: () => listPayments({ page: 1 }),
  })

  const createMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  })

  // ... render
}
```

### Step 6: Add Route

```tsx
// src/app/router.tsx

// Add to admin children
{ path: '/admin/payments', element: <PaymentsPage /> },

// Add to trainer children (if needed)
{ path: '/trainer/payments', element: <PaymentsPage /> },

// Add shortcut redirect
{ path: '/payments', element: <RoleAwareRedirect adminPath="/admin/payments" trainerPath="/trainer/payments" /> },
```

### Step 7: Add to Navigation

```tsx
// src/components/AppLayout.tsx — Inside renderNavLinks
<NavLink to={`${base}/payments`} onClick={onNavigate}>
  {t('layout:menu.payments')}
</NavLink>
```

### Step 8: Add i18n Translations

```json
// src/i18n/resources/en/pages.json
{
  "payments": {
    "title": "Payments",
    "table": {
      "amount": "Amount",
      "status": "Status"
    },
    "form": {
      "create": "New Payment",
      "student": "Student",
      "amount": "Amount"
    }
  }
}

// src/i18n/resources/tr/pages.json
{
  "payments": {
    "title": "Ödemeler",
    "table": {
      "amount": "Tutar",
      "status": "Durum"
    },
    "form": {
      "create": "Yeni Ödeme",
      "student": "Öğrenci",
      "amount": "Tutar"
    }
  }
}
```

```json
// src/i18n/resources/en/layout.json — Add to menu
{ "menu": { "payments": "Payments" } }

// src/i18n/resources/tr/layout.json
{ "menu": { "payments": "Ödemeler" } }
```

### Step 9: Write Tests

```typescript
// src/features/payments/__tests__/api.test.ts
import { describe, it, expect, vi } from 'vitest'

describe('payments api', () => {
  it('lists payments', async () => {
    // Mock api.get
    // Call listPayments
    // Assert response shape
  })
})
```

### Checklist

- [ ] `features/payments/types.ts` — Types defined
- [ ] `features/payments/api.ts` — API functions written
- [ ] `features/payments/schemas.ts` — Zod schemas created
- [ ] `features/payments/components/` — Table and form components
- [ ] `pages/PaymentsPage.tsx` — Page component
- [ ] `app/router.tsx` — Route added (admin + trainer + shortcut)
- [ ] `components/AppLayout.tsx` — Navigation link added
- [ ] `i18n/resources/en/pages.json` — English translations
- [ ] `i18n/resources/tr/pages.json` — Turkish translations
- [ ] `i18n/resources/en/layout.json` — Menu translation (EN)
- [ ] `i18n/resources/tr/layout.json` — Menu translation (TR)
- [ ] Tests written and passing
- [ ] `npm run typecheck` no errors
- [ ] `npm run lint` no errors
- [ ] Backend API endpoint exists (see [Laravel API architecture.md](https://github.com/fvarli/vertex-laravel-api/blob/main/docs/architecture.md))

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000/api/v1` | Backend API base URL |
| `VITE_FIREBASE_API_KEY` | — | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | — | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | — | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | — | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | — | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | — | Firebase app ID |
| `VITE_FIREBASE_VAPID_KEY` | — | Firebase VAPID key for web push |

## Build and Development Commands

```bash
npm run dev           # Development server (localhost:5173)
npm run dev:https     # HTTPS development server
npm run build         # TypeScript build + Vite production build
npm run typecheck     # Type checking only
npm run lint          # ESLint validation
npm run test          # Vitest
npm run test:watch    # Watch mode testing
npm run format        # Prettier format check
npm run preview       # Production build preview
```
