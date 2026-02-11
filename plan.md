# Marketplace Ad-Posting System Plan

## 1. Product Scope and UX Flow

### A. Entry
**Page:** “Create listing”
**Action:** Start a draft (anonymous allowed)

**Flow:**
1. User clicks "Create listing"
2. System creates a `draft_id` and sends user to Step 1

### B. Step 1 — Select Marketplace + Section
**Goal:** Pick where the item belongs.

**Marketplace Selector (Tabs):**
- Agriculture
- Commercial vehicles
- Industrial machinery
- Cars (New marketplace)

**Section Selector (Grid):**
- Changes based on Marketplace selection
- Search bar filters sections

**Output Stored:**
- `marketplace_id`
- `category_id` (section)

### C. Step 2 — Description (Dynamic Form)
**Goal:** Collect listing details based on selected category.

**Features:**
- Render a category-specific form template
- Supports required fields, dropdown options, checkbox features
- Conditional fields (e.g., show “battery capacity” only if fuel=EV)

**Output Stored:**
- `title`, `description`, `lang`
- `attributes` (JSON)
- `facts` (common indexed fields like price/year/mileage/location)

### D. Step 3 — Photos & Media
**Goal:** Upload photos, add video, optional PDF.

**Features:**
- Direct uploads to object storage via presigned URL
- Async thumbnail generation
- Save media order

**Output Stored:**
- Media records (photo/video/pdf)

### E. Step 4 — Contact Info + Consent
**Goal:** Capture seller contact and legal consent.

**Features:**
- Email, Name
- Phone country + Phone number
- Optional partner code
- Privacy + Terms consent

**Output Stored:**
- Seller contact record
- Consent timestamp
- Link seller → listing

### F. Publish
**Actions:**
1. Validate all required fields for the chosen template
2. Change status: `draft` → `published`
3. Create public listing URL/slug
4. Index in search

---

## 2. Core Design Principles

### A. Avoid Schema Churn with a Template System
- Each category points to a form template.
- Templates define fields, validation, option lists, conditional rules.
- Listing stores all raw fields in `attributes` JSONB.
- Important filter fields are stored in `listing_fact` for performance.

### B. Consistent Data Model Across Marketplaces
- Marketplaces differ only by category tree + templates.
- All listings share one publishing pipeline.

---

## 3. System Components

### 1) Catalog Module
- CRUD marketplaces
- Category tree per marketplace
- Expose endpoints for Wizard Step 1

### 2) Form Module
- Template per category (versioned)
- Endpoints to fetch template + options
- Server-side validator

### 3) Listing Module
- Drafts, updates per step
- Validation + publishing
- Status transitions

### 4) Media Module
- Presigned upload
- Store media rows
- Image processing job

### 5) Search Module
- Index published listings
- Faceted filters per marketplace (Cars has different facets)
- Optional: “Related listings”

---

## 4. Database Schema (Copyright-Safe Names)

### A. Marketplaces + Categories
```sql
CREATE TABLE marketplace (
  marketplace_id BIGSERIAL PRIMARY KEY,
  key            TEXT UNIQUE NOT NULL,  -- 'agriculture', 'commercial', 'industrial', 'cars'
  name           TEXT NOT NULL,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE category (
  category_id    BIGSERIAL PRIMARY KEY,
  marketplace_id BIGINT NOT NULL REFERENCES marketplace(marketplace_id),
  parent_id      BIGINT REFERENCES category(category_id),
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL,
  sort_order     INT,
  UNIQUE(marketplace_id, slug)
);
```

### B. Form Templates (Dynamic Description Step)
```sql
CREATE TABLE form_template (
  template_id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES category(category_id),
  version     INT NOT NULL DEFAULT 1,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(category_id, version)
);

CREATE TABLE form_field (
  field_id      BIGSERIAL PRIMARY KEY,
  template_id   BIGINT NOT NULL REFERENCES form_template(template_id) ON DELETE CASCADE,
  field_key     TEXT NOT NULL,   -- stable key like 'year', 'mileage_km', 'fuel'
  label         TEXT NOT NULL,
  field_type    TEXT NOT NULL,   -- text, number, select, multiselect, bool, date, color, geo
  required      BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order    INT NOT NULL DEFAULT 0,
  help_text     TEXT,
  validations   JSONB NOT NULL DEFAULT '{}'::jsonb,  -- min/max/regex/unit
  visibility_if JSONB NOT NULL DEFAULT '{}'::jsonb,  -- conditional rules
  UNIQUE(template_id, field_key)
);

CREATE TABLE field_option (
  option_id   BIGSERIAL PRIMARY KEY,
  field_id    BIGINT NOT NULL REFERENCES form_field(field_id) ON DELETE CASCADE,
  value       TEXT NOT NULL,
  label       TEXT NOT NULL,
  sort_order  INT,
  UNIQUE(field_id, value)
);
```

