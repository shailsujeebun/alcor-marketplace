import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Get(':slug/template')
  findTemplate(@Param('slug') slug: string) {
    return this.categoriesService.findTemplate(slug);
  }

  @Get()
  findTree() {
    return this.categoriesService.findTree();
  }
}
