export declare enum AgendaStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED"
}
export declare class CreateAgendaDto {
    date: Date;
    time: string;
    description: string;
    status: AgendaStatus;
    assignedUserIds?: string[];
    notes?: string;
}
