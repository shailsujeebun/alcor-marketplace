import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) { }

  @Get()
  async search(@Query() query: any) {
    // Convert numeric params
    const q = { ...query };
    if (q.priceMin) q.priceMin = Number(q.priceMin);
    if (q.priceMax) q.priceMax = Number(q.priceMax);
    if (q.yearMin) q.yearMin = Number(q.yearMin);
    if (q.yearMax) q.yearMax = Number(q.yearMax);
    if (q.page) q.page = Number(q.page);
    if (q.limit) q.limit = Number(q.limit);

    return this.searchService.search(q);
  }

  @Get('facets')
  async getFacets(@Query() query: any) {
    return this.searchService.getFacets(query);
  }
}
