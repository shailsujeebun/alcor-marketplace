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

    // Map by parentId (converted to string for map key)
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
  async findTemplate(slug: string) {
    const category = await this.prisma.category.findFirst({
      where: { slug },
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
                  orderBy: { id: 'asc' },
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

    const template = category.formTemplates[0];

    // Serialization helper for BigInt
    const serialize = (obj: any): any => {
      return JSON.parse(
        JSON.stringify(obj, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value,
        ),
      );
    };

    return serialize(template);
  }
}
