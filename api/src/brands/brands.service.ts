import { Injectable } from '@nestjs/common';
import { Brand, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  private shouldIgnoreBrandCategoryError(error: unknown): boolean {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
    // P2021: table does not exist (migration not applied)
    // P2003: FK constraint failed (bad category id)
    return error.code === 'P2021' || error.code === 'P2003';
  }

  async create(dto: CreateBrandDto) {
    const normalizedName = dto.name.trim();
    const brand = await this.prisma.brand.upsert({
      where: { name: normalizedName },
      create: { name: normalizedName },
      update: {},
    });

    if (dto.categoryId) {
      try {
        await this.prisma.brandCategory.upsert({
          where: {
            brandId_categoryId: {
              brandId: brand.id,
              categoryId: BigInt(dto.categoryId),
            },
          },
          create: {
            brandId: brand.id,
            categoryId: BigInt(dto.categoryId),
          },
          update: {},
        });
      } catch (error) {
        if (!this.shouldIgnoreBrandCategoryError(error)) {
          throw error;
        }
      }
    }

    return brand;
  }

  async findAll(categoryId?: string) {
    if (!categoryId || !/^\d+$/.test(categoryId)) {
      return this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
    }

    const categoryIdBigInt = BigInt(categoryId);
    let scoped: Brand[] = [];
    try {
      scoped = await this.prisma.brand.findMany({
        where: {
          OR: [
            { categories: { some: { categoryId: categoryIdBigInt } } },
            { listings: { some: { categoryId: categoryIdBigInt } } },
          ],
        },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      if (!this.shouldIgnoreBrandCategoryError(error)) {
        throw error;
      }
    }

    // Fallback for new/empty categories: still return all brands to avoid blocking user flow.
    if (scoped.length === 0) {
      return this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
    }

    return scoped;
  }
}
