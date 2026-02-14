import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { TBody, TD, TH, THead, Table } from '../../../components/ui/table'
import type { Student } from '../types'

type StudentsTableProps = {
  students: Student[]
  onEdit: (student: Student) => void
  onStatus: (student: Student) => void
  onWhatsApp: (student: Student) => void
}

export function StudentsTable({ students, onEdit, onStatus, onWhatsApp }: StudentsTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <THead>
          <tr>
            <TH>Name</TH>
            <TH>Phone</TH>
            <TH>Status</TH>
            <TH>Actions</TH>
          </tr>
        </THead>
        <TBody>
          {students.map((student) => (
            <tr key={student.id}>
              <TD>
                <div className="font-medium">{student.full_name}</div>
                {student.notes ? <div className="text-xs text-muted">{student.notes}</div> : null}
              </TD>
              <TD>{student.phone}</TD>
              <TD>
                <Badge variant={student.status === 'active' ? 'success' : 'muted'}>{student.status}</Badge>
              </TD>
              <TD>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(student)}>
                    Edit
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => onStatus(student)}>
                    Set {student.status === 'active' ? 'Passive' : 'Active'}
                  </Button>
                  <Button size="sm" onClick={() => onWhatsApp(student)}>
                    WhatsApp
                  </Button>
                </div>
              </TD>
            </tr>
          ))}
        </TBody>
      </Table>
    </div>
  )
}
