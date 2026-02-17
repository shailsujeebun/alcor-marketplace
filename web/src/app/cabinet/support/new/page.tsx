import type { Metadata } from 'next';
import { CreateTicketForm } from '@/components/cabinet/create-ticket-form';

export const metadata: Metadata = {
  title: 'Нова заявка — АЛЬКОР',
};

export default function NewTicketPage() {
  return <CreateTicketForm />;
}
