'use client';

import { useState, useEffect } from 'react';
import type { FormField as TemplateField } from '@/lib/api';
import { MapPin } from 'lucide-react';

interface DynamicFormProps {
    categoryId: string;
    template: { fields: TemplateField[] } | undefined;
    values: Record<string, string>;
    onChange: (values: Record<string, string>) => void;
}

const inputClass = 'w-full px-4 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-bright outline-none transition-colors';
const labelClass = 'block text-sm font-medium text-[var(--text-secondary)] mb-1.5';
const selectClass = `${inputClass} appearance-none`;
const radioClass = 'form-radio text-blue-bright focus:ring-blue-bright bg-[var(--bg-primary)] border-[var(--border-color)]';
const checkboxClass = 'form-checkbox text-blue-bright focus:ring-blue-bright rounded bg-[var(--bg-primary)] border-[var(--border-color)]';

export function DynamicForm({ categoryId, template, values, onChange }: DynamicFormProps) {
    const [formValues, setFormValues] = useState<Record<string, string>>(values);

    useEffect(() => {
        setFormValues(values);
    }, [values]);

    if (!template || !template.fields || template.fields.length === 0) {
        return (
            <div className="text-sm text-[var(--text-secondary)] italic">
                Для цієї категорії немає додаткових полів
            </div>
        );
    }

    const handleFieldChange = (key: string, value: string) => {
        const newValues = { ...formValues, [key]: value };
        setFormValues(newValues);
        onChange(newValues);
    };

    // Group fields by section
    const sections: Record<string, TemplateField[]> = {};
    const defaultSectionName = 'Додаткові характеристики';

    template.fields.forEach(field => {
        const section = field.section || defaultSectionName;
        if (!sections[section]) sections[section] = [];
        sections[section].push(field);
    });

    const renderField = (field: TemplateField) => {
        const value = formValues[field.key] || '';

        switch (field.type) {
            case 'TEXT':
            case 'PRICE': // Price treated as text/number combo usually, but here simple input for attribute
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className={inputClass}
                        placeholder={field.label}
                        required={field.isRequired}
                    />
                );

            case 'NUMBER':
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className={inputClass}
                        placeholder={field.label}
                        required={field.isRequired}
                        min={field.validationRules?.min}
                        max={field.validationRules?.max}
                    />
                );

            case 'RICHTEXT':
                return (
                    <textarea
                        value={value}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className={`${inputClass} min-h-[100px] resize-y`}
                        placeholder={field.label}
                        required={field.isRequired}
                    />
                );

            case 'BOOLEAN':
                return (
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-blue-bright/50 transition-colors">
                        <input
                            type="checkbox"
                            checked={value === 'true'}
                            onChange={(e) => handleFieldChange(field.key, e.target.checked ? 'true' : 'false')}
                            className="w-5 h-5 rounded border-[var(--border-color)] bg-[var(--bg-primary)] text-blue-bright focus:ring-blue-bright"
                        />
                        <span className="text-sm font-medium text-[var(--text-primary)]">{field.label}</span>
                    </label>
                );

            case 'SELECT':
                return (
                    <div className="relative">
                        <select
                            value={value}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            className={selectClass}
                            required={field.isRequired}
                        >
                            <option value="">Оберіть {field.label}</option>
                            {field.options?.map((option) => (
                                <option key={option.id} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                );

            case 'MULTISELECT':
                return (
                    <div className="space-y-2 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
                        {field.options?.map((option) => (
                            <label key={option.id} className="flex items-center gap-2 cursor-pointer hover:bg-[var(--bg-secondary)] p-1 rounded">
                                <input
                                    type="checkbox"
                                    checked={value.split(',').includes(option.value)}
                                    onChange={(e) => {
                                        const values = value ? value.split(',') : [];
                                        const newValues = e.target.checked
                                            ? [...values, option.value]
                                            : values.filter((v) => v !== option.value);
                                        handleFieldChange(field.key, newValues.join(','));
                                    }}
                                    className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--bg-primary)] text-blue-bright focus:ring-blue-bright"
                                />
                                <span className="text-sm text-[var(--text-primary)]">{option.label}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'RADIO':
                return (
                    <div className="space-y-2">
                        {field.options?.map((option) => (
                            <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name={field.key}
                                    value={option.value}
                                    checked={value === option.value}
                                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                    className="w-4 h-4 border-[var(--border-color)] bg-[var(--bg-primary)] text-blue-bright focus:ring-blue-bright"
                                />
                                <span className="text-sm text-[var(--text-primary)]">{option.label}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'CHECKBOX_GROUP':
                // Same logic as Multiselect nicely
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {field.options?.map((option) => (
                            <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={value.split(',').includes(option.value)}
                                    onChange={(e) => {
                                        const values = value ? value.split(',') : [];
                                        const newValues = e.target.checked
                                            ? [...values, option.value]
                                            : values.filter((v) => v !== option.value);
                                        handleFieldChange(field.key, newValues.join(','));
                                    }}
                                    className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--bg-primary)] text-blue-bright focus:ring-blue-bright"
                                />
                                <span className="text-sm text-[var(--text-primary)]">{option.label}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'DATE':
                return (
                    <input
                        type="date"
                        value={value}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className={inputClass}
                        required={field.isRequired}
                    />
                );

            case 'YEAR_RANGE':
                // Simulating range with text for now, or two inputs? 
                // Let's use two inputs "From - To" stored as "2000-2010"
                const [start, end] = value.split('-');
                return (
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="From"
                            value={start || ''}
                            onChange={(e) => handleFieldChange(field.key, `${e.target.value}-${end || ''}`)}
                            className={inputClass}
                            min="1900" max="2100"
                        />
                        <span className="text-[var(--text-secondary)]">-</span>
                        <input
                            type="number"
                            placeholder="To"
                            value={end || ''}
                            onChange={(e) => handleFieldChange(field.key, `${start || ''}-${e.target.value}`)}
                            className={inputClass}
                            min="1900" max="2100"
                        />
                    </div>
                );

            case 'COLOR':
                return (
                    <div className="flex gap-2 flex-wrap">
                        {field.options?.map((option) => (
                            <label
                                key={option.id}
                                className={`
                                    w-8 h-8 rounded-full cursor-pointer border-2 transition-all flex items-center justify-center
                                    ${value === option.value ? 'border-blue-bright scale-110 shadow-lg' : 'border-transparent hover:scale-105'}
                                `}
                                style={{ backgroundColor: option.value }}
                                title={option.label}
                            >
                                <input
                                    type="radio"
                                    name={field.key}
                                    value={option.value}
                                    checked={value === option.value}
                                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                    className="sr-only"
                                />
                                {value === option.value && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                            </label>
                        ))}
                        {/* If no options, basic color picker */}
                        {(!field.options || field.options.length === 0) && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={value || '#000000'}
                                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                    className="h-10 w-16 p-1 rounded bg-[var(--bg-primary)] border border-[var(--border-color)]"
                                />
                                <span className="text-sm text-[var(--text-secondary)]">{value}</span>
                            </div>
                        )}
                    </div>
                );

            case 'LOCATION':
                return (
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            className={`${inputClass} pl-10`}
                            placeholder="Address or Coordinates"
                            required={field.isRequired}
                        />
                    </div>
                );

            case 'MEDIA':
                return (
                    <div className="p-4 border-2 border-dashed border-[var(--border-color)] rounded-lg text-center hover:bg-[var(--bg-secondary)]/50 transition-colors">
                        <input
                            type="file"
                            className="hidden"
                            id={`file-${field.key}`}
                            onChange={(e) => {
                                // Basic handle file - usually needs upload logic
                                // For now just storing filename
                                if (e.target.files?.[0]) handleFieldChange(field.key, e.target.files[0].name);
                            }}
                        />
                        <label htmlFor={`file-${field.key}`} className="cursor-pointer flex flex-col items-center">
                            <span className="text-sm font-medium text-blue-bright mb-1">Upload File</span>
                            <span className="text-xs text-[var(--text-secondary)]">{value || 'No file selected'}</span>
                        </label>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-8">
            {Object.entries(sections).map(([sectionName, fields]) => (
                <div key={sectionName} className="space-y-4">
                    {Object.keys(sections).length > 1 && (
                        <h3 className="text-lg font-heading font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 mb-4">
                            {sectionName}
                        </h3>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {fields.map((field) => (
                            <div key={field.id} className={field.type === 'RICHTEXT' || field.type === 'CHECKBOX_GROUP' ? 'md:col-span-2' : ''}>
                                <label className={labelClass}>
                                    {field.label}
                                    {field.isRequired && <span className="text-red-400 ml-1">*</span>}
                                </label>
                                {renderField(field)}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
