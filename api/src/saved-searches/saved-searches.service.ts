import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedSearchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, name: string, filters: Record<string, string>) {
    return this.prisma.savedSearch.create({
      data: { userId, name, filters },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string, userId: string) {
    const search = await this.prisma.savedSearch.findUnique({ where: { id } });
    if (!search) throw new NotFoundException('Saved search not found');
    if (search.userId !== userId) throw new ForbiddenException('Access denied');

    await this.prisma.savedSearch.delete({ where: { id } });
    return { deleted: true };
  }
}
