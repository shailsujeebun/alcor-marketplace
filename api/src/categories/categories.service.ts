import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

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

  async findTree(): Promise<CategoryTreeNode[]> {
    const all = await this.prisma.category.findMany({
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

    if (!category || category.formTemplates.length === 0) {
      return null;
    }

    return this.mapTemplate(category.formTemplates[0]);
  }
}
