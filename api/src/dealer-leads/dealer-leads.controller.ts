import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DealerLeadsService } from './dealer-leads.service';
import { CreateDealerLeadDto } from './dto/create-dealer-lead.dto';
import { UpdateDealerLeadDto } from './dto/update-dealer-lead.dto';
import { DealerLeadQueryDto } from './dto/dealer-lead-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('dealer-leads')
export class DealerLeadsController {
  constructor(private readonly dealerLeadsService: DealerLeadsService) {}

  // Public — anyone can submit a dealer application
  @Post()
  create(@Body() dto: CreateDealerLeadDto) {
    return this.dealerLeadsService.create(dto);
  }

  // Admin/Manager only — list all leads
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findAll(@Query() query: DealerLeadQueryDto) {
    return this.dealerLeadsService.findAll(query);
  }

  // Admin/Manager only — view single lead
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findById(@Param('id') id: string) {
    return this.dealerLeadsService.findById(id);
  }

  // Admin/Manager only — update lead status/assignment
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateDealerLeadDto) {
    return this.dealerLeadsService.update(id, dto);
  }
}
