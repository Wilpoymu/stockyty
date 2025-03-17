import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy'; // Updated import path from 'strategies' to 'strategy'
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from '../users/users.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    forwardRef(() => UsersModule), // Usar forwardRef para evitar dependencias circulares // Mantener esta importación para posibles usos futuros
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretkey',
      signOptions: { expiresIn: '24h' },
    }),
    EmailModule.register(), // Cambia esta línea para usar .register()
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
