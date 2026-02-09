'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, PlusCircle, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useMyTickets } from '@/lib/queries';
import type { SupportTicket, TicketStatus } from '@/types/api';

const STATUS_BADGE: Record<TicketStatus, { label: string; className: string; icon: typeof Clock }> = {
  OPEN: { label: 'Відкрито', className: 'bg-blue-500/20 text-blue-400', icon: Clock },
  IN_PROGRESS: { label: 'В роботі', className: 'bg-yellow-500/20 text-yellow-400', icon: AlertCircle },
  RESOLVED: { label: 'Вирішено', className: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  CLOSED: { label: 'Закрито', className: 'bg-gray-500/20 text-gray-400', icon: XCircle },
};

export function SupportTickets() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyTickets(page);

  const tickets = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
          Підтримка
        </h1>
        <Link
          href="/cabinet/support/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-cta text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <PlusCircle size={16} />
          Нова заявка
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-5 bg-[var(--border-color)] rounded w-1/3 mb-2" />
              <div className="h-4 bg-[var(--border-color)] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <HelpCircle size={48} className="mx-auto text-[var(--text-secondary)] mb-4 opacity-30" />
          <p className="text-[var(--text-secondary)] mb-4">
            У вас немає заявок в підтримку
          </p>
          <Link
            href="/cabinet/support/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-cta text-white font-medium hover:opacity-90 transition-opacity"
          >
            <PlusCircle size={18} />
            Створити заявку
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket: SupportTicket) => {
            const badge = STATUS_BADGE[ticket.status];
            const Icon = badge.icon;
            return (
              <Link
                key={ticket.id}
                href={`/cabinet/support/${ticket.id}`}
                className="glass-card p-4 flex items-center justify-between hover:border-blue-bright/30 transition-colors block"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-[var(--text-primary)] truncate text-sm">
                      {ticket.subject}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${badge.className}`}>
                      <Icon size={12} />
                      {badge.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                    <span>#{ticket.id.slice(0, 8)}</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString('uk')}</span>
                    {ticket._count?.messages && (
                      <span>{ticket._count.messages} повідомлень</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

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
