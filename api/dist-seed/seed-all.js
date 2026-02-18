"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
try {
    require('dotenv/config');
}
catch { }
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const cleanup_1 = require("./seed-all/cleanup");
const companies_listings_1 = require("./seed-all/companies-listings");
const core_1 = require("./seed-all/core");
const engagement_1 = require("./seed-all/engagement");
const shared_1 = require("./seed-all/shared");
async function main() {
    const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new adapter_pg_1.PrismaPg(pool);
    const prisma = new client_1.PrismaClient({ adapter });
    try {
        console.log(`Seeding full dataset (deterministic reference date: ${shared_1.SEED_REFERENCE_DATE.toISOString()})...`);
        console.log('1/4 Clearing existing data...');
        await (0, cleanup_1.clearDatabase)(prisma);
        console.log('2/4 Seeding core references and auth data...');
        const core = await (0, core_1.seedCore)(prisma);
        console.log('3/4 Seeding companies and listings...');
        const companiesAndListings = await (0, companies_listings_1.seedCompaniesAndListings)(prisma, core);
        console.log('4/4 Seeding engagement data...');
        const conversation = await (0, engagement_1.seedEngagement)(prisma, {
            users: core.users,
            geo: core.geo,
            companies: companiesAndListings.companies,
            listings: companiesAndListings.listings,
        });
        console.log('Seed completed successfully.');
        console.log(`Users: ${Object.keys(core.users).length}`);
        console.log(`Countries: 3, Cities: 5`);
        console.log(`Marketplaces: ${core.catalog.marketplaceMap.size}, Categories: ${core.catalog.categoriesBySlug.size}`);
        console.log(`Brands: ${core.catalog.brandMap.size}, Activity types: ${core.catalog.activityTypeIds.length}`);
        console.log(`Companies: ${Object.keys(companiesAndListings.companies).length}`);
        console.log(`Listings: ${Object.keys(companiesAndListings.listings).length}`);
        console.log(`Plans: ${Object.keys(core.plans).length}, Subscriptions: 3`);
        console.log(`Primary conversation: ${conversation.primaryConversationId}`);
    }
    finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
main().catch((error) => {
    console.error('Comprehensive seed failed:', error);
    process.exit(1);
});
