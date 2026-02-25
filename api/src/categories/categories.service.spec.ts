import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
    category: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
    },
    marketplace: {
        findMany: jest.fn(),
    },
    formTemplate: {
        findFirst: jest.fn(),
    },
    formBlock: {
        findMany: jest.fn(),
    }
};

describe('CategoriesService', () => {
    let service: CategoriesService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CategoriesService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<CategoriesService>(CategoriesService);
        prisma = module.get<PrismaService>(PrismaService);

        // Clear mocks
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findTemplate', () => {
        it('should return null if category is not found', async () => {
            mockPrismaService.category.findFirst.mockResolvedValue(null);

            const result = await service.findTemplate('unknown');
            expect(result).toBeNull();
        });

        it('should find template from parent and inject engine block if hasEngine=true', async () => {
            // Setup hierarchy: Parent (has template, hasEngine=true) -> Child (no template)

            // 1. Initial lookup
            mockPrismaService.category.findFirst.mockResolvedValue({
                id: 2n,
                parentId: 1n,
                hasEngine: true,
                slug: 'child',
                name: 'Child Category',
                marketplaceId: 100n,
                formTemplates: []
            });

            // 2. allCategories lookup for parent chain map
            mockPrismaService.category.findMany.mockResolvedValue([
                { id: 1n, parentId: null, hasEngine: true },
                { id: 2n, parentId: 1n, hasEngine: false }
            ]);

            // 3. Template existence check
            // For child (2n), no template
            mockPrismaService.formTemplate.findFirst.mockImplementation((args) => {
                if (args.where.categoryId === 2n) return null;
                if (args.where.categoryId === 1n) return { id: 100n, categoryId: 1n, isActive: true };
                return null; // fallback
            });

            // 4. Fetch actual template
            mockPrismaService.category.findUnique.mockResolvedValue({
                id: 1n,
                formTemplates: [
                    {
                        id: 100n,
                        categoryId: 1n,
                        version: 1,
                        isActive: true,
                        blockIds: [], // Empty blocks
                        fields: []
                    }
                ]
            });

            // 5. Blocks fetch
            mockPrismaService.formBlock.findMany.mockResolvedValue([]);

            const result = await service.findTemplate('child');

            expect(result).toBeDefined();
            expect(result!.categoryId).toBe('1'); // Inherited from parent

            // Should have injected engine block (brand, model, year, mileage)
            expect(result!.fields.length).toBeGreaterThan(0);
            expect(result!.fields[0].key).toBe('brand');
        });
    });
});
