import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AgendaController } from './agenda.controller';
import { AgendaService } from './agenda.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    AuthModule, // This provides JwtAuthGuard and TokenBlacklistService
    PrismaModule,
  ],
  controllers: [AgendaController],
  providers: [AgendaService, PrismaService],
  exports: [AgendaService],
})
export class AgendaModule {}
