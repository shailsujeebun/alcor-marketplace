import type { Metadata } from 'next';
import { CompaniesManagement } from '@/components/admin/companies-management';

export const metadata: Metadata = {
  title: 'Управління компаніями — Адмін | АЛЬКОР',
};

export default function AdminCompaniesPage() {
  return <CompaniesManagement />;
}
