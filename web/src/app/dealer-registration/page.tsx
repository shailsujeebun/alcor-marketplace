import type { Metadata } from 'next';
import { DealerRegistrationForm } from '@/components/dealer/dealer-registration-form';

export const metadata: Metadata = {
  title: 'Стати дилером — АЛЬКОР',
};

export default function DealerRegistrationPage() {
  return <DealerRegistrationForm />;
}
