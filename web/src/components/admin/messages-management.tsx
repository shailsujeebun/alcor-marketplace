'use client';

import { useState } from 'react';
import { Search, MessageSquare, Trash2, Eye, X } from 'lucide-react';
import { useAllConversations, useConversationAdmin, useDeleteConversation } from '@/lib/queries';
import type { Conversation, ChatMessage } from '@/types/api';

export function MessagesManagement() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const params: Record<string, string> = {
    page: String(page),
    limit: '20',
  };
  if (search) params.search = search;

  const { data, isLoading } = useAllConversations(params);
  const { data: viewedConversation } = useConversationAdmin(viewingId ?? '');
  const deleteMutation = useDeleteConversation();

  const conversations = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeletingId(null);
        if (viewingId === id) setViewingId(null);
      },
    });
  };

  const formatUser = (user: { firstName: string | null; lastName: string | null; email: string }) => {
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return name || user.email;
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-bright outline-none transition-colors';

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-[var(--text-primary)] mb-6">
        Повідомлення
      </h1>

      {/* Search */}
      <div className="glass-card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Пошук за email або назвою оголошення..."
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Conversations list */}
        <div className={viewingId ? 'w-1/2' : 'w-full'}>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="glass-card p-4 animate-pulse">
                  <div className="h-5 bg-[var(--border-color)] rounded w-1/3 mb-2" />
                  <div className="h-4 bg-[var(--border-color)] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <MessageSquare size={48} className="mx-auto mb-4 text-[var(--text-secondary)]" />
              <p className="text-[var(--text-secondary)]">Повідомлень не знайдено</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv: Conversation & { _count?: { messages: number } }) => (
                <div
                  key={conv.id}
                  className={`glass-card p-4 cursor-pointer transition-colors ${
                    viewingId === conv.id ? 'border-blue-bright/40' : ''
                  }`}
                  onClick={() => setViewingId(conv.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--text-primary)] truncate text-sm">
                        {conv.listing?.title ?? 'Невідоме оголошення'}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-secondary)]">
                        <span>Покупець: {formatUser(conv.buyer)}</span>
                        <span>→</span>
                        <span>Продавець: {formatUser(conv.seller)}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-secondary)]">
                        {conv.lastMessageAt && (
                          <span>Останнє: {new Date(conv.lastMessageAt).toLocaleString('uk')}</span>
                        )}
                        {conv._count && (
                          <span>Повідомлень: {conv._count.messages}</span>
                        )}
                      </div>
                      {conv.messages?.[0] && (
                        <p className="mt-1 text-xs text-[var(--text-secondary)] truncate">
                          {conv.messages[0].body}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setViewingId(conv.id)}
                        className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-blue-bright/40 transition-colors"
                        title="Переглянути"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setDeletingId(conv.id)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        title="Видалити"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Delete confirmation */}
                  {deletingId === conv.id && (
                    <div className="mt-3 flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20" onClick={(e) => e.stopPropagation()}>
                      <p className="flex-1 text-xs text-red-400">
                        Видалити цю розмову та всі повідомлення?
                      </p>
                      <button
                        onClick={() => handleDelete(conv.id)}
                        disabled={deleteMutation.isPending}
                        className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 disabled:opacity-50 transition-colors"
                      >
                        Підтвердити
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] text-xs hover:text-[var(--text-primary)] transition-colors"
                      >
                        Скасувати
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

        {/* Conversation detail panel */}
        {viewingId && (
          <div className="w-1/2 glass-card p-5 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-[var(--text-primary)]">
                Деталі розмови
              </h2>
              <button
                onClick={() => setViewingId(null)}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {viewedConversation ? (
              <>
                <div className="mb-4 p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {viewedConversation.listing?.title}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {formatUser(viewedConversation.buyer)} ↔ {formatUser(viewedConversation.seller)}
                  </p>
                </div>

                <div className="space-y-3">
                  {viewedConversation.messages?.map((msg: ChatMessage) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg text-sm ${
                        msg.senderId === viewedConversation.buyerId
                          ? 'bg-blue-500/10 border border-blue-500/20'
                          : 'bg-[var(--bg-primary)] border border-[var(--border-color)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[var(--text-secondary)]">
                          {msg.sender ? formatUser(msg.sender) : 'Невідомий'}
                        </span>
                        <span className="text-xs text-[var(--text-secondary)]">
                          {new Date(msg.createdAt).toLocaleString('uk')}
                        </span>
                      </div>
                      <p className="text-[var(--text-primary)]">{msg.body}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-bright border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