### C. Listings (Draft + Published)
```sql
CREATE TYPE listing_status AS ENUM ('draft','published','archived','rejected');

CREATE TABLE listing (
  listing_id     BIGSERIAL PRIMARY KEY,
  marketplace_id BIGINT NOT NULL REFERENCES marketplace(marketplace_id),
  category_id    BIGINT NOT NULL REFERENCES category(category_id),
  status         listing_status NOT NULL DEFAULT 'draft',

  title          TEXT,
  description    TEXT,
  description_lang TEXT,

  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at   TIMESTAMPTZ
);

-- All category-specific values live here
CREATE TABLE listing_attribute (
  listing_id BIGINT PRIMARY KEY REFERENCES listing(listing_id) ON DELETE CASCADE,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Promoted columns for fast filters + indexing
CREATE TABLE listing_fact (
  listing_id BIGINT PRIMARY KEY REFERENCES listing(listing_id) ON DELETE CASCADE,

  price_amount NUMERIC(14,2),
  price_currency TEXT,
  vat_type TEXT,

  year INT,
  mileage_km INT,
  condition TEXT,

  country TEXT,
  city TEXT,
  lat NUMERIC(9,6),
  lng NUMERIC(9,6)
);
```

### D. Media (Photos/Video/PDF)
```sql
CREATE TYPE media_type AS ENUM ('photo','video','pdf');

CREATE TABLE listing_media (
  media_id    BIGSERIAL PRIMARY KEY,
  listing_id  BIGINT NOT NULL REFERENCES listing(listing_id) ON DELETE CASCADE,
  type        media_type NOT NULL,
  url         TEXT NOT NULL,
  sort_order  INT,
  meta        JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(listing_id, url)
);
```

### E. Contact (No Accounts Needed)
```sql
CREATE TABLE seller_contact (
  seller_contact_id BIGSERIAL PRIMARY KEY,
  email          TEXT NOT NULL,
  name           TEXT NOT NULL,
  phone_country  CHAR(2) NOT NULL,
  phone_number   TEXT NOT NULL,
  partner_code   TEXT,

  privacy_consent BOOLEAN NOT NULL,
  terms_consent   BOOLEAN NOT NULL,
  consented_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE listing_seller (
  listing_id BIGINT PRIMARY KEY REFERENCES listing(listing_id) ON DELETE CASCADE,
  seller_contact_id BIGINT NOT NULL REFERENCES seller_contact(seller_contact_id)
);
```

### F. Wizard Progress (Optional but Recommended)
```sql
CREATE TABLE listing_wizard_state (
  listing_id BIGINT PRIMARY KEY REFERENCES listing(listing_id) ON DELETE CASCADE,
  step INT NOT NULL DEFAULT 1,
  completed_steps INT[] NOT NULL DEFAULT '{}'::INT[],
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 5. Cars Marketplace Blueprint

### Category Tree (Starter)
- **Cars**
  - Sedan
  - Hatchback
  - SUV / Crossover
  - Coupe
  - Convertible
  - Pickup
  - Van / Minivan
  - Electric
  - Hybrid

### Template Fields (Minimum Viable)

**Promote in `listing_fact`:**
- `price_amount`, `price_currency`, `vat_type`
- `year`, `mileage_km`, `condition`
- `country`, `city`, `lat/lng`

**Store in `listing_attribute.data`:**
- `make`, `model`, `trim`
- `vin`
- `fuel`, `transmission`, `drive`
- `engine_cc`, `power_hp`
- `body_type`, `doors`, `color`
- **Features:** `abs`, `airbags`, `parking_sensors`, `camera`, etc.

---

## 6. Implementation Roadmap

### Phase 1 — Foundations (Week 1 Equivalent Scope)
- **Create Tables:** `marketplace`, `category`, `listing`, `attributes`, `facts`, `media`, `seller_contact`
- **Build Endpoints:**
  - `POST /listings/draft` (Creates draft)
  - `GET /marketplaces`
  - `GET /categories?marketplace_id=...`

### Phase 2 — Dynamic Forms (Core of Step 2)
- **Build Template Tables:** `form_template`, `form_field`, `field_option` + Admin seed scripts
- **Build Endpoints:**
  - `GET /categories/:id/template` (Returns schema + options)
  - `PUT /listings/:id/attributes` (Validates + stores)
- **Validator:** Required, min/max, regex, conditional rules

### Phase 3 — Media Pipeline (Step 3)
- **Build Endpoint:** Presigned upload endpoint
- **Features:**
  - Save media rows
  - Background job: Thumbnails, metadata extraction

### Phase 4 — Contacts + Publish (Step 4)
- **Build Endpoints:**
  - `PUT /listings/:id/contact`
  - `POST /listings/:id/publish` (Validate all steps, set status published, build slug, index to search)

### Phase 5 — Search & Filters
- **Build Search Index**
- **Features:**
  - Facets per marketplace (Cars facets differ)
- **Public Endpoints:**
  - `GET /search`
  - `GET /listings/:id`
