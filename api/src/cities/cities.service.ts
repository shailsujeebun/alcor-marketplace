import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCityDto } from './dto/create-city.dto';
import { CityQueryDto } from './dto/city-query.dto';
import { PaginatedResponseDto } from '../common';

@Injectable()
export class CitiesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCityDto) {
    return this.prisma.city.create({
      data: dto,
      include: { country: true },
    });
  }

  async findAll(query: CityQueryDto) {
    const where: Record<string, unknown> = {};
    if (query.countryId) where.countryId = query.countryId;

    const [data, total] = await Promise.all([
      this.prisma.city.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { name: 'asc' },
        include: { country: true },
      }),
      this.prisma.city.count({ where }),
    ]);

    return new PaginatedResponseDto(data, total, query.page!, query.limit!);
  }
}
