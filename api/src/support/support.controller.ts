import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateTicketDto,
  ReplyTicketDto,
  UpdateTicketDto,
} from './dto/support.dto';

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  createTicket(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTicketDto,
  ) {
    return this.supportService.createTicket(
      userId,
      dto.subject,
      dto.body,
      dto.priority,
    );
  }

  @Get('tickets')
  getMyTickets(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.supportService.getUserTickets(
      userId,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Get('tickets/all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  getAllTickets(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.supportService.getAllTickets(
      page ? +page : 1,
      limit ? +limit : 20,
      status,
    );
  }

  @Get('tickets/:id')
  getTicket(@CurrentUser() user: any, @Param('id') id: string) {
    const isAdmin = user.role === 'ADMIN' || user.role === 'MANAGER';
    return this.supportService.getTicket(id, user.id, isAdmin);
  }

  @Post('tickets/:id/reply')
  replyToTicket(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ReplyTicketDto,
  ) {
    const isStaff = user.role === 'ADMIN' || user.role === 'MANAGER';
    return this.supportService.replyToTicket(id, user.id, dto.body, isStaff);
  }

  @Patch('tickets/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  updateTicket(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.supportService.updateTicket(id, dto);
  }
}
