import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

interface PrismaError {
  code?: string;
  meta?: {
    target?: string[];
    [key: string]: any;
  };
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, code, description, type } = createCategoryDto;

    if (!name || !description || !type) {
      throw new BadRequestException('Todos los campos son obligatorios');
    }

    const existingCategory = await this.prisma.category.findFirst({
      where: {
        OR: [{ name }, { code }],
      },
    });
    if (existingCategory) {
      throw new BadRequestException('La categoria ya se encuentra registrada');
    }
    try {
      const category = await this.prisma.category.create({
        data: { name, code, description, type },
      });
      return category;
    } catch (error: unknown) {
      const prismaError = error as PrismaError;
      if (prismaError.code === 'P2002') {
        const target = Array.isArray(prismaError.meta?.target)
          ? prismaError.meta.target
          : [];
        if (target.includes('Category_name_key')) {
          throw new BadRequestException(
            'El nombre de la categoria ya esta registrado',
          );
        }
        throw new BadRequestException(
          `Unique constraint failed on: ${target.join(',') || 'unknown field'}`,
        );
      }
      throw error;
    }
  }

  async findAll() {
    const categories = await this.prisma.category.findMany();
    if (categories.length === 0) {
      throw new NotFoundException('No se encontraron categorías');
    }
    return categories;
  }

  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
    }

    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
    }

    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Categoría no encontrada');
    }

    if (Object.keys(updateCategoryDto).length === 0) {
      throw new BadRequestException('No hay datos para actualizar');
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
    }

    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
