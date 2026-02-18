"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
async function main() {
    const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new adapter_pg_1.PrismaPg(pool);
    const prisma = new client_1.PrismaClient({ adapter });
    try {
        const checks = [
            { name: 'users', min: 5, getCount: (client) => client.user.count() },
            { name: 'marketplaces', min: 4, getCount: (client) => client.marketplace.count() },
            { name: 'categories', min: 15, getCount: (client) => client.category.count() },
            { name: 'brands', min: 8, getCount: (client) => client.brand.count() },
            { name: 'templates', min: 10, getCount: (client) => client.formTemplate.count() },
            { name: 'companies', min: 3, getCount: (client) => client.company.count() },
            { name: 'listings', min: 4, getCount: (client) => client.listing.count() },
            { name: 'conversations', min: 1, getCount: (client) => client.conversation.count() },
            { name: 'messages', min: 2, getCount: (client) => client.message.count() },
            { name: 'support tickets', min: 2, getCount: (client) => client.supportTicket.count() },
            { name: 'notifications', min: 3, getCount: (client) => client.notification.count() },
            { name: 'saved searches', min: 2, getCount: (client) => client.savedSearch.count() },
            { name: 'dealer leads', min: 2, getCount: (client) => client.dealerLead.count() },
        ];
        let hasFailure = false;
        console.log('Seed count checks:');
        for (const check of checks) {
            const count = await check.getCount(prisma);
            const ok = count >= check.min;
            console.log(`- ${check.name}: ${count} (expected >= ${check.min}) ${ok ? 'OK' : 'FAIL'}`);
            if (!ok)
                hasFailure = true;
        }
        const listingsMissingRelations = await prisma.listing.count({
            where: {
                OR: [
                    { fact: null },
                    { attribute: null },
                    { seller: null },
                    { wizardState: null },
                ],
            },
        });
        if (listingsMissingRelations > 0) {
            console.error(`- listing relation integrity: FAIL (${listingsMissingRelations} listing(s) missing related records)`);
            hasFailure = true;
        }
        else {
            console.log('- listing relation integrity: OK');
        }
        const conversationsWithoutMessages = await prisma.conversation.count({
            where: {
                messages: {
                    none: {},
                },
            },
        });
        if (conversationsWithoutMessages > 0) {
            console.error(`- conversation messages integrity: FAIL (${conversationsWithoutMessages} conversation(s) without messages)`);
            hasFailure = true;
        }
        else {
            console.log('- conversation messages integrity: OK');
        }
        const ticketsWithoutMessages = await prisma.supportTicket.count({
            where: {
                messages: {
                    none: {},
                },
            },
        });
        if (ticketsWithoutMessages > 0) {
            console.error(`- support ticket messages integrity: FAIL (${ticketsWithoutMessages} ticket(s) without messages)`);
            hasFailure = true;
        }
        else {
            console.log('- support ticket messages integrity: OK');
        }
        const missingActiveTemplateForLeaf = await prisma.category.count({
            where: {
                children: { none: {} },
                formTemplates: {
                    none: {
                        isActive: true,
                    },
                },
            },
        });
        if (missingActiveTemplateForLeaf > 0) {
            console.error(`- leaf category active template coverage: FAIL (${missingActiveTemplateForLeaf} leaf category(ies) missing active template)`);
            hasFailure = true;
        }
        else {
            console.log('- leaf category active template coverage: OK');
        }
        if (hasFailure) {
            throw new Error('Seed verification failed');
        }
        console.log('Seed verification passed.');
    }
    finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
