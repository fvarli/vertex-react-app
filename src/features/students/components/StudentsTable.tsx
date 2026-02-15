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
    <div>
      <div className="grid gap-3 md:hidden">
        {students.map((student) => (
          <div key={student.id} className="rounded-xl border border-border/70 bg-card/75 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">{student.full_name}</p>
                <p className="text-xs text-muted">{student.phone}</p>
              </div>
              <Badge variant={student.status === 'active' ? 'success' : 'muted'}>{t(`common:${student.status}`)}</Badge>
            </div>

            {student.notes ? <p className="mt-2 text-xs text-muted">{student.notes}</p> : null}

            <div className="mt-3 grid grid-cols-1 gap-2">
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
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
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
    </div>
  )
}
