'use client';

import { useState } from 'react';
import { Search, Shield, ShieldCheck, Factory, Handshake, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useCompanies, useVerifyCompany, useUpdateCompanyFlags, useDeleteCompany } from '@/lib/queries';
import type { Company } from '@/types/api';

export function CompaniesManagement() {
  const [search, setSearch] = useState('');
  const [filterVerified, setFilterVerified] = useState<string>('');
  const [filterDealer, setFilterDealer] = useState<string>('');
  const [filterManufacturer, setFilterManufacturer] = useState<string>('');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const params: Record<string, string> = {
    page: String(page),
    limit: '20',
  };
  if (search) params.search = search;
  if (filterVerified) params.isVerified = filterVerified;
  if (filterDealer) params.isOfficialDealer = filterDealer;
  if (filterManufacturer) params.isManufacturer = filterManufacturer;

  const { data, isLoading } = useCompanies(params);
  const verifyMutation = useVerifyCompany();
  const flagsMutation = useUpdateCompanyFlags();
  const deleteMutation = useDeleteCompany();

  const companies = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => setDeletingId(null),
    });
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-bright outline-none transition-colors';

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-[var(--text-primary)] mb-6">
        Управління компаніями
      </h1>

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Пошук за назвою..."
              className={`${inputClass} pl-10`}
            />
          </div>
          <select
            value={filterVerified}
            onChange={(e) => { setFilterVerified(e.target.value); setPage(1); }}
            className={`${inputClass} md:w-44`}
          >
            <option value="">Верифікація</option>
            <option value="true">Верифіковані</option>
            <option value="false">Не верифіковані</option>
          </select>
          <select
            value={filterDealer}
            onChange={(e) => { setFilterDealer(e.target.value); setPage(1); }}
            className={`${inputClass} md:w-44`}
          >
            <option value="">Дилери</option>
            <option value="true">Офіц. дилери</option>
            <option value="false">Не дилери</option>
          </select>
          <select
            value={filterManufacturer}
            onChange={(e) => { setFilterManufacturer(e.target.value); setPage(1); }}
            className={`${inputClass} md:w-44`}
          >
            <option value="">Виробники</option>
            <option value="true">Виробники</option>
            <option value="false">Не виробники</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-5 bg-[var(--border-color)] rounded w-1/3 mb-2" />
              <div className="h-4 bg-[var(--border-color)] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-[var(--text-secondary)]">Компаній не знайдено</p>
        </div>
      ) : (
        <div className="space-y-3">
          {companies.map((company: Company) => (
            <div key={company.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-[var(--text-primary)] truncate">
                      {company.name}
                    </h3>
                    {company.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        <ShieldCheck size={12} /> Верифіковано
                      </span>
                    )}
                    {company.isOfficialDealer && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        <Handshake size={12} /> Дилер
                      </span>
                    )}
                    {company.isManufacturer && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                        <Factory size={12} /> Виробник
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                    {company.country && <span>{company.country.name}</span>}
                    {company.city && <span>{company.city.name}</span>}
                    <span>Оголошень: {company.listingsCount}</span>
                    <span>Рейтинг: {company.ratingAvg.toFixed(1)} ({company.reviewsCount})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/companies/${company.slug}`}
                    className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-blue-bright/40 transition-colors"
                    title="Переглянути"
                  >
                    <ExternalLink size={18} />
                  </Link>

                  <button
                    onClick={() => verifyMutation.mutate(company.id)}
                    disabled={verifyMutation.isPending}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                      company.isVerified
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                    }`}
                    title={company.isVerified ? 'Зняти верифікацію' : 'Верифікувати'}
                  >
                    {company.isVerified ? <ShieldCheck size={18} /> : <Shield size={18} />}
                  </button>

                  <button
                    onClick={() =>
                      flagsMutation.mutate({
                        id: company.id,
                        data: { isOfficialDealer: !company.isOfficialDealer },
                      })
                    }
                    disabled={flagsMutation.isPending}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                      company.isOfficialDealer
                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                        : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                    }`}
                    title={company.isOfficialDealer ? 'Зняти статус дилера' : 'Зробити дилером'}
                  >
                    <Handshake size={18} />
                  </button>

                  <button
                    onClick={() =>
                      flagsMutation.mutate({
                        id: company.id,
                        data: { isManufacturer: !company.isManufacturer },
                      })
                    }
                    disabled={flagsMutation.isPending}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                      company.isManufacturer
                        ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                        : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                    }`}
                    title={company.isManufacturer ? 'Зняти статус виробника' : 'Зробити виробником'}
                  >
                    <Factory size={18} />
                  </button>

                  <button
                    onClick={() => setDeletingId(company.id)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    title="Видалити"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Delete confirmation */}
              {deletingId === company.id && (
                <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="flex-1 text-sm text-red-400">
                    Ви впевнені, що хочете видалити компанію &quot;{company.name}&quot;? Цю дію неможливо скасувати.
                  </p>
                  <button
                    onClick={() => handleDelete(company.id)}
                    disabled={deleteMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 disabled:opacity-50 transition-colors"
                  >
                    {deleteMutation.isPending ? 'Видалення...' : 'Підтвердити'}
                  </button>
                  <button
                    onClick={() => setDeletingId(null)}
                    className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] text-sm hover:text-[var(--text-primary)] transition-colors"
                  >
                    Скасувати
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                page === p
                  ? 'gradient-cta text-white'
                  : 'glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
