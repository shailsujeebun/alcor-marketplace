import type { SeedCatalog, SeedCompanies, SeedGeo, SeedListings, SeedPlans, SeedUsers } from './shared';

export type CoreSeedInput = {
  users: SeedUsers;
  geo: SeedGeo;
  catalog: SeedCatalog;
  plans: SeedPlans;
};

export type EngagementSeedInput = {
  users: SeedUsers;
  geo: SeedGeo;
  companies: SeedCompanies;
  listings: SeedListings;
};
