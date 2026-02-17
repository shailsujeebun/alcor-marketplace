import type { RuleLeaf, RuleTree, TemplateFieldSchema } from './schemaTypes';

function getByPath(source: any, path: string): any {
  if (!path) return undefined;
  return path.split('.').reduce((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[key];
  }, source);
}

function evaluateLeaf(
  leaf: RuleLeaf,
  state: Record<string, any>,
  context?: Record<string, any>,
): boolean {
  const value = leaf.field.startsWith('context.')
    ? getByPath({ context }, leaf.field)
    : state[leaf.field] ?? getByPath(state, leaf.field);

  switch (leaf.op) {
    case 'eq':
      return value === leaf.value;
    case 'ne':
      return value !== leaf.value;
    case 'in':
      return Array.isArray(leaf.value) && leaf.value.includes(value);
    case 'notIn':
      return Array.isArray(leaf.value) && !leaf.value.includes(value);
    case 'exists':
      return value !== null && value !== undefined && value !== '';
    case 'gt':
      return Number(value) > Number(leaf.value);
    case 'gte':
      return Number(value) >= Number(leaf.value);
    case 'lt':
      return Number(value) < Number(leaf.value);
    case 'lte':
      return Number(value) <= Number(leaf.value);
    default:
      return false;
  }
}

export function evaluateRuleTree(
  tree: RuleTree | undefined,
  state: Record<string, any>,
  context?: Record<string, any>,
): boolean {
  if (!tree || Object.keys(tree).length === 0) return true;
  if ('all' in tree) return tree.all.every((child) => evaluateRuleTree(child, state, context));
  if ('any' in tree) return tree.any.some((child) => evaluateRuleTree(child, state, context));
  if ('not' in tree) return !evaluateRuleTree(tree.not, state, context);
  return evaluateLeaf(tree, state, context);
}

export function getChildDependencyMap(fields: TemplateFieldSchema[]) {
  const map = new Map<string, Set<string>>();
  for (const field of fields) {
    for (const parent of field.dependsOn ?? []) {
      const existing = map.get(parent) ?? new Set<string>();
      existing.add(field.key);
      map.set(parent, existing);
    }
  }
  return map;
}

export function collectDependentFieldKeys(
  parentKey: string,
  dependencyMap: Map<string, Set<string>>,
): string[] {
  const seen = new Set<string>();
  const stack = [parentKey];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const children = dependencyMap.get(current);
    if (!children) continue;
    for (const child of children) {
      if (seen.has(child)) continue;
      seen.add(child);
      stack.push(child);
    }
  }

  return Array.from(seen);
}

