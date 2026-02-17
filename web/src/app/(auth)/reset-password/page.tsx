import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = {
  title: 'Новий пароль — АЛЬКОР',
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-[var(--text-secondary)]">Завантаження...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
