export type RuleOperator = 'eq' | 'neq' | 'in' | 'nin' | 'gt' | 'lt' | 'contains';

export type RuleCondition = {
    type: 'condition';
    field: string;
    op: RuleOperator;
    value: any;
};

export type RuleAnd = {
    type: 'and';
    args: RuleNode[];
};

export type RuleOr = {
    type: 'or';
    args: RuleNode[];
};

export type RuleNode = RuleCondition | RuleAnd | RuleOr;

export interface FieldOption {
    id: string;
    label: string;
    value: string;
    isDefault?: boolean;
}

export interface FormFieldExtended {
    fieldKey: string;
    label: string;
    fieldType: string; // 'text', 'number', 'select', 'checkbox-group', etc.
    required: boolean;
    helpText?: string;
    options?: FieldOption[];
    validations?: Record<string, any>;
    visibilityIf?: RuleNode | null;
    requiredIf?: RuleNode | null;
    config?: Record<string, any>;
    section?: string;
    sortOrder?: number;
}

export interface FormBlockConfig {
    id: string;
    name: string;
    isSystem: boolean;
    fields: FormFieldExtended[];
}

export interface TemplateConfig {
    id: string;
    categoryId: string;
    version: number;
    blockIds: string[];
    fields: FormFieldExtended[];
}
