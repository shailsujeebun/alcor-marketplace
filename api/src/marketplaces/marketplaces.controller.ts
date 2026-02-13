import { Controller, Get } from '@nestjs/common';
import { MarketplacesService } from './marketplaces.service';

@Controller('marketplaces')
export class MarketplacesController {
    constructor(private readonly marketplacesService: MarketplacesService) { }

    @Get()
    findAll() {
        return this.marketplacesService.findAll();
    }
}
