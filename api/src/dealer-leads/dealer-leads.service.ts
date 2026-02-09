import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DealerLeadStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResponseDto } from '../common';
import { CreateDealerLeadDto } from './dto/create-dealer-lead.dto';
import { UpdateDealerLeadDto } from './dto/update-dealer-lead.dto';
import { DealerLeadQueryDto } from './dto/dealer-lead-query.dto';

const VALID_TRANSITIONS: Record<DealerLeadStatus, DealerLeadStatus[]> = {
  NEW: [DealerLeadStatus.CONTACTED, DealerLeadStatus.REJECTED],
  CONTACTED: [DealerLeadStatus.QUALIFIED, DealerLeadStatus.REJECTED],
  QUALIFIED: [DealerLeadStatus.PACKAGE_SELECTED, DealerLeadStatus.REJECTED],
  PACKAGE_SELECTED: [DealerLeadStatus.CONVERTED, DealerLeadStatus.REJECTED],
  CONVERTED: [],
  REJECTED: [DealerLeadStatus.NEW],
};

@Injectable()
export class DealerLeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDealerLeadDto) {
    return this.prisma.dealerLead.create({
      data: {
        companyName: dto.companyName,
        contactPerson: dto.contactPerson,
        email: dto.email,
        phone: dto.phone,
        website: dto.website,
        country: dto.countryId ? { connect: { id: dto.countryId } } : undefined,
        city: dto.cityId ? { connect: { id: dto.cityId } } : undefined,
        activityTypes: dto.activityTypes ?? [],
        brands: dto.brands ?? [],
        equipmentCount: dto.equipmentCount,
        message: dto.message,
      },
      include: { country: true, city: true },
    });
  }

  async findAll(query: DealerLeadQueryDto) {
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.assignedToUserId) where.assignedToUserId = query.assignedToUserId;

    const [data, total] = await Promise.all([
      this.prisma.dealerLead.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          country: true,
          city: true,
          assignedToUser: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.dealerLead.count({ where }),
    ]);

    return new PaginatedResponseDto(data, total, query.page!, query.limit!);
  }

  async findById(id: string) {
    const lead = await this.prisma.dealerLead.findUnique({
      where: { id },
      include: {
        country: true,
        city: true,
        assignedToUser: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });

    if (!lead) {
      throw new NotFoundException(`Dealer lead "${id}" not found`);
    }

    return lead;
  }

  async update(id: string, dto: UpdateDealerLeadDto) {
    const lead = await this.findById(id);

    if (dto.status) {
      const allowed = VALID_TRANSITIONS[lead.status];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Cannot transition from ${lead.status} to ${dto.status}`,
        );
      }
    }

    return this.prisma.dealerLead.update({
      where: { id },
      data: {
        status: dto.status,
        assignedToUserId: dto.assignedToUserId,
        notes: dto.notes,
        convertedAt: dto.status === DealerLeadStatus.CONVERTED ? new Date() : undefined,
      },
      include: {
        country: true,
        city: true,
        assignedToUser: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
  }
}
