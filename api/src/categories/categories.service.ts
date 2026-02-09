import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

export interface CategoryTreeNode {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
  children: CategoryTreeNode[];
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: dto,
      include: { parent: true },
    });
  }

  async findTree(): Promise<CategoryTreeNode[]> {
    const all = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    const map = new Map<string | null, typeof all>();
    for (const cat of all) {
      const key = cat.parentId ?? null;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(cat);
    }

    const buildTree = (parentId: string | null): CategoryTreeNode[] => {
      return (map.get(parentId) ?? []).map((cat) => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        parentId: cat.parentId,
        children: buildTree(cat.id),
      }));
    };

    return buildTree(null);
  }
}
