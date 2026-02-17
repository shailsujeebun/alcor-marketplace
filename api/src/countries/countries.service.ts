import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCountryDto } from './dto/create-country.dto';

@Injectable()
export class CountriesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCountryDto) {
    return this.prisma.country.create({ data: dto });
  }

  findAll() {
    return this.prisma.country.findMany({ orderBy: { name: 'asc' } });
  }
}
