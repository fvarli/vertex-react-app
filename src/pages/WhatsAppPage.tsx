import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BulkLinksTab } from '../features/whatsapp/components/BulkLinksTab'
import { MessageTemplatesTab } from '../features/whatsapp/components/MessageTemplatesTab'

type WhatsAppTab = 'bulk-links' | 'templates'

export function WhatsAppPage() {
  const { t } = useTranslation(['pages'])
  const [activeTab, setActiveTab] = useState<WhatsAppTab>('bulk-links')

  const tabs: { key: WhatsAppTab; label: string }[] = [
    { key: 'bulk-links', label: t('pages:whatsapp.tabs.bulkLinks') },
    { key: 'templates', label: t('pages:whatsapp.tabs.templates') },
  ]

  return (
    <div className="page space-y-5 fade-in">
      <div className="panel">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">{t('pages:whatsapp.sectionLabel')}</p>
        <h2 className="text-2xl font-extrabold tracking-tight">{t('pages:whatsapp.title')}</h2>
        <p className="mt-1 text-sm text-muted">{t('pages:whatsapp.description')}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-border/50 text-muted hover:bg-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'bulk-links' ? <BulkLinksTab /> : <MessageTemplatesTab />}
    </div>
  )
}
