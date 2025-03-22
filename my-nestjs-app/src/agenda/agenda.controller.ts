import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { CreateAgendaDto, AgendaStatus } from './dto/create-agenda.dto';
import { UpdateAgendaDto } from './dto/update-agenda.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/roles.guard';
import { Roles } from '../roles/decorators/roles.decorator';

/**
 * @class AgendaController
 * @description Controller handling agenda-related HTTP requests
 */
@Controller('api/agenda')
@UseGuards(JwtAuthGuard)
export class AgendaController {
  private readonly logger = new Logger(AgendaController.name);
  constructor(private readonly agendaService: AgendaService) {}

  /**
   * Creates a new agenda item.
   * Only administrators and managers can create agenda items.
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  create(@Body() createAgendaDto: CreateAgendaDto, @Request() req) {
    this.logger.debug(
      `User trying to create agenda: ${JSON.stringify({
        id: req.user.id,
        roles: req.user.roles,
      })}`,
    );
    return this.agendaService.create(createAgendaDto, req.user.id);
  }

  /**
   * Retrieves all agenda items with optional filtering.
   * Admins and managers can see all agendas, employees only see their own.
   */
  @Get()
  async findAll(
    @Request() req,
    @Query('date') dateStr?: string,
    @Query('status') status?: AgendaStatus,
  ) {
    const date = dateStr ? new Date(dateStr) : undefined;
    const params: any = { date, status };

    // If not admin or manager, restrict to user's own agendas
    const userRoles = req.user.roles.map((r) => r.name);
    if (!userRoles.includes('ADMIN') && !userRoles.includes('MANAGER')) {
      params.userId = req.user.id;
    }

    return this.agendaService.findAll(params);
  }

  /**
   * Retrieves a specific agenda item by ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agendaService.findOne(id);
  }

  /**
   * Updates an agenda item.
   * Only administrators and managers can update agenda items.
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  update(@Param('id') id: string, @Body() updateAgendaDto: UpdateAgendaDto) {
    return this.agendaService.update(id, updateAgendaDto);
  }

  /**
   * Removes an agenda item.
   * Only administrators and managers can delete agenda items.
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  remove(@Param('id') id: string) {
    return this.agendaService.remove(id);
  }

  /**
   * Assigns users to an agenda item.
   * Only administrators and managers can assign users.
   */
  @Post(':id/assign')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  assignUsers(@Param('id') id: string, @Body() body: { userIds: string[] }) {
    return this.agendaService.assignUsers(id, body.userIds);
  }

  /**
   * Updates the status of an agenda item.
   * Only administrators and managers can update status.
   * When status is changed to COMPLETED, assigned users are notified.
   */
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: AgendaStatus },
  ) {
    return this.agendaService.updateStatus(id, body.status);
  }

  @Get('check-auth')
  checkAuth(@Request() req) {
    this.logger.debug(
      `User auth check: ${JSON.stringify({
        id: req.user.id,
        roles: req.user.roles,
        roleUsers: req.user.roleUsers,
      })}`,
    );
    return {
      message: 'You are authenticated',
      user: {
        id: req.user.id,
        email: req.user.email,
        roles: req.user.roles,
      },
    };
  }
}
