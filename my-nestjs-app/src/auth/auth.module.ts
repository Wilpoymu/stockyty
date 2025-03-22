import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy'; 
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretkey',
      signOptions: { expiresIn: '24h' },
    }),
    EmailModule.register(),
    ScheduleModule.forRoot(),
  ],
  providers: [AuthService, JwtStrategy, TokenBlacklistService, JwtAuthGuard],
  exports: [AuthService, TokenBlacklistService, JwtAuthGuard, JwtModule],
  controllers: [AuthController],
})
export class AuthModule {}
