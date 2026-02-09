import type { Metadata } from 'next';
import { ProfileSettings } from '@/components/cabinet/profile-settings';

export const metadata: Metadata = {
  title: 'Налаштування — АЛЬКОР',
};

export default function SettingsPage() {
  return <ProfileSettings />;
}
