import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import { createStudent, getStudentWhatsappLink, listStudents, updateStudent, updateStudentStatus } from '../features/students/api'
import { StudentFormDialog } from '../features/students/components/StudentFormDialog'
import { StatusDialog } from '../features/students/components/StatusDialog'
import { StudentsTable } from '../features/students/components/StudentsTable'
import type { Student, StudentStatus } from '../features/students/types'

function isWorkspaceForbidden(error: unknown): boolean {
  if (!(error instanceof AxiosError)) return false
  return error.response?.status === 403
}

function errorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (typeof message === 'string') return message
  }

  return 'Request failed. Please try again.'
}

export function StudentsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | StudentStatus>('active')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)

  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [activeStudent, setActiveStudent] = useState<Student | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const [statusOpen, setStatusOpen] = useState(false)
  const [statusTarget, setStatusTarget] = useState<Student | null>(null)

  const [notice, setNotice] = useState<string | null>(null)
  const [errorNotice, setErrorNotice] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)

    return () => clearTimeout(timer)
  }, [searchInput])

  const queryKey = useMemo(() => ['students', { search, status, page, perPage }], [search, status, page, perPage])

  const studentsQuery = useQuery({
    queryKey,
    queryFn: () =>
      listStudents({
        search: search || undefined,
        status,
        page,
        per_page: perPage,
      }),
  })

  useEffect(() => {
    if (studentsQuery.error && isWorkspaceForbidden(studentsQuery.error)) {
      navigate('/workspaces', { replace: true })
    }
  }, [studentsQuery.error, navigate])

  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: async () => {
      setNotice('Student created successfully.')
      setErrorNotice(null)
      setFormOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: (error) => {
      if (isWorkspaceForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(errorMessage(error))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ studentId, payload }: { studentId: number; payload: Parameters<typeof updateStudent>[1] }) => updateStudent(studentId, payload),
    onSuccess: async () => {
      setNotice('Student updated successfully.')
      setErrorNotice(null)
      setFormOpen(false)
      setActiveStudent(null)
      await queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: (error) => {
      if (isWorkspaceForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(errorMessage(error))
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ studentId, nextStatus }: { studentId: number; nextStatus: StudentStatus }) =>
      updateStudentStatus(studentId, { status: nextStatus }),
    onSuccess: async () => {
      setNotice('Student status updated successfully.')
      setErrorNotice(null)
      setStatusOpen(false)
      setStatusTarget(null)
      await queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: (error) => {
      if (isWorkspaceForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(errorMessage(error))
    },
  })

  const whatsappMutation = useMutation({
    mutationFn: getStudentWhatsappLink,
    onSuccess: (url) => {
      setNotice('Opening WhatsApp link...')
      setErrorNotice(null)
      window.open(url, '_blank', 'noopener,noreferrer')
    },
    onError: (error) => {
      if (isWorkspaceForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(errorMessage(error))
    },
  })

  const pagination = studentsQuery.data
  const students = pagination?.data ?? []

  const createOrUpdateSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-white p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Students</h2>
            <p className="text-sm text-muted">Manage active/passive students in your current workspace.</p>
          </div>
          <Button
            onClick={() => {
              setFormMode('create')
              setActiveStudent(null)
              setFormOpen(true)
            }}
          >
            New Student
          </Button>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Input placeholder="Search name or phone..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as 'all' | StudentStatus)
              setPage(1)
            }}
          >
            <option value="active">Active</option>
            <option value="passive">Passive</option>
            <option value="all">All</option>
          </Select>
          <Select
            value={String(perPage)}
            onChange={(e) => {
              setPerPage(Number(e.target.value))
              setPage(1)
            }}
          >
            <option value="10">10 / page</option>
            <option value="15">15 / page</option>
            <option value="25">25 / page</option>
          </Select>
        </div>

        {notice ? <p className="mb-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</p> : null}
        {errorNotice ? <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorNotice}</p> : null}

        {studentsQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : studentsQuery.isError ? (
          <p className="text-sm text-danger">{errorMessage(studentsQuery.error)}</p>
        ) : (
          <>
            <StudentsTable
              students={students}
              onEdit={(student) => {
                setFormMode('edit')
                setActiveStudent(student)
                setFormOpen(true)
              }}
              onStatus={(student) => {
                setStatusTarget(student)
                setStatusOpen(true)
              }}
              onWhatsApp={(student) => {
                void whatsappMutation.mutateAsync(student.id)
              }}
            />

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted">
                Page {pagination?.current_page ?? 1} / {pagination?.last_page ?? 1} • Total {pagination?.total ?? 0}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(pagination?.current_page ?? 1) <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(pagination?.current_page ?? 1) >= (pagination?.last_page ?? 1)}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <StudentFormDialog
        open={formOpen}
        mode={formMode}
        student={activeStudent}
        submitting={createOrUpdateSubmitting}
        onClose={() => setFormOpen(false)}
        onSubmit={async (values) => {
          const payload = {
            full_name: values.full_name,
            phone: values.phone,
            notes: values.notes || null,
          }

          if (formMode === 'create') {
            await createMutation.mutateAsync(payload)
            return
          }

          if (!activeStudent) return
          await updateMutation.mutateAsync({ studentId: activeStudent.id, payload })
        }}
      />

      <StatusDialog
        open={statusOpen}
        status={statusTarget?.status === 'active' ? 'passive' : 'active'}
        submitting={statusMutation.isPending}
        onClose={() => setStatusOpen(false)}
        onConfirm={async () => {
          if (!statusTarget) return
          const nextStatus: StudentStatus = statusTarget.status === 'active' ? 'passive' : 'active'
          await statusMutation.mutateAsync({ studentId: statusTarget.id, nextStatus })
        }}
      />
    </div>
  )
}
