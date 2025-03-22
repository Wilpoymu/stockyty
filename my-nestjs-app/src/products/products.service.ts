import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from '@prisma/client';

interface PrismaError {
  code?: string;
  meta?: {
    target?: string[];
    [key: string]: any;
  };
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const {
      name,
      code,
      typeBarcode,
      cost,
      price,
      brandId,
      taxMethod,
      image,
      note,
      type,
      stock,
      status,
      sku,
      categoryId,
    } = createProductDto;

    // Validar que los campos obligatorios no sean nulos o indefinidos
    if (
      !name ||
      !cost ||
      !typeBarcode ||
      price === undefined ||
      !status ||
      !note ||
      stock === undefined ||
      !type ||
      !categoryId ||
      !sku
    ) {
      throw new BadRequestException(
        'Todos los campos obligatorios deben ser proporcionados',
      );
    }

    // Validar que el precio no sea negativo
    if (price < 0) {
      throw new BadRequestException('El precio no puede ser negativo');
    }

    // Validar que el stock no sea negativo
    if (stock < 0) {
      throw new BadRequestException('El stock no puede ser negativo');
    }

    // Validar que el nombre y el SKU no estén vacíos
    if (name.trim() === '' || sku.trim() === '') {
      throw new BadRequestException(
        'El nombre y el SKU no pueden estar vacíos',
      );
    }

    const existingProduct = await this.prisma.product.findFirst({
      where: {
        OR: [{ name }, { sku }],
      },
    });
    if (existingProduct) {
      throw new ConflictException('El producto ya se encuentra registrado');
    }

    // Asegúrate de que el stock sea al menos 1
    const validatedStock = stock < 1 ? 1 : stock;

    try {
      const product = await this.prisma.product.create({
        data: {
          name,
          code: code ?? null,
          typeBarcode,
          cost,
          price,
          brandId: brandId ?? undefined,
          taxMethod,
          image,
          note,
          type,
          stock: validatedStock,
          status,
          sku,
          categoryId,
        },
      });
      return product;
    } catch (error: unknown) {
      const prismaError = error as PrismaError;
      if (prismaError.code == 'P2002') {
        const target = Array.isArray(prismaError.meta?.target)
          ? prismaError.meta.target
          : [];
        if (target.includes('Product_name_key')) {
          throw new BadRequestException(
            'El nombre del producto ya está registrado',
          );
        }
        if (target.includes('Product_sku_key')) {
          throw new BadRequestException(
            'El código del producto ya está registrado',
          );
        }
        throw new BadRequestException(
          `Unique constraint failed on: ${target.join(',') || 'unknown field'}`,
        );
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    // Validar que el precio no sea negativo
    if (updateProductDto.price !== undefined && updateProductDto.price < 0) {
      throw new BadRequestException('El precio no puede ser negativo');
    }

    // Validar que el stock no sea negativo
    if (updateProductDto.stock !== undefined && updateProductDto.stock < 0) {
      throw new BadRequestException('El stock no puede ser negativo');
    }

    // Asegurar que el stock sea al menos 1
    const validatedStock =
      updateProductDto.stock !== undefined && updateProductDto.stock < 1
        ? 1
        : updateProductDto.stock;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        stock: validatedStock,
      },
    });
  }

  remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
