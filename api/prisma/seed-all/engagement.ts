import { PrismaClient } from '@prisma/client';
import { daysAgo, type SeedConversation } from './shared';
import { type EngagementSeedInput } from './types';

export async function seedEngagement(
  prisma: PrismaClient,
  input: EngagementSeedInput,
): Promise<SeedConversation> {
  await prisma.companyReview.createMany({
    data: [
      {
        companyId: input.companies.agroId,
        authorName: 'Oleksii K.',
        rating: 5,
        title: 'Great support',
        body: 'Fast response and exactly as described.',
        createdAt: daysAgo(11),
      },
      {
        companyId: input.companies.heavyId,
        authorName: 'Martin B.',
        rating: 4,
        title: 'Reliable supplier',
        body: 'Good communication and clear paperwork.',
        createdAt: daysAgo(6),
      },
    ],
  });

  await prisma.favorite.createMany({
    data: [
      { userId: input.users.buyerId, listingId: input.listings.listing1Id, createdAt: daysAgo(4) },
      { userId: input.users.buyerId, listingId: input.listings.listing2Id, createdAt: daysAgo(2) },
    ],
  });

  await prisma.viewHistory.createMany({
    data: [
      { userId: input.users.buyerId, listingId: input.listings.listing1Id, viewedAt: daysAgo(3) },
      { userId: input.users.buyerId, listingId: input.listings.listing2Id, viewedAt: daysAgo(2) },
      { userId: input.users.buyerId, listingId: input.listings.listing3Id, viewedAt: daysAgo(1) },
    ],
  });

  const conversation = await prisma.conversation.create({
    data: {
      listingId: input.listings.listing1Id,
      buyerId: input.users.buyerId,
      sellerId: input.users.proSellerId,
      lastMessageAt: daysAgo(1),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        senderId: input.users.buyerId,
        body: 'Hello, is this tractor still available?',
        createdAt: daysAgo(2),
        readAt: daysAgo(2),
      },
      {
        conversationId: conversation.id,
        senderId: input.users.proSellerId,
        body: 'Yes, available. We can schedule an inspection.',
        createdAt: daysAgo(1),
        readAt: null,
      },
    ],
  });

  const ticket1 = await prisma.supportTicket.create({
    data: {
      userId: input.users.buyerId,
      subject: 'Cannot upload media in listing wizard',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assignedToId: input.users.managerId,
    },
  });

  const ticket2 = await prisma.supportTicket.create({
    data: {
      userId: input.users.proSellerId,
      subject: 'Subscription invoice request',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      assignedToId: input.users.adminId,
      closedAt: daysAgo(1),
    },
  });

  await prisma.ticketMessage.createMany({
    data: [
      {
        ticketId: ticket1.id,
        senderId: input.users.buyerId,
        body: 'Uploader fails after selecting 3 photos.',
        isStaff: false,
        createdAt: daysAgo(2),
      },
      {
        ticketId: ticket1.id,
        senderId: input.users.managerId,
        body: 'We are investigating this issue.',
        isStaff: true,
        createdAt: daysAgo(1),
      },
      {
        ticketId: ticket2.id,
        senderId: input.users.proSellerId,
        body: 'Please send invoice for last month.',
        isStaff: false,
        createdAt: daysAgo(3),
      },
      {
        ticketId: ticket2.id,
        senderId: input.users.adminId,
        body: 'Invoice generated and sent to your email.',
        isStaff: true,
        createdAt: daysAgo(1),
      },
    ],
  });

  await prisma.dealerLead.createMany({
    data: [
      {
        companyName: 'Agri New Co',
        contactPerson: 'Mykola Lead',
        email: 'lead1@example.com',
        phone: '+380671111222',
        website: 'https://agrinew.example.com',
        countryId: input.geo.uaId,
        cityId: input.geo.dniproId,
        activityTypes: ['FARM_EQUIPMENT_SALES'],
        brands: ['John Deere', 'Claas'],
        equipmentCount: 40,
        message: 'Interested in dealer onboarding',
        status: 'NEW',
        assignedToUserId: input.users.managerId,
      },
      {
        companyName: 'Fleet Expand',
        contactPerson: 'Jan Expand',
        email: 'lead2@example.com',
        phone: '+48221110000',
        website: 'https://fleetexpand.example.com',
        countryId: input.geo.plId,
        cityId: input.geo.warsawId,
        activityTypes: ['COMMERCIAL_VEHICLE_SALES'],
        brands: ['MAN'],
        equipmentCount: 85,
        message: 'Need enterprise support',
        status: 'QUALIFIED',
        assignedToUserId: input.users.adminId,
        notes: 'Ready for package discussion',
        convertedAt: null,
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: input.users.buyerId,
        type: 'NEW_MESSAGE',
        title: 'New message from seller',
        body: 'You received a reply for John Deere 6155R',
        linkUrl: `/cabinet/messages/${conversation.id}`,
        isRead: false,
        createdAt: daysAgo(1),
      },
      {
        userId: input.users.proSellerId,
        type: 'LISTING_APPROVED',
        title: 'Listing approved',
        body: 'Your listing "John Deere 6155R" is now active.',
        linkUrl: `/listings/${input.listings.listing1Id.toString()}`,
        isRead: true,
        createdAt: daysAgo(2),
      },
      {
        userId: input.users.managerId,
        type: 'SYSTEM',
        title: 'Daily moderation summary',
        body: '5 new listings pending review.',
        linkUrl: '/admin/moderation',
        isRead: false,
        createdAt: daysAgo(1),
      },
    ],
  });

  await prisma.savedSearch.createMany({
    data: [
      {
        userId: input.users.buyerId,
        name: 'Used tractors in Ukraine',
        filters: {
          marketplace: 'agriculture',
          category: 'wheel-tractors',
          condition: 'USED',
          country: 'UA',
        },
      },
      {
        userId: input.users.proSellerId,
        name: 'Truck tractors under 60k EUR',
        filters: {
          marketplace: 'commercial',
          category: 'truck-tractors',
          maxPrice: 60000,
          currency: 'EUR',
        },
      },
    ],
  });

  return {
    primaryConversationId: conversation.id,
  };
}
