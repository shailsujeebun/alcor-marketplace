import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

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
