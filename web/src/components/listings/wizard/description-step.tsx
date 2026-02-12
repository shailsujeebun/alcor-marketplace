'use client';

import { useSearchParams } from 'next/navigation';
import { useWizard } from './wizard-context';
import { useCategories, useBrands, useCountries, useCities, useCategoryTemplate } from '@/lib/queries';
import { DynamicForm } from '../dynamic-form';
import type { Category } from '@/types/api';

function buildLeafCategories(categories: Category[]): Array<{ id: string; label: string }> {
    const results: Array<{ id: string; label: string }> = [];

    const walk = (nodes: Category[], path: string[]) => {
        for (const node of nodes) {
            const nextPath = [...path, node.name];
            if (!node.children || node.children.length === 0) {
                results.push({ id: node.id, label: nextPath.join(' / ') });
            } else {
                walk(node.children, nextPath);
            }
        }
    };

    walk(categories, []);
    return results;
}

export function DescriptionStep() {
    const searchParams = useSearchParams();
    const { form, setForm, setCurrentStep } = useWizard();

    const marketplaceId = searchParams.get('marketplaceId') ?? undefined;
    const { data: categories } = useCategories(marketplaceId);
    const { data: brands } = useBrands();
    const { data: countries } = useCountries();
    const { data: citiesData } = useCities(form.countryId || undefined);
    const cities = citiesData?.data ?? [];
    const { data: template } = useCategoryTemplate(form.categoryId);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (name === 'countryId') setForm((prev) => ({ ...prev, cityId: '' }));
    };

    const handleNext = () => {
        // Basic validation
        if (!form.title.trim() || !form.categoryId) {
            // ideally handle validation error here
            alert('Будь ласка, заповніть обов\'язкові поля (Назва, Категорія)');
            return;
        }
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const inputClass = 'w-full px-4 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-bright outline-none transition-colors';
    const labelClass = 'block text-sm font-medium text-[var(--text-secondary)] mb-1.5';
    const selectClass = `${inputClass} appearance-none`;
    const sectionClass = 'glass-card p-6 sm:p-8 space-y-5 mb-6';
    const sectionTitleClass = 'text-lg font-heading font-bold text-[var(--text-primary)] mb-4';

    const leafCategories = buildLeafCategories(categories ?? []);

    return (
        <div className="space-y-6">
            {/* 1. Basic characteristics */}
            <div className={sectionClass}>
                <h2 className={sectionTitleClass}>Основні характеристики</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Категорія *</label>
                        <select name="categoryId" value={form.categoryId} onChange={handleChange} className={selectClass}>
                            <option value="">Оберіть категорію</option>
                            {leafCategories.map((c) => (
                                <option key={c.id} value={c.id}>{c.label}</option>
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

                <div>
                    <label className={labelClass}>Назва оголошення *</label>
                    <input type="text" name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="Наприклад: Екскаватор CAT 320 2019" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Рік випуску</label>
                        <input type="number" name="year" value={form.year} onChange={handleChange} min="1950" max="2030" className={inputClass} />
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

            {/* 2. Details & Price */}
            <div className={sectionClass}>
                <h2 className={sectionTitleClass}>Деталі та ціна</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div>
                        <label className={labelClass}>Тип ціни</label>
                        <select name="priceType" value={form.priceType} onChange={handleChange} className={selectClass}>
                            <option value="FIXED">Фіксована</option>
                            <option value="NEGOTIABLE">Договірна</option>
                            <option value="ON_REQUEST">За запитом</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Моточаси / Пробіг</label>
                        <div className="flex gap-2">
                            <input type="number" name="hoursValue" value={form.hoursValue} onChange={handleChange} min="0" className={inputClass} placeholder="Значення" />
                            <input type="text" name="hoursUnit" value={form.hoursUnit} onChange={handleChange} placeholder="м/г або км" className={`${inputClass} w-24`} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Зовнішнє посилання (YouTube/Site)</label>
                        <input type="url" name="externalUrl" value={form.externalUrl} onChange={handleChange} placeholder="https://..." className={inputClass} />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Опис</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows={6} className={`${inputClass} resize-none`} placeholder="Детальний опис техніки..." />
                </div>
            </div>

            {/* 3. Location */}
            <div className={sectionClass}>
                <h2 className={sectionTitleClass}>Місцезнаходження</h2>
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
            </div>

            {/* 4. Additional Options (Dynamic) */}
            {form.categoryId && (
                <div className={sectionClass}>
                    <h2 className={sectionTitleClass}>Додаткові опції</h2>
                    <DynamicForm
                        categoryId={form.categoryId}
                        template={template}
                        values={form.dynamicAttributes}
                        onChange={(values) => setForm((prev) => ({ ...prev, dynamicAttributes: values }))}
                    />
                </div>
            )}

            {/* Next Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleNext}
                    className="px-8 py-3 rounded-lg gradient-cta text-white font-medium hover:opacity-90 transition-opacity"
                >
                    Далі: Фото та Відео →
                </button>
            </div>
        </div>
    );
}
