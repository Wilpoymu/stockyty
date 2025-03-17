import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    // Find user with roles
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
      include: {
        roleUsers: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Transform roleUsers to a simpler roles array for easier checking
    const roles = user.roleUsers.map((ru) => ru.role.name);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      roles: roles,
      roleUsers: user.roleUsers, // Keep original structure too
    };
  }
}
