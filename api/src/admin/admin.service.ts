import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

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

  async createCategory(data: {
    marketplaceId: number;
    name: string;
    slug: string;
    parentId?: number;
    sortOrder?: number;
  }) {
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
    return this.prisma.category.delete({
      where: { id },
    });
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

  private async createTemplateFields(tx: any, templateId: bigint, fields: any[] = []) {
    for (const field of fields) {
      const createdField = await tx.formField.create({
        data: {
          templateId,
          fieldKey: field.key,
          label: field.label,
          fieldType: field.type,
          required: field.required || false,
          sortOrder: field.order || 0,
          validations: field.validations || {},
          visibilityIf: field.visibilityIf || {},
          section: field.section || null,
        },
      });

      if (Array.isArray(field.options) && field.options.length > 0) {
        await tx.fieldOption.createMany({
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

  async createTemplate(data: { categoryId: number; name?: string; fields: any[] }) {
    if (!Number.isInteger(data.categoryId)) {
      throw new BadRequestException('categoryId must be an integer');
    }

    const categoryId = BigInt(data.categoryId);

    return this.prisma.$transaction(async (tx) => {
      const lastTemplate = await tx.formTemplate.findFirst({
        where: { categoryId },
        orderBy: { version: 'desc' },
      });
      const nextVersion = (lastTemplate?.version ?? 0) + 1;

      await tx.formTemplate.updateMany({
        where: { categoryId, isActive: true },
        data: { isActive: false },
      });

      const created = await tx.formTemplate.create({
        data: {
          categoryId,
          version: nextVersion,
          isActive: true,
        },
      });

      await this.createTemplateFields(tx, created.id, data.fields);

      const template = await tx.formTemplate.findUnique({
        where: { id: created.id },
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
      return this.mapTemplate(template);
    });
  }

  async getTemplate(id: number) {
    const template = await this.prisma.formTemplate.findUnique({
      where: { id: BigInt(id) },
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
    return this.mapTemplate(template);
  }

  async getTemplates() {
    const templates = await this.prisma.formTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            marketplace: { select: { name: true } },
          },
        },
        fields: { select: { id: true } },
      },
    });

    return templates.map((template) => ({
      ...template,
      id: template.id.toString(),
      categoryId: template.categoryId.toString(),
      category: template.category
        ? {
            ...template.category,
            id: template.category.id.toString(),
          }
        : undefined,
      fields: template.fields.map((field) => ({
        id: field.id.toString(),
      })),
    }));
  }

  async deleteTemplate(id: number) {
    return this.prisma.formTemplate.delete({
      where: { id: BigInt(id) },
    });
  }

  async toggleTemplateStatus(id: number, isActive: boolean) {
    if (typeof isActive !== 'boolean') {
      throw new BadRequestException('isActive must be a boolean');
    }

    const templateId = BigInt(id);
    const template = await this.prisma.formTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new NotFoundException('Template not found');

    return this.prisma.$transaction(async (tx) => {
      if (isActive) {
        await tx.formTemplate.updateMany({
          where: {
            categoryId: template.categoryId,
            isActive: true,
            id: { not: templateId },
          },
          data: { isActive: false },
        });
      }

      const updated = await tx.formTemplate.update({
        where: { id: templateId },
        data: { isActive },
      });

      return {
        ...updated,
        id: updated.id.toString(),
        categoryId: updated.categoryId.toString(),
      };
    });
  }

  async updateTemplate(id: number, data: { fields: any[] }) {
    const templateId = BigInt(id);

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.formTemplate.findUnique({
        where: { id: templateId },
      });
      if (!existing) throw new NotFoundException('Template not found');

      await tx.formField.deleteMany({
        where: { templateId },
      });

      await this.createTemplateFields(tx, templateId, data.fields);

      const template = await tx.formTemplate.findUnique({
        where: { id: templateId },
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
      return this.mapTemplate(template);
    });
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
