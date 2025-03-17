import {
  IsDate,
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum AgendaStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export class CreateAgendaDto {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date!: Date; // Using definite assignment assertion

  @IsNotEmpty()
  @IsString()
  time!: string; // Using definite assignment assertion

  @IsNotEmpty()
  @IsString()
  description!: string; // Using definite assignment assertion

  @IsOptional()
  @IsEnum(AgendaStatus)
  status: AgendaStatus = AgendaStatus.PENDING;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assignedUserIds?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
