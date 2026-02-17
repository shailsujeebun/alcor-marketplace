import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OptionsService } from './options.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('options')
export class OptionsController {
  constructor(private readonly optionsService: OptionsService) {}

  @Get('brands')
  getBrands(@Query('categoryId') categoryId?: string) {
    return this.optionsService.getBrandOptions(categoryId);
  }

  @Get('models')
  getModels(@Query('brandId') brandId?: string) {
    return this.optionsService.getModelOptions(brandId);
  }

  @Post('resolve')
  resolve(
    @Body()
    body: {
      optionsQuery?: Record<string, any>;
      depends?: Record<string, any>;
    },
  ) {
    return this.optionsService.resolveDbOptions(body.optionsQuery, body.depends);
  }

  @Post('brands')
  @UseGuards(JwtAuthGuard)
  createBrand(@Body() body: { name: string; categoryId?: string }) {
    return this.optionsService.createBrand(body.name, body.categoryId);
  }

  @Post('models')
  @UseGuards(JwtAuthGuard)
  createModel(
    @Body() body: { name: string; brandId?: string; categoryId?: string },
  ) {
    return this.optionsService.createModel(
      body.name,
      body.brandId,
      body.categoryId,
    );
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  createCategory(
    @Body()
    body: {
      name: string;
      marketplaceId: string;
      parentId?: string;
    },
  ) {
    return this.optionsService.createCategory(body);
  }

  @Post('countries')
  @UseGuards(JwtAuthGuard)
  createCountry(@Body() body: { name: string; iso2?: string }) {
    return this.optionsService.createCountry(body.name, body.iso2);
  }

  @Post('cities')
  @UseGuards(JwtAuthGuard)
  createCity(@Body() body: { name: string; countryId: string }) {
    return this.optionsService.createCity(body.name, body.countryId);
  }
}
