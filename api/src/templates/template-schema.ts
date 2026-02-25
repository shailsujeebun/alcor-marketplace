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
      if (!(mergedMap.has(f.fieldKey || f.key))) {
        mergedMap.set(f.fieldKey || f.key, f);
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
