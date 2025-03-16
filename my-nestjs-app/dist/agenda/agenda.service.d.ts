import { PrismaService } from '../prisma/prisma.service';
import { CreateAgendaDto, AgendaStatus } from './dto/create-agenda.dto';
import { UpdateAgendaDto } from './dto/update-agenda.dto';
import { Agenda } from '@prisma/client';
export declare class AgendaService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(createAgendaDto: CreateAgendaDto, userId: string): Promise<Agenda>;
    findAll(params?: {
        userId?: string;
        date?: Date;
        status?: AgendaStatus;
    }): Promise<Agenda[]>;
    findOne(id: string): Promise<Agenda>;
    update(id: string, updateAgendaDto: UpdateAgendaDto): Promise<Agenda>;
    remove(id: string): Promise<Agenda>;
    assignUsers(agendaId: string, userIds: string[]): Promise<void>;
    updateStatus(id: string, status: AgendaStatus): Promise<Agenda>;
}
