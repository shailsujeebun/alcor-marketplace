type RawOption = {
  id?: bigint | number | string;
  value: string;
  label: string;
  sortOrder?: number | null;
};

type RawField = {
  id?: bigint | number | string;
  fieldKey: string;
  label: string;
  fieldType: string;
  required?: boolean;
  sortOrder?: number;
  section?: string | null;
  validations?: Record<string, any> | null;
  visibilityIf?: Record<string, any> | null;
  requiredIf?: Record<string, any> | null;
  config?: Record<string, any> | null;
  options?: RawOption[];
};

type RawBlock = {
  id: string;
  name: string;
  isSystem?: boolean;
  fields: any[];
};

const DEFAULT_ENGINE_BLOCK_FIELDS = [
  {
    key: 'fuel_type',
    label: 'Fuel type',
    component: 'select',
    required: false,
    group: 'Engine',
    order: 1000,
    dataSource: 'static',
    staticOptions: [
      { value: 'diesel', label: 'Diesel' },
      { value: 'petrol', label: 'Petrol' },
      { value: 'electric', label: 'Electric' },
      { value: 'hybrid', label: 'Hybrid' },
      { value: 'lpg', label: 'LPG' },
    ],
  },
  {
    key: 'power_hp',
    label: 'Power',
    component: 'number',
    required: false,
    group: 'Engine',
    order: 1010,
    validationRules: { min: 1, max: 5000, unit: 'hp' },
  },
  {
    key: 'engine_displacement_cm3',
    label: 'Engine displacement',
    component: 'number',
    required: false,
    group: 'Engine',
    order: 1020,
    validationRules: { min: 1, max: 100000, unit: 'cm3' },
  },
  {
    key: 'engine_model',
    label: 'Engine model',
    component: 'text',
    required: false,
    group: 'Engine',
    order: 1030,
  },
  {
    key: 'emission_class',
    label: 'Emission class',
    component: 'select',
    required: false,
    group: 'Engine',
    order: 1040,
    dataSource: 'static',
    staticOptions: [
      { value: 'euro_1', label: 'Euro 1' },
      { value: 'euro_2', label: 'Euro 2' },
      { value: 'euro_3', label: 'Euro 3' },
      { value: 'euro_4', label: 'Euro 4' },
      { value: 'euro_5', label: 'Euro 5' },
      { value: 'euro_6', label: 'Euro 6' },
      { value: 'tier_4', label: 'Tier 4' },
      { value: 'stage_v', label: 'Stage V' },
    ],
  },
];

const typeToComponent: Record<string, string> = {
  TEXT: 'text',
  NUMBER: 'number',
  PRICE: 'text',
  RICHTEXT: 'textarea',
  SELECT: 'select',
  MULTISELECT: 'select',
  RADIO: 'radio',
  CHECKBOX_GROUP: 'checkbox',
  BOOLEAN: 'checkbox',
  DATE: 'date',
  YEAR_RANGE: 'number',
  COLOR: 'select',
  LOCATION: 'text',
  MEDIA: 'text',
};

const componentToType: Record<string, string> = {
  text: 'TEXT',
  number: 'NUMBER',
  checkbox: 'BOOLEAN',
  radio: 'RADIO',
  textarea: 'RICHTEXT',
  date: 'DATE',
  select: 'SELECT',
};

export function sanitizeFieldPayload(inputField: any, index: number) {
  const config = { ...(inputField.config ?? {}) };
  const component = (
    inputField.component ??
    config.component ??
    typeToComponent[inputField.type] ??
    'text'
  ).toLowerCase();
  const normalizedType =
    (inputField.type as string | undefined)?.toUpperCase() ??
    componentToType[component] ??
    'TEXT';

  const section =
    inputField.group ??
    inputField.section ??
    config.group ??
    config.section ??
    null;
  const sortOrder = Number(inputField.order ?? inputField.sortOrder ?? index);

  const staticOptions = Array.isArray(inputField.staticOptions)
    ? inputField.staticOptions
    : Array.isArray(inputField.options)
      ? inputField.options.map((option: any) => ({
          value: String(option.value ?? ''),
          label: String(option.label ?? option.value ?? ''),
        }))
      : [];

  const normalizedConfig = {
    ...config,
    key: inputField.key,
    label: inputField.label,
    component,
    placeholder: inputField.placeholder ?? config.placeholder,
    group: section ?? undefined,
    order: sortOrder,
    dataSource:
      inputField.dataSource ??
      config.dataSource ??
      (staticOptions.length ? 'static' : 'api'),
    staticOptions,
    optionsEndpoint: inputField.optionsEndpoint ?? config.optionsEndpoint,
    optionsQuery: inputField.optionsQuery ?? config.optionsQuery,
    dependsOn: inputField.dependsOn ?? config.dependsOn ?? [],
    optionsMapping: inputField.optionsMapping ?? config.optionsMapping,
    resetOnChange: inputField.resetOnChange ?? config.resetOnChange ?? [],
  };

  return {
    fieldKey: String(inputField.key),
    label: String(inputField.label ?? inputField.key),
    fieldType: normalizedType,
    required: Boolean(
      inputField.required ??
        inputField.isRequired ??
        inputField.baseRequired ??
        false,
    ),
    sortOrder,
    section,
    validations:
      inputField.validationRules ??
      inputField.validations ??
      config.validationRules ??
      {},
    visibilityIf:
      inputField.visibleIf ?? inputField.visibilityIf ?? config.visibleIf ?? {},
    requiredIf: inputField.requiredIf ?? config.requiredIf ?? {},
    config: normalizedConfig,
    staticOptions,
  };
}

