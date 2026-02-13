import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { CountriesModule } from './countries/countries.module';
import { CitiesModule } from './cities/cities.module';
import { BrandsModule } from './brands/brands.module';
import { ActivityTypesModule } from './activity-types/activity-types.module';
import { CategoriesModule } from './categories/categories.module';
import { CompaniesModule } from './companies/companies.module';
import { ListingsModule } from './listings/listings.module';
import { DealerLeadsModule } from './dealer-leads/dealer-leads.module';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FavoritesModule } from './favorites/favorites.module';
import { MessagesModule } from './messages/messages.module';
import { SupportModule } from './support/support.module';
import { AdminModule } from './admin/admin.module';
import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { MailModule } from './mail/mail.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SavedSearchesModule } from './saved-searches/saved-searches.module';
import { SearchModule } from './search/search.module';

import { MarketplacesModule } from './marketplaces/marketplaces.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 100 }] }),
    PrismaModule,
    RedisModule,
    MailModule,
    AuthModule,
    UsersModule,
    CountriesModule,
    CitiesModule,
    BrandsModule,
    ActivityTypesModule,
    CategoriesModule,
    CompaniesModule,
    ListingsModule,
    DealerLeadsModule,
    UploadModule,
    FavoritesModule,
    MessagesModule,
    SupportModule,
    AdminModule,
    PlansModule,
    SubscriptionsModule,
    NotificationsModule,
    SavedSearchesModule,
    SearchModule,
    MarketplacesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
