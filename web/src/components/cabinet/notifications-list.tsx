'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/lib/queries';
import type { Notification } from '@/types/api';

const TYPE_ICONS: Record<string, string> = {
  LISTING_APPROVED: '✅',
  LISTING_REJECTED: '❌',
  NEW_MESSAGE: '💬',
  TICKET_REPLY: '🎫',
  REVIEW_RECEIVED: '⭐',
  SYSTEM: 'ℹ️',
};

export function NotificationsList() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useNotifications(page);
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const notifications = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const hasUnread = notifications.some((n: Notification) => !n.isRead);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading font-bold text-[var(--text-primary)]">
          Сповіщення
        </h1>
        {hasUnread && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-blue-bright hover:bg-blue-500/10 transition-colors disabled:opacity-50"
          >
            <CheckCheck size={16} />
            Прочитати все
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-5 bg-[var(--border-color)] rounded w-1/3 mb-2" />
              <div className="h-4 bg-[var(--border-color)] rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell size={48} className="mx-auto mb-4 text-[var(--text-secondary)]" />
          <p className="text-[var(--text-secondary)]">Немає сповіщень</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: Notification) => {
            const content = (
              <div className={`glass-card p-4 flex gap-4 transition-colors ${!n.isRead ? 'border-blue-bright/20 bg-blue-500/5' : ''}`}>
                <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] ?? 'ℹ️'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm ${!n.isRead ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          markReadMutation.mutate(n.id);
                        }}
                        className="text-xs text-blue-bright hover:underline flex-shrink-0"
                      >
                        Прочитати
                      </button>
                    )}
                  </div>
                  {n.body && (
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{n.body}</p>
                  )}
                  <p className="text-xs text-[var(--text-secondary)] mt-2">
                    {new Date(n.createdAt).toLocaleString('uk')}
                  </p>
                </div>
              </div>
            );

            if (n.linkUrl) {
              return (
                <Link
                  key={n.id}
                  href={n.linkUrl}
                  onClick={() => { if (!n.isRead) markReadMutation.mutate(n.id); }}
                  className="block"
                >
                  {content}
                </Link>
              );
            }

            return <div key={n.id}>{content}</div>;
          })}
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
