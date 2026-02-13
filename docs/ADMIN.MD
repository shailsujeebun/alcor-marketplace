# Admin Features Documentation

## Overview
This document outlines the implementation of the new Admin capabilities for the Alcor Marketplace. The features include management of **Marketplaces**, **Categories**, and **Dynamic Form Templates**.

## 1. Backend Implementation (`api/src/admin`)

The backend logic is encapsulated in the `AdminModule`.

### Controllers & Services
- **AdminController**: Exposes RESTful endpoints protected by `JwtAuthGuard` and `RolesGuard` (Requires `ADMIN` or `MANAGER` role).
- **AdminService**: Handles business logic and database interactions using Prisma.

### Database Schema Updates
New tables were utilized (defined in `schema.prisma`):
- `Marketplace`: Top-level entities (e.g., Agroline, Autoline).
- `Category`: Hierarchical category tree linked to a specific Marketplace.
- `FormTemplate`: Defines the structure of listing forms for a category.
- `FormField`: Specific fields (inputs, selects) belonging to a template.
- `FieldOption`: Options for select/multiselect fields.

### API Endpoints

#### Marketplaces
- `GET /admin/marketplaces` - List all marketplaces.
- `POST /admin/marketplaces` - Create a new marketplace.
- `PATCH /admin/marketplaces/:id` - Update marketplace details (name, active status).

#### Categories
- `POST /admin/categories` - Create a new category (root or child).
- `PATCH /admin/categories/:id` - Update category details.
- `DELETE /admin/categories/:id` - Delete a category (restricted if dependencies exist).

#### Form Templates
- `POST /admin/templates` - Create a new form template with defined fields.
- `GET /admin/templates/:id` - Retrieve a full template with fields and options.

---

## 2. Frontend Implementation (`web/src/app/admin`)

The frontend admin panel has been expanded with new pages and UI components.

### API Client (`web/src/lib/api.ts`)
Added new typed functions to interact with the admin endpoints:
- `getAdminMarketplaces`, `createAdminMarketplace`, `updateAdminMarketplace`
- `createAdminCategory`, `updateAdminCategory`, `deleteAdminCategory`
- `createAdminTemplate`, `getAdminTemplate`

### New Admin Pages

#### 1. Marketplace Management
- **Path**: `/admin/marketplaces`
- **Features**: 
  - List view of all marketplaces.
  - Create new marketplace with Key and Name.
  - Toggle Active/Inactive status.

#### 2. Category Management
- **Path**: `/admin/categories`
- **Features**:
  - Filter categories by Marketplace.
  - Recursive tree view of categories.
  - Add Root Category or Subcategory.
  - Edit or Delete categories.

#### 3. Form Template Builder
- **Path**: `/admin/templates/builder`
- **Features**:
  - Visual drag-and-drop style builder (UI only for now).
  - Add fields: Text, Number, Select, Multi-Select, Boolean.
  - Configure field options and requirements.
  - Save templates to backend.

### UI Components (`web/src/components/ui`)
Implemented standard **shadcn/ui** components to support the new pages:
- `Button`, `Input`, `Label`
- `Select` (Dropdowns)
- `Dialog` (Modals for forms)
- `Card` (Layout containers)

### Navigation
Updated `web/src/app/admin/layout.tsx` to include sidebar links:
- 🌐 **Marketplaces**
- 🗂️ **Categories**
- 📝 **Form Builder**

---

## 3. How to Use

1.  **Login** as an administrator (e.g., `admin@alcor.com`).
2.  Navigate to the **Admin Panel** via the dashboard or sidebar.
3.  **Setup Workflow**:
    1.  Go to **Marketplaces** to define your high-level domains (e.g., "Industrial").
    2.  Go to **Categories** to build the hierarchy (e.g., Industrial -> Generators -> Diesel).
    3.  Go to **Form Builder**, select a category (e.g., "Diesel Generators"), and define the specific fields (e.g., "Power Output", "Year", "Hours").
4.  **Result**: Users trying to place an ad in "Diesel Generators" will now see the custom form you created.
