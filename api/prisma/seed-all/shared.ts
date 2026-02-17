import { PrismaClient } from '@prisma/client';

export const SEED_REFERENCE_DATE = new Date('2026-01-15T12:00:00.000Z');

export function daysAgo(days: number): Date {
  return new Date(SEED_REFERENCE_DATE.getTime() - days * 24 * 60 * 60 * 1000);
}

export function daysFromNow(days: number): Date {
  return new Date(SEED_REFERENCE_DATE.getTime() + days * 24 * 60 * 60 * 1000);
}

export type SeedUsers = {
  adminId: string;
  managerId: string;
  proSellerId: string;
  buyerId: string;
  restrictedUserId: string;
};

export type SeedGeo = {
  uaId: string;
  deId: string;
  plId: string;
  kyivId: string;
  dniproId: string;
  berlinId: string;
  warsawId: string;
};

export type SeedCatalog = {
  activityTypeIds: string[];
  marketplaceMap: Map<string, bigint>;
  categoriesBySlug: Map<string, { id: bigint; marketplaceId: bigint }>;
  brandMap: Map<string, string>;
};

export type SeedPlans = {
  basicPlanId: string;
  proPlanId: string;
  enterprisePlanId: string;
};

export type SeedCompanies = {
  agroId: string;
  heavyId: string;
  fleetId: string;
};

export type SeedListings = {
  listing1Id: bigint;
  listing2Id: bigint;
  listing3Id: bigint;
  listing4Id: bigint;
};

export type SeedConversation = {
  primaryConversationId: string;
};

export type SeedContext = {
  prisma: PrismaClient;
  users: SeedUsers;
  geo: SeedGeo;
  catalog: SeedCatalog;
  plans: SeedPlans;
  companies: SeedCompanies;
  listings: SeedListings;
  conversation: SeedConversation;
};
