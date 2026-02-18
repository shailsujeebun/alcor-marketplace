"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCore = seedCore;
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const shared_1 = require("./shared");
async function seedCore(prisma) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@alcor.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'test1234';
    const demoPassword = 'test1234';
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
    const passwordHash = await bcrypt.hash(demoPassword, 10);
    const admin = await prisma.user.create({
        data: {
            email: adminEmail,
            passwordHash: adminPasswordHash,
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            status: 'ACTIVE',
            locale: 'uk',
            emailVerified: true,
        },
    });
    console.log(`  Admin user created: ${adminEmail}`);
    const manager = await prisma.user.create({
        data: {
            email: 'manager@alcor.com',
            passwordHash,
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
            passwordHash,
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
            passwordHash,
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
            passwordHash,
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
            expiresAt: (0, shared_1.daysFromNow)(30),
            userAgent: 'seed-script',
            ipAddress: '127.0.0.1',
        },
    });
    await prisma.passwordResetToken.create({
        data: {
            userId: restrictedUser.id,
            tokenHash: 'seed-reset-token-restricted',
            expiresAt: (0, shared_1.daysFromNow)(1),
        },
    });
    await prisma.emailVerificationCode.create({
        data: {
            userId: restrictedUser.id,
            codeHash: 'seed-email-code-restricted',
            expiresAt: (0, shared_1.daysFromNow)(1),
        },
    });
    const users = {
        adminId: admin.id,
        managerId: manager.id,
        proSellerId: proSeller.id,
        buyerId: buyer.id,
        restrictedUserId: restrictedUser.id,
    };
    const ua = await prisma.country.create({ data: { iso2: 'UA', name: 'Ukraine' } });
    const de = await prisma.country.create({ data: { iso2: 'DE', name: 'Germany' } });
    const pl = await prisma.country.create({ data: { iso2: 'PL', name: 'Poland' } });
    const kyiv = await prisma.city.create({ data: { name: 'Kyiv', countryId: ua.id } });
    const dnipro = await prisma.city.create({ data: { name: 'Dnipro', countryId: ua.id } });
    const berlin = await prisma.city.create({ data: { name: 'Berlin', countryId: de.id } });
    await prisma.city.create({ data: { name: 'Munich', countryId: de.id } });
    const warsaw = await prisma.city.create({ data: { name: 'Warsaw', countryId: pl.id } });
    const geo = {
        uaId: ua.id,
        deId: de.id,
        plId: pl.id,
        kyivId: kyiv.id,
        dniproId: dnipro.id,
        berlinId: berlin.id,
        warsawId: warsaw.id,
    };
    const activityTypes = await Promise.all([
        prisma.activityType.create({ data: { code: 'FARM_EQUIPMENT_SALES', name: 'Farm equipment sellers' } }),
        prisma.activityType.create({
            data: { code: 'COMMERCIAL_VEHICLE_SALES', name: 'Commercial vehicle sellers' },
        }),
        prisma.activityType.create({
            data: { code: 'INDUSTRIAL_EQUIPMENT_SALES', name: 'Industrial equipment sellers' },
        }),
        prisma.activityType.create({ data: { code: 'AUTO_SERVICE', name: 'Auto service' } }),
    ]);
    const marketplaceRows = await Promise.all([
        prisma.marketplace.create({ data: { key: 'agriculture', name: 'Agriculture' } }),
        prisma.marketplace.create({ data: { key: 'commercial', name: 'Commercial transport' } }),
        prisma.marketplace.create({ data: { key: 'industrial', name: 'Industrial equipment' } }),
        prisma.marketplace.create({ data: { key: 'cars', name: 'Passenger cars' } }),
    ]);
    const marketplaceMap = new Map(marketplaceRows.map((row) => [row.key, row.id]));
    const categoriesBySlug = new Map();
    async function createCategory(params) {
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
        categoriesBySlug.set(params.slug, { id: row.id, marketplaceId });
    }
    await createCategory({ marketplaceKey: 'agriculture', slug: 'tractors', name: 'Tractors', sortOrder: 1 });
    await createCategory({
        marketplaceKey: 'agriculture',
        slug: 'wheel-tractors',
        name: 'Wheel tractors',
        parentSlug: 'tractors',
        sortOrder: 2,
    });
    await createCategory({
        marketplaceKey: 'agriculture',
        slug: 'tracked-tractors',
        name: 'Tracked tractors',
        parentSlug: 'tractors',
        sortOrder: 3,
    });
    await createCategory({
        marketplaceKey: 'agriculture',
        slug: 'combine-harvesters',
        name: 'Combine harvesters',
        sortOrder: 4,
    });
    await createCategory({
        marketplaceKey: 'agriculture',
        slug: 'grain-harvesters',
        name: 'Grain harvesters',
        parentSlug: 'combine-harvesters',
        sortOrder: 5,
    });
    await createCategory({ marketplaceKey: 'industrial', slug: 'excavators', name: 'Excavators', sortOrder: 1 });
    await createCategory({
        marketplaceKey: 'industrial',
        slug: 'mini-excavators',
        name: 'Mini excavators',
        parentSlug: 'excavators',
        sortOrder: 2,
    });
    await createCategory({
        marketplaceKey: 'industrial',
        slug: 'tracked-excavators',
        name: 'Tracked excavators',
        parentSlug: 'excavators',
        sortOrder: 3,
    });
    await createCategory({ marketplaceKey: 'industrial', slug: 'loaders', name: 'Loaders', sortOrder: 4 });
    await createCategory({
        marketplaceKey: 'industrial',
        slug: 'wheel-loaders',
        name: 'Wheel loaders',
        parentSlug: 'loaders',
        sortOrder: 5,
    });
    await createCategory({ marketplaceKey: 'commercial', slug: 'trucks', name: 'Trucks', sortOrder: 1 });
    await createCategory({
        marketplaceKey: 'commercial',
        slug: 'truck-tractors',
        name: 'Truck tractors',
        parentSlug: 'trucks',
        sortOrder: 2,
    });
    await createCategory({
        marketplaceKey: 'commercial',
        slug: 'dump-trucks',
        name: 'Dump trucks',
        parentSlug: 'trucks',
        sortOrder: 3,
    });
    await createCategory({ marketplaceKey: 'commercial', slug: 'trailers', name: 'Trailers', sortOrder: 4 });
    await createCategory({
        marketplaceKey: 'commercial',
        slug: 'semi-trailers',
        name: 'Semi-trailers',
        parentSlug: 'trailers',
        sortOrder: 5,
    });
    await createCategory({
        marketplaceKey: 'cars',
        slug: 'passenger-cars',
        name: 'Passenger cars',
        sortOrder: 1,
    });
    await createCategory({
        marketplaceKey: 'cars',
        slug: 'sedans',
        name: 'Sedans',
        parentSlug: 'passenger-cars',
        sortOrder: 2,
    });
    await createCategory({
        marketplaceKey: 'cars',
        slug: 'suv',
        name: 'SUV',
        parentSlug: 'passenger-cars',
        sortOrder: 3,
    });
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
    const brandMap = new Map(brandRows.map((brand) => [brand.name, brand.id]));
    async function linkBrandToCategory(brandName, categorySlug) {
        const brandId = brandMap.get(brandName);
        const category = categoriesBySlug.get(categorySlug);
        if (!brandId || !category)
            return;
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
        if (!category)
            continue;
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
    const basicPlan = await prisma.plan.create({
        data: {
            slug: 'basic',
            name: 'Basic',
            description: 'Starter plan',
            priceAmount: new client_1.Prisma.Decimal('0'),
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
            priceAmount: new client_1.Prisma.Decimal('1499'),
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
            priceAmount: new client_1.Prisma.Decimal('4999'),
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
            startDate: (0, shared_1.daysAgo)(20),
            endDate: (0, shared_1.daysFromNow)(10),
        },
    });
    await prisma.subscription.create({
        data: {
            userId: buyer.id,
            planId: basicPlan.id,
            status: 'PAUSED',
            startDate: (0, shared_1.daysAgo)(90),
            endDate: (0, shared_1.daysAgo)(30),
        },
    });
    await prisma.subscription.create({
        data: {
            userId: admin.id,
            planId: enterprisePlan.id,
            status: 'CANCELLED',
            startDate: (0, shared_1.daysAgo)(180),
            endDate: (0, shared_1.daysAgo)(60),
        },
    });
    const catalog = {
        activityTypeIds: activityTypes.map((item) => item.id),
        marketplaceMap,
        categoriesBySlug,
        brandMap,
    };
    const plans = {
        basicPlanId: basicPlan.id,
        proPlanId: proPlan.id,
        enterprisePlanId: enterprisePlan.id,
    };
    return {
        users,
        geo,
        catalog,
        plans,
    };
}
