import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ─── Public Marketplaces ─────────────────────────────
  @Get('marketplaces')
  findMarketplaces() {
    return this.categoriesService.findMarketplaces();
  }

  // ─── Categories ──────────────────────────────────────
  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Get('categories/:slug/template')
  findTemplate(@Param('slug') slug: string) {
    return this.categoriesService.findTemplate(slug);
  }

  @Get('categories')
  findTree(@Query('marketplaceId') marketplaceId?: string) {
    return this.categoriesService.findTree(marketplaceId);
  }
}
