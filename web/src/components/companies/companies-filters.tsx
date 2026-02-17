'use client';

import { SearchInput } from '@/components/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCountries, useCities, useActivityTypes, useBrands } from '@/lib/queries';

interface FiltersState {
  search: string;
  countryId: string;
  cityId: string;
  isVerified: string;
  activityTypeId: string;
  brandId: string;
  isOfficialDealer: string;
}

interface CompaniesFiltersProps {
  filters: FiltersState;
  onFilterChange: (key: keyof FiltersState, value: string) => void;
  onClear: () => void;
}

export function CompaniesFilters({ filters, onFilterChange, onClear }: CompaniesFiltersProps) {
  const { data: countries } = useCountries();
  const { data: citiesData } = useCities(filters.countryId || undefined);
  const { data: activityTypes } = useActivityTypes();
  const { data: brands } = useBrands();

  const hasFilters = Object.values(filters).some(Boolean);

  const FilterSelect = ({
    value,
    onChange,
    placeholder,
    options,
  }: {
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    options: { value: string; label: string }[];
  }) => (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-sm text-[var(--text-primary)]">Фільтри</h3>
        {hasFilters && (
          <button onClick={onClear} className="text-xs text-blue-bright hover:text-blue-light transition-colors">
            Очистити всі
          </button>
        )}
      </div>

      <SearchInput
        value={filters.search}
        onChange={(v) => onFilterChange('search', v)}
        placeholder="Пошук компаній..."
      />

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Вид діяльності</label>
        <FilterSelect
          value={filters.activityTypeId}
          onChange={(v) => onFilterChange('activityTypeId', v)}
          placeholder="Усі види діяльності"
          options={(activityTypes ?? []).map((at) => ({ value: at.id, label: at.name }))}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Марка</label>
        <FilterSelect
          value={filters.brandId}
          onChange={(v) => onFilterChange('brandId', v)}
          placeholder="Усі марки"
          options={(brands ?? []).map((b) => ({ value: b.id, label: b.name }))}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Країна</label>
        <FilterSelect
          value={filters.countryId}
          onChange={(v) => {
            onFilterChange('countryId', v);
            onFilterChange('cityId', '');
          }}
          placeholder="Усі країни"
          options={(countries ?? []).map((c) => ({ value: c.id, label: c.name }))}
        />
      </div>

      {filters.countryId && (
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Місто</label>
          <FilterSelect
            value={filters.cityId}
            onChange={(v) => onFilterChange('cityId', v)}
            placeholder="Усі міста"
            options={(citiesData?.data ?? []).map((c) => ({ value: c.id, label: c.name }))}
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Верифікація</label>
        <FilterSelect
          value={filters.isVerified}
          onChange={(v) => onFilterChange('isVerified', v)}
          placeholder="Усі компанії"
          options={[{ value: 'true', label: 'Лише верифіковані' }]}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Офіційний дилер</label>
        <FilterSelect
          value={filters.isOfficialDealer}
          onChange={(v) => onFilterChange('isOfficialDealer', v)}
          placeholder="Усі компанії"
          options={[{ value: 'true', label: 'Лише офіційні дилери' }]}
        />
      </div>
    </div>
  );
}
