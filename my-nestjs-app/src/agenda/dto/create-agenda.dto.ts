export enum AgendaStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export class CreateAgendaDto {
  date!: Date;
  time!: string;
  description!: string;
  status: AgendaStatus = AgendaStatus.PENDING;
  assignedUserIds?: string[];
  notes?: string;
}
