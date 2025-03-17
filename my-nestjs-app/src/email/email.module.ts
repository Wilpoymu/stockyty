import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';

@Module({})
export class EmailModule {
  static register(): DynamicModule {
    return {
      module: EmailModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'EMAIL_TRANSPORTER',
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            return nodemailer.createTransport({
              host: configService.get<string>('EMAIL_HOST'),
              port: parseInt(
                configService.get<string>('EMAIL_PORT') || '587',
                10,
              ),
              secure: configService.get<string>('EMAIL_SECURE') === 'true',
              auth: {
                user: configService.get<string>('EMAIL_USER'),
                pass: configService.get<string>('EMAIL_PASSWORD'),
              },
              ...(configService.get<string>('EMAIL_TLS') === 'true'
                ? { requireTLS: true }
                : {}),
            });
          },
        },
        EmailService,
      ],
      exports: [EmailService],
    };
  }
}
