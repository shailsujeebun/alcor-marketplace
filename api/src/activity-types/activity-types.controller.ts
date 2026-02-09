import { Controller, Get, Post, Body } from '@nestjs/common';
import { ActivityTypesService } from './activity-types.service';
import { CreateActivityTypeDto } from './dto/create-activity-type.dto';

@Controller('activity-types')
export class ActivityTypesController {
  constructor(private readonly activityTypesService: ActivityTypesService) {}

  @Post()
  create(@Body() dto: CreateActivityTypeDto) {
    return this.activityTypesService.create(dto);
  }

  @Get()
  findAll() {
    return this.activityTypesService.findAll();
  }
}
