import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | null, currency: string | null): string {
  if (amount == null) return 'Ціна за запитом';
  const curr = currency || 'USD';
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: curr,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