function mapOptions(options: RawOption[] = []) {
  return options.map((option, index) => ({
    id: option.id ? option.id.toString() : `${index}`,
    value: option.value,
    label: option.label,
  }));
}

export function mapFieldToResponse(rawField: RawField) {
  const config = rawField.config ?? {};
  const options = mapOptions(rawField.options ?? []);
  const component = (
    config.component ??
    typeToComponent[rawField.fieldType] ??
    'text'
  ).toLowerCase();

  const dataSource = config.dataSource ?? (options.length > 0 ? 'static' : 'api');
  const staticOptions =
    dataSource === 'static'
      ? (Array.isArray(config.staticOptions) ? config.staticOptions : options).map(
          (option: any, index: number) => ({
            id: option.id ? String(option.id) : `${index}`,
            value: String(option.value),
            label: String(option.label),
          }),
        )
      : [];

  return {
    id: rawField.id ? rawField.id.toString() : undefined,
    key: rawField.fieldKey,
    label: rawField.label,
    type: rawField.fieldType,
    component,
    required: Boolean(rawField.required),
    isRequired: Boolean(rawField.required),
    placeholder: config.placeholder,
    group: config.group ?? rawField.section ?? undefined,
    section: config.group ?? rawField.section ?? undefined,
    order: rawField.sortOrder ?? 0,
    dataSource,
    staticOptions,
    options,
    optionsEndpoint: config.optionsEndpoint,
    optionsQuery: config.optionsQuery,
    dependsOn: config.dependsOn ?? [],
    optionsMapping: config.optionsMapping,
    visibleIf: rawField.visibilityIf ?? {},
    visibilityIf: rawField.visibilityIf ?? {},
    requiredIf: rawField.requiredIf ?? {},
    resetOnChange: config.resetOnChange ?? [],
    validationRules: rawField.validations ?? {},
    validations: rawField.validations ?? {},
  };
}

export function getBuiltInEngineBlock(): RawBlock {
  return {
    id: 'engine_block',
    name: 'Engine Block',
    isSystem: true,
    fields: DEFAULT_ENGINE_BLOCK_FIELDS,
  };
}

export function mergeTemplateFieldsWithBlocks(
  templateFields: RawField[],
  blocks: RawBlock[],
): ReturnType<typeof mapFieldToResponse>[] {
  const mappedTemplateFields = templateFields.map((field) =>
    mapFieldToResponse(field),
  );
  const mappedBlockFields = blocks.flatMap((block) =>
    (block.fields ?? []).map((rawField: any, index: number) => {
      const normalized = sanitizeFieldPayload(
        {
          ...rawField,
          section: rawField.group ?? rawField.section ?? block.name,
        },
        index,
      );
      return mapFieldToResponse({
        id: `${block.id}:${normalized.fieldKey}`,
        fieldKey: normalized.fieldKey,
        label: normalized.label,
        fieldType: normalized.fieldType,
        required: normalized.required,
        sortOrder: normalized.sortOrder,
        section: normalized.section,
        validations: normalized.validations,
        visibilityIf: normalized.visibilityIf,
        requiredIf: normalized.requiredIf,
        config: normalized.config,
        options: (normalized.staticOptions ?? []).map((option, optionIndex) => ({
          id: `${block.id}:${normalized.fieldKey}:${optionIndex}`,
          value: option.value,
          label: option.label,
          sortOrder: optionIndex,
        })),
      });
    }),
  );

  const deduped = new Map<string, ReturnType<typeof mapFieldToResponse>>();
  for (const field of [...mappedTemplateFields, ...mappedBlockFields]) {
    deduped.set(field.key, field);
  }

  return Array.from(deduped.values()).sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
}

