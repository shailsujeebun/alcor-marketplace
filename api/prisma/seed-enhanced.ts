import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

async function main() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    console.log('🗑️  Clearing existing data...');

    // Clear in correct order (respecting foreign keys)
    await prisma.passwordResetToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.oAuthAccount.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.savedSearch.deleteMany();
    await prisma.viewHistory.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.ticketMessage.deleteMany();
    await prisma.supportTicket.deleteMany();
    await prisma.companyUser.deleteMany();
    await prisma.listingAttribute.deleteMany();
    await prisma.listingMedia.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.companyReview.deleteMany();
    await prisma.companyBrand.deleteMany();
    await prisma.companyActivityType.deleteMany();
    await prisma.companyMedia.deleteMany();
    await prisma.companyPhone.deleteMany();
    await prisma.company.deleteMany();
    await prisma.fieldOption.deleteMany();
    await prisma.formField.deleteMany();
    await prisma.formTemplate.deleteMany();
    await prisma.category.deleteMany();
    await prisma.marketplace.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.activityType.deleteMany();
    await prisma.city.deleteMany();
    await prisma.country.deleteMany();
    await prisma.user.deleteMany();

    // ─── Users (50+ users) ──────────────────────────────────────
    console.log('👥 Seeding users...');
    const password = await bcrypt.hash('password123', 10);

    const users = [];

    // Admin users
    users.push(await prisma.user.create({
        data: {
            email: 'admin@alcor.com',
            passwordHash: await bcrypt.hash('admin123', 10),
            firstName: 'Адмін',
            lastName: 'Система',
            role: 'ADMIN',
            status: 'ACTIVE',
            emailVerified: true,
        },
    }));

    users.push(await prisma.user.create({
        data: {
            email: 'manager@alcor.com',
            passwordHash: await bcrypt.hash('manager123', 10),
            firstName: 'Менеджер',
            lastName: 'Підтримки',
            role: 'MANAGER',
            status: 'ACTIVE',
            emailVerified: true,
        },
    }));

    // Regular users with Ukrainian names
    const firstNames = ['Олександр', 'Дмитро', 'Андрій', 'Сергій', 'Володимир', 'Іван', 'Микола', 'Петро', 'Василь', 'Юрій',
        'Олена', 'Наталія', 'Ірина', 'Тетяна', 'Марія', 'Анна', 'Світлана', 'Людмила', 'Галина', 'Оксана'];
    const lastNames = ['Коваленко', 'Бойко', 'Мельник', 'Шевченко', 'Ткаченко', 'Кравченко', 'Морозов', 'Петренко', 'Іваненко', 'Павленко'];

    for (let i = 0; i < 50; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const email = `user${i + 1}@test.com`;

        users.push(await prisma.user.create({
            data: {
                email,
                passwordHash: password,
                firstName,
                lastName,
                role: 'USER',
                status: i % 10 === 0 ? 'RESTRICTED' : 'ACTIVE',
                emailVerified: i % 5 !== 0, // 80% verified
            },
        }));
    }

    console.log(`✅ Created ${users.length} users`);

    // ─── Countries ───────────────────────────────────
    console.log('🌍 Seeding countries...');
    const countryData = [
        { iso2: 'UA', name: 'Україна' },
        { iso2: 'PL', name: 'Польща' },
        { iso2: 'DE', name: 'Німеччина' },
        { iso2: 'RO', name: 'Румунія' },
        { iso2: 'TR', name: 'Туреччина' },
        { iso2: 'IT', name: 'Італія' },
        { iso2: 'ES', name: 'Іспанія' },
        { iso2: 'NL', name: 'Нідерланди' },
        { iso2: 'CZ', name: 'Чехія' },
        { iso2: 'HU', name: 'Угорщина' },
    ];

    const countries: Record<string, any> = {};
    for (const c of countryData) {
        countries[c.iso2] = await prisma.country.create({ data: c });
    }

    // ─── Cities ──────────────────────────────────────
    console.log('🏙️  Seeding cities...');
    const cityData = [
        // Ukraine
        { name: 'Київ', country: 'UA' },
        { name: 'Львів', country: 'UA' },
        { name: 'Одеса', country: 'UA' },
        { name: 'Харків', country: 'UA' },
        { name: 'Дніпро', country: 'UA' },
        { name: 'Запоріжжя', country: 'UA' },
        { name: 'Вінниця', country: 'UA' },
        { name: 'Полтава', country: 'UA' },
        { name: 'Черкаси', country: 'UA' },
        { name: 'Житомир', country: 'UA' },
        // Poland
        { name: 'Warszawa', country: 'PL' },
        { name: 'Kraków', country: 'PL' },
        { name: 'Gdańsk', country: 'PL' },
        // Germany
        { name: 'Berlin', country: 'DE' },
        { name: 'München', country: 'DE' },
        { name: 'Hamburg', country: 'DE' },
    ];

    const cities: Record<string, any> = {};
    for (const c of cityData) {
        const key = `${c.name}-${c.country}`;
        cities[key] = await prisma.city.create({
            data: {
                name: c.name,
                countryId: countries[c.country].id,
            },
        });
    }

    // ─── Activity Types ──────────────────────────
    console.log('🏢 Seeding activity types...');
    const activityTypes = [];
    const activityTypeData = [
        { code: 'AGRI_SALES', name: 'Продаж сільськогосподарської техніки' },
        { code: 'TRUCK_SALES', name: 'Продаж вантажівок' },
        { code: 'RENTAL', name: 'Оренда техніки' },
        { code: 'SERVICE', name: 'Сервісне обслуговування' },
        { code: 'PARTS', name: 'Продаж запчастин' },
    ];

    for (const data of activityTypeData) {
        activityTypes.push(await prisma.activityType.create({ data }));
    }

    // ─── Brands ──────────────────────────────────────
    console.log('🏷️  Seeding brands...');
    const brandNames = [
        'John Deere', 'Case IH', 'New Holland', 'Massey Ferguson', 'Claas',
        'Fendt', 'Deutz-Fahr', 'Kubota', 'Valtra', 'McCormick',
        'Mercedes-Benz', 'Volvo', 'Scania', 'MAN', 'DAF', 'Iveco', 'Renault',
        'Krone', 'Pöttinger', 'Lemken', 'Amazone', 'Horsch',
    ];

    const brands: Record<string, any> = {};
    for (const name of brandNames) {
        brands[name] = await prisma.brand.create({ data: { name } });
    }

    // ─── Marketplaces ──────────────────────────
    console.log('🛒 Seeding marketplaces...');
    const agroline = await prisma.marketplace.create({
        data: {
            key: 'agroline',
            name: 'Agroline',
        },
    });

    const autoline = await prisma.marketplace.create({
        data: {
            key: 'autoline',
            name: 'Autoline',
        },
    });

    // ─── Categories ──────────────────────────────────
    console.log('📁 Seeding categories...');
    const categories: Record<string, any> = {};

    // Parent categories
    const tractors = await prisma.category.create({
        data: { name: 'Трактори', marketplaceId: agroline.id },
    });
    categories['Трактори'] = tractors;

    const trucks = await prisma.category.create({
        data: { name: 'Вантажівки', marketplaceId: autoline.id },
    });
    categories['Вантажівки'] = trucks;

    const harvesters = await prisma.category.create({
        data: { name: 'Комбайни', marketplaceId: agroline.id },
    });
    categories['Комбайни'] = harvesters;

    const trailers = await prisma.category.create({
        data: { name: 'Причепи', marketplaceId: autoline.id },
    });
    categories['Причепи'] = trailers;

    // Subcategories
    await prisma.category.create({
        data: { name: 'Колісні трактори', marketplaceId: agroline.id, parentId: tractors.id },
    });

    await prisma.category.create({
        data: { name: 'Гусеничні трактори', marketplaceId: agroline.id, parentId: tractors.id },
    });

    await prisma.category.create({
        data: { name: 'Тягачі', marketplaceId: autoline.id, parentId: trucks.id },
    });

    await prisma.category.create({
        data: { name: 'Самоскиди', marketplaceId: autoline.id, parentId: trucks.id },
    });

    // ─── Form Templates ──────────────────────────────
    console.log('📝 Seeding form templates...');

    const tractorTemplate = await prisma.formTemplate.create({
        data: {
            categoryId: tractors.id,
            name: 'Форма для тракторів',
        },
    });

    // Tractor fields
    await prisma.formField.create({
        data: {
            templateId: tractorTemplate.id,
            key: 'engine_power',
            label: 'Потужність двигуна (к.с.)',
            type: 'NUMBER',
            isRequired: true,
            order: 1,
        },
    });

    await prisma.formField.create({
        data: {
            templateId: tractorTemplate.id,
            key: 'drive_type',
            label: 'Тип приводу',
            type: 'SELECT',
            isRequired: true,
            order: 2,
            options: {
                create: [
                    { value: '4x2', label: '4x2' },
                    { value: '4x4', label: '4x4' },
                ],
            },
        },
    });

    // ─── Companies (30+) ─────────────────────────────
    console.log('🏭 Seeding companies...');
    const companies = [];
    const companyNames = [
        'АгроТехСервіс', 'ТехноФарм', 'МашБуд', 'АгроМаш', 'ТехноПлюс',
        'ФермерТех', 'АгроСнаб', 'МашТорг', 'ТехСервіс', 'АгроІмпорт',
        'ЕвроТех', 'АгроЛідер', 'МашЕксперт', 'ТехноГруп', 'АгроСтандарт',
    ];

    for (let i = 0; i < 30; i++) {
        const name = i < companyNames.length ? companyNames[i] : `Компанія ${i + 1}`;
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        const company = await prisma.company.create({
            data: {
                name,
                slug: `${slug}-${i}`,
                marketplaceId: i % 2 === 0 ? agroline.id : autoline.id,
                countryId: countries['UA'].id,
                cityId: cities['Київ-UA']?.id || null,
                status: 'ACTIVE',
                phones: {
                    create: [
                        { number: `+380${Math.floor(Math.random() * 1000000000)}`, isPrimary: true },
                    ],
                },
                activityTypes: {
                    create: [
                        { activityTypeId: activityTypes[i % activityTypes.length].id },
                    ],
                },
                brands: {
                    create: [
                        { brandId: brands[brandNames[i % brandNames.length]].id },
                    ],
                },
            },
        });
        companies.push(company);
    }

    console.log(`✅ Created ${companies.length} companies`);

    // ─── Listings (200+) ─────────────────────────────
    console.log('📋 Seeding listings...');
    const listings = [];

    const titles = [
        'Трактор John Deere 6920',
        'Комбайн Case IH 2388',
        'Вантажівка Mercedes-Benz Actros',
        'Причіп Krone SD',
        'Трактор New Holland T7.270',
        'Комбайн Claas Lexion 770',
        'Тягач Volvo FH16',
        'Самоскид MAN TGS',
        'Трактор Fendt 939',
        'Комбайн Massey Ferguson 7347',
    ];

    for (let i = 0; i < 200; i++) {
        const title = `${titles[i % titles.length]} #${i + 1}`;
        const company = companies[i % companies.length];
        const category = i % 2 === 0 ? tractors : trucks;
        const brand = brands[brandNames[i % brandNames.length]];

        try {
            const listing = await prisma.listing.create({
                data: {
                    marketplaceId: company.marketplaceId,
                    companyId: company.id,
                    title,
                    categoryId: category.id,
                    brandId: brand.id,
                    status: i % 10 === 0 ? 'DRAFT' : 'ACTIVE',
                    publishedAt: i % 10 === 0 ? null : new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                    fact: {
                        create: {
                            condition: i % 3 === 0 ? 'NEW' : 'USED',
                            year: 2015 + (i % 10),
                            priceAmount: 50000 + (i * 1000),
                            priceCurrency: 'USD',
                            vatType: i % 2 === 0 ? 'INCLUDED' : 'EXCLUDED',
                        },
                    },
                    countryId: countries['UA'].id,
                    cityId: cities['Київ-UA']?.id || null,
                },
            });
            listings.push(listing);
        } catch (e) {
            console.error(`Failed to create listing ${title}:`, e);
        }
    }

    console.log(`✅ Created ${listings.length} listings`);

    // ─── Favorites ───────────────────────────────────
    console.log('⭐ Seeding favorites...');
    for (let i = 0; i < 100; i++) {
        const user = users[2 + (i % (users.length - 2))]; // Skip admin/manager
        const listing = listings[i % listings.length];

        try {
            await prisma.favorite.create({
                data: {
                    userId: user.id,
                    listingId: listing.id,
                },
            });
        } catch (e) {
            // Ignore duplicates
        }
    }

    // ─── Listing Views ───────────────────────────────
    console.log('👁️  Seeding listing views...');
    for (let i = 0; i < 500; i++) {
        const listing = listings[i % listings.length];
        const user = users[2 + (i % (users.length - 2))];

        try {
            await prisma.viewHistory.create({
                data: {
                    listingId: listing.id,
                    userId: user.id,
                },
            });
        } catch (e) {
            // Ignore duplicates (unique constraint on userId + listingId)
        }
    }
    // ─── Saved Searches ──────────────────────────────
    console.log('🔍 Seeding saved searches...');
    const searchQueries = [
        { name: 'Трактори John Deere', query: 'brand=john-deere&category=tractors' },
        { name: 'Вантажівки до 50000 USD', query: 'category=trucks&maxPrice=50000' },
        { name: 'Нова техніка', query: 'condition=NEW' },
        { name: 'Комбайни 2020+', query: 'category=harvesters&minYear=2020' },
    ];

    for (let i = 0; i < 50; i++) {
        const user = users[2 + (i % (users.length - 2))];
        const search = searchQueries[i % searchQueries.length];

        await prisma.savedSearch.create({
            data: {
                userId: user.id,
                name: `${search.name} ${i + 1}`,
                query: search.query,
                notifyOnNew: i % 2 === 0,
            },
        });
    }

    // ─── Conversations & Messages ────────────────────
    console.log('💬 Seeding conversations and messages...');
    for (let i = 0; i < 30; i++) {
        const user1 = users[2 + (i % (users.length - 2))];
        const user2 = users[2 + ((i + 1) % (users.length - 2))];
        const listing = listings[i % listings.length];

        const conversation = await prisma.conversation.create({
            data: {
                listingId: listing.id,
                buyerId: user1.id,
                sellerId: user2.id,
            },
        });

        // Add messages
        const messages = [
            'Доброго дня! Чи актуальне оголошення?',
            'Так, техніка в наявності.',
            'Яка ціна остаточна?',
            'Можемо обговорити при зустрічі.',
        ];

        for (let j = 0; j < messages.length; j++) {
            await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    senderId: j % 2 === 0 ? user1.id : user2.id,
                    content: messages[j],
                    isRead: j < 2,
                },
            });
        }
    }

    // ─── Notifications ───────────────────────────────
    console.log('🔔 Seeding notifications...');
    const notificationTypes = ['NEW_MESSAGE', 'LISTING_APPROVED', 'LISTING_REJECTED', 'PRICE_DROP'];
    const notificationTitles = {
        NEW_MESSAGE: 'Нове повідомлення',
        LISTING_APPROVED: 'Оголошення схвалено',
        LISTING_REJECTED: 'Оголошення відхилено',
        PRICE_DROP: 'Зниження ціни',
    };

    for (let i = 0; i < 100; i++) {
        const user = users[2 + (i % (users.length - 2))];
        const type = notificationTypes[i % notificationTypes.length];

        await prisma.notification.create({
            data: {
                userId: user.id,
                type,
                title: notificationTitles[type as keyof typeof notificationTitles],
                message: `Тестове повідомлення ${i + 1}`,
                isRead: i % 3 === 0,
            },
        });
    }

    // ─── Support Tickets ─────────────────────────────
    console.log('🎫 Seeding support tickets...');
    const ticketSubjects = [
        'Не можу опублікувати оголошення',
        'Питання щодо оплати',
        'Технічна проблема',
        'Запит на видалення акаунту',
        'Питання щодо модерації',
    ];

    for (let i = 0; i < 40; i++) {
        const user = users[2 + (i % (users.length - 2))];
        const subject = ticketSubjects[i % ticketSubjects.length];

        const ticket = await prisma.supportTicket.create({
            data: {
                userId: user.id,
                subject: `${subject} #${i + 1}`,
                status: i % 4 === 0 ? 'CLOSED' : i % 3 === 0 ? 'IN_PROGRESS' : 'OPEN',
                priority: i % 5 === 0 ? 'HIGH' : 'NORMAL',
            },
        });

        // Add messages to ticket
        await prisma.ticketMessage.create({
            data: {
                ticketId: ticket.id,
                senderId: user.id,
                body: 'Опис проблеми...',
                isStaff: false,
            },
        });

        if (i % 2 === 0) {
            await prisma.ticketMessage.create({
                data: {
                    ticketId: ticket.id,
                    senderId: users[1].id, // Manager response
                    body: 'Дякуємо за звернення. Ми розглянемо ваше питання.',
                    isStaff: true,
                },
            });
        }
    }

    // ─── Company Reviews ─────────────────────────────
    console.log('⭐ Seeding company reviews...');
    for (let i = 0; i < 80; i++) {
        const company = companies[i % companies.length];

        await prisma.companyReview.create({
            data: {
                companyId: company.id,
                authorName: `Користувач ${i + 1}`,
                rating: 3 + (i % 3),
                title: i % 2 === 0 ? 'Гарний сервіс' : null,
                body: 'Професійна команда, швидка доставка.',
            },
        });
    }

    console.log('\n✅ Seed complete!');
    console.log('═══════════════════════════════════════');
    console.log(`👥 Users: ${users.length}`);
    console.log(`🌍 Countries: ${countryData.length}`);
    console.log(`🏙️  Cities: ${cityData.length}`);
    console.log(`🏢 Activity Types: ${activityTypes.length}`);
    console.log(`🏷️  Brands: ${brandNames.length}`);
    console.log(`📁 Categories: 6`);
    console.log(`🏭 Companies: ${companies.length}`);
    console.log(`📋 Listings: ${listings.length}`);
    console.log(`⭐ Favorites: ~100`);
    console.log(`👁️  Listing Views: ~500`);
    console.log(`🔍 Saved Searches: ~50`);
    console.log(`💬 Conversations: ~30`);
    console.log(`📨 Messages: ~120`);
    console.log(`🔔 Notifications: ~100`);
    console.log(`🎫 Support Tickets: ~40`);
    console.log(`⭐ Reviews: ~80`);
    console.log('═══════════════════════════════════════\n');

    await prisma.$disconnect();
    await pool.end();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
