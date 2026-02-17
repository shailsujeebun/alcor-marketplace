import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TicketStatus, TicketPriority, NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResponseDto } from '../common';
import { NotificationsService } from '../notifications/notifications.service';

const ticketIncludes = {
  user: { select: { id: true, email: true, firstName: true, lastName: true } },
  assignedTo: {
    select: { id: true, email: true, firstName: true, lastName: true },
  },
  messages: {
    orderBy: { createdAt: 'asc' as const },
    include: {
      sender: {
        select: { id: true, email: true, firstName: true, lastName: true },
      },
    },
  },
};

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createTicket(
    userId: string,
    subject: string,
    body: string,
    priority?: string,
  ) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId,
        subject,
        priority: (priority as TicketPriority) || TicketPriority.MEDIUM,
        messages: {
          create: { senderId: userId, body, isStaff: false },
        },
      },
      include: ticketIncludes,
    });
    return ticket;
  }

  async getUserTickets(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.supportTicket.count({ where: { userId } }),
    ]);
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async getAllTickets(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          assignedTo: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async getTicket(ticketId: string, userId: string, isAdmin: boolean) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: ticketIncludes,
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (!isAdmin && ticket.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return ticket;
  }

  async replyToTicket(
    ticketId: string,
    senderId: string,
    body: string,
    isStaff: boolean,
  ) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    if (!isStaff && ticket.userId !== senderId) {
      throw new ForbiddenException('Access denied');
    }

    const message = await this.prisma.ticketMessage.create({
      data: { ticketId, senderId, body, isStaff },
      include: {
        sender: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    // If staff replies, move to IN_PROGRESS
    if (isStaff && ticket.status === 'OPEN') {
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: TicketStatus.IN_PROGRESS },
      });
    }

    // Notify the ticket owner when staff replies
    if (isStaff && ticket.userId !== senderId) {
      this.notificationsService.create(
        ticket.userId,
        NotificationType.TICKET_REPLY,
        'Відповідь на тікет',
        `Нова відповідь на ваш тікет "${ticket.subject}"`,
        `/cabinet/support/${ticketId}`,
      );
    }

    return message;
  }

  async updateTicket(
    ticketId: string,
    data: { status?: string; assignedToId?: string; priority?: string },
  ) {
    const updateData: any = {};
    if (data.status) {
      updateData.status = data.status as TicketStatus;
      if (data.status === 'CLOSED' || data.status === 'RESOLVED') {
        updateData.closedAt = new Date();
      }
    }
    if (data.assignedToId !== undefined)
      updateData.assignedToId = data.assignedToId || null;
    if (data.priority) updateData.priority = data.priority as TicketPriority;

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        assignedTo: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });
  }
}
