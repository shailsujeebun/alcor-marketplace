import { Controller, Post, Get, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateConversationDto, SendMessageDto } from './dto/create-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('conversations')
  startConversation(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateConversationDto,
  ) {
    return this.messagesService.startConversation(userId, dto.listingId, dto.sellerId, dto.body);
  }

  @Get('conversations')
  getConversations(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.messagesService.getUserConversations(userId, page ? +page : 1, limit ? +limit : 20);
  }

  // ─── Admin endpoints (BEFORE :id to avoid route conflicts) ─

  @Get('conversations/all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  getAllConversations(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.messagesService.findAllConversations(
      page ? +page : 1,
      limit ? +limit : 20,
      search,
    );
  }

  @Get('conversations/:id/admin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  getConversationAdmin(@Param('id') id: string) {
    return this.messagesService.getConversationAdmin(id);
  }

  @Delete('conversations/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  deleteConversation(@Param('id') id: string) {
    return this.messagesService.deleteConversation(id);
  }

  // ─── User endpoints ─────────────────────────────────

  @Get('conversations/:id')
  getConversation(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.messagesService.getConversation(id, userId);
  }

  @Post('conversations/:id')
  sendMessage(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(id, userId, dto.body);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser('id') userId: string) {
    const count = await this.messagesService.getUnreadCount(userId);
    return { count };
  }
}
