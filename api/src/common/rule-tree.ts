export type RuleOperator =
  | 'eq'
  | 'ne'
  | 'in'
  | 'notIn'
  | 'exists'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte';

export type RuleLeaf = {
  field: string;
  op: RuleOperator;
  value?: any;
};

export type RuleTree =
  | { all: RuleTree[] }
  | { any: RuleTree[] }
  | { not: RuleTree }
  | RuleLeaf;

const hasOwn = (obj: object, key: string) =>
  Object.prototype.hasOwnProperty.call(obj, key);

function getByPath(root: any, path: string): any {
  if (!path) return undefined;
  const normalized = path.replace(/\[(\w+)\]/g, '.$1');
  return normalized.split('.').reduce((acc: any, segment: string) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[segment];
  }, root);
}

function resolveFieldValue(
  fieldPath: string,
  state: Record<string, any>,
  context?: Record<string, any>,
): any {
  if (fieldPath.startsWith('context.')) {
    return getByPath({ context }, fieldPath);
  }
  if (hasOwn(state, fieldPath)) return state[fieldPath];
  return getByPath(state, fieldPath);
}

function evaluateLeaf(
  leaf: RuleLeaf,
  state: Record<string, any>,
  context?: Record<string, any>,
): boolean {
  const actualValue = resolveFieldValue(leaf.field, state, context);
  switch (leaf.op) {
    case 'eq':
      return actualValue === leaf.value;
    case 'ne':
      return actualValue !== leaf.value;
    case 'in':
      return Array.isArray(leaf.value) && leaf.value.includes(actualValue);
    case 'notIn':
      return Array.isArray(leaf.value) && !leaf.value.includes(actualValue);
    case 'exists':
      return actualValue !== undefined && actualValue !== null && actualValue !== '';
    case 'gt':
      return Number(actualValue) > Number(leaf.value);
    case 'gte':
      return Number(actualValue) >= Number(leaf.value);
    case 'lt':
      return Number(actualValue) < Number(leaf.value);
    case 'lte':
      return Number(actualValue) <= Number(leaf.value);
    default:
      return false;
  }
}

export function evaluateRuleTree(
  tree: RuleTree | null | undefined,
  state: Record<string, any>,
  context?: Record<string, any>,
): boolean {
  if (!tree || Object.keys(tree).length === 0) return true;

  if ('all' in tree) {
    return tree.all.every((node) => evaluateRuleTree(node, state, context));
  }
  if ('any' in tree) {
    return tree.any.some((node) => evaluateRuleTree(node, state, context));
  }
  if ('not' in tree) {
    return !evaluateRuleTree(tree.not, state, context);
  }

  return evaluateLeaf(tree as RuleLeaf, state, context);
}

