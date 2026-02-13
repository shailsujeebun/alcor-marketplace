import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MANAGER')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // ─── Marketplaces ────────────────────────────────────

  @Post('marketplaces')
  createMarketplace(@Body() body: { key: string; name: string }) {
    return this.adminService.createMarketplace(body);
  }

  @Get('marketplaces')
  getMarketplaces() {
    return this.adminService.getMarketplaces();
  }

  @Patch('marketplaces/:id')
  updateMarketplace(@Param('id', ParseIntPipe) id: number, @Body() body: { name?: string; isActive?: boolean }) {
    return this.adminService.updateMarketplace(id, body);
  }

  // ─── Categories ──────────────────────────────────────

  @Post('categories')
  createCategory(@Body() body: {
    marketplaceId: number;
    name: string;
    slug: string;
    parentId?: number;
    sortOrder?: number;
  }) {
    return this.adminService.createCategory(body);
  }

  @Patch('categories/:id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      name?: string;
      slug?: string;
      parentId?: number;
      sortOrder?: number;
    }
  ) {
    return this.adminService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCategory(id);
  }

  // ─── Form Templates ──────────────────────────────────

  @Post('templates')
  createTemplate(@Body() body: { categoryId: number; name?: string; fields: any[] }) {
    return this.adminService.createTemplate(body);
  }

  @Get('templates/:id')
  getTemplate(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getTemplate(id);
  }

  @Patch('templates/:id')
  updateTemplate(@Param('id', ParseIntPipe) id: number, @Body() body: { fields: any[] }) {
    return this.adminService.updateTemplate(id, body);
  }
}
