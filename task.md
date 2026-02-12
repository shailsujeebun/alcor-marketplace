# Task Checklist

- [/] Phase 1 — Foundations (Week 1 Equivalent Scope)
    - [ ] Create tables: `marketplace`, `category`, `listing`, `attributes`, `facts`, `media`, `seller_contact`
    - [ ] Build endpoints:
        - [ ] `POST /listings/draft` (Creates draft)
        - [x] `GET /marketplaces`
        - [x] `GET /categories?marketplaceId=...`
- [ ] Phase 2 — Dynamic Forms (Core of Step 2)
    - [ ] Build template tables: `form_template`, `form_field`, `field_option`
    - [ ] Create admin seed scripts for templates
    - [ ] Build endpoints:
        - [ ] `GET /categories/:id/template` (Returns schema + options)
        - [ ] `PUT /listings/:id/attributes` (Validates + stores)
    - [ ] Implement Validator: Required, min/max, regex, conditional rules
- [ ] Phase 3 — Media Pipeline (Step 3)
    - [ ] Build Endpoint: Presigned upload
    - [ ] Implement Features:
        - [ ] Save media rows
        - [ ] Background job: Thumbnails, metadata extraction
- [ ] Phase 4 — Contacts + Publish (Step 4)
    - [ ] Build Endpoints:
        - [ ] `PUT /listings/:id/contact`
        - [ ] `POST /listings/:id/publish` (Validate all steps, set status published, build slug, index to search)
- [ ] Phase 5 — Search & Filters
    - [ ] Build Search Index
    - [ ] Implement Features:
        - [ ] Facets per marketplace (Cars facets differ)
        - [ ] Related listings logic
    - [ ] Public Endpoints:
        - [ ] `GET /search`
        - [ ] `GET /listings/:id`

## Test Status

- 2026-02-12: `api` tests passed (`npm test`)
- 2026-02-12: `api` lint failed with existing errors (`npm run lint`)
- 2026-02-12: `web` lint failed with existing errors (`npm run lint`)
- 2026-02-12: Fixed `react-hooks/set-state-in-effect` warnings in marketplace default selection (no tests rerun)
- 2026-02-12: Re-ran `web` lint after fix; warnings gone, lint still failing due to existing errors
- 2026-02-12: Ad placement wizard now scopes category list by `marketplaceId` from URL
- 2026-02-12: Excluded `prisma/*.ts` seed files from API tsconfig to avoid dev-server compile errors
- 2026-02-12: Admin categories now fetch marketplace-scoped tree for selected marketplace
- 2026-02-12: Added Agroline/Autoline marketplace trees to seed data with Ukrainian names and URL slugs
- 2026-02-12: Listing wizard contact step now lets users create a company if none exist
- 2026-02-12: Listing media uploads now send `type=PHOTO` to satisfy backend validation
- 2026-02-12: Company creation now generates valid slugs and listing submit requires a company; presigned uploads now use public URLs
- 2026-02-12: Company selector now requests max 100 companies to satisfy backend limit validation
- 2026-02-12: Listing attribute storage now maps key/value array into JSON attribute record
- 2026-02-12: Strip media `key` before Prisma createMany to match schema
