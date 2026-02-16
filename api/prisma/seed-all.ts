import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function clearDatabase(prisma: PrismaClient) {
  console.log('Clearing existing data...');

  await prisma.ticketMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.viewHistory.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.savedSearch.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.dealerLead.deleteMany();

  await prisma.listingWizardState.deleteMany();
  await prisma.listingSeller.deleteMany();
  await prisma.sellerContact.deleteMany();
  await prisma.listingMedia.deleteMany();
  await prisma.listingFact.deleteMany();
  await prisma.listingAttribute.deleteMany();
  await prisma.listing.deleteMany();

  await prisma.companyReview.deleteMany();
  await prisma.companyBrand.deleteMany();
  await prisma.companyActivityType.deleteMany();
  await prisma.companyMedia.deleteMany();
  await prisma.companyPhone.deleteMany();
  await prisma.companyUser.deleteMany();
  await prisma.company.deleteMany();

  await prisma.fieldOption.deleteMany();
  await prisma.formField.deleteMany();
  await prisma.formTemplate.deleteMany();

  await prisma.brandCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.marketplace.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.activityType.deleteMany();
  await prisma.city.deleteMany();
  await prisma.country.deleteMany();

  await prisma.emailVerificationCode.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.oAuthAccount.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await clearDatabase(prisma);

    console.log('Seeding users...');
    const baseHash = await bcrypt.hash('test1234', 10);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@alcor.com',
        passwordHash: baseHash,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        status: 'ACTIVE',
        locale: 'uk',
        emailVerified: true,
      },
    });

    const manager = await prisma.user.create({
      data: {
        email: 'manager@alcor.com',
        passwordHash: baseHash,
        firstName: 'Maria',
        lastName: 'Manager',
        role: 'MANAGER',
        status: 'ACTIVE',
        locale: 'uk',
        emailVerified: true,
      },
    });

    const proSeller = await prisma.user.create({
      data: {
        email: 'proseller@alcor.com',
        passwordHash: baseHash,
        firstName: 'Petro',
        lastName: 'Seller',
        role: 'PRO_SELLER',
        status: 'ACTIVE',
        locale: 'uk',
        emailVerified: true,
      },
    });

    const buyer = await prisma.user.create({
      data: {
        email: 'buyer@alcor.com',
        passwordHash: baseHash,
        firstName: 'Iryna',
        lastName: 'Buyer',
        role: 'USER',
        status: 'ACTIVE',
        locale: 'uk',
        emailVerified: true,
      },
    });

    const restrictedUser = await prisma.user.create({
      data: {
        email: 'restricted@alcor.com',
        passwordHash: baseHash,
        firstName: 'Restricted',
        lastName: 'User',
        role: 'USER',
        status: 'RESTRICTED',
        locale: 'uk',
        emailVerified: false,
      },
    });

    await prisma.oAuthAccount.create({
      data: {
        userId: buyer.id,
        provider: 'google',
        providerId: 'google-buyer-001',
      },
    });

    await prisma.session.create({
      data: {
        userId: admin.id,
        refreshTokenHash: 'seed-refresh-admin',
        expiresAt: daysFromNow(30),
        userAgent: 'Seed Script',
        ipAddress: '127.0.0.1',
      },
    });

    await prisma.passwordResetToken.create({
      data: {
        userId: restrictedUser.id,
        tokenHash: 'seed-reset-token-restricted',
        expiresAt: daysFromNow(1),
      },
    });

    await prisma.emailVerificationCode.create({
      data: {
        userId: restrictedUser.id,
        codeHash: 'seed-email-code-restricted',
        expiresAt: daysFromNow(1),
      },
    });

    console.log('Seeding countries and cities...');
    const ua = await prisma.country.create({ data: { iso2: 'UA', name: 'Ukraine' } });
    const de = await prisma.country.create({ data: { iso2: 'DE', name: 'Germany' } });
    const pl = await prisma.country.create({ data: { iso2: 'PL', name: 'Poland' } });

    const kyiv = await prisma.city.create({
      data: { name: 'Kyiv', countryId: ua.id },
    });
    const dnipro = await prisma.city.create({
      data: { name: 'Dnipro', countryId: ua.id },
    });
    const berlin = await prisma.city.create({
      data: { name: 'Berlin', countryId: de.id },
    });
    await prisma.city.create({
      data: { name: 'Munich', countryId: de.id },
    });
    const warsaw = await prisma.city.create({
      data: { name: 'Warsaw', countryId: pl.id },
    });

    console.log('Seeding activity types...');
    const activityTypes = await Promise.all([
      prisma.activityType.create({ data: { code: 'FARM_EQUIPMENT_SALES', name: 'Farm equipment sellers' } }),
      prisma.activityType.create({ data: { code: 'COMMERCIAL_VEHICLE_SALES', name: 'Commercial vehicle sellers' } }),
      prisma.activityType.create({ data: { code: 'INDUSTRIAL_EQUIPMENT_SALES', name: 'Industrial equipment sellers' } }),
      prisma.activityType.create({ data: { code: 'AUTO_SERVICE', name: 'Auto service' } }),
    ]);

    console.log('Seeding marketplaces and categories...');
    const marketplaceRows = await Promise.all([
      prisma.marketplace.create({ data: { key: 'agriculture', name: 'Agriculture' } }),
      prisma.marketplace.create({ data: { key: 'commercial', name: 'Commercial transport' } }),
      prisma.marketplace.create({ data: { key: 'industrial', name: 'Industrial equipment' } }),
      prisma.marketplace.create({ data: { key: 'cars', name: 'Passenger cars' } }),
    ]);

    const marketplaceMap = new Map<string, bigint>(
      marketplaceRows.map((row) => [row.key, row.id]),
    );

    const categoriesBySlug = new Map<string, { id: bigint; marketplaceId: bigint }>();

    async function createCategory(params: {
      marketplaceKey: string;
      slug: string;
      name: string;
      parentSlug?: string;
      sortOrder: number;
    }) {
      const marketplaceId = marketplaceMap.get(params.marketplaceKey);
      if (!marketplaceId) {
        throw new Error(`Unknown marketplace key: ${params.marketplaceKey}`);
      }

      const parent = params.parentSlug ? categoriesBySlug.get(params.parentSlug) : undefined;
      const row = await prisma.category.create({
        data: {
          marketplaceId,
          slug: params.slug,
          name: params.name,
          parentId: parent?.id,
          sortOrder: params.sortOrder,
        },
      });

      categoriesBySlug.set(params.slug, {
        id: row.id,
        marketplaceId,
      });
    }

    await createCategory({ marketplaceKey: 'agriculture', slug: 'tractors', name: 'Tractors', sortOrder: 1 });
    await createCategory({ marketplaceKey: 'agriculture', slug: 'wheel-tractors', name: 'Wheel tractors', parentSlug: 'tractors', sortOrder: 2 });
    await createCategory({ marketplaceKey: 'agriculture', slug: 'tracked-tractors', name: 'Tracked tractors', parentSlug: 'tractors', sortOrder: 3 });
    await createCategory({ marketplaceKey: 'agriculture', slug: 'combine-harvesters', name: 'Combine harvesters', sortOrder: 4 });
    await createCategory({ marketplaceKey: 'agriculture', slug: 'grain-harvesters', name: 'Grain harvesters', parentSlug: 'combine-harvesters', sortOrder: 5 });

    await createCategory({ marketplaceKey: 'industrial', slug: 'excavators', name: 'Excavators', sortOrder: 1 });
    await createCategory({ marketplaceKey: 'industrial', slug: 'mini-excavators', name: 'Mini excavators', parentSlug: 'excavators', sortOrder: 2 });
    await createCategory({ marketplaceKey: 'industrial', slug: 'tracked-excavators', name: 'Tracked excavators', parentSlug: 'excavators', sortOrder: 3 });
    await createCategory({ marketplaceKey: 'industrial', slug: 'loaders', name: 'Loaders', sortOrder: 4 });
    await createCategory({ marketplaceKey: 'industrial', slug: 'wheel-loaders', name: 'Wheel loaders', parentSlug: 'loaders', sortOrder: 5 });

    await createCategory({ marketplaceKey: 'commercial', slug: 'trucks', name: 'Trucks', sortOrder: 1 });
    await createCategory({ marketplaceKey: 'commercial', slug: 'truck-tractors', name: 'Truck tractors', parentSlug: 'trucks', sortOrder: 2 });
    await createCategory({ marketplaceKey: 'commercial', slug: 'dump-trucks', name: 'Dump trucks', parentSlug: 'trucks', sortOrder: 3 });
    await createCategory({ marketplaceKey: 'commercial', slug: 'trailers', name: 'Trailers', sortOrder: 4 });
    await createCategory({ marketplaceKey: 'commercial', slug: 'semi-trailers', name: 'Semi-trailers', parentSlug: 'trailers', sortOrder: 5 });

    await createCategory({ marketplaceKey: 'cars', slug: 'passenger-cars', name: 'Passenger cars', sortOrder: 1 });
    await createCategory({ marketplaceKey: 'cars', slug: 'sedans', name: 'Sedans', parentSlug: 'passenger-cars', sortOrder: 2 });
    await createCategory({ marketplaceKey: 'cars', slug: 'suv', name: 'SUV', parentSlug: 'passenger-cars', sortOrder: 3 });

    console.log('Seeding brands and brand-category links...');
    const brandRows = await Promise.all([
      prisma.brand.create({ data: { name: 'John Deere' } }),
      prisma.brand.create({ data: { name: 'Claas' } }),
      prisma.brand.create({ data: { name: 'Caterpillar' } }),
      prisma.brand.create({ data: { name: 'Komatsu' } }),
      prisma.brand.create({ data: { name: 'MAN' } }),
      prisma.brand.create({ data: { name: 'Mercedes-Benz' } }),
      prisma.brand.create({ data: { name: 'Toyota' } }),
      prisma.brand.create({ data: { name: 'BMW' } }),
    ]);

    const brandMap = new Map<string, string>(brandRows.map((b) => [b.name, b.id]));

    async function linkBrandToCategory(brandName: string, categorySlug: string) {
      const brandId = brandMap.get(brandName);
      const category = categoriesBySlug.get(categorySlug);
      if (!brandId || !category) return;

      await prisma.brandCategory.create({
        data: {
          brandId,
          categoryId: category.id,
        },
      });
    }

    await linkBrandToCategory('John Deere', 'wheel-tractors');
    await linkBrandToCategory('Claas', 'grain-harvesters');
    await linkBrandToCategory('Caterpillar', 'tracked-excavators');
    await linkBrandToCategory('Komatsu', 'wheel-loaders');
    await linkBrandToCategory('MAN', 'truck-tractors');
    await linkBrandToCategory('Mercedes-Benz', 'dump-trucks');
    await linkBrandToCategory('Toyota', 'sedans');
    await linkBrandToCategory('BMW', 'suv');

    console.log('Seeding form templates, fields, and options...');
    const leafCategorySlugs = [
      'wheel-tractors',
      'tracked-tractors',
      'grain-harvesters',
      'mini-excavators',
      'tracked-excavators',
      'wheel-loaders',
      'truck-tractors',
      'dump-trucks',
      'semi-trailers',
      'sedans',
      'suv',
    ];

    for (const slug of leafCategorySlugs) {
      const category = categoriesBySlug.get(slug);
      if (!category) continue;

      await prisma.formTemplate.create({
        data: {
          categoryId: category.id,
          version: 1,
          isActive: true,
          fields: {
            create: [
              {
                fieldKey: 'year',
                label: 'Year',
                fieldType: 'NUMBER',
                required: true,
                sortOrder: 1,
                section: 'General',
                validations: { min: 1990, max: 2030 },
              },
              {
                fieldKey: 'condition',
                label: 'Condition',
                fieldType: 'SELECT',
                required: true,
                sortOrder: 2,
                section: 'General',
                validations: {},
                options: {
                  create: [
                    { value: 'NEW', label: 'New', sortOrder: 1 },
                    { value: 'USED', label: 'Used', sortOrder: 2 },
                    { value: 'DEMO', label: 'Demo', sortOrder: 3 },
                  ],
                },
              },
              {
                fieldKey: 'hours',
                label: 'Engine hours',
                fieldType: 'NUMBER',
                required: false,
                sortOrder: 3,
                section: 'Technical',
                validations: { min: 0, max: 200000, unit: 'h' },
              },
            ],
          },
        },
      });
    }

    console.log('Seeding plans and subscriptions...');
    const basicPlan = await prisma.plan.create({
      data: {
        slug: 'basic',
        name: 'Basic',
        description: 'Starter plan',
        priceAmount: new Prisma.Decimal('0'),
        priceCurrency: 'UAH',
        interval: 'MONTHLY',
        features: { support: 'email' },
        limits: { listings: 5 },
        isActive: true,
        sortOrder: 1,
      },
    });

    const proPlan = await prisma.plan.create({
      data: {
        slug: 'pro',
        name: 'Pro',
        description: 'Growing business plan',
        priceAmount: new Prisma.Decimal('1499'),
        priceCurrency: 'UAH',
        interval: 'MONTHLY',
        features: { support: 'priority' },
        limits: { listings: 100 },
        isActive: true,
        sortOrder: 2,
      },
    });

    const enterprisePlan = await prisma.plan.create({
      data: {
        slug: 'enterprise',
        name: 'Enterprise',
        description: 'Unlimited enterprise plan',
        priceAmount: new Prisma.Decimal('4999'),
        priceCurrency: 'UAH',
        interval: 'MONTHLY',
        features: { support: 'dedicated' },
        limits: { listings: 1000 },
        isActive: true,
        sortOrder: 3,
      },
    });
    await prisma.subscription.create({
      data: {
        userId: proSeller.id,
        planId: proPlan.id,
        status: 'ACTIVE',
        startDate: daysAgo(20),
        endDate: daysFromNow(10),
      },
    });

    await prisma.subscription.create({
      data: {
        userId: buyer.id,
        planId: basicPlan.id,
        status: 'PAUSED',
        startDate: daysAgo(90),
        endDate: daysAgo(30),
      },
    });

    await prisma.subscription.create({
      data: {
        userId: admin.id,
        planId: enterprisePlan.id,
        status: 'CANCELLED',
        startDate: daysAgo(180),
        endDate: daysAgo(60),
      },
    });

    console.log('Seeding companies and related models...');
    const companyAgro = await prisma.company.create({
      data: {
        slug: 'agro-tech',
        name: 'Agro Tech',
        description: 'Dealer of agriculture machinery',
        countryId: ua.id,
        cityId: kyiv.id,
        region: 'Kyiv',
        addressLine: 'Business St 10',
        website: 'https://agro-tech.example.com',
        contactPerson: 'Petro Seller',
        languages: 'uk,en',
        yearsOnPlatform: 4,
        yearsOnMarket: 12,
        isVerified: true,
        isOfficialDealer: true,
        isManufacturer: false,
        ratingAvg: 4.7,
        reviewsCount: 12,
        listingsCount: 5,
      },
    });

    const companyHeavy = await prisma.company.create({
      data: {
        slug: 'heavy-industrial',
        name: 'Heavy Industrial GmbH',
        description: 'Industrial and construction equipment reseller',
        countryId: de.id,
        cityId: berlin.id,
        region: 'Berlin',
        addressLine: 'Industrial Ring 1',
        website: 'https://heavy-industrial.example.com',
        contactPerson: 'Hans Driver',
        languages: 'de,en',
        yearsOnPlatform: 6,
        yearsOnMarket: 20,
        isVerified: true,
        isOfficialDealer: false,
        isManufacturer: true,
        ratingAvg: 4.5,
        reviewsCount: 21,
        listingsCount: 8,
      },
    });

    const companyFleet = await prisma.company.create({
      data: {
        slug: 'fleet-poland',
        name: 'Fleet Poland',
        description: 'Commercial trucks and trailers',
        countryId: pl.id,
        cityId: warsaw.id,
        region: 'Mazowieckie',
        addressLine: 'Transport Ave 7',
        website: 'https://fleet-poland.example.com',
        contactPerson: 'Jan Fleet',
        languages: 'pl,en',
        yearsOnPlatform: 2,
        yearsOnMarket: 9,
        isVerified: false,
        isOfficialDealer: false,
        isManufacturer: false,
        ratingAvg: 4.1,
        reviewsCount: 7,
        listingsCount: 4,
      },
    });

    await prisma.companyPhone.createMany({
      data: [
        { companyId: companyAgro.id, label: 'Sales', phoneE164: '+380671112233', isPrimary: true },
        { companyId: companyHeavy.id, label: 'Main', phoneE164: '+493012345678', isPrimary: true },
        { companyId: companyFleet.id, label: 'Office', phoneE164: '+48221234567', isPrimary: true },
      ],
    });

    await prisma.companyMedia.createMany({
      data: [
        { companyId: companyAgro.id, kind: 'LOGO', url: 'https://placehold.co/200x200?text=Agro', sortOrder: 1 },
        { companyId: companyHeavy.id, kind: 'LOGO', url: 'https://placehold.co/200x200?text=Heavy', sortOrder: 1 },
        { companyId: companyFleet.id, kind: 'LOGO', url: 'https://placehold.co/200x200?text=Fleet', sortOrder: 1 },
      ],
    });

    await prisma.companyActivityType.createMany({
      data: [
        { companyId: companyAgro.id, activityTypeId: activityTypes[0].id },
        { companyId: companyHeavy.id, activityTypeId: activityTypes[2].id },
        { companyId: companyFleet.id, activityTypeId: activityTypes[1].id },
      ],
    });

    await prisma.companyBrand.createMany({
      data: [
        { companyId: companyAgro.id, brandId: brandMap.get('John Deere')! },
        { companyId: companyAgro.id, brandId: brandMap.get('Claas')! },
        { companyId: companyHeavy.id, brandId: brandMap.get('Caterpillar')! },
        { companyId: companyHeavy.id, brandId: brandMap.get('Komatsu')! },
        { companyId: companyFleet.id, brandId: brandMap.get('MAN')! },
        { companyId: companyFleet.id, brandId: brandMap.get('Mercedes-Benz')! },
      ],
    });

    await prisma.companyUser.createMany({
      data: [
        { companyId: companyAgro.id, userId: proSeller.id, role: 'OWNER' },
        { companyId: companyAgro.id, userId: admin.id, role: 'ADMIN' },
        { companyId: companyHeavy.id, userId: manager.id, role: 'OWNER' },
        { companyId: companyFleet.id, userId: buyer.id, role: 'EDITOR' },
      ],
    });

    console.log('Seeding listings and listing-related models...');

    async function createListing(params: {
      title: string;
      description: string;
      categorySlug: string;
      companyId: string;
      ownerUserId: string;
      brandName: string;
      countryId: string;
      cityId: string;
      status:
        | 'DRAFT'
        | 'SUBMITTED'
        | 'PENDING_MODERATION'
        | 'ACTIVE'
        | 'PAUSED'
        | 'EXPIRED'
        | 'REJECTED'
        | 'REMOVED';
      price: string;
      year: number;
      mileage: number;
      condition: string;
      publishedOffsetDays?: number;
    }) {
      const category = categoriesBySlug.get(params.categorySlug);
      const brandId = brandMap.get(params.brandName);
      if (!category || !brandId) {
        throw new Error(`Missing category or brand for ${params.title}`);
      }

      const listing = await prisma.listing.create({
        data: {
          marketplaceId: category.marketplaceId,
          categoryId: category.id,
          companyId: params.companyId,
          ownerUserId: params.ownerUserId,
          title: params.title,
          description: params.description,
          descriptionLang: 'uk',
          status: params.status,
          countryId: params.countryId,
          cityId: params.cityId,
          brandId,
          publishedAt: params.publishedOffsetDays !== undefined ? daysAgo(params.publishedOffsetDays) : null,
          attribute: {
            create: {
              data: {
                customFieldA: 'value-a',
                customFieldB: 'value-b',
              },
            },
          },
          fact: {
            create: {
              priceAmount: new Prisma.Decimal(params.price),
              priceCurrency: 'EUR',
              vatType: 'with_vat',
              year: params.year,
              mileageKm: params.mileage,
              condition: params.condition,
              country: params.countryId === ua.id ? 'Ukraine' : params.countryId === de.id ? 'Germany' : 'Poland',
              city: params.cityId === kyiv.id ? 'Kyiv' : params.cityId === berlin.id ? 'Berlin' : 'Warsaw',
              lat: new Prisma.Decimal('50.4501'),
              lng: new Prisma.Decimal('30.5234'),
            },
          },
          media: {
            create: [
              {
                type: 'PHOTO',
                url: `https://placehold.co/1200x800?text=${encodeURIComponent(params.title)}`,
                sortOrder: 1,
                meta: {},
              },
              {
                type: 'GALLERY',
                url: `https://placehold.co/1200x800?text=${encodeURIComponent(`${params.title}-2`)}`,
                sortOrder: 2,
                meta: {},
              },
            ],
          },
        },
      });

      const sellerContact = await prisma.sellerContact.create({
        data: {
          email: `${params.ownerUserId.slice(0, 8)}@seed.local`,
          name: 'Seed Seller Contact',
          phoneCountry: 'UA',
          phoneNumber: '+380500001111',
          privacyConsent: true,
          termsConsent: true,
        },
      });

      await prisma.listingSeller.create({
        data: {
          listingId: listing.id,
          sellerContactId: sellerContact.id,
        },
      });

      await prisma.listingWizardState.create({
        data: {
          listingId: listing.id,
          step: params.status === 'DRAFT' ? 2 : 3,
          completedSteps: params.status === 'DRAFT' ? [1] : [1, 2, 3],
          lastSeenAt: daysAgo(1),
        },
      });

      return listing;
    }

    const listing1 = await createListing({
      title: 'John Deere 6155R',
      description: 'Well maintained tractor, ready for field work.',
      categorySlug: 'wheel-tractors',
      companyId: companyAgro.id,
      ownerUserId: proSeller.id,
      brandName: 'John Deere',
      countryId: ua.id,
      cityId: kyiv.id,
      status: 'ACTIVE',
      price: '95000',
      year: 2020,
      mileage: 4200,
      condition: 'USED',
      publishedOffsetDays: 3,
    });

    const listing2 = await createListing({
      title: 'Caterpillar 320 GC',
      description: 'Tracked excavator with full service history.',
      categorySlug: 'tracked-excavators',
      companyId: companyHeavy.id,
      ownerUserId: manager.id,
      brandName: 'Caterpillar',
      countryId: de.id,
      cityId: berlin.id,
      status: 'ACTIVE',
      price: '145000',
      year: 2021,
      mileage: 6200,
      condition: 'USED',
      publishedOffsetDays: 5,
    });

    const listing3 = await createListing({
      title: 'MAN TGX 18.510',
      description: 'Fleet-maintained truck tractor with ADR package.',
      categorySlug: 'truck-tractors',
      companyId: companyFleet.id,
      ownerUserId: buyer.id,
      brandName: 'MAN',
      countryId: pl.id,
      cityId: warsaw.id,
      status: 'SUBMITTED',
      price: '52000',
      year: 2019,
      mileage: 720000,
      condition: 'USED',
      publishedOffsetDays: 1,
    });

    await createListing({
      title: 'BMW X5 xDrive30d',
      description: 'Premium SUV in excellent condition.',
      categorySlug: 'suv',
      companyId: companyFleet.id,
      ownerUserId: buyer.id,
      brandName: 'BMW',
      countryId: pl.id,
      cityId: warsaw.id,
      status: 'DRAFT',
      price: '62000',
      year: 2022,
      mileage: 48000,
      condition: 'USED',
    });

    console.log('Seeding company reviews...');
    await prisma.companyReview.createMany({
      data: [
        {
          companyId: companyAgro.id,
          authorName: 'Oleksii K.',
          rating: 5,
          title: 'Great support',
          body: 'Fast response and exactly as described.',
          createdAt: daysAgo(11),
        },
        {
          companyId: companyHeavy.id,
          authorName: 'Martin B.',
          rating: 4,
          title: 'Reliable supplier',
          body: 'Good communication and clear paperwork.',
          createdAt: daysAgo(6),
        },
      ],
    });

    console.log('Seeding favorites and view history...');
    await prisma.favorite.createMany({
      data: [
        { userId: buyer.id, listingId: listing1.id, createdAt: daysAgo(4) },
        { userId: buyer.id, listingId: listing2.id, createdAt: daysAgo(2) },
      ],
    });

    await prisma.viewHistory.createMany({
      data: [
        { userId: buyer.id, listingId: listing1.id, viewedAt: daysAgo(3) },
        { userId: buyer.id, listingId: listing2.id, viewedAt: daysAgo(2) },
        { userId: buyer.id, listingId: listing3.id, viewedAt: daysAgo(1) },
      ],
    });

    console.log('Seeding conversations and messages...');
    const conversation = await prisma.conversation.create({
      data: {
        listingId: listing1.id,
        buyerId: buyer.id,
        sellerId: proSeller.id,
        lastMessageAt: daysAgo(1),
      },
    });

    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          senderId: buyer.id,
          body: 'Hello, is this tractor still available?',
          createdAt: daysAgo(2),
          readAt: daysAgo(2),
        },
        {
          conversationId: conversation.id,
          senderId: proSeller.id,
          body: 'Yes, available. We can schedule an inspection.',
          createdAt: daysAgo(1),
          readAt: null,
        },
      ],
    });

    console.log('Seeding support tickets and ticket messages...');
    const ticket1 = await prisma.supportTicket.create({
      data: {
        userId: buyer.id,
        subject: 'Cannot upload media in listing wizard',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignedToId: manager.id,
      },
    });

    const ticket2 = await prisma.supportTicket.create({
      data: {
        userId: proSeller.id,
        subject: 'Subscription invoice request',
        status: 'RESOLVED',
        priority: 'MEDIUM',
        assignedToId: admin.id,
        closedAt: daysAgo(1),
      },
    });

    await prisma.ticketMessage.createMany({
      data: [
        {
          ticketId: ticket1.id,
          senderId: buyer.id,
          body: 'Uploader fails after selecting 3 photos.',
          isStaff: false,
          createdAt: daysAgo(2),
        },
        {
          ticketId: ticket1.id,
          senderId: manager.id,
          body: 'We are investigating this issue.',
          isStaff: true,
          createdAt: daysAgo(1),
        },
        {
          ticketId: ticket2.id,
          senderId: proSeller.id,
          body: 'Please send invoice for last month.',
          isStaff: false,
          createdAt: daysAgo(3),
        },
        {
          ticketId: ticket2.id,
          senderId: admin.id,
          body: 'Invoice generated and sent to your email.',
          isStaff: true,
          createdAt: daysAgo(1),
        },
      ],
    });

    console.log('Seeding dealer leads...');
    await prisma.dealerLead.createMany({
      data: [
        {
          companyName: 'Agri New Co',
          contactPerson: 'Mykola Lead',
          email: 'lead1@example.com',
          phone: '+380671111222',
          website: 'https://agrinew.example.com',
          countryId: ua.id,
          cityId: dnipro.id,
          activityTypes: ['FARM_EQUIPMENT_SALES'],
          brands: ['John Deere', 'Claas'],
          equipmentCount: 40,
          message: 'Interested in dealer onboarding',
          status: 'NEW',
          assignedToUserId: manager.id,
        },
        {
          companyName: 'Fleet Expand',
          contactPerson: 'Jan Expand',
          email: 'lead2@example.com',
          phone: '+48221110000',
          website: 'https://fleetexpand.example.com',
          countryId: pl.id,
          cityId: warsaw.id,
          activityTypes: ['COMMERCIAL_VEHICLE_SALES'],
          brands: ['MAN'],
          equipmentCount: 85,
          message: 'Need enterprise support',
          status: 'QUALIFIED',
          assignedToUserId: admin.id,
          notes: 'Ready for package discussion',
          convertedAt: null,
        },
      ],
    });

    console.log('Seeding notifications and saved searches...');
    await prisma.notification.createMany({
      data: [
        {
          userId: buyer.id,
          type: 'NEW_MESSAGE',
          title: 'New message from seller',
          body: 'You received a reply for John Deere 6155R',
          linkUrl: `/cabinet/messages/${conversation.id}`,
          isRead: false,
          createdAt: daysAgo(1),
        },
        {
          userId: proSeller.id,
          type: 'LISTING_APPROVED',
          title: 'Listing approved',
          body: 'Your listing "John Deere 6155R" is now active.',
          linkUrl: `/listings/${listing1.id.toString()}`,
          isRead: true,
          createdAt: daysAgo(2),
        },
        {
          userId: manager.id,
          type: 'SYSTEM',
          title: 'Daily moderation summary',
          body: '5 new listings pending review.',
          linkUrl: '/admin/moderation',
          isRead: false,
          createdAt: daysAgo(1),
        },
      ],
    });

    await prisma.savedSearch.createMany({
      data: [
        {
          userId: buyer.id,
          name: 'Used tractors in Ukraine',
          filters: {
            marketplace: 'agriculture',
            category: 'wheel-tractors',
            condition: 'USED',
            country: 'UA',
          },
        },
        {
          userId: proSeller.id,
          name: 'Truck tractors under 60k EUR',
          filters: {
            marketplace: 'commercial',
            category: 'truck-tractors',
            maxPrice: 60000,
            currency: 'EUR',
          },
        },
      ],
    });

    console.log('Seed complete (all models populated).');
    console.log('Users: 5');
    console.log('Countries: 3, Cities: 5');
    console.log(`Marketplaces: ${marketplaceRows.length}, Categories: ${categoriesBySlug.size}`);
    console.log(`Brands: ${brandRows.length}, Activity types: ${activityTypes.length}`);
    console.log('Companies: 3, Listings: 4');
    console.log('Conversation: 1, Messages: 2');
    console.log('Support tickets: 2, Ticket messages: 4');
    console.log('Plans: 3, Subscriptions: 3');
    console.log('Notifications: 3, Saved searches: 2');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Comprehensive seed failed:', error);
  process.exit(1);
});
