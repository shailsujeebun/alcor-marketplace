'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/components/providers/translation-provider';
import { resendVerification, verifyEmail } from '@/lib/auth-api';
import { useAuthStore } from '@/stores/auth-store';

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { setAuth } = useAuthStore();
  const { t } = useTranslation();

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
  }, [email, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const interval = window.setInterval(() => {
      setResendCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [resendCooldown]);

  const handleDigitChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const nextDigits = [...digits];
    nextDigits[index] = value;
    setDigits(nextDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const nextDigits = [...digits];
    for (let i = 0; i < 6; i += 1) {
      nextDigits[i] = pasted[i] || '';
    }
    setDigits(nextDigits);

    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const code = digits.join('');
    if (code.length !== 6) {
      setError(t('auth.verify.errorCodeLength'));
      return;
    }

    setLoading(true);
    try {
      const data = await verifyEmail({ email, code });
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.push('/');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
          ? err.message
          : t('auth.verify.errorInvalidCode');
      setError(message);
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      await resendVerification(email);
      setResendCooldown(60);
      setError('');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
          ? err.message
          : t('auth.verify.errorResend');
      setError(message);
    }
  };

  if (!email) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
          <ShieldCheck className="text-blue-bright" size={32} />
        </div>
        <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
          {t('auth.verify.title')}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {t('auth.verify.description', { email })}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(event) => handleDigitChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-bright outline-none transition-colors"
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={loading || digits.join('').length !== 6}
        className="w-full gradient-cta text-white py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          t('auth.verify.submit')
        )}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="text-sm text-blue-bright hover:text-blue-light transition-colors disabled:text-[var(--text-secondary)] disabled:cursor-default inline-flex items-center gap-1.5"
        >
          <RefreshCw size={14} />
          {resendCooldown > 0
            ? t('auth.verify.resendAfter', { seconds: resendCooldown })
            : t('auth.verify.resend')}
        </button>
      </div>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        <Link
          href="/login"
          className="text-blue-bright hover:text-blue-light transition-colors font-medium inline-flex items-center gap-1"
        >
          <ArrowLeft size={14} />
          {t('auth.verify.backToLogin')}
        </Link>
      </p>
    </form>
  );
}
