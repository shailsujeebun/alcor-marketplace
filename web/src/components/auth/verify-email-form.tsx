'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';
import { verifyEmail, resendVerification } from '@/lib/auth-api';
import { useAuthStore } from '@/stores/auth-store';

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { setAuth } = useAuthStore();

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

  const handleDigitChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);

    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const code = digits.join('');
    if (code.length !== 6) {
      setError('Введіть повний 6-значний код');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyEmail({ email, code });
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Невірний код підтвердження');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      await resendVerification(email);
      setResendCooldown(60);
      setError('');

      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Помилка повторного надсилання');
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
          Підтвердження email
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Введіть 6-значний код, надісланий на{' '}
          <span className="text-[var(--text-primary)] font-medium">{email}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
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
          'Підтвердити'
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
            ? `Повторити через ${resendCooldown}с`
            : 'Надіслати код повторно'}
        </button>
      </div>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        <Link
          href="/login"
          className="text-blue-bright hover:text-blue-light transition-colors font-medium inline-flex items-center gap-1"
        >
          <ArrowLeft size={14} />
          Повернутися до входу
        </Link>
      </p>
    </form>
  );
}
