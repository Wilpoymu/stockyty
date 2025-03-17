import { Module } from '@nestjs/common';
import { AgendaController } from './agenda.controller';
import { AgendaService } from './agenda.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AgendaController],
  providers: [AgendaService, PrismaService],
  exports: [AgendaService],
})
export class AgendaModule {}
