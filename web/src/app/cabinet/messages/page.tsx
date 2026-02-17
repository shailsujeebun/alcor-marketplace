import type { Metadata } from 'next';
import { ConversationsList } from '@/components/cabinet/conversations-list';

export const metadata: Metadata = {
  title: 'Повідомлення — АЛЬКОР',
};

export default function MessagesPage() {
  return <ConversationsList />;
}
