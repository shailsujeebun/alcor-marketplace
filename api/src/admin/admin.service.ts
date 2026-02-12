import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ─── Marketplaces ────────────────────────────────────

  async createMarketplace(data: { key: string; name: string }) {
    return this.prisma.marketplace.create({
      data: {
        key: data.key,
        name: data.name,
      },
    });
  }

  async getMarketplaces() {
    return this.prisma.marketplace.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async updateMarketplace(
    id: number,
    data: { name?: string; isActive?: boolean },
  ) {
    return this.prisma.marketplace.update({
      where: { id },
      data,
    });
  }

  // ─── Categories ──────────────────────────────────────

  async createCategory(data: {
    marketplaceId: number;
    name: string;
    slug: string;
    parentId?: number;
    sortOrder?: number;
  }) {
    // Basic validation for uniqueness handled by Prisma unique constraint
    return this.prisma.category.create({
      data: {
        marketplaceId: data.marketplaceId,
        name: data.name,
        slug: data.slug,
        parentId: data.parentId,
        sortOrder: data.sortOrder,
      },
    });
  }

  async updateCategory(
    id: number,
    data: {
      name?: string;
      slug?: string;
      parentId?: number;
      sortOrder?: number;
    },
  ) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: number) {
    // Logic to prevent deletion if listings exist could go here,
    // or we rely on foreign key constraints (RESTRICT).
    // For now, attempting delete will fail if constraints exist.
    return this.prisma.category.delete({
      where: { id },
    });
  }

  // ─── Form Templates ──────────────────────────────────

  async createTemplate(data: {
    categoryId: number;
    name?: string;
    fields: any[];
  }) {
    // 1. Create the template
    const template = await this.prisma.formTemplate.create({
      data: {
        categoryId: data.categoryId,
        isActive: true, // Default to active
      },
    });

    // 2. Create fields and options
    if (data.fields && data.fields.length > 0) {
      for (const field of data.fields) {
        const createdField = await this.prisma.formField.create({
          data: {
            templateId: template.id,
            fieldKey: field.key,
            label: field.label,
            fieldType: field.type,
            required: field.required || false,
            sortOrder: field.order || 0,
            validations: field.validations || {},
            visibilityIf: field.visibilityIf || {},
          },
        });

        if (field.options && field.options.length > 0) {
          await this.prisma.fieldOption.createMany({
            data: field.options.map((opt: any, index: number) => ({
              fieldId: createdField.id,
              value: opt.value,
              label: opt.label,
              sortOrder: index,
            })),
          });
        }
      }
    }

    return this.getTemplate(Number(template.id));
  }

  // Simple getter for full template structure
  async getTemplate(id: number) {
    const template = await this.prisma.formTemplate.findUnique({
      where: { id },
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

    if (!template) throw new NotFoundException('Template not found');

    // Transform BigInts to numbers/strings for JSON response if needed,
    // but NestJS serializer usually handles BigInt if configured,
    // or we rely on the interceptor we made earlier.
    return template;
  }

  async getStats() {
    const [usersCount, listingsCount, companiesCount, activeTicketsCount] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.listing.count(),
        this.prisma.company.count(),
        this.prisma.supportTicket.count({
          where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
        }),
      ]);

    return { usersCount, listingsCount, companiesCount, activeTicketsCount };
  }
}
