import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListingStatus } from '@prisma/client';

export interface SearchQuery {
  q?: string;
  search?: string;
  category?: string;
  marketplaceId?: string;
  categoryId?: string;
  brandId?: string;
  condition?: string;
  priceCurrency?: string;
  countryId?: string;
  cityId?: string;
  minPrice?: number;
  maxPrice?: number;
  yearMin?: number;
  yearMax?: number;
  page?: number;
  limit?: number;
  [key: string]: any; // Dynamic attributes
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: SearchQuery) {
    const {
      q,
      search,
      category,
      marketplaceId,
      categoryId,
      brandId,
      condition,
      priceCurrency,
      countryId,
      cityId,
      minPrice,
      maxPrice,
      yearMin,
      yearMax,
      page = 1,
      limit = 20,
      ...attributes
    } = query;

    const skip = (page - 1) * limit;

    // Build Where Clause
    const where: any = {
      status: ListingStatus.ACTIVE,
    };

    // Marketplace Filter
    if (marketplaceId) {
      where.marketplaceId = BigInt(marketplaceId);
    }

    // Keyword Search (Title)
    const keyword = q ?? search;
    if (keyword) {
      where.title = { contains: keyword, mode: 'insensitive' };
    }

    // Category Filter
    if (category) {
      where.category = { slug: category };
    }

    // Category ID Filter (used by frontend filters)
    if (categoryId) {
      where.categoryId = BigInt(categoryId);
    }

    if (brandId) {
      where.brandId = brandId;
    }

    if (countryId) {
      where.countryId = countryId;
    }

    if (cityId) {
      where.cityId = cityId;
    }

    // Fact Filtering (Price, Year)
    // We can filter on ListingFact or Listing directly if fields exist.
    // Listing has: priceAmount, priceCurrency, year.
    // ListingFact has: the same + country/city/mileage.
    // Since we are joining, let's try to filter on Listing fields first for simplicity,
    // or use ListingFact if we want to support attributes like mileage.
    // For now, let's use the core Listing fields for price/year as they are reliable.

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.fact = where.fact || {};
      where.fact.priceAmount = {};
      if (minPrice !== undefined) where.fact.priceAmount.gte = minPrice;
      if (maxPrice !== undefined) where.fact.priceAmount.lte = maxPrice;
    }

    if (yearMin !== undefined || yearMax !== undefined) {
      where.fact = where.fact || {};
      where.fact.year = {};
      if (yearMin !== undefined) where.fact.year.gte = yearMin;
      if (yearMax !== undefined) where.fact.year.lte = yearMax;
    }

    if (condition) {
      where.fact = where.fact || {};
      where.fact.condition = condition;
    }

    if (priceCurrency) {
      where.fact = where.fact || {};
      where.fact.priceCurrency = priceCurrency;
    }

    // Dynamic Attribute Filtering
    // This is tricky with JSONB. We can filter matches in ListingAttribute or ListingFact.
    // ListingFact columns: mileageKm, condition, country, city.
    // If attributes contains specific keys, we can check ListingFact.
    // For arbitrary JSON keys, we'd need to query ListingAttribute.data using JSON path operators.
    // Prisma support for JSON filtering:
    // where: { attribute: { path: ['drive_type'], equals: '4WD' } }

    // Let's implement basic filtering for known keys if provided in attributes
    // AND generic JSON filtering.

    const attrFilters = Object.entries(attributes).filter(
      ([k]) =>
        k !== 'sort' &&
        k !== 'order' &&
        k !== 'categoryId' &&
        k !== 'brandId' &&
        k !== 'condition' &&
        k !== 'listingType' &&
        k !== 'euroClass' &&
        k !== 'priceCurrency' &&
        k !== 'countryId' &&
        k !== 'cityId' &&
        k !== 'search' &&
        k !== 'q',
    );
    if (attrFilters.length > 0) {
      // We need to use AND for multiple attributes
      where.attribute = {
        is: {
          data: {
            path: [], // Root match?
            // Prisma Json filter is limited. usage:
            // data: { path: ['key'], equals: value }
          },
        },
      };

      // Constructing the JSON filter dynamically
      // Prisma's `equals` matches the whole JSON or a specific path.
      // For multiple fields, multiple AND conditions on `attribute`.
      where.AND = attrFilters.map(([key, value]) => ({
        attribute: {
          data: {
            path: [key],
            equals: isNaN(Number(value)) ? value : Number(value), // Try request numbers if possible
          },
        },
      }));
    }

    // Execute Query
    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }, // TODO: Dynamic sort
        include: {
          category: true,
          media: { take: 1, orderBy: { sortOrder: 'asc' } },
          fact: true, // Include facts in result
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    const facets = await this.getFacets(query);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      facets,
    };
  }

  async getFacets(query: SearchQuery) {
    // 1. Categories (all or filtered?)
    // For now, return all top-level categories or relevant subcategories
    const categories = await this.prisma.category.findMany({
      where: { parentId: null }, // Top level
      select: { id: true, slug: true, name: true },
    });

    // 2. Brands
    const brands = await this.prisma.brand.findMany({
      select: { id: true, name: true },
    });

    // 3. Price Range (from ListingFact)
    const priceStats = await this.prisma.listingFact.aggregate({
      _min: { priceAmount: true },
      _max: { priceAmount: true },
      where: { listing: { status: ListingStatus.ACTIVE } },
    });

    return {
      categories,
      brands,
      priceMin: priceStats._min.priceAmount,
      priceMax: priceStats._max.priceAmount,
    };
  }
}
