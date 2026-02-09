'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Plus, Trash2 } from 'lucide-react';
import { useCategories, useBrands, useCountries, useCities, useCompanies, useCreateListing, useUpdateListing } from '@/lib/queries';
import { uploadImages } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { PhotoUpload, type PhotoItem } from './photo-upload';
import type { Listing, CreateListingPayload } from '@/types/api';

interface ListingWizardProps {
  listing?: Listing;
}

interface FormData {
  title: string;
  description: string;
  categoryId: string;
  brandId: string;
  listingType: string;
  condition: string;
  year: string;
  priceAmount: string;
  priceCurrency: string;
  priceType: string;
  hoursValue: string;
  hoursUnit: string;
  euroClass: string;
  countryId: string;
  cityId: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhones: string;
  companyId: string;
  externalUrl: string;
  attributes: { key: string; value: string }[];
}

function initFormData(listing?: Listing): FormData {
  if (!listing) {
    return {
      title: '', description: '', categoryId: '', brandId: '',
      listingType: '', condition: '', year: '', priceAmount: '',
      priceCurrency: 'EUR', priceType: 'FIXED', hoursValue: '',
      hoursUnit: '', euroClass: '', countryId: '', cityId: '',
      sellerName: '', sellerEmail: '', sellerPhones: '',
      companyId: '', externalUrl: '',
      attributes: [],
    };
  }
  return {
    title: listing.title,
    description: listing.description ?? '',
    categoryId: listing.categoryId ?? '',
    brandId: listing.brandId ?? '',
    listingType: listing.listingType ?? '',
    condition: listing.condition ?? '',
    year: listing.year?.toString() ?? '',
    priceAmount: listing.priceAmount?.toString() ?? '',
    priceCurrency: listing.priceCurrency ?? 'EUR',
    priceType: listing.priceType ?? 'FIXED',
    hoursValue: listing.hoursValue?.toString() ?? '',
    hoursUnit: listing.hoursUnit ?? '',
    euroClass: listing.euroClass ?? '',
    countryId: listing.countryId ?? '',
    cityId: listing.cityId ?? '',
    sellerName: listing.sellerName ?? '',
    sellerEmail: listing.sellerEmail ?? '',
    sellerPhones: listing.sellerPhones?.join(', ') ?? '',
    companyId: listing.companyId,
    externalUrl: listing.externalUrl ?? '',
    attributes: listing.attributes?.map((a) => ({ key: a.key, value: a.value })) ?? [],
  };
}

function initPhotos(listing?: Listing): PhotoItem[] {
  if (!listing?.media?.length) return [];
  return listing.media.map((m) => ({
    id: m.id,
    url: m.url,
    isExisting: true,
  }));
}

const inputClass = 'w-full px-4 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-bright outline-none transition-colors';
const labelClass = 'block text-sm font-medium text-[var(--text-secondary)] mb-1.5';
const selectClass = `${inputClass} appearance-none`;
const sectionClass = 'glass-card p-6 sm:p-8 space-y-5';
const sectionTitleClass = 'text-lg font-heading font-bold text-[var(--text-primary)] mb-4';

