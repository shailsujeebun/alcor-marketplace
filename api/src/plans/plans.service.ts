import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { slug },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with slug "${slug}" not found`);
    }

    return plan;
  }

  async create(dto: CreatePlanDto) {
    return this.prisma.plan.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdatePlanDto) {
    return this.prisma.plan.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.plan.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
