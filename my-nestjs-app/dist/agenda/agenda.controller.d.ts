import { AgendaService } from './agenda.service';
import { CreateAgendaDto, AgendaStatus } from './dto/create-agenda.dto';
import { UpdateAgendaDto } from './dto/update-agenda.dto';
export declare class AgendaController {
    private readonly agendaService;
    private readonly logger;
    constructor(agendaService: AgendaService);
    create(createAgendaDto: CreateAgendaDto, req: any): Promise<{
        id: string;
        date: Date;
        time: string;
        description: string;
        status: string;
        notes: string | null;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(req: any, dateStr?: string, status?: AgendaStatus): Promise<{
        id: string;
        date: Date;
        time: string;
        description: string;
        status: string;
        notes: string | null;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        date: Date;
        time: string;
        description: string;
        status: string;
        notes: string | null;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateAgendaDto: UpdateAgendaDto): Promise<{
        id: string;
        date: Date;
        time: string;
        description: string;
        status: string;
        notes: string | null;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        date: Date;
        time: string;
        description: string;
        status: string;
        notes: string | null;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    assignUsers(id: string, body: {
        userIds: string[];
    }): Promise<void>;
    updateStatus(id: string, body: {
        status: AgendaStatus;
    }): Promise<{
        id: string;
        date: Date;
        time: string;
        description: string;
        status: string;
        notes: string | null;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    checkAuth(req: any): {
        message: string;
        user: {
            id: any;
            email: any;
            roles: any;
        };
    };
}
