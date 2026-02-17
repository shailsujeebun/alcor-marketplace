import type { Metadata } from 'next';
import { NotificationsList } from '@/components/cabinet/notifications-list';

export const metadata: Metadata = {
  title: 'Сповіщення — Кабінет | АЛЬКОР',
};

export default function NotificationsPage() {
  return <NotificationsList />;
}
