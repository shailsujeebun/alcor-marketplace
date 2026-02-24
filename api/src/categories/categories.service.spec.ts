import { CategoriesService } from './categories.service';

describe('CategoriesService.findTemplate', () => {
  const buildPrismaMock = () => ({
    category: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    formTemplate: {
      findMany: jest.fn(),
    },
    formBlock: {
      findMany: jest.fn(),
    },
  });

  it('returns explicit category template before motorized fallback', async () => {
    const prisma = buildPrismaMock();
    const service = new CategoriesService(prisma as any);
    prisma.formBlock.findMany.mockResolvedValue([]);

    prisma.category.findFirst.mockResolvedValue({
      id: 1n,
      slug: 'wheel-tractors',
      hasEngine: true,
      marketplaceId: 10n,
      parentId: null,
      formTemplates: [
        {
          id: 11n,
          categoryId: 1n,
          version: 1,
          isActive: true,
          createdAt: new Date('2026-02-23T00:00:00Z'),
          blockIds: [],
          fields: [
            {
              id: 101n,
              fieldKey: 'year',
              label: 'Year',
              fieldType: 'NUMBER',
              required: true,
              sortOrder: 1,
              validations: {},
              visibilityIf: {},
              requiredIf: {},
              config: { component: 'number' },
              options: [],
            },
          ],
        },
      ],
    });

    const result = await service.findTemplate('wheel-tractors');

    expect(result).toBeTruthy();
    expect(result?.id).toBe('11');
    expect(prisma.formTemplate.findMany).not.toHaveBeenCalled();
  });

  it('uses motorized fallback template for hasEngine category without explicit template', async () => {
    const prisma = buildPrismaMock();
    const service = new CategoriesService(prisma as any);
    prisma.formBlock.findMany.mockResolvedValue([]);

    prisma.category.findFirst.mockResolvedValue({
      id: 2n,
      slug: 'mini-excavators',
      hasEngine: true,
      marketplaceId: 20n,
      parentId: 200n,
      formTemplates: [],
    });

    prisma.formTemplate.findMany.mockResolvedValue([
      {
        id: 31n,
        categoryId: 3n,
        version: 1,
        isActive: true,
        createdAt: new Date('2026-02-22T00:00:00Z'),
        blockIds: [],
        fields: [],
        category: {
          id: 3n,
          slug: 'legacy-template-source',
          hasEngine: true,
          marketplaceId: 21n,
          parentId: null,
        },
      },
      {
        id: 41n,
        categoryId: 4n,
        version: 3,
        isActive: true,
        createdAt: new Date('2026-02-23T00:00:00Z'),
        blockIds: ['engine_block'],
        fields: [
          {
            id: 401n,
            fieldKey: 'fuel_type',
            label: 'Fuel type',
            fieldType: 'SELECT',
            required: false,
            sortOrder: 1,
            validations: {},
            visibilityIf: {},
            requiredIf: {},
            config: { component: 'select', dataSource: 'static' },
            options: [
              { id: 1n, value: 'diesel', label: 'Diesel', sortOrder: 1 },
            ],
          },
        ],
        category: {
          id: 4n,
          slug: 'tracked-excavators',
          hasEngine: true,
          marketplaceId: 20n,
          parentId: 200n,
        },
      },
    ]);

    const result = await service.findTemplate('mini-excavators');

    expect(result).toBeTruthy();
    expect(result?.id).toBe('41');
    expect(result?.categoryId).toBe('2');
    expect(result?.category?.id).toBe('2');
    expect(result?.category?.hasEngine).toBe(true);
    expect(prisma.category.findUnique).toHaveBeenCalled();
  });

  it('keeps existing fallback behavior for non-motorized category', async () => {
    const prisma = buildPrismaMock();
    const service = new CategoriesService(prisma as any);
    prisma.formBlock.findMany.mockResolvedValue([]);

    prisma.category.findFirst.mockResolvedValue({
      id: 5n,
      slug: 'trailers',
      hasEngine: false,
      marketplaceId: 30n,
      parentId: null,
      formTemplates: [],
    });

    const result = await service.findTemplate('trailers');

    expect(result).toBeNull();
    expect(prisma.formTemplate.findMany).not.toHaveBeenCalled();
  });
});
