# Ad Placement & Listing Wizard Documentation

## Overview

The Ad Placement system has been significantly refactored to support a **Guest Flow** and a **Multi-Step Wizard** UI. This allows unauthenticated users to start creating an ad, upload photos, and then register/login at the final step without losing their data.

## Features

### 1. Guest Ad Placement
- **Public Access**: The ad creation flow starts at a public URL (`/ad-placement/details`), bypassing the authenticated `/cabinet` routes.
- **Draft Persistence**: Listing data is saved to `localStorage` (`listing_draft`) as the user types.
- **Smart Restore**: When a guest registers or logs in after starting an ad, the draft is automatically restored into the form.
- **Guest Uploads**: The API has been updated to allow unauthenticated image uploads for draft listings.
- **Marketplace Tabs**: Category selection starts with a marketplace selector, and categories are scoped to the chosen marketplace.
- **Leaf-Only Selection**: Ads can be placed in subcategories, or in a main category only if it has no children.

### 2. Multi-Step Wizard UI
Refactored from a single monolithic form into a structured 3-step process:
1.  **Description**: Basic info, category, price, and details.
2.  **Media**: Dedicated step for uploading photos and videos.
3.  **Contacts**: Seller information and final submission.

## Tech Stack & Architecture

### Frontend Components (`web/src/components/listings/wizard/`)
- **`wizard-context.tsx`**: React Context that manages the global state of the wizard (form data, media, current step, errors).
- **`description-step.tsx`**: Step 1 component. Handles dynamic category attributes using `DynamicForm`.
- **`media-step.tsx`**: Step 2 component. Wraps the `MediaUploader`.
- **`contact-step.tsx`**: Step 3 component. Handles guest vs. auth logic and final form submission.
- **`listing-wizard.tsx`**: The orchestrator component. It providers the `WizardContext` and renders the persistent **Sidebar** navigation.

### State Management
- **Context API**: `useWizard()` hook provides access to `form`, `setForm`, `media`, `setMedia` anywhere within the wizard steps.
- **Local Storage**:
  - Key: `listing_draft`
  - Content: `{ form: FormData, media: MediaItem[], timestamp: number }`
  - Behavior: Saved on "Next" or "Submit" (if guest). Cleared on successful submission.

### Backend Changes (`api/`)
- **Upload Controller** (`api/src/upload/upload.controller.ts`):
  - Removed `@UseGuards(JwtAuthGuard)` from the `POST /upload/images` endpoint.
  - This allows guests to upload images to MinIO and get public URLs back, which are then stored in the frontend draft state.

## User Flows

### Guest Flow
1.  User clicks "Place an ad" -> Selects Category.
2.  Redirects to `/ad-placement/details`.
3.  **Step 1**: Fills out description.
4.  **Step 2**: Uploads photos (images uploaded immediately to server, URLs saved in state).
5.  **Step 3**:
    - Sees "Already registered?" prompt.
    - Clicks "Continue & Register".
    - Draft saved to `localStorage`.
    - Redirects to `/register`.
6.  **After Auth**:
    - Redirects back to `/ad-placement/details`.
    - `ListingWizard` detects draft in `localStorage`.
    - Form is repopulated.
    - User clicks "Publish".

### Authenticated Flow
1.  User (logged in) starts at `/ad-placement/details` or `/cabinet/listings/new`.
2.  Form initiates with user data (Company, Name, Email, Phone).
3.  User progresses through steps.
4.  Submits directly via `POST /listings`.

## Directory Structure

```
web/src/app/ad-placement/
├── details/
│   └── page.tsx              # Public wrapper for ListingWizard
└── select-category/
    └── page.tsx              # Category selection (redirects to details)

web/src/components/listings/
├── listing-wizard.tsx        # Main orchestrator & Sidebar
└── wizard/
    ├── wizard-context.tsx    # State management
    ├── description-step.tsx  # Step 1
    ├── media-step.tsx        # Step 2
    └── contact-step.tsx      # Step 3
```

## Key API Endpoints Used

- `GET /marketplaces`
- `GET /categories`: Category tree
- `GET /categories?marketplaceId=...`: Category tree scoped to marketplace
- `GET /categories/:id/template`: Dynamic form fields
- `POST /upload/images`: Image upload (Public)
- `POST /listings`: Create listing (Authenticated)
- `PATCH /listings/:id`: Update listing (Authenticated)

## Future Improvements

- **Validation**: Add stricter Zod validation for each step before proceeding.
- **Draft Expiry**: Implement cleanup for old drafts in `localStorage`.
- **Mobile UI**: Further optimize the sidebar for mobile views (currently stacks or hides).

---

## Updates (2026-02-16)

### Listing Wizard

- Fixed directive typo in Step 1 component (`'use client'`).
- Updated category selection in `description-step.tsx` to a parent/subcategory cascading flow:
  - Parent category selection first.
  - Subcategory selection appears only when children exist.
  - Wizard stores the final selected category id for template loading.
- Added better dynamic form states in Step 1:
  - Spinner while template is loading.
  - Clear empty-state message when no custom template is configured.
- Expanded shared `FormData` in `wizard-context.tsx` and `listing-wizard.tsx` initialization for core listing fields:
  - `brandId`, `condition`, `year`, `priceAmount`, `priceCurrency`, `priceType`, `listingType`, `euroClass`, `hoursValue`, `hoursUnit`, `externalUrl`.
- Wrapped `ListingWizard` `useSearchParams` usage with `Suspense` to satisfy Next.js 16 App Router behavior.

### Project-Wide Translation

- Added global translation provider at `web/src/components/providers/translation-provider.tsx`.
- Added fixed `EN/UA` language toggle button in the app shell.
- Added translation API route `web/src/app/api/translate/route.ts`:
  - Batch translation endpoint with simple server-side cache.
  - Safe fallback to original text on request failures.
- Translation behavior applies across the app, including:
  - Text nodes in rendered pages.
  - Common UI attributes (`placeholder`, `title`, `aria-label`, button `value`).
  - Dynamically inserted content via `MutationObserver`.

### Translation Architecture Refactor (2026-02-16, `feature-translation`)

- Replaced runtime full-page DOM translation with key-based dictionary i18n:
  - Added message dictionaries in `web/src/i18n/messages/uk.ts` and `web/src/i18n/messages/en.ts`.
  - Added central translator utility in `web/src/i18n/index.ts`.
  - `TranslationProvider` now exposes `locale`, `toggleLocale`, and `t(key)`.
- Language switching behavior:
  - Default load is always `uk` for fast first paint.
  - `EN` applies only when user clicks the toggle.
  - No persistence across reloads (avoids slow/looping startup issues).
- Removed runtime translation endpoint usage:
  - Deleted `web/src/app/api/translate/route.ts`.
- Listing wizard translations migrated to i18n keys:
  - Step labels, sidebar title, tip copy, and loading fallback now translate via `t(key)`.
