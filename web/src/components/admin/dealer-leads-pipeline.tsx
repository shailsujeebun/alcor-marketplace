'use client';

import { useState } from 'react';
import { ChevronRight, User, Mail, Phone, Globe, MapPin, MessageSquare } from 'lucide-react';
import { useDealerLeads, useUpdateDealerLead } from '@/lib/queries';
import type { DealerLead, DealerLeadStatus } from '@/types/api';

const PIPELINE_STAGES: { label: string; value: DealerLeadStatus }[] = [
  { label: 'Нові', value: 'NEW' },
  { label: 'Зв\'язалися', value: 'CONTACTED' },
  { label: 'Кваліфіковані', value: 'QUALIFIED' },
  { label: 'Обрано пакет', value: 'PACKAGE_SELECTED' },
  { label: 'Конвертовані', value: 'CONVERTED' },
  { label: 'Відхилені', value: 'REJECTED' },
];

const STATUS_COLORS: Record<DealerLeadStatus, string> = {
  NEW: 'border-blue-500/30',
  CONTACTED: 'border-yellow-500/30',
  QUALIFIED: 'border-purple-500/30',
  PACKAGE_SELECTED: 'border-orange-500/30',
  CONVERTED: 'border-green-500/30',
  REJECTED: 'border-red-500/30',
};

const NEXT_STATUS: Partial<Record<DealerLeadStatus, DealerLeadStatus>> = {
  NEW: 'CONTACTED',
  CONTACTED: 'QUALIFIED',
  QUALIFIED: 'PACKAGE_SELECTED',
  PACKAGE_SELECTED: 'CONVERTED',
};

export function DealerLeadsPipeline() {
  const [activeStage, setActiveStage] = useState<DealerLeadStatus>('NEW');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useDealerLeads({
    status: activeStage,
    page: String(page),
    limit: '20',
  });

  const updateMutation = useUpdateDealerLead();

  const leads = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  const handleAdvance = (lead: DealerLead) => {
    const nextStatus = NEXT_STATUS[lead.status];
    if (!nextStatus) return;
    updateMutation.mutate({ id: lead.id, data: { status: nextStatus } });
  };

  const handleReject = (id: string) => {
    updateMutation.mutate({ id, data: { status: 'REJECTED' } });
  };

  const handleSaveNotes = (id: string) => {
    updateMutation.mutate(
      { id, data: { notes } },
      { onSuccess: () => { setSelectedLead(null); setNotes(''); } },
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-[var(--text-primary)] mb-6">
        Заявки дилерів
      </h1>

      {/* Pipeline Stages */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {PIPELINE_STAGES.map((stage) => (
          <button
            key={stage.value}
            onClick={() => { setActiveStage(stage.value); setPage(1); setSelectedLead(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeStage === stage.value
                ? 'gradient-cta text-white'
                : 'glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {stage.label}
          </button>
        ))}
      </div>

      {/* Leads List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-5 bg-[var(--border-color)] rounded w-1/3 mb-2" />
              <div className="h-4 bg-[var(--border-color)] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-[var(--text-secondary)]">Немає заявок з цим статусом</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead: DealerLead) => (
            <div
              key={lead.id}
              className={`glass-card p-5 border-l-4 ${STATUS_COLORS[lead.status]}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--text-primary)] text-lg mb-2">
                    {lead.companyName}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[var(--text-secondary)]">
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      <span>{lead.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} />
                      <span>{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} />
                      <span>{lead.phone}</span>
                    </div>
                    {lead.website && (
                      <div className="flex items-center gap-2">
                        <Globe size={14} />
                        <span className="truncate">{lead.website}</span>
                      </div>
                    )}
                    {(lead.country || lead.city) && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>
                          {[lead.city?.name, lead.country?.name].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {lead.activityTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {lead.activityTypes.map((at) => (
                        <span
                          key={at}
                          className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-400"
                        >
                          {at}
                        </span>
                      ))}
                    </div>
                  )}

                  {lead.brands.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {lead.brands.map((b) => (
                        <span
                          key={b}
                          className="px-2 py-0.5 rounded-full text-xs bg-orange-500/10 text-orange-400"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}

                  {lead.message && (
                    <p className="mt-3 text-sm text-[var(--text-secondary)] italic">
                      &quot;{lead.message}&quot;
                    </p>
                  )}

                  {lead.notes && (
                    <div className="mt-3 p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]">
                      <p className="text-xs text-[var(--text-secondary)] mb-1">Нотатки:</p>
                      <p className="text-sm text-[var(--text-primary)]">{lead.notes}</p>
                    </div>
                  )}

                  <p className="text-xs text-[var(--text-secondary)] mt-3">
                    Подано: {new Date(lead.createdAt).toLocaleDateString('uk')}
                    {lead.assignedToUser && (
                      <> | Відповідальний: {lead.assignedToUser.firstName || lead.assignedToUser.email}</>
                    )}
                  </p>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {NEXT_STATUS[lead.status] && (
                    <button
                      onClick={() => handleAdvance(lead)}
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg gradient-cta text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <ChevronRight size={16} />
                      Далі
                    </button>
                  )}
                  {lead.status !== 'CONVERTED' && lead.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleReject(lead.id)}
                      disabled={updateMutation.isPending}
                      className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                      Відхилити
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedLead(selectedLead === lead.id ? null : lead.id); setNotes(lead.notes ?? ''); }}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] text-sm hover:text-[var(--text-primary)] hover:border-blue-bright/40 transition-colors"
                  >
                    <MessageSquare size={14} />
                    Нотатки
                  </button>
                </div>
              </div>

              {/* Notes editor */}
              {selectedLead === lead.id && (
                <div className="mt-4 flex gap-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Додати нотатку..."
                    rows={2}
                    className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:border-blue-bright outline-none resize-none"
                  />
                  <button
                    onClick={() => handleSaveNotes(lead.id)}
                    disabled={updateMutation.isPending}
                    className="px-4 py-2 rounded-lg gradient-cta text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity self-end"
                  >
                    Зберегти
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                page === p
                  ? 'gradient-cta text-white'
                  : 'glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