export function ListingWizard({ listing }: ListingWizardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const isEditing = !!listing;

  const [form, setForm] = useState<FormData>(() => initFormData(listing));
  const [photos, setPhotos] = useState<PhotoItem[]>(() => initPhotos(listing));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: countries } = useCountries();
  const { data: citiesData } = useCities(form.countryId || undefined);
  const cities = citiesData?.data ?? [];
  const { data: companiesData } = useCompanies({ limit: '200' });
  const companies = companiesData?.data ?? [];

  const createMutation = useCreateListing();
  const updateMutation = useUpdateListing();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'countryId') setForm((prev) => ({ ...prev, cityId: '' }));
  }, []);

  const addAttribute = () => {
    setForm((prev) => ({ ...prev, attributes: [...prev.attributes, { key: '', value: '' }] }));
  };

  const updateAttribute = (index: number, field: 'key' | 'value', val: string) => {
    setForm((prev) => {
      const attrs = [...prev.attributes];
      attrs[index] = { ...attrs[index], [field]: val };
      return { ...prev, attributes: attrs };
    });
  };

  const removeAttribute = (index: number) => {
    setForm((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError('Введіть назву оголошення');
      return;
    }
    if (!isEditing && !form.companyId) {
      setError('Оберіть компанію');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Upload new photos
      const newFiles = photos.filter((p) => !p.isExisting && p.file).map((p) => p.file!);
      let uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        const result = await uploadImages(newFiles);
        uploadedUrls = result.urls;
      }

      // Build media array
      const existingPhotos = photos.filter((p) => p.isExisting);
      const media = [
        ...existingPhotos.map((p, i) => ({ url: p.url, sortOrder: i })),
        ...uploadedUrls.map((url, i) => ({ url, sortOrder: existingPhotos.length + i })),
      ];

      const payload: CreateListingPayload = {
        companyId: form.companyId,
        title: form.title,
        description: form.description || undefined,
        categoryId: form.categoryId || undefined,
        brandId: form.brandId || undefined,
        condition: (form.condition as CreateListingPayload['condition']) || undefined,
        year: form.year ? parseInt(form.year) : undefined,
        priceAmount: form.priceAmount ? parseFloat(form.priceAmount) : undefined,
        priceCurrency: form.priceCurrency || undefined,
        priceType: (form.priceType as CreateListingPayload['priceType']) || undefined,
        countryId: form.countryId || undefined,
        cityId: form.cityId || undefined,
        sellerName: form.sellerName || undefined,
        sellerEmail: form.sellerEmail || undefined,
        sellerPhones: form.sellerPhones ? form.sellerPhones.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        listingType: (form.listingType as CreateListingPayload['listingType']) || undefined,
        euroClass: form.euroClass || undefined,
        hoursValue: form.hoursValue ? parseInt(form.hoursValue) : undefined,
        hoursUnit: form.hoursUnit || undefined,
        externalUrl: form.externalUrl || undefined,
        media: media.length > 0 ? media : undefined,
        attributes: form.attributes.filter((a) => a.key && a.value).length > 0
          ? form.attributes.filter((a) => a.key && a.value)
          : undefined,
      };

      if (isEditing && listing) {
        const { companyId, ...updateData } = payload;
        await updateMutation.mutateAsync({ id: listing.id, data: updateData });
      } else {
        await createMutation.mutateAsync(payload);
      }

      setSuccess('Оголошення успішно збережено!');
      const redirectTo = isAdmin ? '/admin/moderation' : '/cabinet/listings';
      setTimeout(() => router.push(redirectTo), 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[ListingWizard] Submit error:', message);
      setError(`Помилка: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6" translate="no">
      {/* Section 1: Basic info */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>1. Основна інформація</h2>

        {!isEditing && (
          <div>
            <label className={labelClass}>Компанія *</label>
            <select name="companyId" value={form.companyId} onChange={handleChange} className={selectClass}>
              <option value="">Оберіть компанію</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={labelClass}>Назва оголошення *</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="Наприклад: Екскаватор CAT 320 2019" />
        </div>

        <div>
          <label className={labelClass}>Опис</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder="Детальний опис техніки..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Категорія</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} className={selectClass}>
              <option value="">Оберіть категорію</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Бренд</label>
            <select name="brandId" value={form.brandId} onChange={handleChange} className={selectClass}>
              <option value="">Оберіть бренд</option>
              {brands?.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Тип оголошення</label>
            <select name="listingType" value={form.listingType} onChange={handleChange} className={selectClass}>
              <option value="">Оберіть тип</option>
              <option value="SALE">Продаж</option>
              <option value="RENT">Оренда</option>
              <option value="FROM_MANUFACTURER">Від виробника</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Стан</label>
            <select name="condition" value={form.condition} onChange={handleChange} className={selectClass}>
              <option value="">Оберіть стан</option>
              <option value="NEW">Нове</option>
              <option value="USED">Вживане</option>
              <option value="DEMO">Демо</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Details */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>2. Деталі та ціна</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Рік випуску</label>
            <input type="number" name="year" value={form.year} onChange={handleChange} min="1950" max="2030" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Ціна</label>
            <input type="number" name="priceAmount" value={form.priceAmount} onChange={handleChange} min="0" step="0.01" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Валюта</label>
            <select name="priceCurrency" value={form.priceCurrency} onChange={handleChange} className={selectClass}>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="UAH">UAH</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Тип ціни</label>
            <select name="priceType" value={form.priceType} onChange={handleChange} className={selectClass}>
              <option value="FIXED">Фіксована</option>
              <option value="NEGOTIABLE">Договірна</option>
              <option value="ON_REQUEST">За запитом</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Моточаси</label>
            <input type="number" name="hoursValue" value={form.hoursValue} onChange={handleChange} min="0" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Одиниця</label>
            <input type="text" name="hoursUnit" value={form.hoursUnit} onChange={handleChange} placeholder="м/г" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Євро клас</label>
            <select name="euroClass" value={form.euroClass} onChange={handleChange} className={selectClass}>
              <option value="">Не вказано</option>
              <option value="Euro 3">Euro 3</option>
              <option value="Euro 4">Euro 4</option>
              <option value="Euro 5">Euro 5</option>
              <option value="Euro 6">Euro 6</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Зовнішнє посилання</label>
            <input type="url" name="externalUrl" value={form.externalUrl} onChange={handleChange} placeholder="https://..." className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Країна</label>
            <select name="countryId" value={form.countryId} onChange={handleChange} className={selectClass}>
              <option value="">Оберіть країну</option>
              {countries?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Місто</label>
            <select name="cityId" value={form.cityId} onChange={handleChange} disabled={!form.countryId} className={`${selectClass} disabled:opacity-50`}>
              <option value="">Оберіть місто</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom attributes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass}>Додаткові характеристики</label>
            <button type="button" onClick={addAttribute} className="flex items-center gap-1 text-xs text-blue-bright hover:text-blue-light transition-colors">
              <Plus size={14} />
              <span>Додати</span>
            </button>
          </div>
          {form.attributes.map((attr, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                value={attr.key}
                onChange={(e) => updateAttribute(i, 'key', e.target.value)}
                placeholder="Назва"
                className={`${inputClass} flex-1`}
              />
              <input
                type="text"
                value={attr.value}
                onChange={(e) => updateAttribute(i, 'value', e.target.value)}
                placeholder="Значення"
                className={`${inputClass} flex-1`}
              />
              <button type="button" onClick={() => removeAttribute(i)} className="px-3 text-red-400 hover:text-red-300">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Photos */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>3. Фотографії</h2>
        <PhotoUpload photos={photos} onChange={setPhotos} maxPhotos={10} />
      </div>

      {/* Section 4: Contact */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>4. Контактна інформація</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Ім&apos;я продавця</label>
            <input type="text" name="sellerName" value={form.sellerName} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email продавця</label>
            <input type="email" name="sellerEmail" value={form.sellerEmail} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Телефони продавця</label>
          <input type="text" name="sellerPhones" value={form.sellerPhones} onChange={handleChange} placeholder="+380 XX XXX XX XX" className={inputClass} />
          <p className="text-xs text-[var(--text-secondary)] mt-1">Через кому, якщо кілька</p>
        </div>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
          <Check size={18} />
          {success}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-blue-bright/40 transition-colors"
        >
          <span>Скасувати</span>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-2.5 rounded-lg gradient-cta text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting && <Loader2 size={18} className="animate-spin" />}
          {!isSubmitting && <Check size={18} />}
          <span>{isSubmitting ? 'Збереження...' : isEditing ? 'Зберегти зміни' : 'Створити оголошення'}</span>
        </button>
      </div>
    </div>
  );
}
