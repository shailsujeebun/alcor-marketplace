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

export function evaluateRule(rule: RuleNode | null | undefined, data: Record<string, any>): boolean {
    if (!rule) return true;

    switch (rule.type) {
        case 'and':
            return rule.args.every((r) => evaluateRule(r, data));
        case 'or':
            return rule.args.some((r) => evaluateRule(r, data));
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
