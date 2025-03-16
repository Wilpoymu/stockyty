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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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

      // Crear el usuario
      const user = await this.prisma.user.create({
        data: {
          firstname,
          lastname,
          username,
          email,
          password: hashedPassword,
          phone,
          status,
          avatar,
          documentNumber,
          address,
          roleUsers: {
            create: {
              role: {
                connect: { id: role_id },
              },
            },
          },
        },
      });

      // No devolvemos la contraseña - use underscore for unused variable
      const { password: _, ...result } = user;
      // Remove the void statement which is now unnecessary
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      } else {
        throw new BadRequestException('An unexpected error occurred.');
      }
    }
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

    // Aquí normalmente enviarías un correo electrónico con el token
    // Por ahora, solo devolvemos el token para pruebas
    return {
      message: 'Instrucciones enviadas al correo electrónico',
      resetToken, // En producción no deberías devolver esto, es solo para pruebas
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
