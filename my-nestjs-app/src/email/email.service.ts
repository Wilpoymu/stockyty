import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject('EMAIL_TRANSPORTER') private transporter: nodemailer.Transporter,
    private configService: ConfigService
  ) {}

  async sendMail(to: string, subject: string, html: string) {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM') || this.configService.get<string>('EMAIL_USER'),
      to,
      subject,
      html,
    };
    
    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email enviado a ${to}: ${info.messageId}`);
      return info;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      this.logger.error(`Error al enviar email a ${to}: ${errorMessage}`);
      throw new Error(`No se pudo enviar el correo: ${errorMessage}`);
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Conexión SMTP verificada correctamente');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      this.logger.error(`Error al verificar la conexión SMTP: ${errorMessage}`);
      return false;
    }
  }
}
