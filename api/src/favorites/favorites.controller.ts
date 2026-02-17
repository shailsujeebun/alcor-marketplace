import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('favorites/:listingId')
  addFavorite(
    @CurrentUser('id') userId: string,
    @Param('listingId') listingId: string,
  ) {
    return this.favoritesService.addFavorite(userId, listingId);
  }

  @Delete('favorites/:listingId')
  removeFavorite(
    @CurrentUser('id') userId: string,
    @Param('listingId') listingId: string,
  ) {
    return this.favoritesService.removeFavorite(userId, listingId);
  }

  @Get('favorites')
  getFavorites(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.favoritesService.getUserFavorites(
      userId,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Get('favorites/check/:listingId')
  async checkFavorite(
    @CurrentUser('id') userId: string,
    @Param('listingId') listingId: string,
  ) {
    const isFavorite = await this.favoritesService.isFavorite(
      userId,
      listingId,
    );
    return { isFavorite };
  }

  // --- View History ---

  @Post('view-history/:listingId')
  recordView(
    @CurrentUser('id') userId: string,
    @Param('listingId') listingId: string,
  ) {
    return this.favoritesService.recordView(userId, listingId);
  }

  @Get('view-history')
  getViewHistory(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.favoritesService.getViewHistory(
      userId,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }
}
