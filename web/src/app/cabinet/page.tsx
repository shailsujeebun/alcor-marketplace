import type { Metadata } from 'next';
import { CabinetOverview } from '@/components/cabinet/cabinet-overview';

export const metadata: Metadata = {
  title: 'Кабінет — АЛЬКОР',
};

export default function CabinetPage() {
  return <CabinetOverview />;
}
