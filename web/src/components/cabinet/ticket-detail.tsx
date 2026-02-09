'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Send, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useTicket, useReplyToTicket } from '@/lib/queries';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import type { TicketMessage, TicketStatus } from '@/types/api';

const STATUS_BADGE: Record<TicketStatus, { label: string; className: string }> = {
  OPEN: { label: 'Відкрито', className: 'bg-blue-500/20 text-blue-400' },
  IN_PROGRESS: { label: 'В роботі', className: 'bg-yellow-500/20 text-yellow-400' },
  RESOLVED: { label: 'Вирішено', className: 'bg-green-500/20 text-green-400' },
  CLOSED: { label: 'Закрито', className: 'bg-gray-500/20 text-gray-400' },
};

const PRIORITY_BADGE: Record<string, { label: string; className: string }> = {
  LOW: { label: 'Низький', className: 'bg-gray-500/20 text-gray-400' },
  MEDIUM: { label: 'Середній', className: 'bg-blue-500/20 text-blue-400' },
  HIGH: { label: 'Високий', className: 'bg-red-500/20 text-red-400' },
};

export function TicketDetail({ id }: { id: string }) {
  const { user } = useAuthStore();
  const { data: ticket, isLoading } = useTicket(id);
  const replyMutation = useReplyToTicket(id);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || replyMutation.isPending) return;
    replyMutation.mutate({ body: message.trim() }, {
      onSuccess: () => setMessage(''),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-[var(--border-color)] rounded w-48 animate-pulse" />
        <div className="glass-card p-6 h-96 animate-pulse" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-[var(--text-secondary)]">Заявку не знайдено</p>
      </div>
    );
  }

  const isClosed = ticket.status === 'CLOSED' || ticket.status === 'RESOLVED';
  const statusBadge = STATUS_BADGE[ticket.status];
  const priorityBadge = PRIORITY_BADGE[ticket.priority];

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[400px]">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/cabinet/support"
            className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ChevronLeft size={18} />
          </Link>
          <h2 className="font-heading font-bold text-[var(--text-primary)] truncate flex-1">
            {ticket.subject}
          </h2>
        </div>
        <div className="flex items-center gap-2 ml-12">
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}>
            {statusBadge.label}
          </span>
          {priorityBadge && (
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityBadge.className}`}>
              {priorityBadge.label}
            </span>
          )}
          <span className="text-xs text-[var(--text-secondary)]">
            #{ticket.id.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 glass-card p-4 overflow-y-auto space-y-3 mb-4">
        {ticket.messages?.map((msg: TicketMessage) => {
          const isOwn = msg.senderId === user?.id;
          const senderName = msg.isStaff ? 'Підтримка' : (msg.sender?.firstName || msg.sender?.email.split('@')[0] || 'Ви');
          return (
            <div key={msg.id}>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  'text-xs font-medium',
                  msg.isStaff ? 'text-green-400' : 'text-[var(--text-secondary)]',
                )}>
                  {senderName}
                </span>
                <span className="text-xs text-[var(--text-secondary)]">
                  {new Date(msg.createdAt).toLocaleString('uk', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div
                className={cn(
                  'px-4 py-3 rounded-lg text-sm',
                  msg.isStaff
                    ? 'bg-green-500/10 border border-green-500/20 text-[var(--text-primary)]'
                    : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]',
                )}
              >
                <p className="whitespace-pre-wrap break-words">{msg.body}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {isClosed ? (
        <div className="glass-card p-4 text-center text-sm text-[var(--text-secondary)]">
          Ця заявка закрита. Створіть нову заявку, якщо у вас є додаткові питання.
        </div>
      ) : (
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Написати відповідь..."
            className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-bright outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!message.trim() || replyMutation.isPending}
            className="px-4 py-2.5 rounded-lg gradient-cta text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </form>
      )}
    </div>
  );
}
