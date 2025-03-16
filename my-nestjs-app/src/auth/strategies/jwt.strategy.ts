import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretkey',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roleUsers: {
          include: { role: true },
        },
      },
    });

    if (!user || user.status !== 1) {
      throw new UnauthorizedException();
    }

    const roles = user.roleUsers.map((ru) => ru.role.name);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      roles,
    };
  }
}
