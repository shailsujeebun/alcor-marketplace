'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Send } from 'lucide-react';
import { useConversation, useSendMessage } from '@/lib/queries';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/api';

export function ConversationDetail({ id }: { id: string }) {
  const { user } = useAuthStore();
  const { data: conversation, isLoading } = useConversation(id);
  const sendMutation = useSendMessage(id);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMutation.isPending) return;
    sendMutation.mutate({ body: message.trim() }, {
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

  if (!conversation) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-[var(--text-secondary)]">Розмову не знайдено</p>
      </div>
    );
  }

  const otherUser = conversation.buyerId === user?.id ? conversation.seller : conversation.buyer;
  const otherName = otherUser.firstName
    ? `${otherUser.firstName} ${otherUser.lastName ?? ''}`.trim()
    : otherUser.email.split('@')[0];

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[400px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/cabinet/messages"
          className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h2 className="font-heading font-bold text-[var(--text-primary)] truncate">
            {otherName}
          </h2>
          <Link
            href={`/listings/${conversation.listingId}`}
            className="text-xs text-blue-bright hover:text-blue-light transition-colors truncate block"
          >
            {conversation.listing.title}
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 glass-card p-4 overflow-y-auto space-y-3 mb-4">
        {conversation.messages?.map((msg: ChatMessage) => {
          const isOwn = msg.senderId === user?.id;
          return (
            <div
              key={msg.id}
              className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[75%] px-4 py-2.5 rounded-2xl text-sm',
                  isOwn
                    ? 'gradient-cta text-white rounded-br-md'
                    : 'bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-bl-md',
                )}
              >
                <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                <p
                  className={cn(
                    'text-xs mt-1',
                    isOwn ? 'text-white/60' : 'text-[var(--text-secondary)]',
                  )}
                >
                  {new Date(msg.createdAt).toLocaleTimeString('uk', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Написати повідомлення..."
          className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-bright outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!message.trim() || sendMutation.isPending}
          className="px-4 py-2.5 rounded-lg gradient-cta text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
