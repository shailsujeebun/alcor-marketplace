import { FormField } from '@prisma/client';

export type RuleNode =
  | { type: 'condition'; field: string; op: 'eq' | 'neq' | 'in' | 'nin' | 'gt' | 'lt'; value: any }
  | { type: 'and'; args: RuleNode[] }
  | { type: 'or'; args: RuleNode[] };

export interface ExtendedFormField extends Omit<FormField, 'id' | 'templateId'> {
  fieldKey: string;
  label: string;
  fieldType: string;
  required: boolean;
  sortOrder: number;
  helpText: string | null;
  validations: any;
  visibilityIf: any;
  config: any;
  requiredIf: any;
  section: string | null;
  options: any[]; // Extended with options where needed
}

export const DEFAULT_MOTORIZED_BLOCK_FIELDS: ExtendedFormField[] = [
  {
    fieldKey: 'brand',
    label: 'Brand',
    fieldType: 'select',
    required: true,
    sortOrder: 10,
    helpText: null,
    validations: {},
    visibilityIf: {},
    config: { dataSource: 'brands' },
    requiredIf: {},
    section: 'Specs',
    options: [],
  },
  {
    fieldKey: 'model',
    label: 'Model',
    fieldType: 'select',
    required: true,
    sortOrder: 11,
    helpText: null,
    validations: {},
    visibilityIf: { type: 'condition', field: 'brand', op: 'neq', value: null },
    config: { dataSource: 'models', dependsOn: 'brand', resetOnChange: ['brand'] },
    requiredIf: {},
    section: 'Specs',
    options: [],
  },
  {
    fieldKey: 'year',
    label: 'Year',
    fieldType: 'number',
    required: true,
    sortOrder: 12,
    helpText: null,
    validations: { min: 1900, max: new Date().getFullYear() + 1 },
    visibilityIf: {},
    config: {},
    requiredIf: {},
    section: 'Specs',
    options: [],
  },
  {
    fieldKey: 'mileage_km',
    label: 'Mileage (km)',
    fieldType: 'number',
    required: false,
    sortOrder: 13,
    helpText: null,
    validations: { min: 0 },
    visibilityIf: { type: 'condition', field: 'condition', op: 'eq', value: 'USED' },
    config: {},
    requiredIf: { type: 'condition', field: 'condition', op: 'eq', value: 'USED' },
    section: 'Condition',
    options: [],
  }
];

export function getBuiltInEngineBlock() {
  return {
    id: 'engine_block',
    name: 'Engine & Vehicle Specs',
    isSystem: true,
    fields: DEFAULT_MOTORIZED_BLOCK_FIELDS,
  };
}

export function mergeTemplateFieldsWithBlocks(
  localFields: any[],
  blocks: any[]
): any[] {
  const mergedMap = new Map<string, any>();

  // Add block fields first (lower priority if overwritten by local, but usually they are additive)
  for (const block of blocks) {
    const fields = Array.isArray(block.fields) ? block.fields : [];
    for (const f of fields) {
      if (!mergedMap.has(f.fieldKey)) {
        mergedMap.set(f.fieldKey, f);
      }
    }
  }

  // Add local fields, overwriting block fields with the same key
  for (const f of localFields) {
    mergedMap.set(f.fieldKey, f);
  }

  // Convert map back to array and sort
  const merged = Array.from(mergedMap.values());
  merged.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return merged;
}
