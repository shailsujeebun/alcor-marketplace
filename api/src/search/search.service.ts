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

<<<<<<< HEAD
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
=======
    async search(query: SearchQuery) {
        const {
            q,
            category, // Legacy slug support
            categoryId, // ID support
            priceMin,
            priceMax,
            priceCurrency,
            yearMin,
            yearMax,
            brandId,
            countryId,
            cityId,
            condition,
            listingType,
            page = 1,
            limit = 20,
            sort,
            ...attributes
        } = query;
>>>>>>> feat-add

    const skip = (page - 1) * limit;

    // Build Where Clause
    const where: any = {
      status: ListingStatus.ACTIVE,
    };

<<<<<<< HEAD
    // Marketplace Filter
    if (marketplaceId) {
      where.marketplaceId = BigInt(marketplaceId);
    }

    // Keyword Search (Title)
    const keyword = q ?? search;
    if (keyword) {
      where.title = { contains: keyword, mode: 'insensitive' };
=======
        // Keyword Search (Title)
        if (q) {
            where.title = { contains: q, mode: 'insensitive' };
        }

        // Category Filter (ID or Slug)
        if (categoryId) {
            try {
                where.categoryId = BigInt(categoryId);
            } catch (e) {
                // Invalid BigInt
            }
        } else if (category) {
            where.category = { slug: category };
        }

        // Direct Relations
        if (brandId) {
            where.brandId = brandId;
        }

        if (countryId) {
            where.countryId = countryId;
        }

        if (cityId) {
            where.cityId = cityId;
        }

        // Fact Filtering (Price, Year, Condition, etc.)
        const factFilter: any = {};

        if (priceMin !== undefined || priceMax !== undefined || priceCurrency) {
            factFilter.priceAmount = {};
            if (priceMin !== undefined) factFilter.priceAmount.gte = priceMin;
            if (priceMax !== undefined) factFilter.priceAmount.lte = priceMax;

            if (priceCurrency) {
                factFilter.priceCurrency = priceCurrency;
            }
        }

        if (yearMin !== undefined || yearMax !== undefined) {
            factFilter.year = {};
            if (yearMin !== undefined) factFilter.year.gte = yearMin;
            if (yearMax !== undefined) factFilter.year.lte = yearMax;
        }

        if (condition) {
            factFilter.condition = condition;
        }

        // Only attach fact filter if it has keys or if we check empty object?
        // Prisma handles empty objects gracefully usually, but let's be safe.
        if (Object.keys(factFilter).length > 0) {
            where.fact = factFilter;
        }

        // Dynamic Attribute Filtering
        const attrFilters = Object.entries(attributes).filter(([k]) => k !== 'order');

        // If listingType is provided, treat it as an attribute for now since it's not on Listing/ListingFact
        if (listingType) {
            attrFilters.push(['type', listingType]);
        }

        if (attrFilters.length > 0) {
            where.AND = attrFilters.map(([key, value]) => ({
                attribute: {
                    data: {
                        path: [key],
                        equals: isNaN(Number(value)) ? value : Number(value),
                    },
                },
            }));
        }

        // Sort Mapping
        let orderBy: any = { createdAt: 'desc' };
        if (sort === 'priceAsc') orderBy = { fact: { priceAmount: 'asc' } };
        else if (sort === 'priceDesc') orderBy = { fact: { priceAmount: 'desc' } };
        else if (sort === 'yearAsc') orderBy = { fact: { year: 'asc' } };
        else if (sort === 'yearDesc') orderBy = { fact: { year: 'desc' } };
        else if (sort === 'publishedAt') orderBy = { publishedAt: 'desc' };


        // Execute Query
        const [items, total] = await Promise.all([
            this.prisma.listing.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    category: true,
                    media: { take: 1, orderBy: { sortOrder: 'asc' } },
                    fact: true,
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
        // Simple Facets for now
        // TODO: Context-aware facets based on current query
        const categories = await this.prisma.category.findMany({
            where: { parentId: null },
            select: { id: true, slug: true, name: true }
        });

        const brands = await this.prisma.brand.findMany({
            select: { id: true, name: true }
        });

        const priceStats = await this.prisma.listingFact.aggregate({
            _min: { priceAmount: true },
            _max: { priceAmount: true },
            where: { listing: { status: ListingStatus.ACTIVE } }
        });

        return {
            categories: JSON.parse(JSON.stringify(categories, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value // Handle BigInt
            )),
            brands,
            priceMin: priceStats._min.priceAmount,
            priceMax: priceStats._max.priceAmount,
        };
>>>>>>> feat-add
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
