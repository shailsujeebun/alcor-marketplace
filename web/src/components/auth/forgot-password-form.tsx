'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { forgotPassword } from '@/lib/auth-api';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Помилка надсилання');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-5 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
          <Mail size={28} className="text-green-400" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
          Перевірте пошту
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Якщо акаунт з цим email існує, ми надіслали інструкції для відновлення паролю.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-blue-bright hover:text-blue-light transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Повернутися до входу
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)] text-center">
        Відновлення паролю
      </h1>
      <p className="text-[var(--text-secondary)] text-sm text-center">
        Введіть email, пов&apos;язаний з вашим акаунтом
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-blue-bright transition-colors"
          placeholder="your@email.com"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full gradient-cta text-white py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Mail size={18} />
            Надіслати інструкції
          </>
        )}
      </button>

      <p className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={16} />
          Повернутися до входу
        </Link>
      </p>
    </form>
  );
}
