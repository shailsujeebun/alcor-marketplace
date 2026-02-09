'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';
import { resetPassword } from '@/lib/auth-api';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    if (newPassword.length < 6) {
      setError('Пароль повинен містити мінімум 6 символів');
      return;
    }

    if (!token) {
      setError('Відсутній токен відновлення');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Помилка зміни паролю');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-5 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
          <CheckCircle size={28} className="text-green-400" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
          Пароль змінено
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Ваш пароль успішно оновлено. Тепер ви можете увійти з новим паролем.
        </p>
        <Link
          href="/login"
          className="inline-block gradient-cta text-white px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          Увійти
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)] text-center">
        Новий пароль
      </h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          Новий пароль
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-blue-bright transition-colors"
          placeholder="Мінімум 6 символів"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          Підтвердження паролю
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-blue-bright transition-colors"
          placeholder="Повторіть пароль"
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
            <KeyRound size={18} />
            Змінити пароль
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
