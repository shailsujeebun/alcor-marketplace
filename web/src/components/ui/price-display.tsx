import { formatPrice } from '@/lib/utils';
import { Badge } from './badge';
import type { PriceType } from '@/types/api';

interface PriceDisplayProps {
  amount: number | null;
  currency: string | null;
  priceType: PriceType | null;
  className?: string;
}

export function PriceDisplay({ amount, currency, priceType, className }: PriceDisplayProps) {
  if (priceType === 'ON_REQUEST') {
    return <span className={`text-orange font-semibold ${className ?? ''}`}>Ціна за запитом</span>;
  }

  return (
    <span className={`flex items-center gap-2 ${className ?? ''}`}>
      <span className="font-heading font-bold text-lg text-[var(--text-primary)]">
        {formatPrice(amount, currency)}
      </span>
      {priceType === 'NEGOTIABLE' && <Badge variant="warning">Договірна</Badge>}
    </span>
  );
}
