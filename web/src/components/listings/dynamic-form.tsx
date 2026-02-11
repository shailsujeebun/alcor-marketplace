'use client';

import { useState, useEffect } from 'react';
import type { FormField as TemplateField } from '@/lib/api';

interface DynamicFormProps {
    categoryId: string;
    template: { fields: TemplateField[] } | undefined;
    values: Record<string, string>;
    onChange: (values: Record<string, string>) => void;
}

const inputClass = 'w-full px-4 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-bright outline-none transition-colors';
const labelClass = 'block text-sm font-medium text-[var(--text-secondary)] mb-1.5';
const selectClass = `${inputClass} appearance-none`;

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

    const renderField = (field: TemplateField) => {
        const value = formValues[field.key] || '';

        switch (field.type) {
            case 'TEXT':
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

            case 'BOOLEAN':
                return (
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={value === 'true'}
                            onChange={(e) => handleFieldChange(field.key, e.target.checked ? 'true' : 'false')}
                            className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--bg-primary)] text-blue-bright focus:ring-blue-bright"
                        />
                        <span className="text-sm text-[var(--text-secondary)]">{field.label}</span>
                    </div>
                );

            case 'SELECT':
                return (
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
                );

            case 'MULTISELECT':
                return (
                    <div className="space-y-2">
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

            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            {template.fields.map((field) => (
                <div key={field.id}>
                    <label className={labelClass}>
                        {field.label}
                        {field.isRequired && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {renderField(field)}
                </div>
            ))}
        </div>
    );
}
