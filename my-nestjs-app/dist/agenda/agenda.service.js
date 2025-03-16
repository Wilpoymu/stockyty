"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AgendaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgendaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const create_agenda_dto_1 = require("./dto/create-agenda.dto");
let AgendaService = AgendaService_1 = class AgendaService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AgendaService_1.name);
    }
    async create(createAgendaDto, userId) {
        try {
            const { assignedUserIds, ...agendaData } = createAgendaDto;
            this.logger.debug(`Creating agenda with data: ${JSON.stringify(agendaData)}`);
            if (!agendaData.date || !agendaData.time || !agendaData.description) {
                throw new common_1.BadRequestException('Missing required fields: date, time, or description');
            }
            const agenda = await this.prisma.agenda.create({
                data: {
                    date: agendaData.date,
                    time: agendaData.time,
                    description: agendaData.description,
                    status: agendaData.status || create_agenda_dto_1.AgendaStatus.PENDING,
                    notes: agendaData.notes,
                    createdBy: {
                        connect: { id: userId },
                    },
                },
            });
            if (assignedUserIds && assignedUserIds.length > 0) {
                await this.assignUsers(agenda.id, assignedUserIds);
            }
            return agenda;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Error creating agenda: ${errorMessage}`, errorStack);
            throw error;
        }
    }
    async findAll(params) {
        const { userId, date, status } = params || {};
        const where = {};
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Agenda with ID ${id} not found`);
        }
        return agenda;
    }
    async update(id, updateAgendaDto) {
        const { assignedUserIds, ...agendaData } = updateAgendaDto;
        const updatedAgenda = await this.prisma.agenda.update({
            where: { id },
            data: agendaData,
        });
        if (assignedUserIds !== undefined) {
            await this.assignUsers(id, assignedUserIds);
        }
        return this.findOne(id);
    }
    async remove(id) {
        await this.prisma.agendaAssignment.deleteMany({
            where: { agendaId: id }
        });
        return this.prisma.agenda.delete({
            where: { id },
        });
    }
    async assignUsers(agendaId, userIds) {
        await this.prisma.agendaAssignment.deleteMany({
            where: { agendaId }
        });
        if (userIds.length > 0) {
            await this.prisma.agendaAssignment.createMany({
                data: userIds.map(userId => ({
                    agendaId,
                    userId
                }))
            });
        }
    }
    async updateStatus(id, status) {
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
        if (status === create_agenda_dto_1.AgendaStatus.COMPLETED) {
            console.log(`Agenda ${id} marked as completed. Notification should be sent to assigned users.`);
        }
        return updatedAgenda;
    }
};
exports.AgendaService = AgendaService;
exports.AgendaService = AgendaService = AgendaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AgendaService);
//# sourceMappingURL=agenda.service.js.map