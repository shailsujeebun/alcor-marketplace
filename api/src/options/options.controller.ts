import { Controller, Get, Query } from '@nestjs/common';
import { OptionsService } from './options.service';

@Controller('options')
export class OptionsController {
    constructor(private readonly optionsService: OptionsService) { }

    @Get('models')
    getModels(
        @Query('brandId') brandId?: string,
        @Query('categoryId') categoryId?: string,
    ) {
        return this.optionsService.getModels(brandId, categoryId);
    }
}
