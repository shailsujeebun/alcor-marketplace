'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useStartConversation } from '@/lib/queries';

export function ContactSellerButton({ listingId, sellerId }: { listingId: string; sellerId: string }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const startConversation = useStartConversation();
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  if (!isAuthenticated || !sellerId || sellerId === user?.id) return null;

  const handleSend = () => {
    if (!message.trim() || startConversation.isPending) return;
    startConversation.mutate(
      { listingId, sellerId, body: message.trim() },
      {
        onSuccess: (conv) => {
          router.push(`/cabinet/messages/${conv.id}`);
        },
      },
    );
  };

  return (
    <div className="mt-3">
      {showForm ? (
        <div className="space-y-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ваше повідомлення продавцю..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-bright outline-none transition-colors resize-none text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSend}
              disabled={!message.trim() || startConversation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-blue-bright text-blue-bright text-sm font-semibold hover:bg-blue-bright/10 transition-colors disabled:opacity-50"
            >
              <MessageSquare size={14} />
              {startConversation.isPending ? 'Відправка...' : 'Відправити'}
            </button>
            <button
              onClick={() => { setShowForm(false); setMessage(''); }}
              className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] text-sm hover:text-[var(--text-primary)] transition-colors"
            >
              Скасувати
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="block w-full text-center border border-blue-bright text-blue-bright py-3 rounded-xl font-semibold text-sm hover:bg-blue-bright/10 transition-colors"
        >
          <MessageSquare size={14} className="inline mr-2" />
          Написати продавцю
        </button>
      )}
    </div>
  );
}
