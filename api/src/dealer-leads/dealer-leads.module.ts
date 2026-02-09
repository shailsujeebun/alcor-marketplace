import { Module } from '@nestjs/common';
import { DealerLeadsController } from './dealer-leads.controller';
import { DealerLeadsService } from './dealer-leads.service';

@Module({
  controllers: [DealerLeadsController],
  providers: [DealerLeadsService],
  exports: [DealerLeadsService],
})
export class DealerLeadsModule {}
