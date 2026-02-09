import type { Metadata } from 'next';
import { SupportTickets } from '@/components/cabinet/support-tickets';

export const metadata: Metadata = {
  title: 'Підтримка — АЛЬКОР',
};

export default function SupportPage() {
  return <SupportTickets />;
}
