'use use client';

import { useWizard } from './wizard-context';
import { useCategories, useCountries, useCities, useCategoryTemplate } from '@/lib/queries';
import { DynamicForm } from '../dynamic-form';

export function DescriptionStep() {
    const { form, setForm, setCurrentStep } = useWizard();

    const { data: categories } = useCategories();
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

    return (
        <div className="space-y-6">
            {/* 1. Basic Information - Universal Fields */}
            <div className={sectionClass}>
                <h2 className={sectionTitleClass}>Основна інформація</h2>

                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Категорія *</label>
                        <select name="categoryId" value={form.categoryId} onChange={handleChange} className={selectClass}>
                            <option value="">Оберіть категорію</option>
                            {categories?.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Назва оголошення *</label>
                        <input type="text" name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="Наприклад: Екскаватор CAT 320 2019" />
                    </div>
                </div>
            </div>

            {/* 2. Category-Specific Fields (Dynamic from Template) */}
            {form.categoryId && (
                <div className={sectionClass}>
                    <h2 className={sectionTitleClass}>Деталі</h2>
                    {template ? (
                        <DynamicForm
                            categoryId={form.categoryId}
                            template={template}
                            values={form.dynamicAttributes}
                            onChange={(values) => setForm((prev) => ({ ...prev, dynamicAttributes: values }))}
                        />
                    ) : (
                        <p className="text-[var(--text-secondary)] text-sm">
                            Завантаження полів форми...
                        </p>
                    )}
                </div>
            )}

            {/* 3. Description - Universal Field */}
            <div className={sectionClass}>
                <h2 className={sectionTitleClass}>Опис</h2>
                <div>
                    <label className={labelClass}>Детальний опис</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={6}
                        className={inputClass}
                        placeholder="Детально опишіть техніку, її стан, особливості..."
                    />
                </div>
            </div>

            {/* 4. Location - Universal Fields */}
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
