'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useCreateTicket } from '@/lib/queries';
import type { TicketPriority } from '@/types/api';

const inputClass = 'w-full px-4 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-bright outline-none transition-colors';
const labelClass = 'block text-sm font-medium text-[var(--text-secondary)] mb-1.5';

export function CreateTicketForm() {
  const router = useRouter();
  const createMutation = useCreateTicket();
  const [form, setForm] = useState({
    subject: '',
    body: '',
    priority: 'MEDIUM' as TicketPriority,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.body.trim()) return;
    createMutation.mutate(
      { subject: form.subject, body: form.body, priority: form.priority },
      { onSuccess: () => router.push('/cabinet/support') },
    );
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/cabinet/support"
          className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
          Нова заявка
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 max-w-xl space-y-5">
        <div>
          <label className={labelClass}>Тема</label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            placeholder="Опишіть коротко вашу проблему"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Пріоритет</label>
          <select
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TicketPriority }))}
            className={inputClass}
          >
            <option value="LOW">Низький</option>
            <option value="MEDIUM">Середній</option>
            <option value="HIGH">Високий</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Повідомлення</label>
          <textarea
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            placeholder="Детально опишіть вашу проблему або питання..."
            rows={6}
            className={`${inputClass} resize-none`}
            required
          />
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending || !form.subject.trim() || !form.body.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-cta text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Send size={18} />
          {createMutation.isPending ? 'Відправка...' : 'Відправити'}
        </button>

        {createMutation.isError && (
          <p className="text-sm text-red-400">Помилка створення заявки. Спробуйте ще раз.</p>
        )}
      </form>
    </div>
  );
}
