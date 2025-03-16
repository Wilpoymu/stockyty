import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Provider } from '@prisma/client';

interface PrismaError {
  code?: string;
  meta?: {
    target?: string[];
    [key: string]: any;
  };
}

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  async create(createProviderDto: CreateProviderDto): Promise<Provider> {
    const {
      name,
      code,
      email,
      phone,
      country,
      city,
      address,
      status,
      contactName,
      taxNumber,
    } = createProviderDto;

    if (!name || !email || !phone || !address || !contactName) {
      throw new BadRequestException('Todos los campos son obligatorios');
    }

    const existingProvider = await this.prisma.provider.findFirst({
      where: {
        OR: [{ email }, { contactName }],
      },
    });
    if (existingProvider) {
      throw new BadRequestException('El proveedor ya está registrado');
    }

    try {
      const provider = await this.prisma.provider.create({
        data: {
          name,
          code,
          email,
          phone,
          country,
          city,
          status,
          address,
          contactName,
          taxNumber,
        },
      });
      return provider;
    } catch (error: unknown) {
      const prismaError = error as PrismaError;
      if (prismaError.code === 'P2002') {
        const target = Array.isArray(prismaError.meta?.target)
          ? prismaError.meta.target
          : [];
        if (target.includes('Provider_email_key')) {
          throw new BadRequestException(
            'El email del proveedor ya está registrado',
          );
        }
        if (target.includes('Provider_documentNumber_key')) {
          throw new BadRequestException(
            'El número de documento del proveedor ya está registrado',
          );
        }
        throw new BadRequestException(
          `Unique constraint failed on: ${target.join(', ') || 'unknown field'}`,
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<Provider[]> {
    const providers = await this.prisma.provider.findMany();
    if (providers.length === 0) {
      throw new NotFoundException('No se encontraron proveedores');
    }
    return providers;
  }

  async findOne(id: string): Promise<Provider | null> {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
    }

    const provider = await this.prisma.provider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    return provider;
  }

  async update(
    id: string,
    updateProviderDto: UpdateProviderDto,
  ): Promise<Provider> {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
    }

    const existingProvider = await this.prisma.provider.findUnique({
      where: { id },
    });

    if (!existingProvider) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    if (Object.keys(updateProviderDto).length === 0) {
      throw new BadRequestException('No hay datos para actualizar');
    }

    return this.prisma.provider.update({
      where: { id },
      data: updateProviderDto,
    });
  }

  async remove(id: string): Promise<Provider> {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
    }

    const existingProvider = await this.prisma.provider.findUnique({
      where: { id },
    });

    if (!existingProvider) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    return this.prisma.provider.delete({
      where: { id },
    });
  }
}
