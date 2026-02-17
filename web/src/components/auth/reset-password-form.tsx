'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/components/providers/translation-provider';
import { resetPassword } from '@/lib/auth-api';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError(t('auth.reset.errorPasswordMismatch'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('auth.reset.errorPasswordLength'));
      return;
    }

    if (!token) {
      setError(t('auth.reset.errorMissingToken'));
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
          ? err.message
          : t('auth.reset.errorDefault');
      setError(message);
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
          {t('auth.reset.successTitle')}
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">{t('auth.reset.successDescription')}</p>
        <Link
          href="/login"
          className="inline-block gradient-cta text-white px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          {t('auth.reset.successLogin')}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)] text-center">
        {t('auth.reset.title')}
      </h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          {t('auth.reset.newPassword')}
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-blue-bright transition-colors"
          placeholder={t('auth.reset.newPasswordPlaceholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          {t('auth.reset.confirmPassword')}
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-blue-bright transition-colors"
          placeholder={t('auth.reset.confirmPasswordPlaceholder')}
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
            {t('auth.reset.submit')}
          </>
        )}
      </button>

      <p className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={16} />
          {t('auth.reset.backToLogin')}
        </Link>
      </p>
    </form>
  );
}
