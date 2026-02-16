'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormField as TemplateField } from '@/lib/api';
import { MapPin } from 'lucide-react';

interface DynamicFormProps {
  categoryId: string;
  template: { fields: TemplateField[] } | undefined;
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

type FieldValidation = {
  min?: number;
  max?: number;
  unit?: string;
  hint?: string;
};

const inputClass =
  'w-full px-4 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 focus:border-blue-bright outline-none transition-colors';
const selectClass = `${inputClass} appearance-none`;

function parseSelection(value: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatFieldHint(validation?: FieldValidation): string | null {
  if (!validation) return null;

  const parts: string[] = [];
  if (typeof validation.min === 'number') parts.push(`min ${validation.min}`);
  if (typeof validation.max === 'number') parts.push(`max ${validation.max}`);
  if (validation.unit) parts.push(`unit: ${validation.unit}`);
  if (validation.hint) parts.push(validation.hint);

  return parts.length > 0 ? parts.join(' • ') : null;
}

function getFieldSpanClass(fieldType: TemplateField['type']) {
  if (fieldType === 'RICHTEXT' || fieldType === 'CHECKBOX_GROUP' || fieldType === 'MULTISELECT') {
    return 'md:col-span-2';
  }
  if (fieldType === 'MEDIA') {
    return 'md:col-span-2';
  }
  return '';
}

function OptionChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
        active
          ? 'bg-blue-bright/20 text-blue-bright border-blue-bright/50'
          : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-blue-bright/40 hover:text-[var(--text-primary)]'
      }`}
    >
      {label}
    </button>
  );
}

export function DynamicForm({ categoryId, template, values, onChange }: DynamicFormProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>(values);

  useEffect(() => {
    setFormValues(values);
  }, [values, categoryId]);

  const handleFieldChange = (key: string, value: string) => {
    const nextValues = { ...formValues, [key]: value };
    setFormValues(nextValues);
    onChange(nextValues);
  };

  const sectionEntries = useMemo(() => {
    if (!template?.fields?.length) return [];

    const grouped = new Map<string, TemplateField[]>();
    const defaultSectionName = 'Additional details';

    for (const field of template.fields) {
      const section = field.section || defaultSectionName;
      const current = grouped.get(section) ?? [];
      current.push(field);
      grouped.set(section, current);
    }

    return Array.from(grouped.entries());
  }, [template]);

  if (!template?.fields?.length) {
    return (
      <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]/30 px-4 py-3 text-sm text-[var(--text-secondary)]">
        No additional fields configured for this category.
      </div>
    );
  }

  const renderFieldControl = (field: TemplateField) => {
    const value = formValues[field.key] || '';
    const validation = (field.validationRules ?? {}) as FieldValidation;
    const options = field.options ?? [];

    switch (field.type) {
      case 'TEXT':
      case 'PRICE':
        return (
          <input
            type="text"
            value={value}
            onChange={(event) => handleFieldChange(field.key, event.target.value)}
            className={inputClass}
            placeholder={field.label}
            required={field.isRequired}
          />
        );

      case 'NUMBER':
        return (
          <div className="relative">
            <input
              type="number"
              value={value}
              onChange={(event) => handleFieldChange(field.key, event.target.value)}
              className={`${inputClass} ${validation.unit ? 'pr-14' : ''}`}
              placeholder={field.label}
              required={field.isRequired}
              min={validation.min}
              max={validation.max}
            />
            {validation.unit && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)]">
                {validation.unit}
              </span>
            )}
          </div>
        );

      case 'RICHTEXT':
        return (
          <textarea
            value={value}
            onChange={(event) => handleFieldChange(field.key, event.target.value)}
            className={`${inputClass} min-h-[120px] resize-y`}
            placeholder={field.label}
            required={field.isRequired}
          />
        );

      case 'BOOLEAN': {
        const current = value === 'true' ? 'true' : value === 'false' ? 'false' : '';
        return (
          <div className="flex flex-wrap gap-2">
            <OptionChip
              active={current === 'true'}
              label="Yes"
              onClick={() => handleFieldChange(field.key, 'true')}
            />
            <OptionChip
              active={current === 'false'}
              label="No"
              onClick={() => handleFieldChange(field.key, 'false')}
            />
            <OptionChip
              active={current === ''}
              label="Not set"
              onClick={() => handleFieldChange(field.key, '')}
            />
          </div>
        );
      }

      case 'SELECT':
        return (
          <div className="relative">
            <select
              value={value}
              onChange={(event) => handleFieldChange(field.key, event.target.value)}
              className={selectClass}
              required={field.isRequired}
            >
              <option value="">Choose {field.label.toLowerCase()}</option>
              {options.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        );

      case 'MULTISELECT':
      case 'CHECKBOX_GROUP': {
        const selectedValues = parseSelection(value);
        return (
          <div className="flex flex-wrap gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]/20 p-3">
            {options.map((option) => (
              <OptionChip
                key={option.id}
                active={selectedValues.includes(option.value)}
                label={option.label}
                onClick={() => {
                  const next = selectedValues.includes(option.value)
                    ? selectedValues.filter((item) => item !== option.value)
                    : [...selectedValues, option.value];
                  handleFieldChange(field.key, next.join(','));
                }}
              />
            ))}
          </div>
        );
      }

      case 'RADIO':
        return (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <OptionChip
                key={option.id}
                active={value === option.value}
                label={option.label}
                onClick={() => handleFieldChange(field.key, option.value)}
              />
            ))}
          </div>
        );

      case 'DATE':
        return (
          <input
            type="date"
            value={value}
            onChange={(event) => handleFieldChange(field.key, event.target.value)}
            className={inputClass}
            required={field.isRequired}
          />
        );

      case 'YEAR_RANGE': {
        const [start = '', end = ''] = value.split('-');
        return (
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
            <input
              type="number"
              placeholder="From year"
              value={start}
              onChange={(event) => handleFieldChange(field.key, `${event.target.value}-${end}`)}
              className={inputClass}
              min="1900"
              max="2100"
            />
            <span className="text-[var(--text-secondary)] text-sm">to</span>
            <input
              type="number"
              placeholder="To year"
              value={end}
              onChange={(event) => handleFieldChange(field.key, `${start}-${event.target.value}`)}
              className={inputClass}
              min="1900"
              max="2100"
            />
          </div>
        );
      }

      case 'COLOR': {
        if (options.length === 0) {
          return (
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={value || '#000000'}
                onChange={(event) => handleFieldChange(field.key, event.target.value)}
                className="h-10 w-14 p-1 rounded bg-[var(--bg-primary)] border border-[var(--border-color)]"
              />
              <span className="text-sm text-[var(--text-secondary)]">{value || '#000000'}</span>
            </div>
          );
        }

        return (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => {
              const selected = value === option.value;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleFieldChange(field.key, option.value)}
                  className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-colors ${
                    selected
                      ? 'border-blue-bright/60 bg-blue-bright/20 text-[var(--text-primary)]'
                      : 'border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)]'
                  }`}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-white/30"
                    style={{ backgroundColor: option.value }}
                  />
                  {option.label}
                </button>
              );
            })}
          </div>
        );
      }

      case 'LOCATION':
        return (
          <div className="relative">
            <MapPin
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
              size={18}
            />
            <input
              type="text"
              value={value}
              onChange={(event) => handleFieldChange(field.key, event.target.value)}
              className={`${inputClass} pl-10`}
              placeholder="Address or coordinates"
              required={field.isRequired}
            />
          </div>
        );

      case 'MEDIA':
        return (
          <div className="rounded-lg border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)]/20 px-4 py-4">
            <input
              type="file"
              className="hidden"
              id={`file-${field.key}`}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleFieldChange(field.key, file.name);
              }}
            />
            <label htmlFor={`file-${field.key}`} className="cursor-pointer">
              <p className="text-sm font-medium text-blue-bright">Upload file</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                {value || 'No file selected'}
              </p>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {sectionEntries.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {sectionEntries.map(([sectionName, fields]) => {
            const requiredCount = fields.filter((field) => field.isRequired).length;
            return (
              <span
                key={sectionName}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)]/30 px-3 py-1 text-xs text-[var(--text-secondary)]"
              >
                {sectionName}
                <span className="opacity-80">
                  {requiredCount > 0 ? `${requiredCount} req` : `${fields.length} fields`}
                </span>
              </span>
            );
          })}
        </div>
      )}

      {sectionEntries.map(([sectionName, fields]) => (
        <section
          key={sectionName}
          className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/15 p-4 sm:p-5"
        >
          {sectionEntries.length > 1 && (
            <div className="mb-4 flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">{sectionName}</h3>
              <span className="text-xs text-[var(--text-secondary)]">{fields.length} fields</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {fields.map((field) => {
              const hint = formatFieldHint((field.validationRules ?? {}) as FieldValidation);
              return (
                <div key={field.id} className={`space-y-2 ${getFieldSpanClass(field.type)}`}>
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-medium text-[var(--text-primary)]">
                      {field.label}
                      {field.isRequired && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <span className="text-[11px] uppercase tracking-wide text-[var(--text-secondary)]">
                      {field.type}
                    </span>
                  </div>

                  {renderFieldControl(field)}

                  {hint && <p className="text-xs text-[var(--text-secondary)]">{hint}</p>}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
