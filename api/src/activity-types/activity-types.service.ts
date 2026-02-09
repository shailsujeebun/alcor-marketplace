import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityTypeDto } from './dto/create-activity-type.dto';

@Injectable()
export class ActivityTypesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateActivityTypeDto) {
    return this.prisma.activityType.create({ data: dto });
  }

  findAll() {
    return this.prisma.activityType.findMany({ orderBy: { name: 'asc' } });
  }
}
