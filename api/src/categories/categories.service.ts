import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { mergeTemplateFieldsWithBlocks } from '../templates/template-schema';

export interface CategoryTreeNode {
  id: string;
  marketplaceId: string;
  slug: string;
  name: string;
  parentId: string | null;
  hasEngine: boolean;
  children: CategoryTreeNode[];
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCategoryDto) {
    const parentId = dto.parentId ? BigInt(dto.parentId) : undefined;
    const { parentId: _, ...rest } = dto;
    return this.prisma.category.create({
      data: {
        ...rest,
        parentId,
      } as any,
      include: { parent: true },
    });
  }

  async findMarketplaces() {
    const marketplaces = await this.prisma.marketplace.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return marketplaces.map((m) => ({
      id: m.id.toString(),
      key: m.key,
      name: m.name,
      isActive: m.isActive,
    }));
  }

  async findTree(marketplaceId?: string): Promise<CategoryTreeNode[]> {
    const where: any = {};
    if (marketplaceId) {
      where.marketplaceId = BigInt(marketplaceId);
    }

    const all = await this.prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    const map = new Map<string | null, typeof all>();
    for (const cat of all) {
      const parentId = cat.parentId ? cat.parentId.toString() : null;
      if (!map.has(parentId)) map.set(parentId, []);
      map.get(parentId)!.push(cat);
    }

    const buildTree = (parentId: string | null): CategoryTreeNode[] => {
      return (map.get(parentId) ?? []).map((cat) => ({
        id: cat.id.toString(),
        marketplaceId: cat.marketplaceId.toString(),
        slug: cat.slug,
        name: cat.name,
        parentId: cat.parentId ? cat.parentId.toString() : null,
        hasEngine: Boolean(cat.hasEngine),
        children: buildTree(cat.id.toString()),
      }));
    };

    return buildTree(null);
  }

  private parseBlockIds(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.map((entry) => String(entry)).filter(Boolean);
  }

  private async mapTemplate(template: any, category: any, requestedCategory?: any) {
    const runtimeCategory = requestedCategory ?? category;
    const blockIds = this.parseBlockIds(template.blockIds);
    const blocks =
      blockIds.length === 0
        ? []
        : await this.prisma.formBlock.findMany({
            where: { id: { in: blockIds } },
            orderBy: { name: 'asc' },
          });

    const mergedFields = mergeTemplateFieldsWithBlocks(
      template.fields ?? [],
      blocks.map((block) => ({
        id: block.id,
        name: block.name,
        isSystem: block.isSystem,
        fields: (block.fields as any[]) ?? [],
      })),
    );

    return {
      id: template.id.toString(),
      categoryId: runtimeCategory.id.toString(),
      version: template.version,
      isActive: template.isActive,
      createdAt: template.createdAt,
      blockIds,
      blocks: blocks.map((block) => ({
        id: block.id,
        name: block.name,
        isSystem: block.isSystem,
      })),
      category: {
        id: runtimeCategory.id.toString(),
        slug: runtimeCategory.slug,
        hasEngine: Boolean(runtimeCategory.hasEngine),
      },
      fields: mergedFields,
    };
  }

  async findTemplate(slug: string) {
    let whereCondition: any = { slug };

    if (/^\d+$/.test(slug)) {
      whereCondition = {
        OR: [{ id: BigInt(slug) }, { slug }],
      };
    }

    const category = await this.prisma.category.findFirst({
      where: whereCondition,
      include: {
        formTemplates: {
          where: { isActive: true },
          orderBy: { version: 'desc' },
          take: 1,
          include: {
            fields: {
              orderBy: { sortOrder: 'asc' },
              include: {
                options: {
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!category) {
      return null;
    }

    if (category.formTemplates.length > 0) {
      return this.mapTemplate(category.formTemplates[0], category);
    }

    // Fallback: walk up parent chain and use nearest active ancestor template.
    let parentId = category.parentId;
    while (parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: parentId },
        include: {
          formTemplates: {
            where: { isActive: true },
            orderBy: { version: 'desc' },
            take: 1,
            include: {
              fields: {
                orderBy: { sortOrder: 'asc' },
                include: {
                  options: {
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
            },
          },
        },
      });

      if (!parent) break;
      if (parent.formTemplates.length > 0) {
        return this.mapTemplate(parent.formTemplates[0], parent, category);
      }
      parentId = parent.parentId;
    }

    // Fallback: use a sibling template when parent/ancestor do not have one.
    if (category.parentId) {
      const siblingTemplates = await this.prisma.formTemplate.findMany({
        where: {
          isActive: true,
          category: {
            parentId: category.parentId,
          },
        },
        orderBy: [{ version: 'desc' }],
        include: {
          fields: {
            orderBy: { sortOrder: 'asc' },
            include: {
              options: {
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
      });

      const siblingTemplate = siblingTemplates
        .slice()
        .sort((a: any, b: any) => {
          const aBlocks = Array.isArray(a.blockIds) ? a.blockIds : [];
          const bBlocks = Array.isArray(b.blockIds) ? b.blockIds : [];
          const aHasEngineBlock = aBlocks.includes('engine_block') ? 1 : 0;
          const bHasEngineBlock = bBlocks.includes('engine_block') ? 1 : 0;
          if (aHasEngineBlock !== bHasEngineBlock) {
            return bHasEngineBlock - aHasEngineBlock;
          }
          return (b.fields?.length ?? 0) - (a.fields?.length ?? 0);
        })[0];

      if (siblingTemplate) {
        const siblingCategory = await this.prisma.category.findUnique({
          where: { id: siblingTemplate.categoryId },
          select: { id: true, slug: true, hasEngine: true },
        });
        if (siblingCategory) {
          return this.mapTemplate(siblingTemplate, siblingCategory, category);
        }
      }
    }

    return null;
  }
}
