import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../components/ui/button'
import { downloadReportExport } from '../api'
import type { ReportExportFormat, ReportExportType, ReportParams } from '../types'

type Props = {
  type: ReportExportType
  params: ReportParams
}

export function ReportExportButton({ type, params }: Props) {
  const { t } = useTranslation(['pages'])
  const [isOpen, setIsOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)

  async function handleExport(format: ReportExportFormat) {
    setDownloading(true)
    try {
      await downloadReportExport(type, format, params)
    } finally {
      setDownloading(false)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative inline-block">
      <Button
        variant="outline"
        size="sm"
        disabled={downloading}
        onClick={() => setIsOpen(!isOpen)}
      >
        {downloading ? t('pages:reports.export.downloading') : t('pages:reports.export.button')}
      </Button>
      {isOpen ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-50 mt-1 w-32 rounded-lg border border-border bg-card py-1 shadow-lg">
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-border/50"
              onClick={() => handleExport('csv')}
            >
              CSV
            </button>
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-border/50"
              onClick={() => handleExport('pdf')}
            >
              PDF
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
