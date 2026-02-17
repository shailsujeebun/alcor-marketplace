import type { Metadata } from 'next';
import { ModerationQueue } from '@/components/admin/moderation-queue';

export const metadata: Metadata = {
  title: 'Модерація оголошень — АЛЬКОР',
};

export default function ModerationPage() {
  return <ModerationQueue />;
}
