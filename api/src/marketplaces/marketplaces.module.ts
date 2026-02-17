import { Module } from '@nestjs/common';
import { MarketplacesService } from './marketplaces.service';
import { MarketplacesController } from './marketplaces.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MarketplacesController],
  providers: [MarketplacesService],
})
export class MarketplacesModule {}
