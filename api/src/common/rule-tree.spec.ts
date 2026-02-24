import { evaluateRuleTree } from './rule-tree';

describe('evaluateRuleTree', () => {
  it('handles eq/ne ops', () => {
    expect(
      evaluateRuleTree(
        { field: 'brand', op: 'eq', value: 'cat' },
        { brand: 'cat' },
      ),
    ).toBe(true);
    expect(
      evaluateRuleTree(
        { field: 'brand', op: 'ne', value: 'cat' },
        { brand: 'komatsu' },
      ),
    ).toBe(true);
  });

  it('handles nested all/any/not', () => {
    const tree = {
      all: [
        { field: 'status', op: 'eq' as const, value: 'active' },
        {
          any: [
            { field: 'power', op: 'gte' as const, value: 100 },
            { not: { field: 'fuel', op: 'eq' as const, value: 'electric' } },
          ],
        },
      ],
    };

    expect(
      evaluateRuleTree(tree, { status: 'active', power: 120, fuel: 'diesel' }),
    ).toBe(true);
    expect(
      evaluateRuleTree(tree, { status: 'active', power: 80, fuel: 'electric' }),
    ).toBe(false);
  });

  it('reads context path fields', () => {
    expect(
      evaluateRuleTree(
        {
          field: 'context.category.hasEngine',
          op: 'eq',
          value: true,
        },
        {},
        { category: { hasEngine: true } },
      ),
    ).toBe(true);
  });
});
