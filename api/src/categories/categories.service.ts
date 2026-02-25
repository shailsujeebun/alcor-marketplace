import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import {
  mergeTemplateFieldsWithBlocks,
  getBuiltInEngineBlock,
} from '../templates/template-schema';

export interface CategoryTreeNode {
  id: string;
  marketplaceId: string;
  slug: string;
  name: string;
  parentId: string | null;
  children: CategoryTreeNode[];
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) { }

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
        children: buildTree(cat.id.toString()),
      }));
    };

    return buildTree(null);
  }

  private mapTemplate(template: any) {
    return {
      id: template.id.toString(),
      categoryId: template.categoryId.toString(),
      version: template.version,
      isActive: template.isActive,
      createdAt: template.createdAt,
      fields: (template.fields ?? []).map((field: any) => ({
        id: field.id.toString(),
        key: field.fieldKey,
        label: field.label,
        type: field.fieldType,
        isRequired: field.required,
        section: field.section ?? undefined,
        validationRules: field.validations ?? {},
        options: (field.options ?? []).map((option: any) => ({
          id: option.id.toString(),
          value: option.value,
          label: option.label,
        })),
      })),
    };
  }

  async findTemplate(slug: string) {
    let whereCondition: any = { slug };

    if (/^\d+$/.test(slug)) {
      whereCondition = {
        OR: [{ id: BigInt(slug) }, { slug }],
      };
    }

    // 1. Fetch category and its ancestors to determine the applicable template and `hasEngine` flag
    const targetCategory = await this.prisma.category.findFirst({
      where: whereCondition,
    });

    if (!targetCategory) return null;

    // Get all categories to build parent chain (in a real app, use recursive CTE, but this is fine for deep-shallow trees)
    const allCategories = await this.prisma.category.findMany();
    const catMap = new Map(allCategories.map(c => [c.id.toString(), c]));

    let current: any = targetCategory;
    let fallbackCategoryWithTemplate: any = null;
    let resolvesEngine = false;

    // Traverse upwards
    while (current) {
      if (current.hasEngine) {
        resolvesEngine = true;
      }

      // Check if this category has an active template
      if (!fallbackCategoryWithTemplate) {
        const hasTemplate = await this.prisma.formTemplate.findFirst({
          where: { categoryId: current.id, isActive: true },
        });
        if (hasTemplate) {
          fallbackCategoryWithTemplate = current;
        }
      }

      if (current.parentId) {
        current = catMap.get(current.parentId.toString());
      } else {
        break;
      }
    }

    if (!fallbackCategoryWithTemplate) {
      return null; // No template found in hierarchy
    }

    // 2. Fetch the actual template from the discovered category
    const categoryWithTemplates = await this.prisma.category.findUnique({
      where: { id: fallbackCategoryWithTemplate.id },
      include: {
        formTemplates: {
          where: { isActive: true },
          orderBy: { version: 'desc' },
          take: 1,
          include: {
            fields: {
              orderBy: { sortOrder: 'asc' },
              include: {
                options: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
      },
    });

    if (!categoryWithTemplates || categoryWithTemplates.formTemplates.length === 0) {
      return null;
    }

    const rawTemplate = categoryWithTemplates.formTemplates[0];
    const mappedTemplate = this.mapTemplate(rawTemplate);

    // 3. Resolve blocks
    let blocks: any[] = [];
    const blockIds = (rawTemplate.blockIds as string[]) || [];

    // Inject engine block if the category's lineage requires it, and it's not already there
    if (resolvesEngine && !blockIds.includes('engine_block')) {
      blockIds.unshift('engine_block');
    }

    if (blockIds.length > 0) {
      const dbBlocks = await this.prisma.formBlock.findMany({
        where: { id: { in: blockIds } }
      });

      // Order them as requested in blockIds array
      blocks = blockIds.map((id) => {
        if (id === 'engine_block') return getBuiltInEngineBlock(); // Saftey fallback if not in DB yet
        return dbBlocks.find((b) => b.id === id);
      }).filter(Boolean);
    }

    // 4. Merge fields
    const localFields = mappedTemplate.fields || [];
    const mergedFields = mergeTemplateFieldsWithBlocks(localFields, blocks);

    // Convert back array to the format expected by the frontend
    mappedTemplate.fields = mergedFields.map((f) => ({
      id: f.id || `virtual-${f.fieldKey}`,
      key: f.fieldKey || f.key, // Handle both our new internal representation and the legacy one
      label: f.label,
      type: f.fieldType || f.type,
      isRequired: f.required ?? f.isRequired,
      section: f.section || undefined,
      validationRules: f.validations || f.validationRules || {},
      options: f.options || [],
      // Inject the newer config parameters not explicitly mapped in mapTemplate payload yet
      config: f.config || {},
      requiredIf: f.requiredIf || {},
      visibilityIf: f.visibilityIf || {},
    }));

    return mappedTemplate;
  }
}
