'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useNotificationUnreadCount, useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/lib/queries';
import type { Notification } from '@/types/api';

const TYPE_ICONS: Record<string, string> = {
  LISTING_APPROVED: '✅',
  LISTING_REJECTED: '❌',
  NEW_MESSAGE: '💬',
  TICKET_REPLY: '🎫',
  REVIEW_RECEIVED: '⭐',
  SYSTEM: 'ℹ️',
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: unreadData } = useNotificationUnreadCount();
  const { data: notificationsData } = useNotifications(1);
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const unreadCount = unreadData?.count ?? 0;
  const notifications = notificationsData?.data ?? [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 glass-card border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
            <h3 className="font-heading font-bold text-sm text-[var(--text-primary)]">
              Сповіщення
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                className="text-xs text-blue-bright hover:underline"
              >
                Прочитати все
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[var(--text-secondary)]">
                Немає сповіщень
              </div>
            ) : (
              notifications.slice(0, 10).map((n: Notification) => (
                <div key={n.id}>
                  {n.linkUrl ? (
                    <Link
                      href={n.linkUrl}
                      onClick={() => handleNotificationClick(n)}
                      className={`block px-4 py-3 hover:bg-[var(--border-color)] transition-colors ${
                        !n.isRead ? 'bg-blue-500/5' : ''
                      }`}
                    >
                      <NotificationItem notification={n} />
                    </Link>
                  ) : (
                    <div
                      onClick={() => handleNotificationClick(n)}
                      className={`px-4 py-3 cursor-pointer hover:bg-[var(--border-color)] transition-colors ${
                        !n.isRead ? 'bg-blue-500/5' : ''
                      }`}
                    >
                      <NotificationItem notification={n} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <Link
            href="/cabinet/notifications"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-center text-sm text-blue-bright hover:underline border-t border-[var(--border-color)]"
          >
            Всі сповіщення
          </Link>
        </div>
      )}
    </div>
  );
}

function NotificationItem({ notification: n }: { notification: Notification }) {
  return (
    <div className="flex gap-3">
      <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] ?? 'ℹ️'}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${!n.isRead ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>
          {n.title}
        </p>
        {n.body && (
          <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
            {n.body}
          </p>
        )}
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {new Date(n.createdAt).toLocaleString('uk')}
        </p>
      </div>
      {!n.isRead && (
        <span className="w-2 h-2 rounded-full bg-blue-bright flex-shrink-0 mt-2" />
      )}
    </div>
  );
}
