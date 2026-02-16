'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWizard } from './wizard-context';
import { useCategories, useBrands, useCountries, useCities, useCategoryTemplate, useCreateBrand } from '@/lib/queries';
import { DynamicForm } from '../dynamic-form';
import type { Category } from '@/types/api';
import { ChevronDown } from 'lucide-react';

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

function AccordionSection({
    id,
    title,
    expanded,
    onToggle,
    className,
    titleClassName,
    children,
}: {
    id: string;
    title: string;
    expanded: boolean;
    onToggle: (id: string) => void;
    className: string;
    titleClassName: string;
    children: React.ReactNode;
}) {
    return (
        <div className={className}>
            <button
                type="button"
                onClick={() => onToggle(id)}
                className="w-full flex items-center justify-between text-left"
            >
                <h2 className={titleClassName}>{title}</h2>
                <ChevronDown
                    size={20}
                    className={`text-[var(--text-secondary)] transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
            </button>
            {expanded && <div className="space-y-5">{children}</div>}
        </div>
    );
}

export function DescriptionStep() {
    const searchParams = useSearchParams();
    const { form, setForm, setCurrentStep } = useWizard();

    const marketplaceId = searchParams.get('marketplaceId') ?? undefined;
    const { data: categories } = useCategories(marketplaceId);
    const { data: brands } = useBrands(form.categoryId || undefined);
    const createBrandMutation = useCreateBrand();
    const { data: countries } = useCountries();
    const { data: citiesData } = useCities(form.countryId || undefined);
    const cities = citiesData?.data ?? [];
    const { data: template } = useCategoryTemplate(form.categoryId);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        basic: true,
        engine: true,
        axles: true,
        options: true,
        details: true,
        params: true,
        location: true,
    });
    const [showCreateBrand, setShowCreateBrand] = useState(false);
    const [newBrandName, setNewBrandName] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 'true' : '') : value,
        }));
        if (name === 'countryId') setForm((prev) => ({ ...prev, cityId: '' }));
    };

    const setAttr = (key: string, value: string) => {
        setForm((prev) => ({
            ...prev,
            dynamicAttributes: { ...prev.dynamicAttributes, [key]: value },
        }));
    };

    const toggleCheckboxListValue = (key: string, value: string) => {
        const current = (form.dynamicAttributes[key] ?? '')
            .split('|')
            .map((v) => v.trim())
            .filter(Boolean);
        const next = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
        setAttr(key, next.join('|'));
    };

    const isCheckedInList = (key: string, value: string) =>
        (form.dynamicAttributes[key] ?? '').split('|').includes(value);

    const toggleSection = (key: string) => {
        setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleNext = () => {
        // Basic validation
        if (!form.categoryId || !form.brandId || !form.title.trim()) {
            // ideally handle validation error here
            alert('╨æ╤â╨┤╤î ╨╗╨░╤ü╨║╨░, ╨╖╨░╨┐╨╛╨▓╨╜╤û╤é╤î ╨╛╨▒╨╛╨▓\'╤Å╨╖╨║╨╛╨▓╤û ╨┐╨╛╨╗╤Å (╨Ü╨░╤é╨╡╨│╨╛╤Ç╤û╤Å, ╨æ╤Ç╨╡╨╜╨┤, ╨¥╨░╨╖╨▓╨░)');
            return;
        }
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCreateBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = newBrandName.trim();
        if (!name) return;
        try {
            const created = await createBrandMutation.mutateAsync({
                name,
                categoryId: form.categoryId || undefined,
            });
            setForm((prev) => ({ ...prev, brandId: created.id }));
            setNewBrandName('');
            setShowCreateBrand(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            alert(`╨¥╨╡ ╨▓╨┤╨░╨╗╨╛╤ü╤Å ╤ü╤é╨▓╨╛╤Ç╨╕╤é╨╕ ╨▒╤Ç╨╡╨╜╨┤: ${message}`);
        }
    };

    const inputClass = 'wizard-control w-full px-4 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] outline-none';
    const labelClass = 'block text-sm font-medium text-[var(--text-secondary)] mb-1.5';
    const selectClass = `${inputClass} appearance-none`;
    const sectionClass = 'glass-card wizard-section-card animate-fade-up p-4 sm:p-6 mb-6';
    const sectionTitleClass = 'text-lg font-heading font-bold text-[var(--text-primary)] mb-4';

    const leafCategories = buildLeafCategories(categories ?? []);
    const categoryLocked = !!searchParams.get('categoryId');

    const selectedBrandName = useMemo(
        () => brands?.find((b) => b.id === form.brandId)?.name.toLowerCase() ?? '',
        [brands, form.brandId],
    );

    const modelOptions = useMemo(() => {
        if (!selectedBrandName) return [];
        if (selectedBrandName.includes('bmw')) return ['X5', 'X3', '320', '520', 'M3'];
        if (selectedBrandName.includes('mercedes')) return ['Actros', 'Sprinter', 'C220', 'E220'];
        if (selectedBrandName.includes('audi')) return ['A4', 'A6', 'Q5', 'Q7'];
        if (selectedBrandName.includes('toyota')) return ['Corolla', 'Camry', 'RAV4', 'Land Cruiser'];
        return ['Model 1', 'Model 2', 'Model 3'];
    }, [selectedBrandName]);

    const conditionDetail = form.dynamicAttributes.condition_detail ?? 'used';
    const advertType = form.dynamicAttributes.advert_type ?? 'sale';
    const powerUnit = form.dynamicAttributes.power_unit ?? 'hp';
    const consumptionUnit = form.dynamicAttributes.fuel_consumption_unit ?? 'l_100km';
    const colorValue = form.dynamicAttributes.color ?? '';
    const hasAirConditioning = form.dynamicAttributes.air_conditioning === 'true';
    const hasPoweredWindows = form.dynamicAttributes.powered_windows === 'true';
    const selectedLanguages = (form.dynamicAttributes.description_languages ?? 'en')
        .split('|')
        .filter(Boolean);

    const years = Array.from({ length: 61 }, (_, i) => String(new Date().getFullYear() - i));
    const months = [
        { value: '01', label: '╨í╤û╤ç' }, { value: '02', label: '╨¢╤Ä╤é' }, { value: '03', label: '╨æ╨╡╤Ç' },
        { value: '04', label: '╨Ü╨▓╤û' }, { value: '05', label: '╨ó╤Ç╨░' }, { value: '06', label: '╨º╨╡╤Ç' },
        { value: '07', label: '╨¢╨╕╨┐' }, { value: '08', label: '╨í╨╡╤Ç' }, { value: '09', label: '╨Æ╨╡╤Ç' },
        { value: '10', label: '╨û╨╛╨▓' }, { value: '11', label: '╨¢╨╕╤ü' }, { value: '12', label: '╨ô╤Ç╤â' },
    ];

    const colorSwatches = ['#ffffff', '#111827', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#8b5cf6', '#9ca3af'];

    return (
        <div className="space-y-6">
            <AccordionSection id="basic" title="╨₧╤ü╨╜╨╛╨▓╨╜╤û ╤à╨░╤Ç╨░╨║╤é╨╡╤Ç╨╕╤ü╤é╨╕╨║╨╕" expanded={!!expandedSections.basic} onToggle={toggleSection} className={sectionClass} titleClassName={sectionTitleClass}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>╨Ü╨░╤é╨╡╨│╨╛╤Ç╤û╤Å *</label>
                        <select
                            name="categoryId"
                            value={form.categoryId}
                            onChange={handleChange}
                            className={`${selectClass} ${categoryLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
                            disabled={categoryLocked}
                        >
                            <option value="">╨₧╨▒╨╡╤Ç╤û╤é╤î ╨║╨░╤é╨╡╨│╨╛╤Ç╤û╤Ä</option>
                            {leafCategories.map((c) => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>╨æ╤Ç╨╡╨╜╨┤ *</label>
                        <select
                            name="brandId"
                            value={form.brandId}
                            onChange={handleChange}
                            className={`${selectClass} disabled:opacity-50`}
                            disabled={!form.categoryId}
                        >
                            <option value="">╨₧╨▒╨╡╤Ç╤û╤é╤î ╨▒╤Ç╨╡╨╜╨┤</option>
                            {brands?.map((b) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                        <div className="mt-2 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCreateBrand((prev) => !prev)}
                                className="text-sm text-blue-bright hover:text-orange transition-colors"
                                disabled={!form.categoryId}
                            >
                                {showCreateBrand ? '╨í╨║╨░╤ü╤â╨▓╨░╤é╨╕' : '╨ö╨╛╨┤╨░╤é╨╕ ╨╜╨╛╨▓╨╕╨╣ ╨▒╤Ç╨╡╨╜╨┤'}
                            </button>
                            {!form.categoryId && (
                                <span className="text-xs text-[var(--text-secondary)]">
                                    ╨í╨┐╨╛╤ç╨░╤é╨║╤â ╨╛╨▒╨╡╤Ç╤û╤é╤î ╨║╨░╤é╨╡╨│╨╛╤Ç╤û╤Ä
                                </span>
                            )}
                        </div>
                        {showCreateBrand && (
                            <form onSubmit={handleCreateBrand} className="mt-3 flex gap-2">
                                <input
                                    type="text"
                                    value={newBrandName}
                                    onChange={(e) => setNewBrandName(e.target.value)}
                                    className={inputClass}
                                    placeholder="╨¥╨░╨┐╤Ç╨╕╨║╨╗╨░╨┤: Iveco"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="wizard-action-btn px-4 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
                                    disabled={createBrandMutation.isPending}
                                >
                                    {createBrandMutation.isPending ? '╨ù╨▒╨╡╤Ç╨╡╨╢╨╡╨╜╨╜╤Å...' : '╨ù╨▒╨╡╤Ç╨╡╨│╤é╨╕'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>╨£╨╛╨┤╨╡╨╗╤î</label>
                        <select
                            value={form.dynamicAttributes.model ?? ''}
                            onChange={(e) => setAttr('model', e.target.value)}
                            className={`${selectClass} disabled:opacity-50`}
                            disabled={!form.brandId}
                        >
                            <option value="">╨₧╨▒╨╡╤Ç╤û╤é╤î ╨╝╨╛╨┤╨╡╨╗╤î</option>
                            {modelOptions.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                            <option value="custom">╨å╨╜╤ê╨░ (╨▓╨▓╨╡╤ü╤é╨╕ ╨▓╤Ç╤â╤ç╨╜╤â)</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>╨£╨╛╨┤╨╡╨╗╤î (╤é╨╡╨║╤ü╤é)</label>
                        <input
                            type="text"
                            value={form.dynamicAttributes.model_text ?? ''}
                            onChange={(e) => setAttr('model_text', e.target.value)}
                            className={inputClass}
                            placeholder="╨Æ╨▓╨╡╨┤╤û╤é╤î ╨╝╨╛╨┤╨╡╨╗╤î ╨░╨▓╤é╨╛"
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>╨¥╨░╨╖╨▓╨░ ╨╛╨│╨╛╨╗╨╛╤ê╨╡╨╜╨╜╤Å *</label>
                    <input type="text" name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="╨¥╨░╨┐╤Ç╨╕╨║╨╗╨░╨┤: ╨ò╨║╤ü╨║╨░╨▓╨░╤é╨╛╤Ç CAT 320 2019" />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        id="right_hand_drive"
                        type="checkbox"
                        checked={form.dynamicAttributes.right_hand_drive === 'true'}
                        onChange={(e) => setAttr('right_hand_drive', e.target.checked ? 'true' : '')}
                    />
                    <label htmlFor="right_hand_drive" className="text-sm text-[var(--text-primary)]">
                        ╨ƒ╤Ç╨░╨▓╨╕╨╣ ╤Ç╤â╨╗╤î
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>╨á╤û╨║ ╨▓╨╕╨┐╤â╤ü╨║╤â</label>
                        <select
                            value={form.dynamicAttributes.year_of_manufacture_year ?? form.year}
                            onChange={(e) => {
                                setAttr('year_of_manufacture_year', e.target.value);
                                setForm((prev) => ({ ...prev, year: e.target.value }));
                            }}
                            className={selectClass}
                        >
                            <option value="">╨á╤û╨║</option>
                            {years.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>╨£╤û╤ü╤Å╤å╤î</label>
                        <select
                            value={form.dynamicAttributes.year_of_manufacture_month ?? ''}
                            onChange={(e) => setAttr('year_of_manufacture_month', e.target.value)}
                            className={selectClass}
                        >
                            <option value="">╨£╤û╤ü╤Å╤å╤î</option>
                            {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>VIN</label>
                        <input
                            type="text"
                            value={form.dynamicAttributes.vin ?? ''}
                            onChange={(e) => setAttr('vin', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>╨ƒ╨╡╤Ç╤ê╨░ ╤Ç╨╡╤ö╤ü╤é╤Ç╨░╤å╤û╤Å</label>
                        <div className="grid grid-cols-2 gap-2">
                            <select value={form.dynamicAttributes.first_registration_year ?? ''} onChange={(e) => setAttr('first_registration_year', e.target.value)} className={selectClass}>
                                <option value="">╨á╤û╨║</option>
                                {years.map((y) => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <select value={form.dynamicAttributes.first_registration_month ?? ''} onChange={(e) => setAttr('first_registration_month', e.target.value)} className={selectClass}>
                                <option value="">╨£╤û╤ü╤Å╤å╤î</option>
                                {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>╨ó╨╡╤à╨╛╨│╨╗╤Å╨┤ ╨┤╤û╨╣╤ü╨╜╨╕╨╣ ╨┤╨╛</label>
                        <div className="grid grid-cols-2 gap-2">
                            <select value={form.dynamicAttributes.inspection_valid_till_year ?? ''} onChange={(e) => setAttr('inspection_valid_till_year', e.target.value)} className={selectClass}>
                                <option value="">╨á╤û╨║</option>
                                {years.map((y) => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <select value={form.dynamicAttributes.inspection_valid_till_month ?? ''} onChange={(e) => setAttr('inspection_valid_till_month', e.target.value)} className={selectClass}>
                                <option value="">╨£╤û╤ü╤Å╤å╤î</option>
                                {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>╨í╤é╨░╨╜</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                            ['new', '╨¥╨╛╨▓╨╡'],
                            ['used', '╨Æ╨╢╨╕╨▓╨░╨╜╨╡'],
                            ['with_defect', '╨ù ╨┤╨╡╤ä╨╡╨║╤é╨╛╨╝'],
                            ['remanufactured', '╨Æ╤û╨┤╨╜╨╛╨▓╨╗╨╡╨╜╨╡'],
                            ['crashed', '╨ƒ╨╛╤ê╨║╨╛╨┤╨╢╨╡╨╜╨╡'],
                            ['demonstration', '╨ö╨╡╨╝╨╛╨╜╤ü╤é╤Ç╨░╤å╤û╨╣╨╜╨╡'],
                            ['for_parts', '╨¥╨░ ╨╖╨░╨┐╤ç╨░╤ü╤é╨╕╨╜╨╕'],
                        ].map(([value, label]) => (
                            <label key={value} className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="condition_detail"
                                    checked={conditionDetail === value}
                                    onChange={() => {
                                        setAttr('condition_detail', value);
                                        setForm((prev) => ({
                                            ...prev,
                                            condition: value === 'new' ? 'NEW' : value === 'demonstration' ? 'DEMO' : 'USED',
                                        }));
                                    }}
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className={labelClass}>╨ó╨╡╤à╨╜╤û╤ç╨╜╨╕╨╣ ╤ü╤é╨░╨╜</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {[
                            ['garage_storage', '╨ô╨░╤Ç╨░╨╢╨╜╨╡ ╨╖╨▒╨╡╤Ç╤û╨│╨░╨╜╨╜╤Å'],
                            ['running', '╨¥╨░ ╤à╨╛╨┤╤â, ╤ü╨┐╤Ç╨░╨▓╨╜╨╕╨╣'],
                            ['not_hit', '╨¥╨╡ ╨▒╨╕╤é╨╕╨╣'],
                            ['not_repainted', '╨¥╨╡ ╤ä╨░╤Ç╨▒╨╛╨▓╨░╨╜╨╕╨╣'],
                            ['service_booklet', '╨í╨╡╤Ç╨▓╤û╤ü╨╜╨░ ╨║╨╜╨╕╨╢╨║╨░'],
                            ['not_working', '╨¥╨╡ ╨╜╨░ ╤à╨╛╨┤╤â'],
                            ['needs_bodywork', '╨ƒ╨╛╤é╤Ç╨╡╨▒╤â╤ö ╨║╤â╨╖╨╛╨▓╨╜╨╛╨│╨╛ ╤Ç╨╡╨╝╨╛╨╜╤é╤â'],
                            ['needs_engine_overhaul', '╨ƒ╨╛╤é╤Ç╤û╨▒╨╡╨╜ ╤Ç╨╡╨╝╨╛╨╜╤é ╨┤╨▓╨╕╨│╤â╨╜╨░'],
                            ['needs_undercarriage_repair', '╨ƒ╨╛╤é╤Ç╤û╨▒╨╡╨╜ ╤Ç╨╡╨╝╨╛╨╜╤é ╤à╨╛╨┤╨╛╨▓╨╛╤ù'],
                        ].map(([value, label]) => (
                            <label key={value} className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                                <input
                                    type="checkbox"
                                    checked={isCheckedInList('technical_condition', value)}
                                    onChange={() => toggleCheckboxListValue('technical_condition', value)}
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>╨Ü╤û╨╗╤î╨║╤û╤ü╤é╤î ╨▓╨╗╨░╤ü╨╜╨╕╨║╤û╨▓</label>
                        <input type="number" value={form.dynamicAttributes.owners_count ?? ''} onChange={(e) => setAttr('owners_count', e.target.value)} className={inputClass} min="0" />
                    </div>
                    <div>
                        <label className={labelClass}>╨ƒ╤Ç╨╛╨▒╤û╨│ (╨║╨╝)</label>
                        <input type="number" value={form.dynamicAttributes.mileage_km ?? ''} onChange={(e) => setAttr('mileage_km', e.target.value)} className={inputClass} min="0" />
                    </div>
                    <div>
                        <label className={labelClass}>╨ó╨╕╨┐ ╨║╤â╨╖╨╛╨▓╨░</label>
                        <input type="text" value={form.dynamicAttributes.body_type ?? ''} onChange={(e) => setAttr('body_type', e.target.value)} className={inputClass} />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>╨Ü╨╛╨╗╤û╤Ç</label>
                    <div className="flex flex-wrap gap-2">
                        {colorSwatches.map((swatch) => (
                            <button
                                key={swatch}
                                type="button"
                                onClick={() => setAttr('color', swatch)}
                                className={`wizard-color-swatch w-8 h-8 rounded-full border-2 ${colorValue === swatch ? 'border-blue-bright' : 'border-white/30'}`}
                                style={{ backgroundColor: swatch }}
                                aria-label={`╨Ü╨╛╨╗╤û╤Ç ${swatch}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>╨Ü╤û╨╗╤î╨║╤û╤ü╤é╤î ╨┤╨▓╨╡╤Ç╨╡╨╣</label>
                        <div className="flex gap-3">
                            {['2/3', '4/5', '6/7'].map((value) => (
                                <label key={value} className="flex items-center gap-1 text-sm">
                                    <input type="radio" name="doors_group" checked={(form.dynamicAttributes.doors_group ?? '') === value} onChange={() => setAttr('doors_group', value)} />
                                    {value}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>╨Ü╤û╨╗╤î╨║╤û╤ü╤é╤î ╨╝╤û╤ü╤å╤î</label>
                        <input type="number" value={form.dynamicAttributes.seats_count ?? ''} onChange={(e) => setAttr('seats_count', e.target.value)} className={inputClass} min="1" />
                    </div>
                    <div>
                        <label className={labelClass}>╨£╨░╤ü╨░ ╨╜╨╡╤é╤é╨╛ (╨║╨│)</label>
                        <input type="number" value={form.dynamicAttributes.net_weight_kg ?? ''} onChange={(e) => setAttr('net_weight_kg', e.target.value)} className={inputClass} min="0" />
                    </div>
                </div>
            </AccordionSection>

            <AccordionSection id="engine" title="╨ö╨▓╨╕╨│╤â╨╜, ╨║╨╛╤Ç╨╛╨▒╨║╨░ ╨┐╨╡╤Ç╨╡╨┤╨░╤ç" expanded={!!expandedSections.engine} onToggle={toggleSection} className={sectionClass} titleClassName={sectionTitleClass}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>╨£╨░╤Ç╨║╨░ ╨┤╨▓╨╕╨│╤â╨╜╨░</label>
                        <input type="text" value={form.dynamicAttributes.engine_mark ?? ''} onChange={(e) => setAttr('engine_mark', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>╨£╨╛╨┤╨╡╨╗╤î ╨┤╨▓╨╕╨│╤â╨╜╨░</label>
                        <input type="text" value={form.dynamicAttributes.engine_model ?? ''} onChange={(e) => setAttr('engine_model', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>╨ƒ╨░╨╗╨╕╨▓╨╛</label>
                        <select value={form.dynamicAttributes.fuel ?? ''} onChange={(e) => setAttr('fuel', e.target.value)} className={selectClass}>
                            <option value="">╨₧╨▒╨╡╤Ç╤û╤é╤î</option>
                            <option value="petrol">╨æ╨╡╨╜╨╖╨╕╨╜</option>
                            <option value="diesel">╨ö╨╕╨╖╨╡╨╗╤î</option>
                            <option value="hybrid">╨ô╤û╨▒╤Ç╨╕╨┤</option>
                            <option value="electric">╨ò╨╗╨╡╨║╤é╤Ç╨╛</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    {[
                        ['turbo', '╨ó╤â╤Ç╨▒╨╛'],
                        ['intercooler', '╨å╨╜╤é╨╡╤Ç╨║╤â╨╗╨╡╤Ç'],
                        ['particulate_filter', '╨í╨░╨╢╨╛╨▓╨╕╨╣ ╤ä╤û╨╗╤î╤é╤Ç'],
                        ['eev', 'EEV'],
                        ['reverse_gear', '╨á╨╡╨▓╨╡╤Ç╤ü'],
                    ].map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                            <input type="checkbox" checked={form.dynamicAttributes[key] === 'true'} onChange={(e) => setAttr(key, e.target.checked ? 'true' : '')} />
                            {label}
                        </label>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>╨ƒ╨╛╤é╤â╨╢╨╜╤û╤ü╤é╤î</label>
                        <div className="flex gap-2">
                            <input type="number" value={form.dynamicAttributes.power_value ?? ''} onChange={(e) => setAttr('power_value', e.target.value)} min="0" className={inputClass} />
                            <div className="flex items-center gap-2 px-3 rounded-lg border border-[var(--border-color)]">
                                <label className="flex items-center gap-1 text-sm">
                                    <input type="radio" name="power_unit" checked={powerUnit === 'hp'} onChange={() => setAttr('power_unit', 'hp')} />
                                    HP
                                </label>
                                <label className="flex items-center gap-1 text-sm">
                                    <input type="radio" name="power_unit" checked={powerUnit === 'kw'} onChange={() => setAttr('power_unit', 'kw')} />
                                    kW
                                </label>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>╨₧╨▒╩╝╤ö╨╝ ╨┤╨▓╨╕╨│╤â╨╜╨░ (╤ü╨╝┬│)</label>
                        <input type="number" value={form.dynamicAttributes.engine_volume_cm3 ?? ''} onChange={(e) => setAttr('engine_volume_cm3', e.target.value)} min="0" className={inputClass} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>╨ä╨▓╤Ç╨╛ ╤ü╤é╨░╨╜╨┤╨░╤Ç╤é</label>
                        <div className="flex flex-wrap gap-2">
                            {['1', '2', '3', '4', '5', '6', '7'].map((euro) => (
                                <label key={euro} className="flex items-center gap-1 text-sm">
                                    <input
                                        type="radio"
                                        name="euro_class"
                                        checked={(form.dynamicAttributes.euro_class ?? '') === euro}
                                        onChange={() => {
                                            setAttr('euro_class', euro);
                                            setForm((prev) => ({ ...prev, euroClass: `EURO_${euro}` }));
                                        }}
                                    />
                                    Euro {euro}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>╨Æ╨╕╤é╤Ç╨░╤é╨░ ╨┐╨░╨╗╨╕╨▓╨░</label>
                        <div className="flex gap-2">
                            <input type="number" value={form.dynamicAttributes.fuel_consumption_value ?? ''} onChange={(e) => setAttr('fuel_consumption_value', e.target.value)} min="0" step="0.1" className={inputClass} />
                            <div className="flex items-center gap-2 px-3 rounded-lg border border-[var(--border-color)]">
                                <label className="flex items-center gap-1 text-sm">
                                    <input type="radio" name="consumption_unit" checked={consumptionUnit === 'l_100km'} onChange={() => setAttr('fuel_consumption_unit', 'l_100km')} />
                                    l/100km
                                </label>
                                <label className="flex items-center gap-1 text-sm">
                                    <input type="radio" name="consumption_unit" checked={consumptionUnit === 'l_h'} onChange={() => setAttr('fuel_consumption_unit', 'l_h')} />
                                    l/h
                                </label>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>╨ó╨╕╨┐ ╨┐╤Ç╨╕╨▓╨╛╨┤╤â</label>
                        <div className="space-y-1">
                            {[
                                ['awd', '╨ƒ╨╛╨▓╨╜╨╕╨╣'],
                                ['rwd', '╨ù╨░╨┤╨╜╤û╨╣'],
                                ['fwd', '╨ƒ╨╡╤Ç╨╡╨┤╨╜╤û╨╣'],
                            ].map(([value, label]) => (
                                <label key={value} className="flex items-center gap-2 text-sm">
                                    <input type="radio" name="drive_type" checked={(form.dynamicAttributes.drive_type ?? '') === value} onChange={() => setAttr('drive_type', value)} />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>╨ó╨╕╨┐ ╨Ü╨ƒ╨ƒ</label>
                        <select value={form.dynamicAttributes.gearbox_type ?? ''} onChange={(e) => setAttr('gearbox_type', e.target.value)} className={selectClass}>
                            <option value="">╨₧╨▒╨╡╤Ç╤û╤é╤î</option>
                            <option value="manual">╨£╨╡╤à╨░╨╜╤û╤ç╨╜╨░</option>
                            <option value="automatic">╨É╨▓╤é╨╛╨╝╨░╤é╨╕╤ç╨╜╨░</option>
                            <option value="robot">╨á╨╛╨▒╨╛╤é</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>╨Ü╤û╨╗╤î╨║╤û╤ü╤é╤î ╨┐╨╡╤Ç╨╡╨┤╨░╤ç</label>
                        <input type="number" value={form.dynamicAttributes.gears_count ?? ''} onChange={(e) => setAttr('gears_count', e.target.value)} className={inputClass} min="1" />
                    </div>
                </div>
            </AccordionSection>

            <AccordionSection id="axles" title="╨₧╤ü╤û, ╨│╨░╨╗╤î╨╝╨░" expanded={!!expandedSections.axles} onToggle={toggleSection} className={sectionClass} titleClassName={sectionTitleClass}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>╨Ü╨╛╨╜╤ä╤û╨│╤â╤Ç╨░╤å╤û╤Å ╨╛╤ü╨╡╨╣</label>
                        <input type="text" value={form.dynamicAttributes.axle_configuration ?? ''} onChange={(e) => setAttr('axle_configuration', e.target.value)} className={inputClass} placeholder="4x2, 6x4..." />
                    </div>
                    <div>
                        <label className={labelClass}>╨á╨╛╨╖╨╝╤û╤Ç ╤ê╨╕╨╜</label>
                        <input type="text" value={form.dynamicAttributes.tyre_size ?? ''} onChange={(e) => setAttr('tyre_size', e.target.value)} className={inputClass} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>╨í╤é╨░╨╜ ╤ê╨╕╨╜ (%)</label>
                        <input type="number" value={form.dynamicAttributes.tyre_condition_percent ?? ''} onChange={(e) => setAttr('tyre_condition_percent', e.target.value)} className={inputClass} min="0" max="100" />
                    </div>
                    <div>
                        <label className={labelClass}>╨í╤é╨░╨╜ ╤ê╨╕╨╜ (╨╝╨╝)</label>
                        <input type="number" value={form.dynamicAttributes.tyre_condition_mm ?? ''} onChange={(e) => setAttr('tyre_condition_mm', e.target.value)} className={inputClass} min="0" step="0.1" />
                    </div>
                    <div className="flex items-center">
                        <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                            <input type="checkbox" checked={form.dynamicAttributes.enter_by_axles === 'true'} onChange={(e) => setAttr('enter_by_axles', e.target.checked ? 'true' : '')} />
                            ╨Æ╨▓╨╛╨┤╨╕╤é╨╕ ╨┐╨╛ ╨╛╤ü╤Å╤à
                        </label>
                    </div>
                </div>
            </AccordionSection>

            <AccordionSection id="options" title="╨ö╨╛╨┤╨░╤é╨║╨╛╨▓╤û ╨╛╨┐╤å╤û╤ù" expanded={!!expandedSections.options} onToggle={toggleSection} className={sectionClass} titleClassName={sectionTitleClass}>
                <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={hasAirConditioning} onChange={(e) => setAttr('air_conditioning', e.target.checked ? 'true' : '')} />
                        ╨Ü╨╛╨╜╨┤╨╕╤å╤û╨╛╨╜╨╡╤Ç
                    </label>
                    <div className={`${hasAirConditioning ? '' : 'opacity-50 pointer-events-none'}`}>
                        <label className={labelClass}>╨ó╨╕╨┐ ╨║╨╗╤û╨╝╨░╤é-╨║╨╛╨╜╤é╤Ç╨╛╨╗╤Ä</label>
                        <div className="flex flex-wrap gap-3">
                            {[
                                ['single', '╨Ü╨╗╤û╨╝╨░╤é-╨║╨╛╨╜╤é╤Ç╨╛╨╗╤î'],
                                ['dual', '╨ö╨▓╨╛╨╖╨╛╨╜╨╜╨╕╨╣'],
                                ['multi', '╨æ╨░╨│╨░╤é╨╛╨╖╨╛╨╜╨╜╨╕╨╣'],
                            ].map(([value, label]) => (
                                <label key={value} className="flex items-center gap-1 text-sm">
                                    <input type="radio" name="climate_control_type" checked={(form.dynamicAttributes.climate_control_type ?? '') === value} onChange={() => setAttr('climate_control_type', value)} />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={hasPoweredWindows} onChange={(e) => setAttr('powered_windows', e.target.checked ? 'true' : '')} />
                        ╨ò╨╗╨╡╨║╤é╤Ç╨╛╤ü╨║╨╗╨╛╨┐╤û╨┤╨╣╨╛╨╝╨╜╨╕╨║╨╕
                    </label>
                    <div className={`${hasPoweredWindows ? '' : 'opacity-50 pointer-events-none'}`}>
                        <label className={labelClass}>╨ó╨╕╨┐ ╤ü╨║╨╗╨╛╨┐╤û╨┤╨╣╨╛╨╝╨╜╨╕╨║╤û╨▓</label>
                        <div className="flex gap-3">
                            {[
                                ['front', '╨ƒ╨╡╤Ç╨╡╨┤╨╜╤û'],
                                ['front_rear', '╨ƒ╨╡╤Ç╨╡╨┤╨╜╤û ╤é╨░ ╨╖╨░╨┤╨╜╤û'],
                            ].map(([value, label]) => (
                                <label key={value} className="flex items-center gap-1 text-sm">
                                    <input type="radio" name="powered_windows_type" checked={(form.dynamicAttributes.powered_windows_type ?? '') === value} onChange={() => setAttr('powered_windows_type', value)} />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>╨£╨░╤é╨╡╤Ç╤û╨░╨╗ ╤ü╨░╨╗╨╛╨╜╤â</label>
                        <div className="flex gap-3">
                            {[
                                ['alcantara', '╨É╨╗╤î╨║╨░╨╜╤é╨░╤Ç╨░'],
                                ['faux_leather', '╨ò╨║╨╛╤ê╨║╤û╤Ç╨░'],
                                ['fabric', '╨ó╨║╨░╨╜╨╕╨╜╨░'],
                            ].map(([value, label]) => (
                                <label key={value} className="flex items-center gap-1 text-sm">
                                    <input type="radio" name="interior_material" checked={(form.dynamicAttributes.interior_material ?? '') === value} onChange={() => setAttr('interior_material', value)} />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </AccordionSection>

            <AccordionSection id="details" title="╨æ╤û╨╗╤î╤ê╨╡ ╨┤╨╡╤é╨░╨╗╨╡╨╣" expanded={!!expandedSections.details} onToggle={toggleSection} className={sectionClass} titleClassName={sectionTitleClass}>
                <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-900/20 text-sm text-[var(--text-secondary)]">
                    ╨ö╨╡╤é╨░╨╗╤î╨╜╨╕╨╣ ╨╛╨┐╨╕╤ü ╨╖╨▒╤û╨╗╤î╤ê╤â╤ö ╨┐╨╡╤Ç╨╡╨│╨╗╤Å╨┤╨╕ ╤é╨░ ╨┤╨╛╨▓╤û╤Ç╤â ╨┐╨╛╨║╤â╨┐╤å╤û╨▓.
                </div>
                <div>
                    <label className={labelClass}>╨₧╨┐╨╕╤ü (╨╛╤ü╨╜╨╛╨▓╨╜╨░ ╨╝╨╛╨▓╨░)</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows={6} className={`${inputClass} resize-none`} />
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-[var(--text-secondary)]">╨£╨╛╨▓╨╕:</span>
                    {selectedLanguages.map((lang) => (
                        <span key={lang} className="px-2 py-1 rounded-md bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs uppercase">
                            {lang}
                        </span>
                    ))}
                    <button
                        type="button"
                        onClick={() => {
                            const next = selectedLanguages.includes('uk')
                                ? selectedLanguages.includes('ru')
                                    ? selectedLanguages.includes('de')
                                        ? selectedLanguages
                                        : [...selectedLanguages, 'de']
                                    : [...selectedLanguages, 'ru']
                                : [...selectedLanguages, 'uk'];
                            setAttr('description_languages', next.join('|'));
                        }}
                        className="text-blue-bright text-sm hover:underline"
                    >
                        ╨ö╨╛╨┤╨░╤é╨╕ ╨╝╨╛╨▓╤â
                    </button>
                </div>
            </AccordionSection>

            <AccordionSection id="params" title="╨ƒ╨░╤Ç╨░╨╝╨╡╤é╤Ç╨╕ ╨╛╨│╨╛╨╗╨╛╤ê╨╡╨╜╨╜╤Å" expanded={!!expandedSections.params} onToggle={toggleSection} className={sectionClass} titleClassName={sectionTitleClass}>
                <div>
                    <label className={labelClass}>╨ó╨╕╨┐ ╨╛╨│╨╛╨╗╨╛╤ê╨╡╨╜╨╜╤Å</label>
                    <div className="flex gap-3">
                        {[
                            ['sale', '╨ƒ╤Ç╨╛╨┤╨░╨╢'],
                            ['rent', '╨₧╤Ç╨╡╨╜╨┤╨░'],
                            ['sale_rent', '╨ƒ╤Ç╨╛╨┤╨░╨╢ / ╨₧╤Ç╨╡╨╜╨┤╨░'],
                        ].map(([value, label]) => (
                            <label key={value} className="flex items-center gap-1 text-sm">
                                <input
                                    type="radio"
                                    name="advert_type"
                                    checked={advertType === value}
                                    onChange={() => {
                                        setAttr('advert_type', value);
                                        setForm((prev) => ({ ...prev, listingType: value === 'rent' ? 'RENT' : 'SALE' }));
                                    }}
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>╨ª╤û╨╜╨░</label>
                        <input type="number" name="priceAmount" value={form.priceAmount} onChange={handleChange} min="0" step="0.01" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>╨Æ╨░╨╗╤Ä╤é╨░</label>
                        <select name="priceCurrency" value={form.priceCurrency} onChange={handleChange} className={selectClass}>
                            <option value="EUR">EUR</option>
                            <option value="USD">USD</option>
                            <option value="UAH">UAH</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>╨ƒ╨ö╨Æ %</label>
                        <select
                            value={form.dynamicAttributes.vat_percent ?? '20'}
                            onChange={(e) => setAttr('vat_percent', e.target.value)}
                            className={selectClass}
                        >
                            <option value="0">0%</option>
                            <option value="7">7%</option>
                            <option value="20">20%</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-1 text-sm">
                        <input type="radio" name="vat_mode" checked={(form.dynamicAttributes.vat_mode ?? 'excluding') === 'excluding'} onChange={() => setAttr('vat_mode', 'excluding')} />
                        ╨æ╨╡╨╖ ╨ƒ╨ö╨Æ
                    </label>
                    <label className="flex items-center gap-1 text-sm">
                        <input type="radio" name="vat_mode" checked={(form.dynamicAttributes.vat_mode ?? '') === 'including'} onChange={() => setAttr('vat_mode', 'including')} />
                        ╨ù ╨ƒ╨ö╨Æ
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        ['reserved', '╨ù╨░╤Ç╨╡╨╖╨╡╤Ç╨▓╨╛╨▓╨░╨╜╨╛'],
                        ['leasing_possible', '╨¢╤û╨╖╨╕╨╜╨│ ╨╝╨╛╨╢╨╗╨╕╨▓╨╕╨╣'],
                        ['credit_possible', '╨Ü╤Ç╨╡╨┤╨╕╤é ╨╝╨╛╨╢╨╗╨╕╨▓╨╕╨╣'],
                        ['installments_possible', '╨á╨╛╨╖╤ü╤é╤Ç╨╛╤ç╨║╨░ ╨╝╨╛╨╢╨╗╨╕╨▓╨░'],
                    ].map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.dynamicAttributes[key] === 'true'} onChange={(e) => setAttr(key, e.target.checked ? 'true' : '')} />
                            {label}
                        </label>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>╨ô╨░╤Ç╨░╨╜╤é╤û╤Å</label>
                        <input type="text" value={form.dynamicAttributes.warranty ?? ''} onChange={(e) => setAttr('warranty', e.target.value)} className={inputClass} placeholder="12 ╨╝╤û╤ü╤Å╤å╤û╨▓" />
                    </div>
                    <div>
                        <label className={labelClass}>Seller stock ID</label>
                        <input type="text" value={form.dynamicAttributes.seller_stock_id ?? ''} onChange={(e) => setAttr('seller_stock_id', e.target.value)} className={inputClass} />
                    </div>
                </div>
            </AccordionSection>

            <AccordionSection id="location" title="╨¢╨╛╨║╨░╤å╤û╤Å" expanded={!!expandedSections.location} onToggle={toggleSection} className={sectionClass} titleClassName={sectionTitleClass}>
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

                <div>
                    <label className={labelClass}>╨ƒ╨╛╤ê╤â╨║ ╨╗╨╛╨║╨░╤å╤û╤ù</label>
                    <input
                        type="text"
                        value={form.dynamicAttributes.location_query ?? ''}
                        onChange={(e) => setAttr('location_query', e.target.value)}
                        className={inputClass}
                        placeholder="╨Æ╨▓╨╡╨┤╤û╤é╤î ╨╗╨╛╨║╨░╤å╤û╤Ä"
                    />
                </div>

                <div>
                    <label className={labelClass}>╨Ü╨░╤Ç╤é╨░ (╨║╨╗╤û╨║╨╜╤û╤é╤î ╨┤╨╗╤Å ╨▓╤ü╤é╨░╨╜╨╛╨▓╨╗╨╡╨╜╨╜╤Å ╤é╨╛╤ç╨║╨╕)</label>
                    <button
                        type="button"
                        className="wizard-map-surface w-full h-52 rounded-xl border border-[var(--border-color)] bg-gradient-to-br from-blue-900/30 to-blue-500/10 relative overflow-hidden"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = (e.clientX - rect.left) / rect.width;
                            const y = (e.clientY - rect.top) / rect.height;
                            const lat = (50 + (0.5 - y) * 10).toFixed(6);
                            const lng = (30 + (x - 0.5) * 20).toFixed(6);
                            setAttr('location_lat', lat);
                            setAttr('location_lng', lng);
                        }}
                    >
                        {form.dynamicAttributes.location_lat && form.dynamicAttributes.location_lng ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="px-3 py-1 rounded-full bg-red-500 text-white text-xs">
                                    {form.dynamicAttributes.location_lat}, {form.dynamicAttributes.location_lng}
                                </div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--text-secondary)]">
                                ╨Ü╨╗╤û╨║╨╜╤û╤é╤î ╨╜╨░ ╨║╨░╤Ç╤é╤û
                            </div>
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={(form.dynamicAttributes.geography_visibility ?? 'all_countries') === 'all_countries'}
                            onChange={(e) => setAttr('geography_visibility', e.target.checked ? 'all_countries' : 'restricted')}
                        />
                        ╨Æ╤ü╤û ╨║╤Ç╨░╤ù╨╜╨╕
                    </label>
                    <span className="text-xs text-[var(--text-secondary)]">
                        ╨Æ╨╕╨┤╨╕╨╝╤û╤ü╤é╤î ╨╛╨│╨╛╨╗╨╛╤ê╨╡╨╜╨╜╤Å ╨╝╨╛╨╢╨╜╨░ ╨╛╨▒╨╝╨╡╨╢╨╕╤é╨╕ ╨║╤Ç╨░╤ù╨╜╨░╨╝╨╕.
                    </span>
                </div>
            </AccordionSection>

            {form.categoryId && (
                <div className={sectionClass}>
                    <h2 className={sectionTitleClass}>╨ö╨╕╨╜╨░╨╝╤û╤ç╨╜╤û ╨┐╨╛╨╗╤Å ╨║╨░╤é╨╡╨│╨╛╤Ç╤û╤ù</h2>
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
                    className="wizard-action-btn px-8 py-3 rounded-lg text-white font-medium"
                >
                    ╨ö╨░╨╗╤û: ╨ñ╨╛╤é╨╛ ╤é╨░ ╨Æ╤û╨┤╨╡╨╛ ΓåÆ
                </button>
            </div>
        </div>
    );
}
