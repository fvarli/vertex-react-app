import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/button'
import { Dialog } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { studentCreateSchema, type StudentCreateInput } from '../schemas'
import type { Student } from '../types'

type StudentFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  student: Student | null
  submitting: boolean
  onClose: () => void
  onSubmit: (values: StudentCreateInput) => Promise<void>
}

export function StudentFormDialog({ open, mode, student, submitting, onClose, onSubmit }: StudentFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentCreateInput>({
    resolver: zodResolver(studentCreateSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (!open) return

    reset({
      full_name: student?.full_name ?? '',
      phone: student?.phone ?? '',
      notes: student?.notes ?? '',
    })
  }, [open, student, reset])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Create Student' : 'Edit Student'}
      description="Student records are scoped to your active workspace"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit((values) => onSubmit(values))} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </>
      }
    >
      <div className="grid gap-3">
        <label className="grid gap-1 text-sm">
          Full Name
          <Input {...register('full_name')} />
          {errors.full_name ? <span className="text-xs text-danger">{errors.full_name.message}</span> : null}
        </label>

        <label className="grid gap-1 text-sm">
          Phone
          <Input {...register('phone')} />
          {errors.phone ? <span className="text-xs text-danger">{errors.phone.message}</span> : null}
        </label>

        <label className="grid gap-1 text-sm">
          Notes
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus-visible:ring-2"
          />
          {errors.notes ? <span className="text-xs text-danger">{errors.notes.message}</span> : null}
        </label>
      </div>
    </Dialog>
  )
}
