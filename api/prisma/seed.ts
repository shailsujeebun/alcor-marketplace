import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Clearing existing data...');
  await prisma.passwordResetToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.oAuthAccount.deleteMany();
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
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.activityType.deleteMany();
  await prisma.city.deleteMany();
  await prisma.country.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ──────────────────────────────────────
  console.log('Seeding users...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@alcor.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'Alcor',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@alcor.com',
      passwordHash: managerPassword,
      firstName: 'Manager',
      lastName: 'Alcor',
      role: 'MANAGER',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  const testUser = await prisma.user.create({
    data: {
      email: 'user@test.com',
      passwordHash: userPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  // ─── Countries ───────────────────────────────────
  // Sourced from agriline.ua/ru/companies/list/ location filters + company cards
  console.log('Seeding countries...');
  const countries: Record<string, Awaited<ReturnType<typeof prisma.country.create>>> = {};
  const countryData = [
    { iso2: 'DE', name: 'Німеччина' },
    { iso2: 'ES', name: 'Іспанія' },
    { iso2: 'IT', name: 'Італія' },
    { iso2: 'LT', name: 'Литва' },
    { iso2: 'NL', name: 'Нідерланди' },
    { iso2: 'PL', name: 'Польща' },
    { iso2: 'RO', name: 'Румунія' },
    { iso2: 'TR', name: 'Туреччина' },
    { iso2: 'UA', name: 'Україна' },
    { iso2: 'CZ', name: 'Чехія' },
    { iso2: 'HU', name: 'Угорщина' },
    { iso2: 'CN', name: 'Китай' },
    { iso2: 'EE', name: 'Естонія' },
    { iso2: 'SK', name: 'Словаччина' },
    { iso2: 'SI', name: 'Словенія' },
    { iso2: 'SE', name: 'Швеція' },
    { iso2: 'AT', name: 'Австрія' },
    { iso2: 'GB', name: 'Велика Британія' },
    { iso2: 'BG', name: 'Болгарія' },
    { iso2: 'DK', name: 'Данія' },
    { iso2: 'NO', name: 'Норвегія' },
    { iso2: 'JP', name: 'Японія' },
    { iso2: 'BE', name: 'Бельгія' },
    { iso2: 'PT', name: 'Португалія' },
    { iso2: 'CH', name: 'Швейцарія' },
    { iso2: 'SA', name: 'Саудівська Аравія' },
    { iso2: 'KR', name: 'Південна Корея' },
    { iso2: 'AE', name: 'ОАЕ' },
    { iso2: 'MD', name: 'Молдова' },
  ];
  for (const c of countryData) {
    countries[c.iso2] = await prisma.country.create({ data: c });
  }

  // ─── Cities ──────────────────────────────────────
  console.log('Seeding cities...');
  const cities: Record<string, Awaited<ReturnType<typeof prisma.city.create>>> = {};
  const cityData = [
    // Turkey
    { name: 'KONYA', country: 'TR' },
    { name: 'Istanbul', country: 'TR' },
    { name: 'Ankara', country: 'TR' },
    { name: 'SAKARYA', country: 'TR' },
    { name: 'BALIKESIR', country: 'TR' },
    { name: 'Manisa', country: 'TR' },
    { name: 'Selcuklu/Konya', country: 'TR' },
    { name: 'YENIMAHALLE/ANKARA', country: 'TR' },
    { name: 'Izmir', country: 'TR' },
    { name: 'Burdur', country: 'TR' },
    { name: 'Kayseri', country: 'TR' },
    { name: 'Mersin', country: 'TR' },
    { name: 'Izmit', country: 'TR' },
    { name: 'Tekirdag', country: 'TR' },
    { name: 'Osmaniye', country: 'TR' },
    { name: 'Adana', country: 'TR' },
    { name: 'Samsun/Atakum', country: 'TR' },
    { name: 'Kahramankazan/Ankara', country: 'TR' },
    { name: 'Nevsehir', country: 'TR' },
    { name: 'Osmangazi/Bursa', country: 'TR' },
    { name: 'Karatay/Konya', country: 'TR' },
    { name: 'Sincan/Ankara', country: 'TR' },
    { name: 'Merkez/Duzce', country: 'TR' },
    { name: 'Etimesgut/Ankara', country: 'TR' },
    { name: 'SAMSUN/BAFRA', country: 'TR' },
    { name: 'MERSIN/AKDENIZ', country: 'TR' },
    { name: 'KAHRAMANKAZAN/ANKARA', country: 'TR' },
    // Germany
    { name: 'Delbrück', country: 'DE' },
    { name: 'Finowfurt near Berlin', country: 'DE' },
    { name: 'Crailsheim', country: 'DE' },
    { name: 'München', country: 'DE' },
    { name: 'Munich', country: 'DE' },
    { name: 'Langenfeld (Rheinland)', country: 'DE' },
    { name: 'Konz', country: 'DE' },
    { name: 'Rheda-Wiedenbrück', country: 'DE' },
    { name: 'Geilenkirchen', country: 'DE' },
    // Romania
    { name: 'Chitila', country: 'RO' },
    { name: 'Bihor', country: 'RO' },
    { name: 'Ovidiu', country: 'RO' },
    { name: 'Suceava', country: 'RO' },
    { name: 'Jud. Constanța', country: 'RO' },
    { name: 'Gătaia', country: 'RO' },
    { name: 'Bistrița Năsăud', country: 'RO' },
    // Netherlands
    { name: 'Veghel', country: 'NL' },
    { name: 'Hoogerheide', country: 'NL' },
    { name: 'Utrecht', country: 'NL' },
    { name: 'Schiedam', country: 'NL' },
    { name: 'Rijnsburg', country: 'NL' },
    { name: 'Zevenbergen', country: 'NL' },
    { name: 'Amsterdam', country: 'NL' },
    { name: 'Vuren', country: 'NL' },
    { name: 'Heerenveen', country: 'NL' },
    { name: 'Oosterhout', country: 'NL' },
    { name: 'Helmond', country: 'NL' },
    { name: 'Roosendaal', country: 'NL' },
    { name: 'Rheden', country: 'NL' },
    // Poland
    { name: 'Morawica', country: 'PL' },
    { name: 'Pabianice', country: 'PL' },
    { name: 'Pszczyna', country: 'PL' },
    { name: 'Słupsk', country: 'PL' },
    { name: 'Kudowa Zdrój', country: 'PL' },
    { name: 'Gdańsk', country: 'PL' },
    { name: 'Warszawa', country: 'PL' },
    { name: 'Toruń', country: 'PL' },
    { name: 'Kraków', country: 'PL' },
    { name: 'Ruda Śląska', country: 'PL' },
    { name: 'Police', country: 'PL' },
    { name: 'Częstochina', country: 'PL' },
    // Ukraine
    { name: 'Березівка', country: 'UA' },
    { name: 'Київ', country: 'UA' },
    { name: 'Яворівський район', country: 'UA' },
    { name: 'Вінниця', country: 'UA' },
    { name: 'Ужгород', country: 'UA' },
    { name: 'Харків', country: 'UA' },
    { name: 'Кривий Ріг', country: 'UA' },
    { name: 'Чернігів', country: 'UA' },
    { name: 'Красноград', country: 'UA' },
    { name: 'Олександрія', country: 'UA' },
    { name: 'Супрунівка', country: 'UA' },
    { name: 'Фастівський район', country: 'UA' },
    { name: 'Гостомель', country: 'UA' },
    { name: 'Мукачево', country: 'UA' },
    { name: 'Кременчук', country: 'UA' },
    { name: 'Одеса', country: 'UA' },
    { name: 'Тернопіль', country: 'UA' },
    { name: 'Дніпро', country: 'UA' },
    { name: 'Мелітополь', country: 'UA' },
    { name: 'Надежівка', country: 'UA' },
    { name: 'с. Воля Баратівська', country: 'UA' },
    // Czech Republic
    { name: 'Hřebec', country: 'CZ' },
    { name: 'Uherský Brod', country: 'CZ' },
    { name: 'Jedlová', country: 'CZ' },
    { name: 'Nové Strašecí', country: 'CZ' },
    { name: 'Štěpánovice', country: 'CZ' },
    // Hungary
    { name: 'Vác', country: 'HU' },
    { name: 'Százhalombatta', country: 'HU' },
    { name: 'Béled', country: 'HU' },
    // China
    { name: 'Hong Kong', country: 'CN' },
    { name: 'Shanghai', country: 'CN' },
    { name: 'Shandong', country: 'CN' },
    { name: 'Jiangsu Province', country: 'CN' },
    { name: 'Changsha', country: 'CN' },
    { name: 'Qingdao', country: 'CN' },
    { name: 'Zhengzhou', country: 'CN' },
    { name: 'Hefei', country: 'CN' },
    { name: "Ma'anshan", country: 'CN' },
    { name: 'Qingzhou', country: 'CN' },
    { name: 'Hunan', country: 'CN' },
    // Estonia
    { name: 'Tartu', country: 'EE' },
    // Slovakia
    { name: 'Šaľa', country: 'SK' },
    { name: 'Bobrov', country: 'SK' },
    { name: 'Bratislava', country: 'SK' },
    { name: 'Jálšovík', country: 'SK' },
    { name: 'Žilina', country: 'SK' },
    { name: 'Pezinok', country: 'SK' },
    // Sweden
    { name: 'Malmö', country: 'SE' },
    { name: 'Karlstad', country: 'SE' },
    { name: 'Stugun', country: 'SE' },
    // Spain
    { name: 'Granda, Siero', country: 'ES' },
    { name: 'Montcada i Reixac', country: 'ES' },
    // Italy
    { name: 'Livorno', country: 'IT' },
    { name: 'Legnano MI', country: 'IT' },
    { name: 'Olgiate Comasco (CO)', country: 'IT' },
    { name: 'Fara Vicentino (VI)', country: 'IT' },
    // Austria
    { name: 'Markt Hartmannsdorf', country: 'AT' },
    // UK
    { name: 'Sawley', country: 'GB' },
    // Bulgaria
    { name: 'SLIVEN', country: 'BG' },
    // Denmark
    { name: 'Padborg', country: 'DK' },
    // Norway
    { name: 'Porsgrunn', country: 'NO' },
    { name: 'Heimdal', country: 'NO' },
    // Belgium
    { name: 'Hooglede', country: 'BE' },
    // Portugal
    { name: 'Santo Tirso', country: 'PT' },
    // Switzerland
    { name: 'Zug', country: 'CH' },
    // UAE
    { name: 'Dubai', country: 'AE' },
    // Moldova
    { name: 'Chișinău', country: 'MD' },
  ];
  for (const c of cityData) {
    const key = `${c.country}:${c.name}`;
    cities[key] = await prisma.city.create({
      data: { name: c.name, countryId: countries[c.country].id },
    });
  }

  // Helper to get city id
  const cityId = (country: string, city: string) => cities[`${country}:${city}`]?.id ?? null;

  // ─── Activity Types ──────────────────────────────
  // From agriline.ua sidebar filters
  console.log('Seeding activity types...');
  const activityTypeData = [
    { code: 'FARM_EQUIPMENT_SALES', name: 'Продавці сільгосптехніки' },
    { code: 'COMMERCIAL_VEHICLE_SALES', name: 'Продавці комерційної техніки' },
    { code: 'CONSTRUCTION_EQUIPMENT_SALES', name: 'Продавці будівельної техніки' },
    { code: 'LOADER_SALES', name: 'Продавці навантажувачів' },
    { code: 'INDUSTRIAL_EQUIPMENT_SALES', name: 'Продавці промислового обладнання' },
    { code: 'AGRI_PRODUCTS_SALES', name: 'Продавці сільгосппродукції та матеріалів' },
    { code: 'AUCTION', name: 'Аукціон' },
    { code: 'AUTO_SERVICE', name: 'Автосервіси' },
    { code: 'LEASING', name: 'Лізинг' },
    { code: 'DELIVERY', name: 'Доставка/перевезення' },
    { code: 'INSPECTION', name: 'Інспекція' },
    { code: 'SPARE_PARTS', name: 'Продавці запчастин' },
    { code: 'RENTAL', name: 'Оренда' },
    { code: 'MANUFACTURER', name: 'Виробник' },
  ];
  const actTypes: Record<string, string> = {};
  for (const at of activityTypeData) {
    const created = await prisma.activityType.create({ data: at });
    actTypes[at.code] = created.id;
  }

  // ─── Brands ──────────────────────────────────────
  // From agriline.ua sidebar filters + company profile brand lists
  console.log('Seeding brands...');
  const brandNames = [
    'Amazone', 'Case IH', 'Claas', 'Deutz-Fahr', 'Fendt', 'John Deere',
    'Lemken', 'Massey Ferguson', 'New Holland',
    // From company profiles
    'Atlas Copco', 'Caterpillar', 'Frumecar', 'Gasparin', 'Herbst', 'Hitachi',
    'Hyundai', 'Kobelco', 'Komatsu', 'Lintec', 'MAN', 'Marini', 'Mecalac',
    'Merlo', 'Parker', 'Sandvik', 'Sany', 'Steelwrist', 'Still',
    'DAF', 'Mercedes-Benz', 'Scania', 'IVECO', 'Carnehl', 'Kögel',
    'Volvo', 'Spitzer', 'Ford', 'Renault', 'Schwarzmüller', 'Terex',
    'Volkswagen', 'XCMG', 'Linde', 'BYD', 'Avant', 'Kleemann',
    'Unia', 'Schmitz Cargobull', 'Terex Finlay', 'Skyjack',
    'Ammann', 'Janmil', 'Kässbohrer', 'Meiller',
    'Nükte Trailer', 'JCB', 'Liebherr', 'Doosan', 'Bobcat',
    'Manitou', 'Kubota', 'Takeuchi', 'Wacker Neuson', 'Hamm',
    'Bomag', 'Wirtgen', 'Vögele', 'Dynapac', 'BELL',
  ];
  const brands: Record<string, string> = {};
  for (const name of brandNames) {
    const created = await prisma.brand.create({ data: { name } });
    brands[name] = created.id;
  }

  // ─── Categories ──────────────────────────────────
  // From agriline.ua listing filter categories
  console.log('Seeding categories...');
  const catMap: Record<string, string> = {};

  // Parent categories
  const parentCats = [
    { slug: 'tractors', name: 'Трактори' },
    { slug: 'harvesters', name: 'Комбайни' },
    { slug: 'seeders', name: 'Сівалки' },
    { slug: 'excavators', name: 'Екскаватори' },
    { slug: 'loaders', name: 'Навантажувачі' },
    { slug: 'trucks', name: 'Вантажівки' },
    { slug: 'trailers', name: 'Причепи' },
    { slug: 'semi-trailers', name: 'Напівпричепи' },
    { slug: 'construction-equipment', name: 'Будівельна техніка' },
    { slug: 'agricultural-equipment', name: 'Сільгосптехніка' },
    { slug: 'industrial-equipment', name: 'Промислове обладнання' },
    { slug: 'livestock-equipment', name: 'Обладнання для тваринництва' },
    { slug: 'spare-parts', name: 'Запчастини' },
    { slug: 'aerial-platforms', name: 'Автовишки та підйомники' },
    { slug: 'municipal-equipment', name: 'Комунальна техніка' },
  ];
  for (const cat of parentCats) {
    const created = await prisma.category.create({ data: cat });
    catMap[cat.slug] = created.id;
  }

  // Child categories
  const childCats = [
    { slug: 'mini-tractors', name: 'Міні-трактори', parent: 'tractors' },
    { slug: 'wheel-tractors', name: 'Колісні трактори', parent: 'tractors' },
    { slug: 'crawler-tractors', name: 'Гусеничні трактори', parent: 'tractors' },
    { slug: 'mini-excavators', name: 'Міні-екскаватори', parent: 'excavators' },
    { slug: 'tracked-excavators', name: 'Гусеничні екскаватори', parent: 'excavators' },
    { slug: 'wheel-excavators', name: 'Колісні екскаватори', parent: 'excavators' },
    { slug: 'wheel-loaders', name: 'Фронтальні навантажувачі', parent: 'loaders' },
    { slug: 'telehandlers', name: 'Телескопічні навантажувачі', parent: 'loaders' },
    { slug: 'skid-steer-loaders', name: 'Міні-навантажувачі', parent: 'loaders' },
    { slug: 'forklifts', name: 'Вилкові навантажувачі', parent: 'loaders' },
    { slug: 'dump-trucks', name: 'Самоскиди', parent: 'trucks' },
    { slug: 'truck-tractors', name: 'Тягачі', parent: 'trucks' },
    { slug: 'flatbed-trucks', name: 'Бортові вантажівки', parent: 'trucks' },
    { slug: 'curtain-semi-trailers', name: 'Напівпричепи шторні', parent: 'semi-trailers' },
    { slug: 'tipper-semi-trailers', name: 'Напівпричепи самоскидні', parent: 'semi-trailers' },
    { slug: 'lowbed-semi-trailers', name: 'Напівпричепи низькорамні', parent: 'semi-trailers' },
    { slug: 'balers', name: 'Прес-підбирачі', parent: 'agricultural-equipment' },
    { slug: 'mowers', name: 'Косарки', parent: 'agricultural-equipment' },
    { slug: 'feed-mixers', name: 'Кормозмішувачі', parent: 'livestock-equipment' },
    { slug: 'tractor-trailers', name: 'Тракторні причепи', parent: 'trailers' },
    { slug: 'silage-machines', name: 'Силосозбиральні машини', parent: 'agricultural-equipment' },
    { slug: 'scissor-lifts', name: 'Ножичні підйомники', parent: 'aerial-platforms' },
    { slug: 'concrete-plants', name: 'Бетонні заводи', parent: 'construction-equipment' },
    { slug: 'crushers', name: 'Дробарки', parent: 'construction-equipment' },
    { slug: 'asphalt-plants', name: 'Асфальтові заводи', parent: 'construction-equipment' },
  ];
  for (const cat of childCats) {
    const created = await prisma.category.create({
      data: { slug: cat.slug, name: cat.name, parentId: catMap[cat.parent] },
    });
    catMap[cat.slug] = created.id;
  }

  // ─── Companies ───────────────────────────────────
  // All data scraped from agriline.ua/ru/companies/list/ pages 1-10
  console.log('Seeding companies...');

  interface CompanySeed {
    slug: string;
    name: string;
    description?: string;
    country: string;
    city?: string;
    region?: string;
    addressLine?: string;
    timezone?: string;
    utcOffsetMin?: number;
    website?: string;
    contactPerson?: string;
    workingHours?: string;
    languages?: string;
    yearsOnPlatform?: number;
    yearsOnMarket?: number;
    isVerified?: boolean;
    isOfficialDealer?: boolean;
    isManufacturer?: boolean;
    ratingAvg?: number;
    reviewsCount?: number;
    listingsCount: number;
    phones?: { phoneE164: string; label?: string; isPrimary?: boolean }[];
    activityCodes?: string[];
    brandNames?: string[];
  }

  const companySeedData: CompanySeed[] = [
    // ── Page 1 ──────────────────────────────────────
    {
      slug: 'nukte-trailer',
      name: 'Nükte Trailer',
      country: 'TR', city: 'KONYA',
      ratingAvg: 5.0, reviewsCount: 8, listingsCount: 17,
      brandNames: ['Nükte Trailer'],
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'peitzmeyer',
      name: 'PEITZMEYER Fahrzeug- und Gerätevertrieb',
      description: 'Spezialist für den Handel mit gebrauchten Nutzfahrzeugen und Baumaschinen mit über 20 Jahren Erfahrung.',
      country: 'DE', city: 'Delbrück', region: 'Nordrhein-Westfalen',
      addressLine: 'Rietberger Str. 57, D-33129',
      timezone: 'Europe/Berlin', utcOffsetMin: 60,
      website: 'peitzmeyer.com',
      contactPerson: 'Frank Peitzmeyer',
      workingHours: 'Пн - Пт 08:00 - 17:00',
      languages: 'Німецька, Англійська',
      yearsOnPlatform: 4, yearsOnMarket: 26,
      isVerified: true,
      ratingAvg: 4.7, reviewsCount: 45, listingsCount: 113,
      phones: [
        { phoneE164: '+491609036354', label: 'WhatsApp/Viber', isPrimary: true },
        { phoneE164: '+495250933250', label: 'Офіс' },
      ],
      activityCodes: ['COMMERCIAL_VEHICLE_SALES', 'CONSTRUCTION_EQUIPMENT_SALES', 'SPARE_PARTS'],
      brandNames: ['DAF', 'MAN', 'Mercedes-Benz', 'Scania', 'IVECO', 'Kögel'],
    },
    {
      slug: 'utirom-invest',
      name: 'Utirom Invest SRL',
      country: 'RO', city: 'Chitila', region: 'Ilfov',
      addressLine: 'Rudeni nr 79, 077046',
      website: 'utirom.ro',
      contactPerson: 'Alexandru Moise',
      workingHours: 'Пн - Пт 09:00 - 17:30',
      languages: 'Англійська, Румунська',
      yearsOnPlatform: 7, yearsOnMarket: 11,
      isVerified: true,
      ratingAvg: 4.3, reviewsCount: 75, listingsCount: 54,
      phones: [
        { phoneE164: '+40754221285', isPrimary: true },
        { phoneE164: '+40751088004', label: 'WhatsApp' },
        { phoneE164: '+40747047771', label: 'WhatsApp' },
      ],
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES', 'LOADER_SALES'],
      brandNames: ['Caterpillar', 'Hitachi', 'Komatsu', 'Merlo', 'New Holland', 'Skyjack', 'Terex Finlay'],
    },
    {
      slug: 'tad-construction-group',
      name: 'TAD Construction Group',
      country: 'UA', city: 'Березівка',
      listingsCount: 139,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'broad-prospect-hk',
      name: 'Broad Prospect (HK) Trading Co., Limited',
      country: 'CN', city: 'Hong Kong',
      listingsCount: 25,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'shanghai-jiangchun',
      name: 'Shanghai Jiangchun Machinery Co., Ltd.',
      country: 'CN', city: 'Shanghai',
      listingsCount: 89,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES', 'LOADER_SALES'],
    },
    {
      slug: 'sarkad-rotorcom',
      name: 'Sarkad Rotorcom',
      country: 'HU',
      listingsCount: 100,
      activityCodes: ['INDUSTRIAL_EQUIPMENT_SALES'],
    },
    {
      slug: 'rovita-ou',
      name: 'Rovita OÜ',
      country: 'EE', city: 'Tartu',
      ratingAvg: 4.7, reviewsCount: 6, listingsCount: 44,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'xgo-autorulote',
      name: 'XGO AUTORULOTE',
      country: 'RO',
      ratingAvg: 4.4, reviewsCount: 41, listingsCount: 19,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'varexpres',
      name: 'Varexpres s.r.o.',
      country: 'SK', city: 'Šaľa',
      ratingAvg: 4.7, reviewsCount: 64, listingsCount: 4,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'kazinc-epker',
      name: 'Kazinc-Epker Kft.',
      country: 'HU', city: 'Vác',
      listingsCount: 28,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'niveo-automotive',
      name: 'NIVEO AUTOMOTIVE SPARE PARTS',
      country: 'TR',
      listingsCount: 24,
      activityCodes: ['SPARE_PARTS'],
    },
    {
      slug: 'frigokit',
      name: 'Frigokit',
      country: 'TR',
      ratingAvg: 5.0, reviewsCount: 5, listingsCount: 270,
      activityCodes: ['SPARE_PARTS', 'COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'kaps-commerce',
      name: 'KAPS Commerce d.o.o.',
      country: 'SI',
      ratingAvg: 4.9, reviewsCount: 26, listingsCount: 10,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'phu-mardex',
      name: 'P.H.U. Mardex',
      country: 'PL', city: 'Morawica',
      ratingAvg: 4.6, reviewsCount: 72, listingsCount: 21,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'alke-muhendislik',
      name: 'ALKE MUHENDISLIK MAKINE SANAYI TICARET',
      country: 'TR', city: 'SAKARYA',
      ratingAvg: 4.4, reviewsCount: 13, listingsCount: 20,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'erdallar-tarimsal-makina',
      name: 'ERDALLAR TARIMSAL MAKINA',
      description: 'Erdal Ticaret\'in temelleri 80\'li yıllara dayanmaktadır. 2013 yılında "BAŞAK Traktörler" ile ortaklık kurmuştur.',
      country: 'TR', city: 'BALIKESIR',
      addressLine: '1.Organize Sanayi Bölgesi 17. Cd. No: 4/A Altıeylül',
      website: 'www.erdallar.com.tr',
      contactPerson: 'SERKAN FINDIKLI',
      workingHours: 'Пн - Пт 08:00 - 18:00',
      languages: 'Німецька, Румунська, Англійська',
      yearsOnPlatform: 3, yearsOnMarket: 41,
      isVerified: true, isOfficialDealer: true, isManufacturer: true,
      ratingAvg: 5.0, reviewsCount: 21, listingsCount: 50,
      phones: [
        { phoneE164: '+905497405429', isPrimary: true },
        { phoneE164: '+902662464752', label: 'Офіс' },
      ],
      activityCodes: ['FARM_EQUIPMENT_SALES', 'MANUFACTURER'],
      brandNames: ['Unia'],
    },
    {
      slug: 'stk-makina',
      name: 'STK MAKINA',
      country: 'TR', city: 'SAKARYA',
      ratingAvg: 4.9, reviewsCount: 40, listingsCount: 67,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'saurus-yukleme',
      name: 'SAURUS YUKLEME SISTEMLERI',
      country: 'TR', city: 'KAHRAMANKAZAN/ANKARA',
      ratingAvg: 4.9, reviewsCount: 22, listingsCount: 55,
      activityCodes: ['LOADER_SALES'],
    },
    {
      slug: 'karaova-tarim',
      name: 'KARAOVA TARIM MAKINA',
      country: 'TR', city: 'KONYA',
      ratingAvg: 5.0, reviewsCount: 9, listingsCount: 50,
      activityCodes: ['FARM_EQUIPMENT_SALES'],
    },
    {
      slug: 'ninkasi-mobil',
      name: 'NINKASI MOBIL CIHAZLAR',
      country: 'TR', city: 'Manisa',
      ratingAvg: 4.6, reviewsCount: 100, listingsCount: 10,
      activityCodes: ['INDUSTRIAL_EQUIPMENT_SALES'],
    },
    {
      slug: 'cnr-municipal',
      name: 'CNR MUNICIPAL SERVICE VEHICLES',
      country: 'TR', city: 'Selcuklu/Konya',
      isOfficialDealer: true,
      listingsCount: 29,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'polygonmach',
      name: 'POLYGONMACH ASPHALT CONCRETE',
      country: 'TR', city: 'YENIMAHALLE/ANKARA',
      ratingAvg: 4.9, reviewsCount: 31, listingsCount: 50,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES', 'MANUFACTURER'],
    },
    {
      slug: 'pela-sro',
      name: 'PELA s.r.o.',
      country: 'CZ',
      listingsCount: 48,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },

    // ── Page 2 ──────────────────────────────────────
    {
      slug: 'titaniumspareparts',
      name: 'Titaniumspareparts',
      country: 'TR',
      ratingAvg: 5.0, reviewsCount: 6, listingsCount: 83,
      activityCodes: ['SPARE_PARTS'],
    },
    {
      slug: 'auta-z-usa',
      name: 'Auta z USA',
      country: 'SK', city: 'Bobrov',
      ratingAvg: 5.0, reviewsCount: 37, listingsCount: 41,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'mim-mak-makina',
      name: 'Mim-Mak Makina Imalat Montaj San. Tic. Ltd. Sti.',
      country: 'TR', city: 'Osmaniye',
      isOfficialDealer: true,
      ratingAvg: 4.6, reviewsCount: 10, listingsCount: 25,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES', 'MANUFACTURER'],
    },
    {
      slug: 'shiwen-construction',
      name: 'Shiwen Construction Machinery Co., LTD',
      country: 'CN',
      listingsCount: 200,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'himalaya-technology',
      name: 'Himalaya Technology Co.,Ltd',
      country: 'CN',
      listingsCount: 36,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'hunan-best-technology',
      name: 'HUNAN BEST TECHNOLOGY TRADE Co., Ltd',
      country: 'CN', city: 'Hunan',
      listingsCount: 50,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'scandinavian-uk-machines',
      name: 'Scandinavian & UK Machines',
      country: 'SE', city: 'Malmö',
      ratingAvg: 5.0, reviewsCount: 1, listingsCount: 20,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'abc-auctions',
      name: 'ABC Auctions',
      country: 'RO',
      listingsCount: 150,
      activityCodes: ['AUCTION'],
    },
    {
      slug: 'fermat-cz',
      name: 'FERMAT CZ s.r.o.',
      country: 'CZ',
      ratingAvg: 4.5, reviewsCount: 19, listingsCount: 50,
      activityCodes: ['INDUSTRIAL_EQUIPMENT_SALES'],
    },
    {
      slug: 'dingemanse-trucks',
      name: 'Dingemanse Trucks & Trailers',
      country: 'NL', city: 'Hoogerheide',
      ratingAvg: 4.2, reviewsCount: 60, listingsCount: 719,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'mammoet-used',
      name: 'Mammoet Used Equipment',
      country: 'NL', city: 'Utrecht',
      ratingAvg: 4.3, reviewsCount: 7, listingsCount: 42,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'constructionworksplanet',
      name: 'ConstructionWorksPlanet',
      country: 'SK', city: 'Jálšovík',
      listingsCount: 7,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'evrotech-sro',
      name: 'Evrotech s. r. o.',
      country: 'SK', city: 'Bratislava',
      ratingAvg: 5.0, reviewsCount: 4, listingsCount: 47,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'tmh-trucks',
      name: 'TMH Trucks',
      country: 'NL', city: 'Schiedam',
      ratingAvg: 4.8, reviewsCount: 17, listingsCount: 52,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'utilrom-professional',
      name: 'UTILROM PROFESSIONAL SRL',
      country: 'RO',
      ratingAvg: 4.6, reviewsCount: 5, listingsCount: 35,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'basworld',
      name: 'BAS World',
      description: 'BAS World: The platform to buy and sell worldwide. Понад 450 співробітників та більше 60 років досвіду. Обробляє понад 15 000 угод на рік.',
      country: 'NL', city: 'Veghel', region: 'Північний Брабант',
      addressLine: 'Mac Arthurweg, 2, 5466',
      website: 'www.basworld.com',
      workingHours: 'Пн - Пт 08:00 - 17:30',
      languages: 'Англійська, Чеська, Французька, Фінська, Угорська, Словацька, Румунська, Російська, Польська, Німецька, Нідерландська, Італійська, Іспанська',
      yearsOnPlatform: 22, yearsOnMarket: 64,
      isVerified: true,
      ratingAvg: 4.2, reviewsCount: 1501, listingsCount: 1435,
      phones: [
        { phoneE164: '+31413752174', isPrimary: true },
        { phoneE164: '+31413754237', label: 'Продаж техніки' },
      ],
      activityCodes: ['COMMERCIAL_VEHICLE_SALES', 'CONSTRUCTION_EQUIPMENT_SALES', 'LOADER_SALES'],
      brandNames: ['DAF', 'MAN', 'Volvo', 'Mercedes-Benz', 'Ford', 'Renault', 'Terex', 'Volkswagen', 'XCMG', 'Linde', 'Case IH', 'BYD'],
    },
    {
      slug: 'kulk-trucks',
      name: 'Kulk Trucks',
      country: 'NL', city: 'Rijnsburg',
      ratingAvg: 4.9, reviewsCount: 91, listingsCount: 43,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'prefekta',
      name: 'PREFEKTA',
      country: 'DE',
      listingsCount: 17,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'junora',
      name: 'Junora',
      country: 'SE',
      listingsCount: 92,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'gam-sa',
      name: 'GAM SA',
      country: 'ES', city: 'Granda, Siero',
      ratingAvg: 4.4, reviewsCount: 61, listingsCount: 288,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES', 'RENTAL'],
    },
    {
      slug: 'bierbauer-gmbh',
      name: 'Bierbauer GmbH',
      country: 'AT', city: 'Markt Hartmannsdorf',
      ratingAvg: 4.6, reviewsCount: 42, listingsCount: 100,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'tor-industries',
      name: 'Tor-Industries Sp. z o.o.',
      country: 'PL', city: 'Gdańsk',
      ratingAvg: 4.3, reviewsCount: 24, listingsCount: 20,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES', 'MANUFACTURER'],
    },
    {
      slug: 'skylift-depo',
      name: 'SKYLIFT DEPO SRL',
      country: 'RO',
      listingsCount: 37,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'domo21-ingenieria',
      name: 'DOMO21 INGENIERIA Y INSTALACIONES',
      country: 'ES', city: 'Montcada i Reixac',
      ratingAvg: 4.3, reviewsCount: 35, listingsCount: 22,
      activityCodes: ['INDUSTRIAL_EQUIPMENT_SALES'],
    },

    // ── Page 3 ──────────────────────────────────────
    {
      slug: 'ciezarowki-pl',
      name: 'CIEZAROWKI.PL',
      country: 'PL', city: 'Kraków',
      ratingAvg: 3.7, reviewsCount: 3, listingsCount: 262,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'bss-trading',
      name: 'BSS heavy machinery GmbH',
      description: 'Продаж та оренда будівельної техніки в Німеччині з 18-річним досвідом.',
      country: 'DE', city: 'Finowfurt near Berlin', region: 'Brandenburg',
      addressLine: 'Magistrale 9-11, 16244',
      timezone: 'Europe/Berlin', utcOffsetMin: 60,
      website: 'www.bss-used.com',
      contactPerson: 'Dirk Schoenbohm',
      workingHours: 'Пн - Пт 08:00 - 17:00',
      yearsOnPlatform: 18, yearsOnMarket: 19,
      isVerified: true,
      ratingAvg: 4.8, reviewsCount: 25, listingsCount: 84,
      phones: [
        { phoneE164: '+493335451040', label: 'Офіс', isPrimary: true },
        { phoneE164: '+491604708807', label: 'WhatsApp' },
        { phoneE164: '+4933354510411', label: 'Факс' },
      ],
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES', 'RENTAL', 'LOADER_SALES'],
      brandNames: ['Atlas Copco', 'Caterpillar', 'Hitachi', 'Hyundai', 'Kobelco', 'Komatsu', 'MAN', 'Mecalac', 'Merlo', 'Sany', 'Still'],
    },
    {
      slug: 'britannia-export',
      name: 'Britannia Export Consultants Limited',
      country: 'GB',
      ratingAvg: 4.0, reviewsCount: 1, listingsCount: 40,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'truck-impex',
      name: 'Truck Impex srl',
      country: 'IT', city: 'Livorno',
      ratingAvg: 4.9, reviewsCount: 15, listingsCount: 37,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'philipp-verfahrenstechnik',
      name: 'Philipp Verfahrenstechnik',
      country: 'BG', city: 'SLIVEN',
      listingsCount: 7,
      activityCodes: ['INDUSTRIAL_EQUIPMENT_SALES'],
    },
    {
      slug: 'km-wood',
      name: 'KM WOOD s.r.o.',
      country: 'CZ',
      listingsCount: 5,
      activityCodes: ['INDUSTRIAL_EQUIPMENT_SALES'],
    },
    {
      slug: 'trailix',
      name: 'Trailix Srl',
      country: 'IT', city: 'Legnano MI',
      ratingAvg: 4.9, reviewsCount: 14, listingsCount: 30,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'dyferencjal',
      name: 'DYFERENCJAL',
      country: 'PL',
      ratingAvg: 5.0, reviewsCount: 19, listingsCount: 47,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES', 'SPARE_PARTS'],
    },
    {
      slug: 'alcan-makina',
      name: 'Alcan Makina',
      country: 'TR', city: 'Istanbul',
      ratingAvg: 5.0, reviewsCount: 29, listingsCount: 25,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'kurtaran-ambulans',
      name: 'KURTARAN AMBULANS',
      country: 'TR',
      ratingAvg: 5.0, reviewsCount: 10, listingsCount: 7,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES', 'MANUFACTURER'],
    },
    {
      slug: 'suv-makina',
      name: 'SUV MAKINA IS MAKINA',
      country: 'TR', city: 'MERSIN/AKDENIZ',
      listingsCount: 15,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'line-trucks',
      name: 'Line trucks Otomotiv',
      country: 'TR', city: 'Istanbul',
      listingsCount: 10,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'supplyparts',
      name: 'SupplyParts',
      country: 'TR',
      ratingAvg: 5.0, reviewsCount: 3, listingsCount: 100,
      activityCodes: ['SPARE_PARTS'],
    },
    {
      slug: 'sancar-traktor',
      name: 'Sancar traktör ve tarım makineleri',
      country: 'TR', city: 'SAMSUN/BAFRA',
      listingsCount: 20,
      activityCodes: ['FARM_EQUIPMENT_SALES'],
    },
    {
      slug: 'goker-spare',
      name: 'GOKER CONSTRUCTION MACHINERY SPARE PARTS',
      country: 'TR', city: 'Ankara',
      ratingAvg: 4.6, reviewsCount: 19, listingsCount: 57,
      activityCodes: ['SPARE_PARTS', 'CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'maanshan-zhiheng',
      name: "MA'ANSHAN ZHIHENG TRADING CO,LTD",
      country: 'CN', city: "Ma'anshan",
      listingsCount: 17,
      activityCodes: ['SPARE_PARTS'],
    },
    {
      slug: 'aph-group',
      name: 'APH GROUP',
      country: 'NL', city: 'Heerenveen',
      ratingAvg: 5.0, reviewsCount: 12, listingsCount: 4,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'rongquan-machinery',
      name: 'Rongquan machinery company',
      country: 'CN',
      listingsCount: 200,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'pve-cranes',
      name: 'PVE Cranes & Services',
      country: 'NL', city: 'Oosterhout',
      ratingAvg: 4.4, reviewsCount: 27, listingsCount: 20,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'lkw-store',
      name: 'LKW STORE & SERVICES',
      country: 'RO',
      ratingAvg: 4.1, reviewsCount: 127, listingsCount: 32,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES', 'AUTO_SERVICE'],
    },
    {
      slug: 'antwell-group',
      name: 'Antwell Group s.r.o.',
      country: 'CZ',
      ratingAvg: 3.5, reviewsCount: 11, listingsCount: 3,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'mb-crusher',
      name: 'MB Crusher',
      country: 'IT', city: 'Fara Vicentino (VI)',
      ratingAvg: 4.8, reviewsCount: 75, listingsCount: 29,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES', 'MANUFACTURER'],
    },
    {
      slug: 'att-auto-transport',
      name: 'ATT - Auto Transport Technik',
      country: 'CZ',
      ratingAvg: 4.4, reviewsCount: 83, listingsCount: 20,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'aft-otomotiv',
      name: 'AFT OTOMOTIV VE NAKLIYAT SAN. TIC. LTD. STI.',
      country: 'TR', city: 'Etimesgut/Ankara',
      ratingAvg: 4.5, reviewsCount: 155, listingsCount: 18,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },

    // ── Page 4 ──────────────────────────────────────
    {
      slug: 'rafco-endustri',
      name: 'Rafco endüstri ve Ticaret A.S',
      country: 'TR', city: 'Izmir',
      isOfficialDealer: true,
      listingsCount: 20,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES', 'MANUFACTURER'],
    },
    {
      slug: 'impes',
      name: 'IMPES',
      country: 'TR', city: 'Ankara',
      isOfficialDealer: true,
      listingsCount: 20,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'ects-makina',
      name: 'ECTS Makina Kalıp Sanayi',
      country: 'TR', city: 'Burdur',
      ratingAvg: 4.9, reviewsCount: 18, listingsCount: 8,
      activityCodes: ['INDUSTRIAL_EQUIPMENT_SALES'],
    },
    {
      slug: 'danfuld',
      name: 'DANFULD',
      country: 'PL', city: 'Pabianice',
      listingsCount: 918,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES', 'SPARE_PARTS'],
    },
    {
      slug: 'nidah-group',
      name: 'NIDAH GROUP IS MAKINELERI',
      country: 'TR', city: 'Ankara',
      ratingAvg: 5.0, reviewsCount: 8, listingsCount: 75,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'shanghai-cotrun',
      name: 'Shanghai Cotrun Trading Co.,Ltd',
      country: 'CN',
      listingsCount: 50,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'hanselmann-gmbh',
      name: 'Hanselmann GmbH',
      country: 'DE', city: 'Crailsheim',
      ratingAvg: 4.7, reviewsCount: 55, listingsCount: 768,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES', 'FARM_EQUIPMENT_SALES'],
    },
    {
      slug: 'soosan-heavy',
      name: 'SOOSAN HEAVY INDUSTRIES',
      country: 'CN', city: 'Shandong',
      listingsCount: 20,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'mecalux-logistic',
      name: 'Mecalux-Logistic SRL',
      country: 'MD',
      ratingAvg: 5.0, reviewsCount: 3, listingsCount: 14,
      activityCodes: ['LOADER_SALES'],
    },
    {
      slug: 'otm-ozkan',
      name: 'OTM OZKAN TARIM MAKINA',
      country: 'TR', city: 'Kayseri',
      ratingAvg: 4.6, reviewsCount: 18, listingsCount: 36,
      activityCodes: ['FARM_EQUIPMENT_SALES'],
    },
    {
      slug: 'module-t-germany',
      name: 'Module T Germany GmbH',
      country: 'DE', city: 'München',
      ratingAvg: 5.0, reviewsCount: 2, listingsCount: 35,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'kerous',
      name: 'KEROUS, s.r.o.',
      country: 'CZ',
      ratingAvg: 4.6, reviewsCount: 37, listingsCount: 84,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'szafron-crane',
      name: 'SZAFRON Crane Car Truck',
      country: 'PL', city: 'Pszczyna',
      ratingAvg: 4.6, reviewsCount: 254, listingsCount: 41,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES', 'CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'king-vehicle',
      name: 'KING Vehicle Body Builder',
      country: 'PL', city: 'Słupsk',
      ratingAvg: 3.4, reviewsCount: 11, listingsCount: 13,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES', 'MANUFACTURER'],
    },
    {
      slug: 'ritchie-bros',
      name: 'Ritchie Bros B.V.',
      country: 'NL', city: 'Zevenbergen',
      ratingAvg: 4.0, reviewsCount: 165, listingsCount: 399,
      activityCodes: ['AUCTION'],
    },
    {
      slug: 'haowei-engineering',
      name: 'Haowei Engineering Machinery',
      country: 'CN',
      listingsCount: 197,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'lorger-srl',
      name: 'LORGER SRL',
      country: 'RO', city: 'Bihor',
      ratingAvg: 3.7, reviewsCount: 84, listingsCount: 238,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'troostwijk',
      name: 'Troostwijk Veilingen B.V.',
      country: 'NL', city: 'Amsterdam',
      ratingAvg: 3.2, reviewsCount: 729, listingsCount: 60,
      activityCodes: ['AUCTION'],
    },
    {
      slug: 'nordbid-norge',
      name: 'Nordbid Norge AS',
      country: 'NO', city: 'Porsgrunn',
      listingsCount: 344,
      activityCodes: ['AUCTION'],
    },
    {
      slug: 'shanghai-aite',
      name: 'SHANGHAI AITE MACHINE CO.',
      country: 'CN', city: 'Shanghai',
      listingsCount: 500,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'pphu-hucaluk',
      name: 'P.P.H.U. Artur Hucaluk',
      country: 'PL', city: 'Kudowa Zdrój',
      ratingAvg: 4.7, reviewsCount: 51, listingsCount: 87,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'stu-trailers',
      name: 'STU TRAILERS',
      country: 'TR',
      ratingAvg: 5.0, reviewsCount: 4, listingsCount: 20,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES', 'MANUFACTURER'],
    },

    // ── Page 5 ──────────────────────────────────────
    {
      slug: 'achieve-innovations',
      name: 'Achieve Innovations',
      country: 'CN', city: 'Changsha',
      listingsCount: 50,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'ironwell',
      name: 'IRONWELL',
      country: 'TR', city: 'Ankara',
      ratingAvg: 5.0, reviewsCount: 3, listingsCount: 15,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'vsv',
      name: 'VSV',
      country: 'TR', city: 'Ankara',
      ratingAvg: 4.5, reviewsCount: 8, listingsCount: 100,
      activityCodes: ['SPARE_PARTS'],
    },
    {
      slug: 'costh-brake',
      name: 'COSTH BRAKE PARTS',
      country: 'TR', city: 'KONYA',
      ratingAvg: 4.8, reviewsCount: 43, listingsCount: 100,
      activityCodes: ['SPARE_PARTS'],
    },
    {
      slug: 'deczman-autoimport',
      name: 'DECZMAN Autoimport SE',
      country: 'CZ', city: 'Hřebec',
      ratingAvg: 4.9, reviewsCount: 198, listingsCount: 12,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'zeppelin-nl',
      name: 'Zeppelin Construction Equipment Netherlands B.V.',
      country: 'NL', city: 'Vuren',
      ratingAvg: 5.0, reviewsCount: 2, listingsCount: 41,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
      brandNames: ['Caterpillar'],
    },
    {
      slug: 'kraemer-mining',
      name: 'Kraemer Mining GmbH',
      country: 'DE', city: 'Rheda-Wiedenbrück',
      ratingAvg: 4.5, reviewsCount: 99, listingsCount: 3541,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES', 'INDUSTRIAL_EQUIPMENT_SALES'],
    },
    {
      slug: 'fd-crankshaft',
      name: 'FD CRANKSHAFT INDUSTRY',
      country: 'TR', city: 'KONYA',
      ratingAvg: 5.0, reviewsCount: 3, listingsCount: 98,
      activityCodes: ['SPARE_PARTS'],
    },
    {
      slug: 'toyokami',
      name: 'Toyokami Co., Ltd.',
      country: 'JP',
      listingsCount: 100,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'ayb-endustri',
      name: 'AYB Endüstri',
      country: 'TR', city: 'Mersin',
      ratingAvg: 4.3, reviewsCount: 11, listingsCount: 51,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'agro-tiger-elibol',
      name: 'AGRO TIGER / ELIBOL',
      country: 'TR', city: 'KONYA',
      ratingAvg: 4.4, reviewsCount: 39, listingsCount: 20,
      activityCodes: ['FARM_EQUIPMENT_SALES'],
    },
    {
      slug: 'sigma-asphalt',
      name: 'SIGMA ASPHALT PLANT',
      country: 'TR', city: 'Ankara',
      ratingAvg: 4.9, reviewsCount: 8, listingsCount: 30,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES', 'MANUFACTURER'],
    },
    {
      slug: 'skymix-beton',
      name: 'SKYMIX BETON SANTRALLERI',
      country: 'TR', city: 'Ankara',
      ratingAvg: 5.0, reviewsCount: 7, listingsCount: 71,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES', 'MANUFACTURER'],
    },
    {
      slug: 'elkon-concrete',
      name: 'ELKON Concrete Batching Plants',
      country: 'TR', city: 'Istanbul',
      ratingAvg: 3.8, reviewsCount: 13, listingsCount: 25,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES', 'MANUFACTURER'],
    },
    {
      slug: 'man-truck-bus-de',
      name: 'MAN Truck & Bus Deutschland GmbH',
      country: 'DE', city: 'Munich',
      ratingAvg: 3.5, reviewsCount: 298, listingsCount: 3,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
      brandNames: ['MAN'],
    },
    {
      slug: 'euro-nor',
      name: 'Euro Nor A/S',
      country: 'DK', city: 'Padborg',
      ratingAvg: 4.6, reviewsCount: 33, listingsCount: 84,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'b-euro-car',
      name: 'B Euro Car Kft.',
      country: 'HU', city: 'Százhalombatta',
      ratingAvg: 4.4, reviewsCount: 26, listingsCount: 53,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },

    // ── Page 6 ──────────────────────────────────────
    {
      slug: 'gorila-machinery',
      name: 'GORILA MACHINERY s.r.o.',
      country: 'CZ',
      ratingAvg: 4.7, reviewsCount: 41, listingsCount: 20,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'fleequid-it',
      name: 'Fleequid',
      country: 'IT', city: 'Olgiate Comasco (CO)',
      listingsCount: 17,
      activityCodes: ['AUCTION'],
    },
    {
      slug: 'sinan-tanker',
      name: 'SINAN TANKER TREYLER',
      country: 'TR', city: 'KONYA',
      ratingAvg: 5.0, reviewsCount: 4, listingsCount: 38,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES', 'MANUFACTURER'],
    },
    {
      slug: 'lukton-prest',
      name: 'LUKTON PREST S.R.L.',
      country: 'RO', city: 'Ovidiu',
      ratingAvg: 5.0, reviewsCount: 8, listingsCount: 19,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'fogel-trans',
      name: 'Fogel Trans',
      country: 'PL', city: 'Warszawa',
      listingsCount: 32,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'hans-warner',
      name: 'Hans Warner GmbH',
      country: 'DE', city: 'Langenfeld (Rheinland)',
      ratingAvg: 4.9, reviewsCount: 14, listingsCount: 96,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'indie-campers',
      name: 'Indie Campers',
      country: 'PT', city: 'Santo Tirso',
      ratingAvg: 4.3, reviewsCount: 767, listingsCount: 75,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES', 'RENTAL'],
    },
    {
      slug: 'the-truck-company',
      name: 'The Truck Company',
      country: 'BE', city: 'Hooglede',
      ratingAvg: 4.3, reviewsCount: 158, listingsCount: 391,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'conmach',
      name: 'CONMACH',
      country: 'TR', city: 'Tekirdag',
      ratingAvg: 5.0, reviewsCount: 5, listingsCount: 41,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES', 'MANUFACTURER'],
    },
    {
      slug: 'ats-sweden',
      name: 'ATS Sweden AB',
      country: 'SE', city: 'Stugun',
      ratingAvg: 5.0, reviewsCount: 1, listingsCount: 342,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'equippo',
      name: 'EQUIPPO AG',
      country: 'CH', city: 'Zug',
      ratingAvg: 4.4, reviewsCount: 5, listingsCount: 138,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES', 'AUCTION'],
    },
    {
      slug: 'interhandler',
      name: 'Interhandler Sp. z o.o.',
      country: 'PL', city: 'Toruń',
      isOfficialDealer: true,
      ratingAvg: 4.4, reviewsCount: 123, listingsCount: 15,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
      brandNames: ['JCB'],
    },
    {
      slug: 'werwie-gmbh',
      name: 'werwie GmbH',
      country: 'DE', city: 'Konz',
      ratingAvg: 4.6, reviewsCount: 23, listingsCount: 144,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'e-agricultura',
      name: 'E-AGRICULTURA SRL',
      country: 'RO', city: 'Jud. Constanța',
      ratingAvg: 4.2, reviewsCount: 21, listingsCount: 42,
      activityCodes: ['FARM_EQUIPMENT_SALES'],
    },

    // ── Page 7 ──────────────────────────────────────
    {
      slug: 'bml-teknik',
      name: 'BML TEKNIK MAKINE ANONIM SIRKET',
      country: 'TR', city: 'Istanbul',
      ratingAvg: 5.0, reviewsCount: 5, listingsCount: 13,
      activityCodes: ['INDUSTRIAL_EQUIPMENT_SALES'],
    },
    {
      slug: 'gjgu-international',
      name: 'GJGU International s.r.o.',
      country: 'CZ',
      listingsCount: 38,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'duzce-saglam',
      name: 'Düzce Sağlam Depo',
      country: 'TR', city: 'Merkez/Duzce',
      ratingAvg: 4.8, reviewsCount: 22, listingsCount: 50,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'hardlife-europe',
      name: 'Hardlife Europe Kft.',
      country: 'HU',
      ratingAvg: 5.0, reviewsCount: 15, listingsCount: 20,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'gurlesenyil',
      name: 'Gürleşenyıl Trailers',
      country: 'TR', city: 'Sincan/Ankara',
      ratingAvg: 4.7, reviewsCount: 21, listingsCount: 28,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES', 'MANUFACTURER'],
    },
    {
      slug: 'kleyn-vans',
      name: 'Kleyn Vans B.V.',
      country: 'NL', city: 'Vuren',
      ratingAvg: 4.0, reviewsCount: 310, listingsCount: 474,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'makinsan-treyler',
      name: 'MAKINSAN TREYLER SANAYI VE TICARET ANONIM SIRKETI',
      country: 'TR', city: 'Adana',
      isOfficialDealer: true,
      ratingAvg: 5.0, reviewsCount: 5, listingsCount: 25,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES', 'MANUFACTURER'],
    },
    {
      slug: 'golden-target',
      name: 'Golden Target Heavy Equipment LLC',
      country: 'AE', city: 'Dubai',
      ratingAvg: 4.3, reviewsCount: 30, listingsCount: 204,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'hidrosil',
      name: 'HIDROSIL',
      country: 'TR', city: 'Ankara',
      ratingAvg: 4.5, reviewsCount: 26, listingsCount: 33,
      activityCodes: ['SPARE_PARTS'],
    },
    {
      slug: 'bellator-maszyny',
      name: 'Bellator Maszyny Budowlane Sp. z o.o.',
      country: 'PL', city: 'Ruda Śląska',
      ratingAvg: 4.5, reviewsCount: 77, listingsCount: 48,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'van-den-hurk',
      name: 'Van den Hurk Bedrijfswagens BV',
      country: 'NL', city: 'Helmond',
      ratingAvg: 4.3, reviewsCount: 370, listingsCount: 226,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'auto-petr-simanek',
      name: 'A U T O Petr Šimánek',
      country: 'CZ', city: 'Štěpánovice',
      ratingAvg: 4.4, reviewsCount: 67, listingsCount: 69,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'maxagro',
      name: 'Maxagro',
      country: 'RO', city: 'Gătaia',
      ratingAvg: 4.3, reviewsCount: 96, listingsCount: 120,
      activityCodes: ['FARM_EQUIPMENT_SALES', 'CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'classtrucks-lithuania',
      name: 'ClassTrucks Lithuania',
      country: 'LT',
      ratingAvg: 4.7, reviewsCount: 11, listingsCount: 32,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'trucks-roosendaal',
      name: 'Trucks Roosendaal B.V.',
      country: 'NL', city: 'Roosendaal',
      ratingAvg: 4.4, reviewsCount: 71, listingsCount: 346,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },

    // ── Page 8 ──────────────────────────────────────
    {
      slug: 'walker-movements',
      name: 'Walker Movements Limited',
      country: 'GB', city: 'Sawley',
      ratingAvg: 4.4, reviewsCount: 125, listingsCount: 446,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'prox-bud',
      name: 'PROX-BUD',
      country: 'PL', city: 'Police',
      ratingAvg: 4.8, reviewsCount: 9, listingsCount: 50,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'detasis-tarti',
      name: 'Detasis Endüstriyel Tartı Sistemleri',
      country: 'TR', city: 'Samsun/Atakum',
      ratingAvg: 5.0, reviewsCount: 12, listingsCount: 18,
      activityCodes: ['INDUSTRIAL_EQUIPMENT_SALES'],
    },
    {
      slug: 'tauros-sro',
      name: 'TAUROS s.r.o.',
      country: 'CZ', city: 'Uherský Brod',
      ratingAvg: 5.0, reviewsCount: 7, listingsCount: 15,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'galen-grup',
      name: 'Galen Grup Çelik Üretim',
      country: 'TR',
      ratingAvg: 4.8, reviewsCount: 28, listingsCount: 217,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES', 'MANUFACTURER'],
    },
    {
      slug: 'e-mak',
      name: 'E-MAK',
      country: 'TR', city: 'Osmangazi/Bursa',
      ratingAvg: 4.5, reviewsCount: 27, listingsCount: 30,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES', 'MANUFACTURER'],
    },
    {
      slug: 'reis-treyler',
      name: 'REIS TREYLER',
      country: 'TR', city: 'Karatay/Konya',
      isOfficialDealer: true,
      ratingAvg: 5.0, reviewsCount: 7, listingsCount: 20,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES', 'MANUFACTURER'],
    },
    {
      slug: 'porters-sk',
      name: 'PORTERS',
      country: 'SK', city: 'Žilina',
      ratingAvg: 4.8, reviewsCount: 133, listingsCount: 78,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'doprava-pk',
      name: 'DOPRAVA PK s.r.o.',
      country: 'SK', city: 'Pezinok',
      ratingAvg: 5.0, reviewsCount: 4, listingsCount: 16,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'szalai-dozer',
      name: 'Szalai DOZER Kft.',
      country: 'HU', city: 'Béled',
      listingsCount: 40,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },

    // ── Page 9 ──────────────────────────────────────
    {
      slug: 'air-truck',
      name: 'Air Truck s.r.o.',
      country: 'CZ',
      ratingAvg: 4.0, reviewsCount: 11, listingsCount: 42,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'constmach',
      name: 'CONSTMACH CONSTRUCTION MACHINERY',
      country: 'TR', city: 'Izmir',
      listingsCount: 154,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES', 'MANUFACTURER'],
    },
    {
      slug: 'ugurmak',
      name: 'UGURMAK',
      country: 'TR', city: 'Sincan/Ankara',
      isOfficialDealer: true,
      ratingAvg: 4.7, reviewsCount: 23, listingsCount: 25,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'ades-diesel',
      name: 'ADES DIESEL OTOMOTIV',
      country: 'TR', city: 'Istanbul',
      ratingAvg: 5.0, reviewsCount: 20, listingsCount: 166,
      activityCodes: ['SPARE_PARTS'],
    },
    {
      slug: 'fabo-germany',
      name: 'FABO GERMANY GmbH',
      country: 'DE', city: 'Geilenkirchen',
      ratingAvg: 4.5, reviewsCount: 48, listingsCount: 16,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES', 'MANUFACTURER'],
    },
    {
      slug: 'kleyn-trucks',
      name: 'Kleyn Trucks',
      country: 'NL', city: 'Vuren',
      ratingAvg: 4.5, reviewsCount: 738, listingsCount: 743,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'mastrailer-tanker',
      name: 'MASTRAILER TANKER',
      country: 'TR', city: 'Karatay/Konya',
      isOfficialDealer: true,
      ratingAvg: 5.0, reviewsCount: 95, listingsCount: 20,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES', 'MANUFACTURER'],
    },
    {
      slug: 'klaravik-sweden',
      name: 'Klaravik Sweden',
      country: 'SE', city: 'Karlstad',
      ratingAvg: 1.8, reviewsCount: 5, listingsCount: 2002,
      activityCodes: ['AUCTION'],
    },
    {
      slug: 'losl-sro',
      name: 'LOSL s.r.o.',
      country: 'CZ', city: 'Nové Strašecí',
      ratingAvg: 4.0, reviewsCount: 85, listingsCount: 200,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'ats-norway',
      name: 'ATS Norway AS',
      country: 'NO', city: 'Heimdal',
      ratingAvg: 4.1, reviewsCount: 13, listingsCount: 800,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'esa-trucks',
      name: 'ESA Trucks A/S',
      country: 'DK', city: 'Padborg',
      ratingAvg: 4.6, reviewsCount: 180, listingsCount: 3,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
    },
    {
      slug: 'schmitz-cargobull-ua',
      name: 'Schmitz Cargobull Ukraine',
      country: 'UA', city: 'Київ',
      ratingAvg: 4.2, reviewsCount: 200, listingsCount: 1,
      activityCodes: ['COMMERCIAL_VEHICLE_SALES'],
      brandNames: ['Schmitz Cargobull'],
    },

    // ── Page 10 (Ukrainian companies) ───────────────
    {
      slug: 'gekkon-ukraine',
      name: 'GEKKON UKRAINE',
      country: 'UA', city: 'Березівка',
      listingsCount: 44,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'trak-servis-lviv',
      name: 'ОФІЦІЙНИЙ СЕРВІСНИЙ ЦЕНТР МАН ТОВ "ТРАК СЕРВІС ЛЬВІВ"',
      country: 'UA', city: 'с. Воля Баратівська',
      ratingAvg: 4.5, reviewsCount: 136, listingsCount: 13,
      activityCodes: ['AUTO_SERVICE', 'SPARE_PARTS'],
      brandNames: ['MAN'],
    },
    {
      slug: 'logintekh',
      name: 'ООО "ЛОГИНТЕХ"',
      country: 'UA', city: 'Київ',
      ratingAvg: 5.0, reviewsCount: 9, listingsCount: 9,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'ukr-agro-service',
      name: 'Укр.Агро-сервіс',
      country: 'UA', city: 'Харків',
      ratingAvg: 4.7, reviewsCount: 29, listingsCount: 5,
      activityCodes: ['FARM_EQUIPMENT_SALES', 'AUTO_SERVICE'],
    },
    {
      slug: 'avtoservis-vis',
      name: 'Автосервіс В.І.С.',
      country: 'UA', city: 'Кривий Ріг',
      ratingAvg: 4.5, reviewsCount: 97, listingsCount: 1,
      activityCodes: ['AUTO_SERVICE'],
    },
    {
      slug: 'avtorozbirka-truck-pride',
      name: 'Авторозбірка Truck-Pride',
      country: 'UA', city: 'Олександрія',
      ratingAvg: 4.5, reviewsCount: 127, listingsCount: 1,
      activityCodes: ['SPARE_PARTS'],
    },
    {
      slug: 'klaas-ukraina',
      name: 'ТОВ "КЛААС Україна"',
      country: 'UA', city: 'Фастівський район',
      ratingAvg: 5.0, reviewsCount: 7, listingsCount: 9,
      activityCodes: ['FARM_EQUIPMENT_SALES'],
      brandNames: ['Claas'],
    },
    {
      slug: 'longran',
      name: 'LONGRAN',
      country: 'UA', city: 'Гостомель',
      ratingAvg: 4.7, reviewsCount: 142, listingsCount: 1,
      activityCodes: ['INDUSTRIAL_EQUIPMENT_SALES'],
    },
    {
      slug: 'veles-agro',
      name: 'ТОВ "Велес Агро ЛТД"',
      country: 'UA', city: 'Одеса',
      listingsCount: 65,
      activityCodes: ['FARM_EQUIPMENT_SALES'],
    },
    {
      slug: 'druzhba-agro',
      name: 'Дружба Агро Сервіс',
      country: 'UA', city: 'Тернопіль',
      listingsCount: 13,
      activityCodes: ['FARM_EQUIPMENT_SALES', 'AUTO_SERVICE'],
    },
    {
      slug: 'iksfield',
      name: 'ООО "Іксфілд"',
      country: 'UA', city: 'Київ',
      listingsCount: 16,
      activityCodes: ['CONSTRUCTION_EQUIPMENT_SALES'],
    },
    {
      slug: 'agrovizhn',
      name: 'ТОВ "Агровіжн"',
      country: 'UA', city: 'Дніпро',
      listingsCount: 11,
      activityCodes: ['FARM_EQUIPMENT_SALES'],
    },
    {
      slug: 'kremremtrans',
      name: 'ТОВ Кремремтранс',
      country: 'UA', city: 'Кременчук',
      ratingAvg: 4.2, reviewsCount: 18, listingsCount: 1,
      activityCodes: ['AUTO_SERVICE'],
    },
  ];

  // Create all companies
  const companyIds: Record<string, string> = {};
  for (const cs of companySeedData) {
    const countryRef = countries[cs.country];
    const cityRef = cs.city ? cities[`${cs.country}:${cs.city}`] : null;

    const company = await prisma.company.create({
      data: {
        slug: cs.slug,
        name: cs.name,
        description: cs.description ?? null,
        countryId: countryRef?.id ?? null,
        cityId: cityRef?.id ?? null,
        region: cs.region ?? null,
        addressLine: cs.addressLine ?? null,
        timezone: cs.timezone ?? null,
        utcOffsetMin: cs.utcOffsetMin ?? null,
        website: cs.website ?? null,
        contactPerson: cs.contactPerson ?? null,
        workingHours: cs.workingHours ?? null,
        languages: cs.languages ?? null,
        yearsOnPlatform: cs.yearsOnPlatform ?? null,
        yearsOnMarket: cs.yearsOnMarket ?? null,
        isVerified: cs.isVerified ?? false,
        isOfficialDealer: cs.isOfficialDealer ?? false,
        isManufacturer: cs.isManufacturer ?? false,
        ratingAvg: cs.ratingAvg ?? 0,
        reviewsCount: cs.reviewsCount ?? 0,
        listingsCount: cs.listingsCount,
      },
    });
    companyIds[cs.slug] = company.id;

    // Create phones
    if (cs.phones?.length) {
      await prisma.companyPhone.createMany({
        data: cs.phones.map((p) => ({
          companyId: company.id,
          phoneE164: p.phoneE164,
          label: p.label ?? null,
          isPrimary: p.isPrimary ?? false,
        })),
      });
    }

    // Link activity types
    if (cs.activityCodes?.length) {
      const validActs = cs.activityCodes.filter((code) => actTypes[code]);
      if (validActs.length) {
        await prisma.companyActivityType.createMany({
          data: validActs.map((code) => ({
            companyId: company.id,
            activityTypeId: actTypes[code],
          })),
        });
      }
    }

    // Link brands
    if (cs.brandNames?.length) {
      const validBrands = cs.brandNames.filter((name) => brands[name]);
      if (validBrands.length) {
        await prisma.companyBrand.createMany({
          data: validBrands.map((name) => ({
            companyId: company.id,
            brandId: brands[name],
          })),
        });
      }
    }

    // Add placeholder logo
    await prisma.companyMedia.create({
      data: {
        companyId: company.id,
        kind: 'LOGO',
        url: `https://placehold.co/200x200?text=${encodeURIComponent(cs.name.substring(0, 10))}`,
        sortOrder: 0,
      },
    });
  }

  // ─── Sample Listings ─────────────────────────────
  // From scraped company detail pages
  console.log('Seeding listings...');

  interface ListingSeed {
    companySlug: string;
    title: string;
    categorySlug?: string;
    brandName?: string;
    condition?: 'NEW' | 'USED';
    year?: number;
    priceAmount?: number;
    priceCurrency?: string;
    priceType?: 'FIXED' | 'NEGOTIABLE' | 'ON_REQUEST';
    attributes?: { key: string; value: string }[];
  }

  const listingSeedData: ListingSeed[] = [
    // BSS heavy machinery GmbH listings
    { companySlug: 'bss-trading', title: 'Mecalac AX 850', categorySlug: 'wheel-loaders', brandName: 'Mecalac', condition: 'NEW', priceAmount: 49000, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'bss-trading', title: 'Sany SY18C', categorySlug: 'mini-excavators', brandName: 'Sany', priceAmount: 14800, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'bss-trading', title: 'Sany SY35U', categorySlug: 'mini-excavators', brandName: 'Sany', condition: 'USED', year: 2023, priceAmount: 31000, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'bss-trading', title: 'Kobelco E305', categorySlug: 'tracked-excavators', brandName: 'Kobelco', condition: 'USED', priceAmount: 24000, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'bss-trading', title: 'Sany SY 26', categorySlug: 'mini-excavators', brandName: 'Sany', priceAmount: 23000, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'bss-trading', title: 'Merlo 40.13', categorySlug: 'telehandlers', brandName: 'Merlo', condition: 'USED', year: 2022, priceType: 'ON_REQUEST' },
    { companySlug: 'bss-trading', title: 'Sany SY50U', categorySlug: 'mini-excavators', brandName: 'Sany', priceAmount: 34900, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'bss-trading', title: 'Mecalac AF1200', categorySlug: 'wheel-loaders', brandName: 'Mecalac', priceAmount: 60000, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'bss-trading', title: 'Hitachi ZX225', categorySlug: 'tracked-excavators', brandName: 'Hitachi', condition: 'USED', year: 2007, priceAmount: 28000, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'bss-trading', title: 'Mecalac AS750', categorySlug: 'skid-steer-loaders', brandName: 'Mecalac', condition: 'USED', year: 2023, priceAmount: 63000, priceCurrency: 'EUR', priceType: 'FIXED' },

    // PEITZMEYER listings
    { companySlug: 'peitzmeyer', title: 'DAF XF 480 FT', categorySlug: 'truck-tractors', brandName: 'DAF', condition: 'USED', year: 2019, priceAmount: 42800, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'peitzmeyer', title: 'MAN TGX 18.510 4x2', categorySlug: 'truck-tractors', brandName: 'MAN', condition: 'USED', year: 2020, priceAmount: 52000, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'peitzmeyer', title: 'Mercedes-Benz Actros 2545', categorySlug: 'trucks', brandName: 'Mercedes-Benz', condition: 'USED', year: 2018, priceAmount: 38500, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'peitzmeyer', title: 'Scania R450', categorySlug: 'truck-tractors', brandName: 'Scania', condition: 'USED', year: 2017, priceAmount: 35000, priceCurrency: 'EUR', priceType: 'NEGOTIABLE' },

    // Utirom Invest SRL listings
    { companySlug: 'utirom-invest', title: 'Hitachi ZX38U-6', categorySlug: 'mini-excavators', brandName: 'Hitachi', condition: 'USED', year: 2021, priceAmount: 36900, priceCurrency: 'EUR', priceType: 'FIXED', attributes: [{ key: 'hours', value: '1376' }] },
    { companySlug: 'utirom-invest', title: 'Terex THW 224', categorySlug: 'excavators', brandName: 'Terex', condition: 'NEW', year: 2024, priceType: 'ON_REQUEST', attributes: [{ key: 'hours', value: '2' }] },
    { companySlug: 'utirom-invest', title: 'Hitachi ZX55U-6', categorySlug: 'mini-excavators', brandName: 'Hitachi', condition: 'USED', year: 2023, priceAmount: 46900, priceCurrency: 'EUR', priceType: 'FIXED', attributes: [{ key: 'hours', value: '879' }] },
    { companySlug: 'utirom-invest', title: 'Hitachi ZW220-5B', categorySlug: 'wheel-loaders', brandName: 'Hitachi', condition: 'USED', year: 2015, priceAmount: 74900, priceCurrency: 'EUR', priceType: 'FIXED', attributes: [{ key: 'hours', value: '8453' }] },
    { companySlug: 'utirom-invest', title: 'Merlo TF35.7-140', categorySlug: 'telehandlers', brandName: 'Merlo', condition: 'NEW', year: 2026, priceType: 'ON_REQUEST' },
    { companySlug: 'utirom-invest', title: 'Merlo P60.10', categorySlug: 'telehandlers', brandName: 'Merlo', condition: 'USED', year: 2018, priceAmount: 51900, priceCurrency: 'EUR', priceType: 'FIXED', attributes: [{ key: 'hours', value: '2504' }] },
    { companySlug: 'utirom-invest', title: 'Komatsu WA320-6', categorySlug: 'wheel-loaders', brandName: 'Komatsu', condition: 'USED', year: 2011, priceAmount: 48900, priceCurrency: 'EUR', priceType: 'FIXED', attributes: [{ key: 'hours', value: '7523' }] },
    { companySlug: 'utirom-invest', title: 'Skyjack SJ3219', categorySlug: 'scissor-lifts', brandName: 'Skyjack', condition: 'USED', year: 2017, priceAmount: 3900, priceCurrency: 'EUR', priceType: 'FIXED', attributes: [{ key: 'hours', value: '202' }] },

    // BAS World listings
    { companySlug: 'basworld', title: 'MAN TGS 18.470 4X2 TM ADR Retarder', categorySlug: 'truck-tractors', brandName: 'MAN', condition: 'USED', year: 2020, priceAmount: 29900, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'basworld', title: 'Volvo FH16 750 4X2', categorySlug: 'truck-tractors', brandName: 'Volvo', condition: 'USED', year: 2023, priceAmount: 115900, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'basworld', title: 'Krone SD NEW Laadklep Lift', categorySlug: 'curtain-semi-trailers', condition: 'NEW', year: 2026, priceAmount: 54900, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'basworld', title: 'Volvo FH 540 6X2 Chassis', categorySlug: 'trucks', brandName: 'Volvo', condition: 'USED', year: 2017, priceAmount: 28400, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'basworld', title: 'DAF CF 450 6X2 Curtainsider', categorySlug: 'trucks', brandName: 'DAF', condition: 'USED', year: 2019, priceAmount: 35500, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'basworld', title: 'Mercedes-Benz Actros 1845 LS 4X2', categorySlug: 'truck-tractors', brandName: 'Mercedes-Benz', condition: 'USED', year: 2018, priceAmount: 32000, priceCurrency: 'EUR', priceType: 'FIXED' },

    // ERDALLAR listings
    { companySlug: 'erdallar-tarimsal-makina', title: 'Горизонтальний міксер 4-21 (одношнековий)', categorySlug: 'feed-mixers', condition: 'NEW', priceType: 'ON_REQUEST', attributes: [{ key: 'horsepower', value: '35' }, { key: 'volume', value: '4 м³' }] },
    { companySlug: 'erdallar-tarimsal-makina', title: 'Горизонтальний міксер 3-22 (двошнековий)', categorySlug: 'feed-mixers', condition: 'NEW', priceType: 'ON_REQUEST', attributes: [{ key: 'horsepower', value: '25' }, { key: 'volume', value: '3 м³' }] },
    { companySlug: 'erdallar-tarimsal-makina', title: 'Тракторний причіп для тюків 8,60B-210', categorySlug: 'tractor-trailers', condition: 'NEW', priceType: 'ON_REQUEST', attributes: [{ key: 'load_capacity', value: '8000 кг' }] },
    { companySlug: 'erdallar-tarimsal-makina', title: 'Тракторний причіп DNR-12-23', categorySlug: 'tractor-trailers', condition: 'NEW', priceType: 'ON_REQUEST', attributes: [{ key: 'load_capacity', value: '12100 кг' }, { key: 'volume', value: '14.49 м³' }] },
    { companySlug: 'erdallar-tarimsal-makina', title: 'Ротаційна косарка MKP-195', categorySlug: 'mowers', condition: 'NEW', priceType: 'ON_REQUEST', attributes: [{ key: 'working_width', value: '1.95 м' }, { key: 'horsepower', value: '30' }] },
    { companySlug: 'erdallar-tarimsal-makina', title: 'Вертикальний міксер 20-12 (двошнековий)', categorySlug: 'feed-mixers', condition: 'NEW', priceType: 'ON_REQUEST', attributes: [{ key: 'horsepower', value: '95' }, { key: 'volume', value: '20 м³' }] },
    { companySlug: 'erdallar-tarimsal-makina', title: 'Прес-підбирач квадратних тюків DF 1.8V', categorySlug: 'balers', condition: 'NEW', priceType: 'ON_REQUEST', attributes: [{ key: 'working_width', value: '2.1 м' }, { key: 'horsepower', value: '70' }] },

    // Additional listings for other notable companies
    { companySlug: 'kraemer-mining', title: 'Caterpillar D6T LGP', categorySlug: 'construction-equipment', brandName: 'Caterpillar', condition: 'USED', year: 2016, priceAmount: 89000, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'kraemer-mining', title: 'Komatsu PC210-10', categorySlug: 'tracked-excavators', brandName: 'Komatsu', condition: 'USED', year: 2018, priceAmount: 75000, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'kraemer-mining', title: 'Volvo A30G', categorySlug: 'dump-trucks', brandName: 'Volvo', condition: 'USED', year: 2017, priceAmount: 125000, priceCurrency: 'EUR', priceType: 'NEGOTIABLE' },

    { companySlug: 'dingemanse-trucks', title: 'DAF XF 530 FTG', categorySlug: 'truck-tractors', brandName: 'DAF', condition: 'USED', year: 2021, priceAmount: 55000, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'dingemanse-trucks', title: 'Scania G410 6x2', categorySlug: 'trucks', brandName: 'Scania', condition: 'USED', year: 2018, priceAmount: 38000, priceCurrency: 'EUR', priceType: 'FIXED' },

    { companySlug: 'kleyn-trucks', title: 'MAN TGX 26.510 6X2', categorySlug: 'trucks', brandName: 'MAN', condition: 'USED', year: 2020, priceAmount: 45000, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'kleyn-trucks', title: 'DAF CF 480 FT 4X2', categorySlug: 'truck-tractors', brandName: 'DAF', condition: 'USED', year: 2019, priceAmount: 37500, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'kleyn-trucks', title: 'Renault T480 4X2', categorySlug: 'truck-tractors', brandName: 'Renault', condition: 'USED', year: 2018, priceAmount: 28000, priceCurrency: 'EUR', priceType: 'FIXED' },

    { companySlug: 'ritchie-bros', title: 'Caterpillar 320 GC', categorySlug: 'tracked-excavators', brandName: 'Caterpillar', condition: 'USED', year: 2020, priceAmount: 95000, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'ritchie-bros', title: 'Liebherr LTM 1100-5.2', categorySlug: 'construction-equipment', brandName: 'Liebherr', condition: 'USED', year: 2015, priceAmount: 450000, priceCurrency: 'EUR', priceType: 'FIXED' },

    { companySlug: 'hanselmann-gmbh', title: 'John Deere 6155R', categorySlug: 'tractors', brandName: 'John Deere', condition: 'USED', year: 2019, priceAmount: 95000, priceCurrency: 'EUR', priceType: 'NEGOTIABLE', attributes: [{ key: 'horsepower', value: '155' }] },
    { companySlug: 'hanselmann-gmbh', title: 'Fendt 724 Vario', categorySlug: 'tractors', brandName: 'Fendt', condition: 'USED', year: 2020, priceAmount: 135000, priceCurrency: 'EUR', priceType: 'FIXED', attributes: [{ key: 'horsepower', value: '240' }] },
    { companySlug: 'hanselmann-gmbh', title: 'Claas Arion 660', categorySlug: 'tractors', brandName: 'Claas', condition: 'USED', year: 2021, priceAmount: 110000, priceCurrency: 'EUR', priceType: 'FIXED', attributes: [{ key: 'horsepower', value: '185' }] },

    { companySlug: 'walker-movements', title: 'Volvo FH 460 Globetrotter', categorySlug: 'truck-tractors', brandName: 'Volvo', condition: 'USED', year: 2018, priceAmount: 42000, priceCurrency: 'EUR', priceType: 'FIXED' },
    { companySlug: 'walker-movements', title: 'DAF XF 480 Super Space', categorySlug: 'truck-tractors', brandName: 'DAF', condition: 'USED', year: 2020, priceAmount: 55000, priceCurrency: 'EUR', priceType: 'FIXED' },
  ];

  for (const ls of listingSeedData) {
    const compId = companyIds[ls.companySlug];
    if (!compId) continue;

    // Find the company to get country/city
    const compData = companySeedData.find((c) => c.slug === ls.companySlug);
    const countryRef = compData ? countries[compData.country] : null;
    const cityRef = compData?.city ? cities[`${compData.country}:${compData.city}`] : null;

    await prisma.listing.create({
      data: {
        companyId: compId,
        title: ls.title,
        categoryId: ls.categorySlug ? catMap[ls.categorySlug] ?? null : null,
        brandId: ls.brandName ? brands[ls.brandName] ?? null : null,
        condition: ls.condition ?? null,
        year: ls.year ?? null,
        priceAmount: ls.priceAmount ?? null,
        priceCurrency: ls.priceCurrency ?? null,
        priceType: ls.priceType ?? null,
        countryId: countryRef?.id ?? null,
        cityId: cityRef?.id ?? null,
        publishedAt: new Date(),
        attributes: ls.attributes?.length
          ? { createMany: { data: ls.attributes } }
          : undefined,
      },
    });
  }

  // ─── Sample Reviews ──────────────────────────────
  console.log('Seeding reviews...');
  const reviewData = [
    { companySlug: 'bss-trading', authorName: 'Thomas K.', rating: 5, title: 'Sehr gute Qualität', body: 'Professionelle Beratung, schnelle Lieferung. Sehr empfehlenswert!' },
    { companySlug: 'bss-trading', authorName: 'Marek P.', rating: 5, title: 'Great service', body: 'Very professional team. The machine was exactly as described.' },
    { companySlug: 'bss-trading', authorName: 'Giovanni R.', rating: 4, body: 'Good selection of equipment. Prices are fair.' },
    { companySlug: 'peitzmeyer', authorName: 'Jan W.', rating: 5, title: 'Zuverlässig', body: 'Schnelle und unkomplizierte Abwicklung.' },
    { companySlug: 'peitzmeyer', authorName: 'Piotr Z.', rating: 5, body: 'Very good trucks, honest dealer.' },
    { companySlug: 'peitzmeyer', authorName: 'Ion M.', rating: 4, body: 'Fast communication, good prices.' },
    { companySlug: 'basworld', authorName: 'Ahmed S.', rating: 5, title: 'Excellent platform', body: 'Wide selection, professional service.' },
    { companySlug: 'basworld', authorName: 'Lukas B.', rating: 4, body: 'Large inventory but delivery can be slow.' },
    { companySlug: 'basworld', authorName: 'Ricardo F.', rating: 4, title: 'Good variety', body: 'Many options available. Documentation handled well.' },
    { companySlug: 'erdallar-tarimsal-makina', authorName: 'Mehmet A.', rating: 5, title: 'Mükemmel kalite', body: 'Makineler çok dayanıklı. Kesinlikle tavsiye ederim.' },
    { companySlug: 'erdallar-tarimsal-makina', authorName: 'Ahmet Y.', rating: 5, body: 'Harika hizmet ve kaliteli ürünler.' },
    { companySlug: 'utirom-invest', authorName: 'Cristian D.', rating: 5, title: 'Servicii excelente', body: 'Mașini de calitate, livrare rapidă.' },
    { companySlug: 'utirom-invest', authorName: 'Andrei P.', rating: 4, body: 'Good equipment, fair prices.' },
    { companySlug: 'kleyn-trucks', authorName: 'Tomasz K.', rating: 5, title: 'Bardzo polecam', body: 'Duży wybór samochodów w dobrym stanie.' },
    { companySlug: 'kleyn-trucks', authorName: 'Stefan V.', rating: 4, body: 'Professional service, trucks as described.' },
    { companySlug: 'ritchie-bros', authorName: 'Hans M.', rating: 4, title: 'Good auction platform', body: 'Fair bidding process. Equipment as described.' },
    { companySlug: 'hanselmann-gmbh', authorName: 'Friedrich B.', rating: 5, title: 'Top Händler', body: 'Sehr gute Landmaschinen, faire Preise.' },
    { companySlug: 'walker-movements', authorName: 'James H.', rating: 4, body: 'Reliable supplier. Good communication throughout.' },
  ];

  for (const rv of reviewData) {
    const compId = companyIds[rv.companySlug];
    if (!compId) continue;
    await prisma.companyReview.create({
      data: {
        companyId: compId,
        authorName: rv.authorName,
        rating: rv.rating,
        title: rv.title ?? null,
        body: rv.body ?? null,
      },
    });
  }

  console.log('Seed complete!');
  console.log(`  Users: 3 (admin, manager, test)`);
  console.log(`  Countries: ${countryData.length}`);
  console.log(`  Cities: ${cityData.length}`);
  console.log(`  Activity Types: ${activityTypeData.length}`);
  console.log(`  Brands: ${brandNames.length}`);
  console.log(`  Categories: ${parentCats.length + childCats.length}`);
  console.log(`  Companies: ${companySeedData.length}`);
  console.log(`  Listings: ${listingSeedData.length}`);
  console.log(`  Reviews: ${reviewData.length}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
