'use client';

import { use } from 'react';
import { TicketDetail } from '@/components/cabinet/ticket-detail';

export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <TicketDetail id={id} />;
}
