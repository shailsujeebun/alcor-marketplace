import type { Metadata } from 'next';
import { MessagesManagement } from '@/components/admin/messages-management';

export const metadata: Metadata = {
  title: 'Повідомлення — Адмін | АЛЬКОР',
};

export default function AdminMessagesPage() {
  return <MessagesManagement />;
}
