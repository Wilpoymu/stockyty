import { AgendaStatus } from '@prisma/client';
export declare class FilterAgendaDto {
    startDate?: string;
    endDate?: string;
    type?: string;
    status?: AgendaStatus;
}
