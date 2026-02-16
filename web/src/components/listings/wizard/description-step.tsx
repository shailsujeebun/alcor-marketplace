'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWizard } from './wizard-context';
import { useCategories, useBrands, useCountries, useCities, useCategoryTemplate, useCreateBrand } from '@/lib/queries';
import { useCategories, useCountries, useCities, useCategoryTemplate } from '@/lib/queries';
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
    const { data: categories } = useCategories();
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
            alert('Будь ласка, заповніть обов\'язкові поля (Категорія, Бренд, Назва)');
        if (!form.title.trim() || !form.categoryId) {
            alert('Будь ласка, заповніть обов\'язкові поля (Назва, Категорія)');
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
            alert(`Не вдалося створити бренд: ${message}`);
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
        { value: '01', label: 'Січ' }, { value: '02', label: 'Лют' }, { value: '03', label: 'Бер' },
        { value: '04', label: 'Кві' }, { value: '05', label: 'Тра' }, { value: '06', label: 'Чер' },
        { value: '07', label: 'Лип' }, { value: '08', label: 'Сер' }, { value: '09', label: 'Вер' },
        { value: '10', label: 'Жов' }, { value: '11', label: 'Лис' }, { value: '12', label: 'Гру' },
    ];

    const colorSwatches = ['#ffffff', '#111827', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#8b5cf6', '#9ca3af'];

    return (
        <div className="space-y-6">
            <AccordionSection id="basic" title="Основні характеристики" expanded={!!expandedSections.basic} onToggle={toggleSection} className={sectionClass} titleClassName={sectionTitleClass}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Basic Information - Universal Fields */}
            <div className={sectionClass}>
                <h2 className={sectionTitleClass}>Основна інформація</h2>

                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Категорія *</label>
                        <select
                            name="categoryId"
                            value={form.categoryId}
                            onChange={handleChange}
                            className={`${selectClass} ${categoryLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
                            disabled={categoryLocked}
                        >
                            <option value="">Оберіть категорію</option>
                            {leafCategories.map((c) => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Бренд *</label>
                        <select
                            name="brandId"
                            value={form.brandId}
                            onChange={handleChange}
                            className={`${selectClass} disabled:opacity-50`}
                            disabled={!form.categoryId}
                        >
                            <option value="">Оберіть бренд</option>
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
                                {showCreateBrand ? 'Скасувати' : 'Додати новий бренд'}
                            </button>
                            {!form.categoryId && (
                                <span className="text-xs text-[var(--text-secondary)]">
                                    Спочатку оберіть категорію
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
                                    placeholder="Наприклад: Iveco"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="wizard-action-btn px-4 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
                                    disabled={createBrandMutation.isPending}
                                >
                                    {createBrandMutation.isPending ? 'Збереження...' : 'Зберегти'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Модель</label>
                        <select
                            value={form.dynamicAttributes.model ?? ''}
                            onChange={(e) => setAttr('model', e.target.value)}
                            className={`${selectClass} disabled:opacity-50`}
                            disabled={!form.brandId}
                        >
                            <option value="">Оберіть модель</option>
                            {modelOptions.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                            <option value="custom">Інша (ввести вручну)</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Модель (текст)</label>
                        <input
                            type="text"
                            value={form.dynamicAttributes.model_text ?? ''}
                            onChange={(e) => setAttr('model_text', e.target.value)}
                            className={inputClass}
                            placeholder="Введіть модель авто"
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Назва оголошення *</label>
                    <input type="text" name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="Наприклад: Екскаватор CAT 320 2019" />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        id="right_hand_drive"
                        type="checkbox"
                        checked={form.dynamicAttributes.right_hand_drive === 'true'}
                        onChange={(e) => setAttr('right_hand_drive', e.target.checked ? 'true' : '')}
                    />
                    <label htmlFor="right_hand_drive" className="text-sm text-[var(--text-primary)]">
                        Правий руль
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>Рік випуску</label>
                        <select
                            value={form.dynamicAttributes.year_of_manufacture_year ?? form.year}
                            onChange={(e) => {
                                setAttr('year_of_manufacture_year', e.target.value);
                                setForm((prev) => ({ ...prev, year: e.target.value }));
                            }}
                            className={selectClass}
                        >
                            <option value="">Рік</option>
                            {years.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Місяць</label>
                        <select
                            value={form.dynamicAttributes.year_of_manufacture_month ?? ''}
                            onChange={(e) => setAttr('year_of_manufacture_month', e.target.value)}
                            className={selectClass}
                        >
                            <option value="">Місяць</option>
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
                        <label className={labelClass}>Перша реєстрація</label>
                        <div className="grid grid-cols-2 gap-2">
                            <select value={form.dynamicAttributes.first_registration_year ?? ''} onChange={(e) => setAttr('first_registration_year', e.target.value)} className={selectClass}>
                                <option value="">Рік</option>
                                {years.map((y) => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <select value={form.dynamicAttributes.first_registration_month ?? ''} onChange={(e) => setAttr('first_registration_month', e.target.value)} className={selectClass}>
                                <option value="">Місяць</option>
                                {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Техогляд дійсний до</label>
                        <div className="grid grid-cols-2 gap-2">
                            <select value={form.dynamicAttributes.inspection_valid_till_year ?? ''} onChange={(e) => setAttr('inspection_valid_till_year', e.target.value)} className={selectClass}>
                                <option value="">Рік</option>
                                {years.map((y) => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <select value={form.dynamicAttributes.inspection_valid_till_month ?? ''} onChange={(e) => setAttr('inspection_valid_till_month', e.target.value)} className={selectClass}>
                                <option value="">Місяць</option>
                                {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Стан</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                            ['new', 'Нове'],
                            ['used', 'Вживане'],
                            ['with_defect', 'З дефектом'],
                            ['remanufactured', 'Відновлене'],
                            ['crashed', 'Пошкоджене'],
                            ['demonstration', 'Демонстраційне'],
                            ['for_parts', 'На запчастини'],
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
                    <label className={labelClass}>Технічний стан</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {[
                            ['garage_storage', 'Гаражне зберігання'],
                            ['running', 'На ходу, справний'],
                            ['not_hit', 'Не битий'],
                            ['not_repainted', 'Не фарбований'],
                            ['service_booklet', 'Сервісна книжка'],
                            ['not_working', 'Не на ходу'],
                            ['needs_bodywork', 'Потребує кузовного ремонту'],
                            ['needs_engine_overhaul', 'Потрібен ремонт двигуна'],
                            ['needs_undercarriage_repair', 'Потрібен ремонт ходової'],
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
                        <label className={labelClass}>Кількість власників</label>
                        <input type="number" value={form.dynamicAttributes.owners_count ?? ''} onChange={(e) => setAttr('owners_count', e.target.value)} className={inputClass} min="0" />
                    </div>
                    <div>
                        <label className={labelClass}>Пробіг (км)</label>
                        <input type="number" value={form.dynamicAttributes.mileage_km ?? ''} onChange={(e) => setAttr('mileage_km', e.target.value)} className={inputClass} min="0" />
                    </div>
                    <div>
                        <label className={labelClass}>Тип кузова</label>
                        <input type="text" value={form.dynamicAttributes.body_type ?? ''} onChange={(e) => setAttr('body_type', e.target.value)} className={inputClass} />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Колір</label>
                    <div className="flex flex-wrap gap-2">
                        {colorSwatches.map((swatch) => (
                            <button
                                key={swatch}
                                type="button"
                                onClick={() => setAttr('color', swatch)}
                                className={`wizard-color-swatch w-8 h-8 rounded-full border-2 ${colorValue === swatch ? 'border-blue-bright' : 'border-white/30'}`}
                                style={{ backgroundColor: swatch }}
                                aria-label={`Колір ${swatch}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>Кількість дверей</label>
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
                        <label className={labelClass}>Кількість місць</label>
                        <input type="number" value={form.dynamicAttributes.seats_count ?? ''} onChange={(e) => setAttr('seats_count', e.target.value)} className={inputClass} min="1" />
                    </div>
                    <div>
                        <label className={labelClass}>Маса нетто (кг)</label>
                        <input type="number" value={form.dynamicAttributes.net_weight_kg ?? ''} onChange={(e) => setAttr('net_weight_kg', e.target.value)} className={inputClass} min="0" />
                    </div>
                </div>
            </AccordionSection>

            <AccordionSection id="engine" title="Двигун, коробка передач" expanded={!!expandedSections.engine} onToggle={toggleSection} className={sectionClass} titleClassName={sectionTitleClass}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>Марка двигуна</label>
                        <input type="text" value={form.dynamicAttributes.engine_mark ?? ''} onChange={(e) => setAttr('engine_mark', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Модель двигуна</label>
                        <input type="text" value={form.dynamicAttributes.engine_model ?? ''} onChange={(e) => setAttr('engine_model', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Паливо</label>
                        <select value={form.dynamicAttributes.fuel ?? ''} onChange={(e) => setAttr('fuel', e.target.value)} className={selectClass}>
                            <option value="">Оберіть</option>
                            <option value="petrol">Бензин</option>
                            <option value="diesel">Дизель</option>
                            <option value="hybrid">Гібрид</option>
                            <option value="electric">Електро</option>
                        </select>

                    <div>
                        <label className={labelClass}>Назва оголошення *</label>
                        <input type="text" name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="Наприклад: Екскаватор CAT 320 2019" />
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    {[
                        ['turbo', 'Турбо'],
                        ['intercooler', 'Інтеркулер'],
                        ['particulate_filter', 'Сажовий фільтр'],
                        ['eev', 'EEV'],
                        ['reverse_gear', 'Реверс'],
                    ].map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                            <input type="checkbox" checked={form.dynamicAttributes[key] === 'true'} onChange={(e) => setAttr(key, e.target.checked ? 'true' : '')} />
                            {label}
                        </label>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Потужність</label>
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
                        <label className={labelClass}>Обʼєм двигуна (см³)</label>
                        <input type="number" value={form.dynamicAttributes.engine_volume_cm3 ?? ''} onChange={(e) => setAttr('engine_volume_cm3', e.target.value)} min="0" className={inputClass} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>Євро стандарт</label>
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
                        <label className={labelClass}>Витрата палива</label>
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
                        <label className={labelClass}>Тип приводу</label>
                        <div className="space-y-1">
                            {[
                                ['awd', 'Повний'],
                                ['rwd', 'Задній'],
                                ['fwd', 'Передній'],
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
                        <label className={labelClass}>Тип КПП</label>
                        <select value={form.dynamicAttributes.gearbox_type ?? ''} onChange={(e) => setAttr('gearbox_type', e.target.value)} className={selectClass}>
                            <option value="">Оберіть</option>
                            <option value="manual">Механічна</option>
                            <option value="automatic">Автоматична</option>
                            <option value="robot">Робот</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Кількість передач</label>
                        <input type="number" value={form.dynamicAttributes.gears_count ?? ''} onChange={(e) => setAttr('gears_count', e.target.value)} className={inputClass} min="1" />
                    </div>
                </div>
            </AccordionSection>

            <AccordionSection id="axles" title="Осі, гальма" expanded={!!expandedSections.axles} onToggle={toggleSection} className={sectionClass} titleClassName={sectionTitleClass}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Конфігурація осей</label>
                        <input type="text" value={form.dynamicAttributes.axle_configuration ?? ''} onChange={(e) => setAttr('axle_configuration', e.target.value)} className={inputClass} placeholder="4x2, 6x4..." />
                    </div>
                    <div>
                        <label className={labelClass}>Розмір шин</label>
                        <input type="text" value={form.dynamicAttributes.tyre_size ?? ''} onChange={(e) => setAttr('tyre_size', e.target.value)} className={inputClass} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>Стан шин (%)</label>
                        <input type="number" value={form.dynamicAttributes.tyre_condition_percent ?? ''} onChange={(e) => setAttr('tyre_condition_percent', e.target.value)} className={inputClass} min="0" max="100" />
                    </div>
                    <div>
                        <label className={labelClass}>Стан шин (мм)</label>
                        <input type="number" value={form.dynamicAttributes.tyre_condition_mm ?? ''} onChange={(e) => setAttr('tyre_condition_mm', e.target.value)} className={inputClass} min="0" step="0.1" />
                    </div>
                    <div className="flex items-center">
                        <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                            <input type="checkbox" checked={form.dynamicAttributes.enter_by_axles === 'true'} onChange={(e) => setAttr('enter_by_axles', e.target.checked ? 'true' : '')} />
                            Вводити по осях
                        </label>
                    </div>
                </div>
            </AccordionSection>

            <AccordionSection id="options" title="Додаткові опції" expanded={!!expandedSections.options} onToggle={toggleSection} className={sectionClass} titleClassName={sectionTitleClass}>
                <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={hasAirConditioning} onChange={(e) => setAttr('air_conditioning', e.target.checked ? 'true' : '')} />
                        Кондиціонер
                    </label>
                    <div className={`${hasAirConditioning ? '' : 'opacity-50 pointer-events-none'}`}>
                        <label className={labelClass}>Тип клімат-контролю</label>
                        <div className="flex flex-wrap gap-3">
                            {[
                                ['single', 'Клімат-контроль'],
                                ['dual', 'Двозонний'],
                                ['multi', 'Багатозонний'],
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
                        Електросклопідйомники
                    </label>
                    <div className={`${hasPoweredWindows ? '' : 'opacity-50 pointer-events-none'}`}>
                        <label className={labelClass}>Тип склопідйомників</label>
                        <div className="flex gap-3">
                            {[
                                ['front', 'Передні'],
                                ['front_rear', 'Передні та задні'],
                            ].map(([value, label]) => (
                                <label key={value} className="flex items-center gap-1 text-sm">
                                    <input type="radio" name="powered_windows_type" checked={(form.dynamicAttributes.powered_windows_type ?? '') === value} onChange={() => setAttr('powered_windows_type', value)} />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Матеріал салону</label>
                        <div className="flex gap-3">
                            {[
                                ['alcantara', 'Алькантара'],
                                ['faux_leather', 'Екошкіра'],
                                ['fabric', 'Тканина'],
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

            <AccordionSection id="details" title="Більше деталей" expanded={!!expandedSections.details} onToggle={toggleSection} className={sectionClass} titleClassName={sectionTitleClass}>
                <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-900/20 text-sm text-[var(--text-secondary)]">
                    Детальний опис збільшує перегляди та довіру покупців.
                </div>
                <div>
                    <label className={labelClass}>Опис (основна мова)</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows={6} className={`${inputClass} resize-none`} />
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-[var(--text-secondary)]">Мови:</span>
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
                        Додати мову
                    </button>
                </div>
            </AccordionSection>

            <AccordionSection id="params" title="Параметри оголошення" expanded={!!expandedSections.params} onToggle={toggleSection} className={sectionClass} titleClassName={sectionTitleClass}>
                <div>
                    <label className={labelClass}>Тип оголошення</label>
                    <div className="flex gap-3">
                        {[
                            ['sale', 'Продаж'],
                            ['rent', 'Оренда'],
                            ['sale_rent', 'Продаж / Оренда'],
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
                        <label className={labelClass}>ПДВ %</label>
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
                        Без ПДВ
                    </label>
                    <label className="flex items-center gap-1 text-sm">
                        <input type="radio" name="vat_mode" checked={(form.dynamicAttributes.vat_mode ?? '') === 'including'} onChange={() => setAttr('vat_mode', 'including')} />
                        З ПДВ
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        ['reserved', 'Зарезервовано'],
                        ['leasing_possible', 'Лізинг можливий'],
                        ['credit_possible', 'Кредит можливий'],
                        ['installments_possible', 'Розстрочка можлива'],
                    ].map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.dynamicAttributes[key] === 'true'} onChange={(e) => setAttr(key, e.target.checked ? 'true' : '')} />
                            {label}
                        </label>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Гарантія</label>
                        <input type="text" value={form.dynamicAttributes.warranty ?? ''} onChange={(e) => setAttr('warranty', e.target.value)} className={inputClass} placeholder="12 місяців" />
                    </div>
                    <div>
                        <label className={labelClass}>Seller stock ID</label>
                        <input type="text" value={form.dynamicAttributes.seller_stock_id ?? ''} onChange={(e) => setAttr('seller_stock_id', e.target.value)} className={inputClass} />
                    </div>
                </div>
            </AccordionSection>

            <AccordionSection id="location" title="Локація" expanded={!!expandedSections.location} onToggle={toggleSection} className={sectionClass} titleClassName={sectionTitleClass}>
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

                <div>
                    <label className={labelClass}>Пошук локації</label>
                    <input
                        type="text"
                        value={form.dynamicAttributes.location_query ?? ''}
                        onChange={(e) => setAttr('location_query', e.target.value)}
                        className={inputClass}
                        placeholder="Введіть локацію"
                    />
                </div>

                <div>
                    <label className={labelClass}>Карта (клікніть для встановлення точки)</label>
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
                                Клікніть на карті
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
                        Всі країни
                    </label>
                    <span className="text-xs text-[var(--text-secondary)]">
                        Видимість оголошення можна обмежити країнами.
                    </span>
                </div>
            </AccordionSection>

            {form.categoryId && (
                <div className={sectionClass}>
                    <h2 className={sectionTitleClass}>Динамічні поля категорії</h2>
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
                    Далі: Фото та Відео →
                </button>
            </div>
        </div>
    );
}
