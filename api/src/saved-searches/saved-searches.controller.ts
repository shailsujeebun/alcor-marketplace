import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SavedSearchesService } from './saved-searches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('saved-searches')
@UseGuards(JwtAuthGuard)
export class SavedSearchesController {
  constructor(private readonly savedSearchesService: SavedSearchesService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() body: { name: string; filters: Record<string, string> },
  ) {
    return this.savedSearchesService.create(userId, body.name, body.filters);
  }

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.savedSearchesService.findByUser(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.savedSearchesService.remove(id, userId);
  }
}
