'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Building2 } from 'lucide-react';
import { useConversations } from '@/lib/queries';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/types/api';

export function ConversationsList() {
  const [page, setPage] = useState(1);
  const { user } = useAuthStore();
  const { data, isLoading } = useConversations(page);

  const conversations = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)] mb-6">
        Повідомлення
      </h1>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-5 bg-[var(--border-color)] rounded w-1/3 mb-2" />
              <div className="h-4 bg-[var(--border-color)] rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <MessageSquare size={48} className="mx-auto text-[var(--text-secondary)] mb-4 opacity-30" />
          <p className="text-[var(--text-secondary)] mb-4">
            У вас поки немає повідомлень
          </p>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-cta text-white font-medium hover:opacity-90 transition-opacity"
          >
            Переглянути оголошення
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv: Conversation) => {
            const otherUser = conv.buyerId === user?.id ? conv.seller : conv.buyer;
            const lastMessage = conv.messages?.[0];
            const displayName = otherUser.firstName
              ? `${otherUser.firstName} ${otherUser.lastName ?? ''}`.trim()
              : otherUser.email.split('@')[0];

            return (
              <Link
                key={conv.id}
                href={`/cabinet/messages/${conv.id}`}
                className="glass-card p-4 flex items-center gap-4 hover:border-blue-bright/30 transition-colors block"
              >
                <div className="flex-shrink-0">
                  {conv.listing.media?.[0]?.url ? (
                    <img
                      src={conv.listing.media[0].url}
                      alt={conv.listing.title}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-accent/20 to-orange/10 flex items-center justify-center">
                      <Building2 size={20} className="text-blue-bright/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h3 className="font-medium text-[var(--text-primary)] truncate text-sm">
                      {displayName}
                    </h3>
                    {conv.lastMessageAt && (
                      <span className="text-xs text-[var(--text-secondary)] flex-shrink-0">
                        {new Date(conv.lastMessageAt).toLocaleDateString('uk')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] truncate mb-1">
                    {conv.listing.title}
                  </p>
                  {lastMessage && (
                    <p className="text-sm text-[var(--text-secondary)] truncate">
                      {lastMessage.senderId === user?.id ? 'Ви: ' : ''}
                      {lastMessage.body}
                    </p>
                  )}
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
