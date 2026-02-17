'use client';

import { CompanyCard } from '@/components/cards/company-card';
import { CompanyCardSkeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { Building2 } from 'lucide-react';
import type { PaginatedResponse, Company } from '@/types/api';

interface CompaniesGridProps {
  data?: PaginatedResponse<Company>;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

export function CompaniesGrid({ data, isLoading, page, onPageChange }: CompaniesGridProps) {
  return (
    <div>
      {data && (
        <div className="mb-6 text-sm text-[var(--text-secondary)]">
          Показано {data.data.length} з {data.meta.total} компаній
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
        {isLoading
          ? Array.from({ length: 9 }).map((_, i) => <CompanyCardSkeleton key={i} />)
          : data?.data.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
      </div>

      {!isLoading && (!data?.data || data.data.length === 0) && (
        <div className="text-center py-20">
          <Building2 size={48} className="mx-auto text-blue-bright/20 mb-4" />
          <h3 className="font-heading font-bold text-lg text-[var(--text-primary)] mb-2">Компаній не знайдено</h3>
          <p className="text-sm text-[var(--text-secondary)]">Спробуйте змінити фільтри.</p>
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <Pagination currentPage={page} totalPages={data.meta.totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
}
