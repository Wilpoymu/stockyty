import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { comparePassword, hashPassword } from '../utils/bcrypt.util';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { randomBytes } from 'crypto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { EmailService } from '../email/email.service';
import { recoveryPasswordTemplate } from '../email/templates/recovery-password.template';
import { emailVerificationTemplate } from '../email/templates/email-verification.template';
import { welcomeTemplate } from '../email/templates/welcome.template';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roleUsers: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar si el email está confirmado
    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Email no verificado. Por favor verifique su correo electrónico.',
      );
    }

    // Return user without password - use an underscore to indicate intentionally unused variable
    const { password: _password, ...result } = user;
    return result;
  }

  async login(user: Omit<User, 'password'>) {
    // Fetch user roles to include in the payload
    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        roleUsers: {
          include: { role: true },
        },
      },
    });

    // Handle potential null value
    if (!userData) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const roles = userData.roleUsers.map((ru) => ru.role.name);

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        roles,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    try {
      // Create a new object instead of modifying the DTO directly
      const userData = {
        ...createUserDto,
        role_id: createUserDto.role_id || '4', // Asumiendo que 4 es el ID del rol "CLIENT"
      };

      // En lugar de usar UsersService, implementamos la lógica directamente
      const {
        firstname,
        lastname,
        username,
        email,
        password,
        phone,
        status,
        avatar,
        role_id,
        documentNumber,
        address,
      } = userData;

      // Validar que el usuario no exista
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ email }, { documentNumber }],
        },
      });

      if (existingUser) {
        throw new Error('El usuario ya está registrado');
      }

      // Verificar que el rol existe
      const role = await this.prisma.role.findUnique({
        where: { id: role_id },
      });

      if (!role) {
        throw new Error(`Role with id ${role_id} not found`);
      }

      // Hashear la contraseña
      const hashedPassword = await hashPassword(password);

      // Generar token de verificación
      const verificationToken = randomBytes(32).toString('hex');
      const verificationTokenExpiry = new Date(Date.now() + 24 * 3600000); // 24 horas

      // Crear el usuario - ensure email is stored in lowercase
      const user = await this.prisma.user.create({
        data: {
          firstname,
          lastname,
          username,
          email: email.toLowerCase(), // Store email in lowercase for consistent comparison
          password: hashedPassword,
          phone,
          status,
          avatar,
          documentNumber,
          address,
          isEmailVerified: false,
          emailVerificationToken: verificationToken,
          emailVerificationTokenExpiry: verificationTokenExpiry,
          roleUsers: {
            create: {
              role: {
                connect: { id: role_id },
              },
            },
          },
        },
      });

      // Enviar email de verificación
      await this.sendEmailVerification(
        user.id,
        firstname,
        email,
        verificationToken,
      );

      // También enviar email de bienvenida
      const welcomeLink = `${process.env.FRONTEND_URL}/login`;
      const welcomeHtml = welcomeTemplate(firstname, welcomeLink);
      await this.emailService.sendMail(
        email,
        '¡Bienvenido a nuestra plataforma!',
        welcomeHtml,
      );

      // No devolvemos la contraseña - use underscore for unused variable
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      } else {
        throw new BadRequestException('An unexpected error occurred.');
      }
    }
  }

  // Método privado para enviar el email de verificación
  private async sendEmailVerification(
    userId: string,
    firstname: string,
    email: string,
    token: string,
  ) {
    try {
      const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
      const html = emailVerificationTemplate(firstname, verificationLink);
      await this.emailService.sendMail(
        email,
        'Verificación de Correo Electrónico',
        html,
      );
    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  }

  // Método para verificar el email
  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Token inválido o expirado');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: '',
        emailVerificationTokenExpiry: null,
      },
    });

    return { message: 'Correo electrónico verificado con éxito' };
  }

  // Método para enviar email de verificación (para usuarios autenticados)
  async sendVerificationEmail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.isEmailVerified) {
      return { message: 'El correo electrónico ya está verificado' };
    }

    // Generar nuevo token
    const verificationToken = randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 3600000); // 24 horas

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpiry: verificationTokenExpiry,
      },
    });

    await this.sendEmailVerification(
      userId,
      user.firstname,
      user.email,
      verificationToken,
    );

    return { message: 'Email de verificación enviado' };
  }

  // Método para reenviar email de verificación (sin estar autenticado)
  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return {
        message:
          'Si el correo existe y no está verificado, recibirá instrucciones para la verificación',
      };
    }

    if (user.isEmailVerified) {
      return {
        message:
          'Si el correo existe y no está verificado, recibirá instrucciones para la verificación',
      };
    }

    // Generar nuevo token
    const verificationToken = randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 3600000); // 24 horas

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpiry: verificationTokenExpiry,
      },
    });

    await this.sendEmailVerification(
      user.id,
      user.firstname,
      user.email,
      verificationToken,
    );

    return {
      message:
        'Si el correo existe y no está verificado, recibirá instrucciones para la verificación',
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          roleUsers: {
            include: { role: true },
          },
        },
      });

      if (!user || user.status !== 1) {
        throw new UnauthorizedException('Token inválido o usuario inactivo');
      }

      return {
        isValid: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      };
    } catch {
      return {
        isValid: false,
        message: 'Token inválido o expirado',
      };
    }
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return {
        message:
          'Si el correo existe, recibirá instrucciones para restablecer su contraseña',
      };
    }

    // Genera un token único
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora de validez

    // Guarda el token en la base de datos
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Construye el enlace de recuperación (ajústalo según tu frontend)
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Genera el HTML usando el template y envía el email
    const html = recoveryPasswordTemplate(user.firstname, resetLink);
    await this.emailService.sendMail(email, 'Recuperación de Contraseña', html);

    return {
      message: 'Instrucciones enviadas al correo electrónico',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    // Busca un usuario con el token dado y que no haya expirado
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Token inválido o expirado');
    }

    // Hashea la nueva contraseña
    const hashedPassword = await hashPassword(newPassword);

    // Actualiza el usuario y limpia los campos del token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Contraseña restablecida con éxito' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roleUsers: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const roles = user.roleUsers.map((ru) => ru.role.name);

    // Build a new object with only the fields we want to return
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      phone: user.phone,
      status: user.status,
      avatar: user.avatar,
      documentNumber: user.documentNumber,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles,
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    // Busca el usuario
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verifica la contraseña actual
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Hashea y establece la nueva contraseña
    const hashedPassword = await hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return { message: 'Contraseña cambiada con éxito' };
  }
}
