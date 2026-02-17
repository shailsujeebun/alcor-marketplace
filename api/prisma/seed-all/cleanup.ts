import { PrismaClient } from '@prisma/client';

export async function clearDatabase(prisma: PrismaClient) {
  await prisma.ticketMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.viewHistory.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.savedSearch.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.dealerLead.deleteMany();

  await prisma.listingWizardState.deleteMany();
  await prisma.listingSeller.deleteMany();
  await prisma.sellerContact.deleteMany();
  await prisma.listingMedia.deleteMany();
  await prisma.listingFact.deleteMany();
  await prisma.listingAttribute.deleteMany();
  await prisma.listing.deleteMany();

  await prisma.companyReview.deleteMany();
  await prisma.companyBrand.deleteMany();
  await prisma.companyActivityType.deleteMany();
  await prisma.companyMedia.deleteMany();
  await prisma.companyPhone.deleteMany();
  await prisma.companyUser.deleteMany();
  await prisma.company.deleteMany();

  await prisma.fieldOption.deleteMany();
  await prisma.formField.deleteMany();
  await prisma.formTemplate.deleteMany();

  await prisma.brandCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.marketplace.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.activityType.deleteMany();
  await prisma.city.deleteMany();
  await prisma.country.deleteMany();

  await prisma.emailVerificationCode.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.oAuthAccount.deleteMany();
  await prisma.user.deleteMany();
}
