import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResponseDto } from '../common';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async addFavorite(userId: string, listingId: string) {
    const id = BigInt(listingId);
    // Check listing exists
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');

    // Upsert to avoid duplicate errors
    return this.prisma.favorite.upsert({
      where: { userId_listingId: { userId, listingId: id } },
      update: {},
      create: { userId, listingId: id },
      include: {
        listing: {
          include: {
            media: { orderBy: { sortOrder: 'asc' }, take: 1 },
            category: true,
            brand: true,
            country: true,
            city: true,
          },
        },
      },
    });
  }

  async removeFavorite(userId: string, listingId: string) {
    const id = BigInt(listingId);
    const fav = await this.prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId: id } },
    });
    if (!fav) throw new NotFoundException('Favorite not found');
    await this.prisma.favorite.delete({ where: { id: fav.id } });
  }

  async getUserFavorites(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: {
            include: {
              media: { orderBy: { sortOrder: 'asc' }, take: 1 },
              category: true,
              brand: true,
              country: true,
              city: true,
              company: true,
            },
          },
        },
      }),
      this.prisma.favorite.count({ where: { userId } }),
    ]);
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async isFavorite(userId: string, listingId: string): Promise<boolean> {
    const id = BigInt(listingId);
    const fav = await this.prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId: id } },
    });
    return !!fav;
  }

  // --- View History ---

  async recordView(userId: string, listingId: string) {
    const id = BigInt(listingId);
    return this.prisma.viewHistory.upsert({
      where: { userId_listingId: { userId, listingId: id } },
      update: { viewedAt: new Date() },
      create: { userId, listingId: id },
    });
  }

  async getViewHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.viewHistory.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { viewedAt: 'desc' },
        include: {
          listing: {
            include: {
              media: { orderBy: { sortOrder: 'asc' }, take: 1 },
              category: true,
              brand: true,
              country: true,
              city: true,
              company: true,
            },
          },
        },
      }),
      this.prisma.viewHistory.count({ where: { userId } }),
    ]);
    return new PaginatedResponseDto(data, total, page, limit);
  }
}
