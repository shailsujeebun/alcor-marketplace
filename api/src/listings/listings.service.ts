import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ListingStatus, NotificationType, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResponseDto } from '../common';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingQueryDto } from './dto/listing-query.dto';

const VALID_TRANSITIONS: Record<ListingStatus, ListingStatus[]> = {
  DRAFT: [ListingStatus.SUBMITTED],
  SUBMITTED: [ListingStatus.PENDING_MODERATION, ListingStatus.DRAFT],
  PENDING_MODERATION: [ListingStatus.ACTIVE, ListingStatus.REJECTED],
  ACTIVE: [ListingStatus.PAUSED, ListingStatus.EXPIRED, ListingStatus.REMOVED],
  PAUSED: [ListingStatus.ACTIVE, ListingStatus.REMOVED],
  EXPIRED: [ListingStatus.DRAFT],
  REJECTED: [ListingStatus.DRAFT],
  REMOVED: [],
};

const listingIncludes = {
  company: { include: { country: true, city: true } },
  category: true,
  brand: true,
  country: true,
  city: true,
  media: { orderBy: { sortOrder: 'asc' as const } },
  attributes: true,
  ownerUser: { select: { id: true, email: true, firstName: true, lastName: true } },
};

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateListingDto, ownerUserId?: string, callerRole?: string) {
    const {
      media, attributes, companyId, categoryId, brandId, countryId, cityId,
      sellerPhones, ...rest
    } = dto;

    // Admin/Manager listings are auto-published; regular users start as DRAFT
    const isPrivileged = callerRole === UserRole.ADMIN || callerRole === UserRole.MANAGER;
    const status = isPrivileged ? ListingStatus.ACTIVE : ListingStatus.DRAFT;

    const listing = await this.prisma.listing.create({
      data: {
        ...rest,
        sellerPhones: sellerPhones ?? [],
        company: { connect: { id: companyId } },
        ownerUser: ownerUserId ? { connect: { id: ownerUserId } } : undefined,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        brand: brandId ? { connect: { id: brandId } } : undefined,
        country: countryId ? { connect: { id: countryId } } : undefined,
        city: cityId ? { connect: { id: cityId } } : undefined,
        status,
        publishedAt: isPrivileged ? new Date() : undefined,
        media: media ? { createMany: { data: media } } : undefined,
        attributes: attributes
          ? { createMany: { data: attributes } }
          : undefined,
      },
      include: listingIncludes,
    });

    await this.prisma.company.update({
      where: { id: companyId },
      data: { listingsCount: { increment: 1 } },
    });

    return listing;
  }

  async findAll(query: ListingQueryDto) {
    const where: Record<string, unknown> = {};
    if (query.companyId) where.companyId = query.companyId;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.brandId) where.brandId = query.brandId;
    if (query.countryId) where.countryId = query.countryId;
    if (query.cityId) where.cityId = query.cityId;
    if (query.condition) where.condition = query.condition;
    if (query.status) where.status = query.status;
    if (query.ownerUserId) where.ownerUserId = query.ownerUserId;
    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }
    if (query.listingType) where.listingType = query.listingType;
    if (query.euroClass) where.euroClass = query.euroClass;
    if (query.priceCurrency) where.priceCurrency = query.priceCurrency;

    // Default to only showing ACTIVE listings for public queries
    if (!query.status && !query.ownerUserId) {
      where.status = ListingStatus.ACTIVE;
    }

    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (query.priceMin !== undefined) priceFilter.gte = query.priceMin;
      if (query.priceMax !== undefined) priceFilter.lte = query.priceMax;
      where.priceAmount = priceFilter;
    }

    if (query.yearMin !== undefined || query.yearMax !== undefined) {
      const yearFilter: Record<string, number> = {};
      if (query.yearMin !== undefined) yearFilter.gte = query.yearMin;
      if (query.yearMax !== undefined) yearFilter.lte = query.yearMax;
      where.year = yearFilter;
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    switch (query.sort) {
      case 'publishedAt': orderBy = { publishedAt: 'desc' }; break;
      case 'priceAsc': orderBy = { priceAmount: 'asc' }; break;
      case 'priceDesc': orderBy = { priceAmount: 'desc' }; break;
      case 'yearDesc': orderBy = { year: 'desc' }; break;
      case 'yearAsc': orderBy = { year: 'asc' }; break;
    }

    const [data, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy,
        include: {
          company: { include: { country: true, city: true } },
          category: true,
          brand: true,
          country: true,
          city: true,
          media: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return new PaginatedResponseDto(data, total, query.page!, query.limit!);
  }

  async findByCompany(companyId: string, query: ListingQueryDto) {
    const where: Record<string, unknown> = { companyId };
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.brandId) where.brandId = query.brandId;
    if (query.status) where.status = query.status;

    // Default to ACTIVE for public company listing views
    if (!query.status) {
      where.status = ListingStatus.ACTIVE;
    }

    const [data, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          brand: true,
          country: true,
          city: true,
          media: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return new PaginatedResponseDto(data, total, query.page!, query.limit!);
  }

  async findById(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: listingIncludes,
    });

    if (!listing) {
      throw new NotFoundException(`Listing "${id}" not found`);
    }

    return listing;
  }

  async update(id: string, dto: UpdateListingDto) {
    const { media, attributes, categoryId, brandId, countryId, cityId, sellerPhones, ...rest } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (media !== undefined) {
        await tx.listingMedia.deleteMany({ where: { listingId: id } });
        if (media.length > 0) {
          await tx.listingMedia.createMany({
            data: media.map((m) => ({ ...m, listingId: id })),
          });
        }
      }

      if (attributes !== undefined) {
        await tx.listingAttribute.deleteMany({ where: { listingId: id } });
        if (attributes.length > 0) {
          await tx.listingAttribute.createMany({
            data: attributes.map((a) => ({ ...a, listingId: id })),
          });
        }
      }

      return tx.listing.update({
        where: { id },
        data: {
          ...rest,
          sellerPhones: sellerPhones,
          category: categoryId !== undefined
            ? categoryId ? { connect: { id: categoryId } } : { disconnect: true }
            : undefined,
          brand: brandId !== undefined
            ? brandId ? { connect: { id: brandId } } : { disconnect: true }
            : undefined,
          country: countryId !== undefined
            ? countryId ? { connect: { id: countryId } } : { disconnect: true }
            : undefined,
          city: cityId !== undefined
            ? cityId ? { connect: { id: cityId } } : { disconnect: true }
            : undefined,
        },
        include: listingIncludes,
      });
    });
  }

  // ─── Status State Machine ──────────────────────────

  async submitForModeration(id: string) {
    const listing = await this.findById(id);
    this.validateTransition(listing.status, ListingStatus.SUBMITTED);

    return this.prisma.listing.update({
      where: { id },
      data: {
        status: ListingStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      include: listingIncludes,
    });
  }

  async approve(id: string) {
    const listing = await this.findById(id);
    // Allow from SUBMITTED or PENDING_MODERATION
    if (listing.status === ListingStatus.SUBMITTED) {
      // Skip straight to ACTIVE
    } else {
      this.validateTransition(listing.status, ListingStatus.ACTIVE);
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: {
        status: ListingStatus.ACTIVE,
        moderatedAt: new Date(),
        publishedAt: listing.publishedAt ?? new Date(),
      },
      include: listingIncludes,
    });

    if (listing.ownerUserId) {
      this.notificationsService.create(
        listing.ownerUserId,
        NotificationType.LISTING_APPROVED,
        'Оголошення схвалено',
        `Ваше оголошення "${listing.title}" було схвалено`,
        `/listings/${id}`,
      );
    }

    return updated;
  }

  async reject(id: string, reason: string) {
    const listing = await this.findById(id);
    if (listing.status !== ListingStatus.SUBMITTED && listing.status !== ListingStatus.PENDING_MODERATION) {
      throw new BadRequestException(
        `Cannot reject listing in ${listing.status} status`,
      );
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: {
        status: ListingStatus.REJECTED,
        moderationReason: reason,
        moderatedAt: new Date(),
      },
      include: listingIncludes,
    });

    if (listing.ownerUserId) {
      this.notificationsService.create(
        listing.ownerUserId,
        NotificationType.LISTING_REJECTED,
        'Оголошення відхилено',
        `Ваше оголошення "${listing.title}" було відхилено: ${reason}`,
        `/cabinet/listings`,
      );
    }

    return updated;
  }

  async pause(id: string) {
    const listing = await this.findById(id);
    this.validateTransition(listing.status, ListingStatus.PAUSED);

    return this.prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.PAUSED },
      include: listingIncludes,
    });
  }

  async resume(id: string) {
    const listing = await this.findById(id);
    this.validateTransition(listing.status, ListingStatus.ACTIVE);

    return this.prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.ACTIVE },
      include: listingIncludes,
    });
  }

  async resubmit(id: string) {
    const listing = await this.findById(id);
    if (listing.status !== ListingStatus.REJECTED && listing.status !== ListingStatus.EXPIRED) {
      throw new BadRequestException(
        `Cannot resubmit listing in ${listing.status} status`,
      );
    }

    return this.prisma.listing.update({
      where: { id },
      data: {
        status: ListingStatus.DRAFT,
        moderationReason: null,
      },
      include: listingIncludes,
    });
  }

  async removeListing(id: string) {
    const listing = await this.findById(id);
    if (listing.status === ListingStatus.REMOVED) {
      throw new BadRequestException('Listing is already removed');
    }

    return this.prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.REMOVED },
      include: listingIncludes,
    });
  }

  private validateTransition(current: ListingStatus, target: ListingStatus) {
    const allowed = VALID_TRANSITIONS[current];
    if (!allowed.includes(target)) {
      throw new BadRequestException(
        `Cannot transition from ${current} to ${target}`,
      );
    }
  }
}
