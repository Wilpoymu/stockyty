import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createHash } from 'crypto';

@Injectable()
export class TokenBlacklistService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async blacklistToken(token: string): Promise<void> {
    try {
      // Decode the token to get its expiry time
      const decoded = this.jwtService.decode(token);
      if (decoded && decoded['exp']) {
        // Convert expiry from seconds to milliseconds
        const expiryDate = new Date(decoded['exp'] * 1000);

        // Hash the token
        const tokenHash = this.hashToken(token);

        // Store in database with both the original token and its hash
        await this.prisma.blacklistedToken.create({
          data: {
            token,
            tokenHash,
            expiresAt: expiryDate,
          },
        });
      }
    } catch (error) {
      console.error('Error blacklisting token:', error);
    }
  }

  async isBlacklisted(token: string): Promise<boolean> {
    if (!token) return false;

    // Hash the token for lookup
    const tokenHash = this.hashToken(token);

    const blacklistedToken = await this.prisma.blacklistedToken.findFirst({
      where: {
        tokenHash,
      },
    });

    return !!blacklistedToken;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.prisma.blacklistedToken.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });
  }
}
