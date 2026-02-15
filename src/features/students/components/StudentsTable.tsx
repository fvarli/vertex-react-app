import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation(['pages', 'common'])

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <THead>
          <tr>
            <TH>{t('pages:students.table.name')}</TH>
            <TH>{t('pages:students.table.phone')}</TH>
            <TH>{t('pages:students.table.status')}</TH>
            <TH>{t('pages:students.table.actions')}</TH>
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
                <Badge variant={student.status === 'active' ? 'success' : 'muted'}>{t(`common:${student.status}`)}</Badge>
              </TD>
              <TD>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(student)}>
                    {t('common:edit')}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => onStatus(student)}>
                    {t('pages:students.table.setStatus', {
                      status: student.status === 'active' ? t('common:passive') : t('common:active'),
                    })}
                  </Button>
                  <Button size="sm" onClick={() => onWhatsApp(student)}>
                    {t('pages:students.table.whatsapp')}
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
