import { RuleNode, FormFieldExtended } from './schemaTypes';

export function evaluateRule(rule: RuleNode | null | undefined, data: Record<string, any>): boolean {
    if (!rule) return true;

    switch (rule.type) {
        case 'and':
            return !!rule.args && rule.args.every((r) => evaluateRule(r, data));
        case 'or':
            return !!rule.args && rule.args.some((r) => evaluateRule(r, data));
        case 'condition':
            const dataValue = data[rule.field];
            switch (rule.op) {
                case 'eq':
                    return dataValue === rule.value;
                case 'neq':
                    return dataValue !== rule.value;
                case 'in':
                    return Array.isArray(rule.value) && rule.value.includes(dataValue);
                case 'nin':
                    return Array.isArray(rule.value) && !rule.value.includes(dataValue);
                case 'gt':
                    return typeof dataValue === 'number' && typeof rule.value === 'number' && dataValue > rule.value;
                case 'lt':
                    return typeof dataValue === 'number' && typeof rule.value === 'number' && dataValue < rule.value;
                case 'contains':
                    return Array.isArray(dataValue) && dataValue.includes(rule.value);
                default:
                    return false;
            }
        default:
            return false;
    }
}

export function evaluateFieldVisibility(field: FormFieldExtended, data: Record<string, any>): boolean {
    if (!field.visibilityIf || Object.keys(field.visibilityIf).length === 0) return true;
    return evaluateRule(field.visibilityIf, data);
}

export function evaluateFieldRequired(field: FormFieldExtended, data: Record<string, any>): boolean {
    let isReq = field.required;
    if (field.requiredIf && Object.keys(field.requiredIf).length > 0) {
        isReq = isReq || evaluateRule(field.requiredIf, data);
    }
    return isReq;
}
