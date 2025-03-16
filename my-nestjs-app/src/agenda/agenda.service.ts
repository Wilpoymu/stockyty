import { Injectable, NotFoundException, ForbiddenException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgendaDto, AgendaStatus } from './dto/create-agenda.dto';
import { UpdateAgendaDto } from './dto/update-agenda.dto';
import { Agenda } from '@prisma/client';

/**
 * @class AgendaService
 * @description Service for managing agenda items in the system.
 */
@Injectable()
export class AgendaService {
  private readonly logger = new Logger(AgendaService.name);
  
  /**
   * Creates an instance of AgendaService.
   * @param {PrismaService} prisma - The Prisma service instance.
   */
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new agenda item.
   *
   * @param {CreateAgendaDto} createAgendaDto - The DTO containing agenda creation information.
   * @param {string} userId - The ID of the user creating the agenda.
   * @returns {Promise<Agenda>} A promise that resolves with the created agenda.
   */
  async create(createAgendaDto: CreateAgendaDto, userId: string): Promise<Agenda> {
    try {
      const { assignedUserIds, ...agendaData } = createAgendaDto;
      
      this.logger.debug(`Creating agenda with data: ${JSON.stringify(agendaData)}`);
      
      // Validate required fields
      if (!agendaData.date || !agendaData.time || !agendaData.description) {
        throw new BadRequestException('Missing required fields: date, time, or description');
      }

      // Create the agenda item
      const agenda = await this.prisma.agenda.create({
        data: {
          date: agendaData.date,
          time: agendaData.time,
          description: agendaData.description,
          status: agendaData.status || AgendaStatus.PENDING,
          notes: agendaData.notes,
          createdBy: {
            connect: { id: userId },
          },
        },
      });

      // If there are assigned users, create the assignments
      if (assignedUserIds && assignedUserIds.length > 0) {
        await this.assignUsers(agenda.id, assignedUserIds);
      }

      return agenda;
    } catch (error: unknown) {
      // Properly handle the unknown error type
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      this.logger.error(`Error creating agenda: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Retrieves all agenda items with optional filtering.
   *
   * @param {Object} params - The filter parameters.
   * @returns {Promise<Agenda[]>} A promise that resolves with an array of agenda items.
   */
  async findAll(params?: {
    userId?: string;
    date?: Date;
    status?: AgendaStatus;
  }): Promise<Agenda[]> {
    const { userId, date, status } = params || {};
    
    const where: any = {};
    
    if (date) {
      where.date = date;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.OR = [
        { createdById: userId },
        { agendaAssignments: { some: { userId } } }
      ];
    }
    
    return this.prisma.agenda.findMany({
      where,
      include: {
        createdBy: true,
        agendaAssignments: {
          include: {
            user: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });
  }

  /**
   * Retrieves a single agenda item by ID.
   *
   * @param {string} id - The ID of the agenda item to retrieve.
   * @returns {Promise<Agenda>} A promise that resolves with the found agenda item.
   * @throws {NotFoundException} If the agenda item is not found.
   */
  async findOne(id: string): Promise<Agenda> {
    const agenda = await this.prisma.agenda.findUnique({
      where: { id },
      include: {
        createdBy: true,
        agendaAssignments: {
          include: {
            user: true
          }
        }
      }
    });
    
    if (!agenda) {
      throw new NotFoundException(`Agenda with ID ${id} not found`);
    }
    
    return agenda;
  }

  /**
   * Updates an agenda item.
   *
   * @param {string} id - The ID of the agenda item to update.
   * @param {UpdateAgendaDto} updateAgendaDto - The data to update.
   * @returns {Promise<Agenda>} A promise that resolves with the updated agenda item.
   */
  async update(id: string, updateAgendaDto: UpdateAgendaDto): Promise<Agenda> {
    const { assignedUserIds, ...agendaData } = updateAgendaDto;
    
    // Update the agenda item
    const updatedAgenda = await this.prisma.agenda.update({
      where: { id },
      data: agendaData,
    });
    
    // If there are assigned users, update the assignments
    if (assignedUserIds !== undefined) {
      await this.assignUsers(id, assignedUserIds);
    }
    
    return this.findOne(id);
  }

  /**
   * Removes an agenda item.
   *
   * @param {string} id - The ID of the agenda item to remove.
   * @returns {Promise<Agenda>} A promise that resolves with the deleted agenda item.
   */
  async remove(id: string): Promise<Agenda> {
    // First delete all assignments to avoid foreign key constraints
    await this.prisma.agendaAssignment.deleteMany({
      where: { agendaId: id }
    });
    
    return this.prisma.agenda.delete({
      where: { id },
    });
  }

  /**
   * Assigns users to an agenda item.
   *
   * @param {string} agendaId - The ID of the agenda item.
   * @param {string[]} userIds - The IDs of users to assign.
   */
  async assignUsers(agendaId: string, userIds: string[]): Promise<void> {
    // First delete all existing assignments for this agenda
    await this.prisma.agendaAssignment.deleteMany({
      where: { agendaId }
    });
    
    // Create new assignments
    if (userIds.length > 0) {
      await this.prisma.agendaAssignment.createMany({
        data: userIds.map(userId => ({
          agendaId,
          userId
        }))
      });
    }
  }

  /**
   * Updates the status of an agenda item and notifies assigned users if completed.
   *
   * @param {string} id - The ID of the agenda item.
   * @param {AgendaStatus} status - The new status.
   * @returns {Promise<Agenda>} A promise that resolves with the updated agenda item.
   */
  async updateStatus(id: string, status: AgendaStatus): Promise<Agenda> {
    const updatedAgenda = await this.prisma.agenda.update({
      where: { id },
      data: { status },
      include: {
        agendaAssignments: {
          include: {
            user: true
          }
        }
      }
    });
    
    // If status is COMPLETED, notify assigned users
    if (status === AgendaStatus.COMPLETED) {
      // In a real application, this would send notifications to users
      console.log(`Agenda ${id} marked as completed. Notification should be sent to assigned users.`);
      // Implementation for notification system would go here
    }
    
    return updatedAgenda;
  }
}
