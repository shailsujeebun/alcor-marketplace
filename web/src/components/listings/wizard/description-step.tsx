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
            alert('╨æ╤â╨┤╤î ╨╗╨░╤ü╨║╨░, ╨╖╨░╨┐╨╛╨▓╨╜╤û╤é╤î ╨╛╨▒╨╛╨▓\'╤Å╨╖╨║╨╛╨▓╤û ╨┐╨╛╨╗╤Å (╨¥╨░╨╖╨▓╨░, ╨Ü╨░╤é╨╡╨│╨╛╤Ç╤û╤Å)');
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
                <h2 className={sectionTitleClass}>╨₧╤ü╨╜╨╛╨▓╨╜╨░ ╤û╨╜╤ä╨╛╤Ç╨╝╨░╤å╤û╤Å</h2>

                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>╨Ü╨░╤é╨╡╨│╨╛╤Ç╤û╤Å *</label>
                        <select name="categoryId" value={form.categoryId} onChange={handleChange} className={selectClass}>
                            <option value="">╨₧╨▒╨╡╤Ç╤û╤é╤î ╨║╨░╤é╨╡╨│╨╛╤Ç╤û╤Ä</option>
                            {categories?.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>╨¥╨░╨╖╨▓╨░ ╨╛╨│╨╛╨╗╨╛╤ê╨╡╨╜╨╜╤Å *</label>
                        <input type="text" name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="╨¥╨░╨┐╤Ç╨╕╨║╨╗╨░╨┤: ╨ò╨║╤ü╨║╨░╨▓╨░╤é╨╛╤Ç CAT 320 2019" />
                    </div>
                </div>
            </div>

            {/* 2. Category-Specific Fields (Dynamic from Template) */}
            {form.categoryId && (
                <div className={sectionClass}>
                    <h2 className={sectionTitleClass}>╨ö╨╡╤é╨░╨╗╤û</h2>
                    {template ? (
                        <DynamicForm
                            categoryId={form.categoryId}
                            template={template}
                            values={form.dynamicAttributes}
                            onChange={(values) => setForm((prev) => ({ ...prev, dynamicAttributes: values }))}
                        />
                    ) : (
                        <p className="text-[var(--text-secondary)] text-sm">
                            ╨ù╨░╨▓╨░╨╜╤é╨░╨╢╨╡╨╜╨╜╤Å ╨┐╨╛╨╗╤û╨▓ ╤ä╨╛╤Ç╨╝╨╕...
                        </p>
                    )}
                </div>
            )}

            {/* 3. Description - Universal Field */}
            <div className={sectionClass}>
                <h2 className={sectionTitleClass}>╨₧╨┐╨╕╤ü</h2>
                <div>
                    <label className={labelClass}>╨ö╨╡╤é╨░╨╗╤î╨╜╨╕╨╣ ╨╛╨┐╨╕╤ü</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={6}
                        className={inputClass}
                        placeholder="╨ö╨╡╤é╨░╨╗╤î╨╜╨╛ ╨╛╨┐╨╕╤ê╤û╤é╤î ╤é╨╡╤à╨╜╤û╨║╤â, ╤ù╤ù ╤ü╤é╨░╨╜, ╨╛╤ü╨╛╨▒╨╗╨╕╨▓╨╛╤ü╤é╤û..."
                    />
                </div>
            </div>

            {/* 4. Location - Universal Fields */}
            <div className={sectionClass}>
                <h2 className={sectionTitleClass}>╨£╤û╤ü╤å╨╡╨╖╨╜╨░╤à╨╛╨┤╨╢╨╡╨╜╨╜╤Å</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>╨Ü╤Ç╨░╤ù╨╜╨░</label>
                        <select name="countryId" value={form.countryId} onChange={handleChange} className={selectClass}>
                            <option value="">╨₧╨▒╨╡╤Ç╤û╤é╤î ╨║╤Ç╨░╤ù╨╜╤â</option>
                            {countries?.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>╨£╤û╤ü╤é╨╛</label>
                        <select name="cityId" value={form.cityId} onChange={handleChange} disabled={!form.countryId} className={`${selectClass} disabled:opacity-50`}>
                            <option value="">╨₧╨▒╨╡╤Ç╤û╤é╤î ╨╝╤û╤ü╤é╨╛</option>
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
                    ╨ö╨░╨╗╤û: ╨ñ╨╛╤é╨╛ ╤é╨░ ╨Æ╤û╨┤╨╡╨╛ ΓåÆ
                </button>
            </div>
        </div>
    );
}
