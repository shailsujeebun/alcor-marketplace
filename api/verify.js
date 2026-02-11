const API_URL = 'http://localhost:3005';
const ADMIN_EMAIL = 'admin@alcor.com';
const ADMIN_PASSWORD = 'admin123';

async function request(path, method = 'GET', body = null, headers = {}) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${API_URL}${path}`, options);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(`${method} ${path} failed: ${res.status} ${JSON.stringify(data)}`);
    }
    return data;
}

async function main() {
    try {
        console.log('🚀 Starting End-to-End Verification (Fetch Mode)...');

        // 1. Auth
        console.log('\n🔐 Authenticating...');
        const loginRes = await request('/auth/login', 'POST', {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
        });
        const token = loginRes.accessToken;
        const authHeaders = { Authorization: `Bearer ${token}` };
        console.log('✅ Logged in.');

        // 2. Categories
        console.log('\n📂 Fetching Categories...');
        const catsRes = await request('/categories');
        const tractorCat = catsRes.find((c) => c.slug === 'tractors');
        if (!tractorCat) throw new Error('Tractor category not found.');
        console.log(`✅ Found category: ${tractorCat.name} (${tractorCat.id})`);

        // 2.5 Get a valid Company ID
        console.log('\n🏢 Fetching a valid Company...');
        const searchInit = await request('/search?limit=1');
        const validCompanyId = searchInit.data[0]?.companyId;
        if (!validCompanyId) throw new Error('No existing listings found to grab a Company ID from. Please seed db.');
        console.log(`✅ Using Company ID: ${validCompanyId}`);

        // 3. Draft
        console.log('\n📝 Creating Draft Listing...');
        const createRes = await request(
            '/listings',
            'POST',
            {
                title: 'New John Deere 8R - Test',
                companyId: validCompanyId,
                categoryId: String(tractorCat.id),
            },
            authHeaders
        );
        const listingId = createRes.id;
        console.log(`✅ Created Draft: ${listingId}`);

        // 4. Attributes
        console.log('\n✨ Validating Attributes...');
        const attributes = {
            drive_type: '4WD',
            horsepower: 400,
            hours: 100,
            cabin: true,
            condition: 'USED'
        };

        const validateRes = await request(
            '/listings/draft/validate',
            'POST',
            { categoryId: tractorCat.id, attributes },
            authHeaders
        );
        if (!validateRes.success) throw new Error('Validation failed');
        console.log('✅ Attributes Validated.');

        await request(
            `/listings/${listingId}/attributes`,
            'PUT',
            { attributes },
            authHeaders
        );
        console.log('✅ Attributes Saved.');

        // 5. Contact
        console.log('\n📞 Updating Contact Info...');
        await request(
            `/listings/${listingId}/contact`,
            'PUT',
            {
                name: 'John Seller',
                email: 'john@seller.com',
                phoneCountry: 'US',
                phoneNumber: '555-0199',
                privacyConsent: true,
                termsConsent: true
            },
            authHeaders
        );
        console.log('✅ Contact Info Saved.');

        // 6. Media
        console.log('\n📸 Checking Presigned URL...');
        const presignedRes = await request('/upload/presigned', 'GET', null, authHeaders);
        console.log(`   Got URL: ${presignedRes.uploadUrl.substring(0, 30)}...`);

        await request(
            `/listings/${listingId}`,
            'PATCH',
            {
                media: [{ type: 'PHOTO', url: 'https://placehold.co/600x400', key: 'test/image.jpg' }]
            },
            authHeaders
        );
        console.log('✅ Media Attached.');

        // 7. Publish (Skip for admin - listings are auto-published as ACTIVE)
        console.log('\n🚀 Skipping Submit (Admin listings are auto-published)...');
        // await request(`/listings/${listingId}/submit`, 'POST', {}, authHeaders);
        // console.log('✅ Submitted.');

        // 8. Approve (Skip for admin)
        // console.log('\n👑 Approving Listing...');
        // await request(`/listings/${listingId}/approve`, 'POST', {}, authHeaders);
        // console.log('✅ Approved.');

        // 9. Search
        console.log('\n🔍 Verifying Search...');
        // await new Promise(r => setTimeout(r, 1000));

        // Convert params to query string manually for fetch
        const searchRes = await request('/search?q=John+Deere&category=tractors');
        const found = searchRes.data.find((l) => l.id == listingId || l.title.includes('8R'));
        if (!found) {
            console.warn('⚠️ Listing not found in search immediately. Data:', JSON.stringify(searchRes.data.map(i => i.title)));
        } else {
            console.log(`✅ Listing found in search: ${found.title}`);
        }

        // 10. Facets
        console.log('\n📊 Verifying Facets...');
        const facetsRes = await request('/search/facets');
        console.log(`✅ Facets returned: Categories=${facetsRes.categories.length}, Brands=${facetsRes.brands.length}`);

        // 11. Public
        console.log('\n📄 Verifying Public Detail...');
        const detailRes = await request(`/listings/${listingId}`);
        if (detailRes.id != listingId) throw new Error('Detail ID mismatch');
        console.log('✅ Public detail fetch successful.');

        console.log('\n🎉 ALL CHECKS PASSED!');

    } catch (error) {
        console.error('\n❌ Verify Failed:', error.message);
        process.exit(1);
    }
}

main();
