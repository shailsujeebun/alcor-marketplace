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

const YEAR_OPTIONS = Array.from({ length: 77 }, (_, index) => {
  const year = 2026 - index;
  return { value: String(year), label: String(year) };
});

const MONTH_OPTIONS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export const DEFAULT_MOTORIZED_BLOCK_FIELDS = [
  {
    key: 'brand',
    label: 'Brand',
    type: 'SELECT',
    component: 'select',
    group: 'Basic Characteristics',
    order: 1000,
    dataSource: 'api',
  },
  {
    key: 'model',
    label: 'Model',
    type: 'SELECT',
    component: 'select',
    group: 'Basic Characteristics',
    order: 1010,
    dataSource: 'api',
    dependsOn: ['brand'],
    resetOnChange: [],
  },
  {
    key: 'right_hand_drive',
    label: 'Right hand drive',
    type: 'BOOLEAN',
    component: 'checkbox',
    group: 'Basic Characteristics',
    order: 1020,
  },
  {
    key: 'year_of_manufacture',
    label: 'Year of manufacture',
    type: 'SELECT',
    component: 'select',
    group: 'Basic Characteristics',
    order: 1030,
    dataSource: 'static',
    staticOptions: YEAR_OPTIONS,
  },
  {
    key: 'month_of_manufacture',
    label: 'Month of manufacture',
    type: 'SELECT',
    component: 'select',
    group: 'Basic Characteristics',
    order: 1040,
    dataSource: 'static',
    staticOptions: MONTH_OPTIONS,
  },
  {
    key: 'first_registration_year',
    label: 'First registration (year)',
    type: 'SELECT',
    component: 'select',
    group: 'Basic Characteristics',
    order: 1050,
    dataSource: 'static',
    staticOptions: YEAR_OPTIONS,
  },
  {
    key: 'first_registration_month',
    label: 'First registration (month)',
    type: 'SELECT',
    component: 'select',
    group: 'Basic Characteristics',
    order: 1060,
    dataSource: 'static',
    staticOptions: MONTH_OPTIONS,
  },
  {
    key: 'inspection_valid_till_year',
    label: 'Technical inspection valid till (year)',
    type: 'SELECT',
    component: 'select',
    group: 'Basic Characteristics',
    order: 1070,
    dataSource: 'static',
    staticOptions: YEAR_OPTIONS,
  },
  {
    key: 'inspection_valid_till_month',
    label: 'Technical inspection valid till (month)',
    type: 'SELECT',
    component: 'select',
    group: 'Basic Characteristics',
    order: 1080,
    dataSource: 'static',
    staticOptions: MONTH_OPTIONS,
  },
  {
    key: 'vin',
    label: 'VIN',
    type: 'TEXT',
    component: 'text',
    group: 'Basic Characteristics',
    order: 1090,
    validationRules: { minLength: 8, maxLength: 32 },
  },
  {
    key: 'condition',
    label: 'Condition',
    type: 'RADIO',
    component: 'radio',
    group: 'Basic Characteristics',
    order: 1100,
    dataSource: 'static',
    staticOptions: [
      { value: 'new', label: 'New' },
      { value: 'used', label: 'Used' },
      { value: 'with_defect', label: 'With a defect' },
      { value: 'remanufactured', label: 'Remanufactured' },
      { value: 'crashed', label: 'Crashed' },
      { value: 'demonstration', label: 'Demonstration' },
      { value: 'for_parts', label: 'For parts' },
    ],
  },
  {
    key: 'technical_condition',
    label: 'Technical condition',
    type: 'CHECKBOX_GROUP',
    component: 'checkbox',
    group: 'Basic Characteristics',
    order: 1110,
    dataSource: 'static',
    staticOptions: [
      { value: 'garage_storage', label: 'Garage storage' },
      { value: 'running_good', label: 'Running in good working order' },
      { value: 'hasnt_been_hit', label: "Hasn't been hit" },
      { value: 'hasnt_been_repainted', label: "Hasn't been repainted" },
      { value: 'service_booklet', label: 'Service booklet' },
      { value: 'not_working', label: 'Not in working order' },
      { value: 'needs_bodywork', label: 'Needs bodywork' },
      { value: 'needs_engine_overhaul', label: 'Needs engine overhaul' },
      {
        value: 'needs_undercarriage_repair',
        label: 'Needs undercarriage repair',
      },
    ],
  },
  {
    key: 'previous_owners',
    label: 'Number of previous owners',
    type: 'SELECT',
    component: 'select',
    group: 'Basic Characteristics',
    order: 1120,
    dataSource: 'static',
    staticOptions: [
      { value: '0', label: '0' },
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
      { value: '4', label: '4' },
      { value: '5_plus', label: '5+' },
    ],
  },
  {
    key: 'mileage',
    label: 'Mileage',
    type: 'NUMBER',
    component: 'number',
    group: 'Basic Characteristics',
    order: 1130,
    validationRules: { min: 0, max: 5000000, unit: 'km' },
  },
  {
    key: 'body_type',
    label: 'Body type',
    type: 'SELECT',
    component: 'select',
    group: 'Basic Characteristics',
    order: 1140,
    dataSource: 'static',
    staticOptions: [
      { value: 'sedan', label: 'Sedan' },
      { value: 'suv', label: 'SUV' },
      { value: 'hatchback', label: 'Hatchback' },
      { value: 'wagon', label: 'Wagon' },
      { value: 'pickup', label: 'Pickup' },
      { value: 'tractor_unit', label: 'Tractor unit' },
      { value: 'dump', label: 'Dump' },
      { value: 'box', label: 'Box' },
      { value: 'flatbed', label: 'Flatbed' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    key: 'color',
    label: 'Colour',
    type: 'SELECT',
    component: 'select',
    group: 'Basic Characteristics',
    order: 1150,
    dataSource: 'static',
    staticOptions: [
      { value: 'white', label: 'White' },
      { value: 'black', label: 'Black' },
      { value: 'silver', label: 'Silver' },
      { value: 'grey', label: 'Grey' },
      { value: 'blue', label: 'Blue' },
      { value: 'red', label: 'Red' },
      { value: 'green', label: 'Green' },
      { value: 'yellow', label: 'Yellow' },
      { value: 'orange', label: 'Orange' },
      { value: 'brown', label: 'Brown' },
      { value: 'beige', label: 'Beige' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    key: 'doors',
    label: 'Number of doors',
    type: 'RADIO',
    component: 'radio',
    group: 'Basic Characteristics',
    order: 1160,
    dataSource: 'static',
    staticOptions: [
      { value: '2_3', label: '2/3' },
      { value: '4_5', label: '4/5' },
      { value: '6_7', label: '6/7' },
    ],
  },
  {
    key: 'seats',
    label: 'Number of seats',
    type: 'NUMBER',
    component: 'number',
    group: 'Basic Characteristics',
    order: 1170,
    validationRules: { min: 1, max: 100 },
  },
  {
    key: 'net_weight_kg',
    label: 'Net weight',
    type: 'NUMBER',
    component: 'number',
    group: 'Basic Characteristics',
    order: 1180,
    validationRules: { min: 1, max: 200000, unit: 'kg' },
  },

  {
    key: 'engine_mark',
    label: 'Engine mark',
    type: 'SELECT',
    component: 'select',
    group: 'Engine, Gearbox',
    order: 2000,
    dataSource: 'static',
    staticOptions: [
      { value: 'cummins', label: 'Cummins' },
      { value: 'deutz', label: 'Deutz' },
      { value: 'perkins', label: 'Perkins' },
      { value: 'man', label: 'MAN' },
      { value: 'mercedes', label: 'Mercedes-Benz' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    key: 'engine_model',
    label: 'Engine model',
    type: 'TEXT',
    component: 'text',
    group: 'Engine, Gearbox',
    order: 2010,
  },
  {
    key: 'fuel',
    label: 'Fuel',
    type: 'SELECT',
    component: 'select',
    group: 'Engine, Gearbox',
    order: 2020,
    dataSource: 'static',
    staticOptions: [
      { value: 'diesel', label: 'Diesel' },
      { value: 'petrol', label: 'Petrol' },
      { value: 'electric', label: 'Electric' },
      { value: 'hybrid', label: 'Hybrid' },
      { value: 'lpg', label: 'LPG' },
      { value: 'cng', label: 'CNG' },
    ],
  },
  {
    key: 'turbo',
    label: 'Turbo',
    type: 'BOOLEAN',
    component: 'checkbox',
    group: 'Engine, Gearbox',
    order: 2030,
  },
  {
    key: 'intercooler',
    label: 'Intercooler',
    type: 'BOOLEAN',
    component: 'checkbox',
    group: 'Engine, Gearbox',
    order: 2040,
  },
  {
    key: 'power',
    label: 'Power',
    type: 'NUMBER',
    component: 'number',
    group: 'Engine, Gearbox',
    order: 2050,
    validationRules: { min: 1, max: 5000 },
  },
  {
    key: 'power_unit',
    label: 'Power unit',
    type: 'RADIO',
    component: 'radio',
    group: 'Engine, Gearbox',
    order: 2060,
    dataSource: 'static',
    staticOptions: [
      { value: 'hp', label: 'HP' },
      { value: 'kw', label: 'kW' },
    ],
  },
  {
    key: 'engine_volume_cm3',
    label: 'Engine volume',
    type: 'NUMBER',
    component: 'number',
    group: 'Engine, Gearbox',
    order: 2070,
    validationRules: { min: 1, max: 100000, unit: 'cm3' },
  },
  {
    key: 'euro',
    label: 'Euro',
    type: 'RADIO',
    component: 'radio',
    group: 'Engine, Gearbox',
    order: 2080,
    dataSource: 'static',
    staticOptions: [
      { value: 'euro_1', label: 'Euro 1' },
      { value: 'euro_2', label: 'Euro 2' },
      { value: 'euro_3', label: 'Euro 3' },
      { value: 'euro_4', label: 'Euro 4' },
      { value: 'euro_5', label: 'Euro 5' },
      { value: 'euro_6', label: 'Euro 6' },
      { value: 'euro_7', label: 'Euro 7' },
    ],
  },
  {
    key: 'particulate_filter',
    label: 'Particulate filter',
    type: 'BOOLEAN',
    component: 'checkbox',
    group: 'Engine, Gearbox',
    order: 2090,
  },
  {
    key: 'eev',
    label: 'EEV',
    type: 'BOOLEAN',
    component: 'checkbox',
    group: 'Engine, Gearbox',
    order: 2100,
  },
  {
    key: 'fuel_consumption',
    label: 'Fuel consumption',
    type: 'NUMBER',
    component: 'number',
    group: 'Engine, Gearbox',
    order: 2110,
    validationRules: { min: 0, max: 500 },
  },
  {
    key: 'fuel_consumption_unit',
    label: 'Fuel consumption unit',
    type: 'RADIO',
    component: 'radio',
    group: 'Engine, Gearbox',
    order: 2120,
    dataSource: 'static',
    staticOptions: [
      { value: 'l_100km', label: 'l/100km' },
      { value: 'l_h', label: 'l/h' },
    ],
  },
  {
    key: 'gearbox_type',
    label: 'Gearbox type',
    type: 'SELECT',
    component: 'select',
    group: 'Engine, Gearbox',
    order: 2130,
    dataSource: 'static',
    staticOptions: [
      { value: 'manual', label: 'Manual' },
      { value: 'automatic', label: 'Automatic' },
      { value: 'semi_automatic', label: 'Semi-automatic' },
      { value: 'cvt', label: 'CVT' },
    ],
  },
  {
    key: 'reverse_gear',
    label: 'Reverse gear',
    type: 'BOOLEAN',
    component: 'checkbox',
    group: 'Engine, Gearbox',
    order: 2140,
  },
  {
    key: 'number_of_gears',
    label: 'Number of gears',
    type: 'SELECT',
    component: 'select',
    group: 'Engine, Gearbox',
    order: 2150,
    dataSource: 'static',
    staticOptions: [
      { value: '4', label: '4' },
      { value: '5', label: '5' },
      { value: '6', label: '6' },
      { value: '7', label: '7' },
      { value: '8', label: '8' },
      { value: '9', label: '9' },
      { value: '10', label: '10' },
      { value: '12', label: '12' },
      { value: '16', label: '16' },
    ],
  },
  {
    key: 'gearbox_brand',
    label: 'Gearbox brand',
    type: 'SELECT',
    component: 'select',
    group: 'Engine, Gearbox',
    order: 2160,
    dataSource: 'static',
    staticOptions: [
      { value: 'zf', label: 'ZF' },
      { value: 'aisin', label: 'Aisin' },
      { value: 'allison', label: 'Allison' },
      { value: 'eaton', label: 'Eaton' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    key: 'gearbox_model',
    label: 'Gearbox model',
    type: 'TEXT',
    component: 'text',
    group: 'Engine, Gearbox',
    order: 2170,
  },
  {
    key: 'drive_type',
    label: 'Drive type',
    type: 'RADIO',
    component: 'radio',
    group: 'Engine, Gearbox',
    order: 2180,
    dataSource: 'static',
    staticOptions: [
      { value: 'awd', label: 'All-Wheel Drive' },
      { value: 'fwd', label: 'Front-Wheel Drive' },
      { value: 'rwd', label: 'Rear-Wheel Drive' },
    ],
  },

  {
    key: 'axle_configuration',
    label: 'Axle configuration',
    type: 'SELECT',
    component: 'select',
    group: 'Axles, Brakes',
    order: 3000,
    dataSource: 'static',
    staticOptions: [
      { value: '4x2', label: '4x2' },
      { value: '4x4', label: '4x4' },
      { value: '6x2', label: '6x2' },
      { value: '6x4', label: '6x4' },
      { value: '6x6', label: '6x6' },
      { value: '8x4', label: '8x4' },
      { value: '8x8', label: '8x8' },
    ],
  },
  {
    key: 'tyre_size',
    label: 'Tyre size',
    type: 'TEXT',
    component: 'text',
    group: 'Axles, Brakes',
    order: 3010,
  },
  {
    key: 'tyre_condition_percent',
    label: 'Tyre condition',
    type: 'NUMBER',
    component: 'number',
    group: 'Axles, Brakes',
    order: 3020,
    validationRules: { min: 0, max: 100, unit: '%' },
  },
  {
    key: 'tyre_condition_mm',
    label: 'Tyre condition (tread)',
    type: 'NUMBER',
    component: 'number',
    group: 'Axles, Brakes',
    order: 3030,
    validationRules: { min: 0, max: 120, unit: 'mm' },
  },
  {
    key: 'enter_by_axles',
    label: 'Enter by axles',
    type: 'BOOLEAN',
    component: 'checkbox',
    group: 'Axles, Brakes',
    order: 3040,
  },

  {
    key: 'air_conditioning',
    label: 'Air conditioning',
    type: 'BOOLEAN',
    component: 'checkbox',
    group: 'Additional Options',
    order: 4000,
  },
  {
    key: 'air_conditioning_type',
    label: 'Air conditioning type',
    type: 'RADIO',
    component: 'radio',
    group: 'Additional Options',
    order: 4010,
    dataSource: 'static',
    visibleIf: { field: 'air_conditioning', op: 'eq', value: 'true' },
    requiredIf: { field: 'air_conditioning', op: 'eq', value: 'true' },
    staticOptions: [
      { value: 'climate_control', label: 'Climate control' },
      { value: 'dual_zone', label: 'Dual-zone' },
      { value: 'multi_zone', label: 'Multi-zone' },
    ],
  },
  {
    key: 'powered_windows',
    label: 'Powered windows',
    type: 'BOOLEAN',
    component: 'checkbox',
    group: 'Additional Options',
    order: 4020,
  },
  {
    key: 'powered_windows_scope',
    label: 'Powered windows scope',
    type: 'RADIO',
    component: 'radio',
    group: 'Additional Options',
    order: 4030,
    dataSource: 'static',
    visibleIf: { field: 'powered_windows', op: 'eq', value: 'true' },
    requiredIf: { field: 'powered_windows', op: 'eq', value: 'true' },
    staticOptions: [
      { value: 'front', label: 'Front' },
      { value: 'front_rear', label: 'Front and rear' },
    ],
  },
  {
    key: 'interior_material',
    label: 'Interior material',
    type: 'CHECKBOX_GROUP',
    component: 'checkbox',
    group: 'Additional Options',
    order: 4040,
    dataSource: 'static',
    staticOptions: [
      { value: 'alcantara', label: 'Alcantara' },
      { value: 'faux_leather', label: 'Faux leather' },
      { value: 'leather', label: 'Leather' },
      { value: 'fabric', label: 'Fabric' },
      { value: 'velour', label: 'Velour' },
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

  const dataSource =
    config.dataSource ?? (options.length > 0 ? 'static' : 'api');
  const staticOptions =
    dataSource === 'static'
      ? (Array.isArray(config.staticOptions)
          ? config.staticOptions
          : options
        ).map((option: any, index: number) => ({
          id: option.id ? String(option.id) : `${index}`,
          value: String(option.value),
          label: String(option.label),
        }))
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
    name: 'Motorized Vehicle Block',
    isSystem: true,
    fields: DEFAULT_MOTORIZED_BLOCK_FIELDS,
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
        options: (normalized.staticOptions ?? []).map(
          (option, optionIndex) => ({
            id: `${block.id}:${normalized.fieldKey}:${optionIndex}`,
            value: option.value,
            label: option.label,
            sortOrder: optionIndex,
          }),
        ),
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
