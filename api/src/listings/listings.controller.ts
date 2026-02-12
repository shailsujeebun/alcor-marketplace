import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingQueryDto } from './dto/listing-query.dto';
import { ModerateListingDto } from './dto/moderate-listing.dto';
import { ValidateDraftDto } from './dto/validate-draft.dto';
import { UpdateListingContactDto } from './dto/update-listing-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller()
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post('listings/draft/validate')
  @UseGuards(JwtAuthGuard)
  validateDraft(@Body() dto: ValidateDraftDto) {
    return this.listingsService.validateDraft(dto.categoryId, dto.attributes);
  }

  @Post('listings')
  @UseGuards(JwtAuthGuard)
  create(
    @Body() dto: CreateListingDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.listingsService.create(dto, user.id, user.role);
  }

  @Get('listings')
  findAll(@Query() query: ListingQueryDto) {
    return this.listingsService.findAll(query);
  }

  @Get('companies/:companyId/listings')
  findByCompany(
    @Param('companyId') companyId: string,
    @Query() query: ListingQueryDto,
  ) {
    return this.listingsService.findByCompany(companyId, query);
  }

  @Get('listings/:id')
  findById(@Param('id') id: string) {
    return this.listingsService.findById(id);
  }

  @Patch('listings/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateListingDto) {
    return this.listingsService.update(id, dto);
  }

  // ─── Step 2: Attributes ─────────────────────────────

  @Put('listings/:id/attributes')
  @UseGuards(JwtAuthGuard)
  updateAttributes(
    @Param('id') id: string,
    @Body() body: { attributes: Record<string, any> },
  ) {
    return this.listingsService.updateAttributes(id, body.attributes);
  }

  @Put('listings/:id/contact')
  @UseGuards(JwtAuthGuard)
  updateContact(@Param('id') id: string, @Body() dto: UpdateListingContactDto) {
    return this.listingsService.updateContact(id, dto);
  }

  // ─── Status Actions (authenticated user) ────────────

  @Post('listings/:id/submit')
  @UseGuards(JwtAuthGuard)
  submit(@Param('id') id: string) {
    return this.listingsService.submitForModeration(id);
  }

  @Post('listings/:id/pause')
  @UseGuards(JwtAuthGuard)
  pause(@Param('id') id: string) {
    return this.listingsService.pause(id);
  }

  @Post('listings/:id/resume')
  @UseGuards(JwtAuthGuard)
  resume(@Param('id') id: string) {
    return this.listingsService.resume(id);
  }

  @Post('listings/:id/resubmit')
  @UseGuards(JwtAuthGuard)
  resubmit(@Param('id') id: string) {
    return this.listingsService.resubmit(id);
  }

  // ─── Moderation (admin/manager only) ────────────────

  @Post('listings/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  approve(@Param('id') id: string) {
    return this.listingsService.approve(id);
  }

  @Post('listings/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  reject(@Param('id') id: string, @Body() dto: ModerateListingDto) {
    return this.listingsService.reject(id, dto.moderationReason ?? '');
  }

  @Post('listings/:id/remove')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.listingsService.removeListing(id);
  }
}
