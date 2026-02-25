import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OptionsService {
    constructor(private prisma: PrismaService) { }

    async getModels(brandId?: string, categoryIdStr?: string) {
        const where: any = {};
        if (brandId) {
            where.brandId = brandId;
        }

        if (categoryIdStr) {
            const categoryId = BigInt(categoryIdStr);
            // We return generic models OR category-specific models.
            // E.g. a model for 'Cars' (categoryId=123) or just a general brand model that can apply anywhere.
            where.OR = [
                { categoryId },
                { categoryId: null }
            ];
        }

        const models = await this.prisma.model.findMany({
            where,
            orderBy: { name: 'asc' },
        });

        return models.map(m => ({
            ...m,
            categoryId: m.categoryId ? m.categoryId.toString() : null
        }));
    }
}
