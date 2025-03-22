import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderDetailDto } from './dto/create-orderdetail.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const {
      date,
      ref,
      clientId,
      quotationId,
      status,
      notes,
      total,
      taxNet,
      taxRate,
      discount,
      shipping,
      grandTotal,
      userId,
      details,
    } = createOrderDto;

    // Validar campos requeridos
    this.validateRequiredFields(createOrderDto);

    // Validar valores no negativos
    this.validateNonNegativeValues(createOrderDto);

    // Verificar si la orden ya existe (si se proporciona ref)
    if (ref) {
      const existingOrder = await this.prisma.order.findFirst({
        where: {
          ref,
        },
      });
      if (existingOrder) {
        throw new BadRequestException('La orden ya está registrada');
      }
    }

    try {
      // Generar referencia si no se proporciona
      const orderRef = ref || (await this.generateOrderReference());

      // Calcular totales si no se proporcionan
      const calculatedDetails = details
        ? details.map((detail) => this.calculateDetailTotals(detail))
        : [];

      // Calcular subtotal (suma de todos los totales de los detalles)
      const calculatedTotal = calculatedDetails.reduce((sum, detail) => {
        return sum + detail.total;
      }, 0);

      // Calcular impuestos
      const calculatedTaxNet = (calculatedTotal * taxRate) / 100;

      // Calcular total con impuestos y envío
      const calculatedGrandTotal =
        calculatedTotal + calculatedTaxNet + shipping - discount;

      const order = await this.prisma.order.create({
        data: {
          date: date || new Date(),
          ref: orderRef,
          notes: notes || '',
          status: status || 'pending',
          total: total || calculatedTotal,
          taxNet: taxNet || calculatedTaxNet,
          taxRate,
          discount: discount || 0,
          shipping: shipping || 0,
          grandTotal: grandTotal || calculatedGrandTotal,
          client: {
            connect: {
              id: clientId,
            },
          },
          quotation: quotationId
            ? {
                connect: {
                  id: quotationId,
                },
              }
            : undefined,
          user: {
            connect: {
              id: userId,
            },
          },
          details: {
            create: calculatedDetails.map((detail) => ({
              product: { connect: { id: detail.productId } },
              quantity: detail.quantity,
              price: detail.price,
              total: detail.total,
              taxNet: detail.taxNet,
              discount: detail.discount,
              discountMethod: detail.discountMethod,
              taxMethod: detail.taxMethod,
              productVariant: detail.productVariantId
                ? { connect: { id: detail.productVariantId } }
                : undefined,
              quotation: {
                connect: {
                  id: quotationId,
                },
              },
            })),
          },
        },
        include: {
          user: true,
          client: true,
          quotation: true,
          details: {
            include: {
              product: true,
              productVariant: true,
              quotation: true,
            },
          },
        },
      });

      return order;
    } catch (error) {
      console.error('Error al crear la orden:', error);
      throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      include: {
        user: true,
        client: true,
        quotation: true,
        details: {
          include: {
            product: true,
            productVariant: true,
            quotation: true,
          },
        },
      },
    });
    if (orders.length === 0) {
      throw new NotFoundException('No se encontraron órdenes');
    }
    return orders;
  }

  async findOne(id: string): Promise<Order | null> {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
    }

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        client: true,
        quotation: true,
        details: {
          include: {
            product: true,
            productVariant: true,
            quotation: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
    }

    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        client: true,
        quotation: true,
        details: {
          include: {
            product: true,
            productVariant: true,
            quotation: true,
          },
        },
      },
    });

    if (!existingOrder) {
      throw new NotFoundException('Orden no encontrada');
    }

    if (Object.keys(updateOrderDto).length === 0) {
      throw new BadRequestException('No hay datos para actualizar');
    }

    // Usar transacción para todas las operaciones
    return this.prisma.$transaction(async (prismaClient) => {
      // 1. Si hay cambio de estado, agregar a historial
      if (
        updateOrderDto.status &&
        updateOrderDto.status !== existingOrder.status
      ) {
        await prismaClient.order.update({
          where: { id },
          data: {
            status: updateOrderDto.status, // Actualiza el estado directamente
            updatedAt: new Date(), // Opcional, para registrar la fecha de actualización
          },
        });
      }

      // 2. Si hay detalles, actualizar cada uno
      if (updateOrderDto.details && Array.isArray(updateOrderDto.details)) {
        for (const detail of updateOrderDto.details) {
          if (detail.id) {
            // Primero, obtener el detalle existente
            const existingDetail = await prismaClient.orderDetail.findUnique({
              where: { id: detail.id },
            });

            if (!existingDetail) {
              throw new NotFoundException(
                `Detalle de orden con ID ${detail.id} no encontrado`,
              );
            }

            // Determinar los valores a utilizar (nuevos o existentes)
            const quantity =
              detail.quantity !== undefined
                ? detail.quantity
                : existingDetail.quantity;
            const price =
              detail.price !== undefined ? detail.price : existingDetail.price;
            const discount =
              detail.discount !== undefined
                ? detail.discount
                : existingDetail.discount;
            const discountMethod =
              detail.discountMethod !== undefined
                ? detail.discountMethod
                : existingDetail.discountMethod;
            const taxMethod =
              detail.taxMethod !== undefined
                ? detail.taxMethod
                : existingDetail.taxMethod;

            // Calcular los valores derivados
            const totalBeforeDiscount = quantity * price;
            let discountAmount = 0;

            if (discount) {
              if (discountMethod === 'percentage') {
                discountAmount = (totalBeforeDiscount * discount) / 100;
              } else {
                discountAmount = discount;
              }
            }

            const total = totalBeforeDiscount - discountAmount;
            let taxNet = 0;

            // Obtener la tasa de impuesto actual de la orden o del detalle
            const taxRate = existingOrder.taxRate; // O podrías usar un campo específico del detalle si lo tienes

            if (taxMethod === 'included') {
              taxNet = (total * taxRate) / (100 + taxRate);
            } else {
              taxNet = (total * taxRate) / 100;
            }

            // Actualizar solo con los campos calculados y los proporcionados
            await prismaClient.orderDetail.update({
              where: { id: detail.id },
              data: {
                quantity,
                price,
                discount,
                discountMethod,
                taxMethod,
                total,
                taxNet,
                // Solo incluir otros campos si están presentes en el detalle
                productVariantId:
                  detail.productVariantId !== undefined
                    ? detail.productVariantId
                    : undefined,
                // Otros campos que podrían ser actualizados...
              },
            });
          } else {
            // Crear nuevo detalle
            await prismaClient.orderDetail.create({
              data: {
                order: { connect: { id } },
                product: { connect: { id: detail.productId } },
                quantity: detail.quantity,
                price: detail.price,
                total: detail.total,
                taxNet: detail.taxNet,
                discount: detail.discount,
                discountMethod: detail.discountMethod,
                taxMethod: detail.taxMethod,
                productVariant: detail.productVariantId
                  ? { connect: { id: detail.productVariantId } }
                  : undefined,
                quotation: detail.quotationId
                  ? { connect: { id: detail.quotationId } }
                  : undefined,
              },
            });
          }
        }
      }

      // 3. Recalcular totales de la orden completa
      const updatedDetails = await prismaClient.orderDetail.findMany({
        where: { orderId: id },
      });

      const calculatedTotal = updatedDetails.reduce(
        (sum, detail) => sum + detail.total,
        0,
      );

      const taxRate =
        updateOrderDto.taxRate !== undefined
          ? updateOrderDto.taxRate
          : existingOrder.taxRate;

      const calculatedTaxNet = (calculatedTotal * taxRate) / 100;

      const shipping =
        updateOrderDto.shipping !== undefined
          ? updateOrderDto.shipping
          : existingOrder.shipping;

      const discount =
        updateOrderDto.discount !== undefined
          ? updateOrderDto.discount
          : existingOrder.discount;

      const calculatedGrandTotal =
        calculatedTotal + calculatedTaxNet + shipping - discount;

      // 4. Actualizar la orden principal
      const { details, ...orderData } = updateOrderDto;

      const updatedOrder = await prismaClient.order.update({
        where: { id },
        data: {
          ...orderData,
          total: calculatedTotal,
          taxNet: calculatedTaxNet,
          grandTotal: calculatedGrandTotal,
        },
        include: {
          user: true,
          client: true,
          quotation: true,
          details: {
            include: {
              product: true,
              productVariant: true,
              quotation: true,
            },
          },
        },
      });

      return updatedOrder;
    });
  }

  async remove(id: string): Promise<Order> {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
    }

    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
      include: {
        details: true,
      },
    });

    if (!existingOrder) {
      throw new NotFoundException('Orden no encontrada');
    }

    await this.prisma.$transaction(async (prisma) => {
      // Eliminar detalles de la orden
      await prisma.orderDetail.deleteMany({
        where: { orderId: id },
      });

      // Finalmente, eliminar la orden
      await prisma.order.delete({
        where: { id },
      });
    });

    return existingOrder;
  }

  async updateStatus(
    id: string,
    status: string,
    userId: string,
    comment?: string,
  ): Promise<Order> {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
    }

    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      throw new NotFoundException('Orden no encontrada');
    }

    return this.prisma.$transaction(async (prismaClient) => {
      // Crear registro en historial
      await prismaClient.order.update({
        where: { id },
        data: { status },
      });

      // Actualizar estado de la orden
      const updatedOrder = await prismaClient.order.update({
        where: { id },
        data: { status },
        include: {
          user: true,
          client: true,
          quotation: true,
          details: {
            include: {
              product: true,
              productVariant: true,
              quotation: true,
            },
          },
        },
      });

      return updatedOrder;
    });
  }

  private calculateDetailTotals(detail: CreateOrderDetailDto): any {
    // Calcular total base (precio * cantidad)
    const baseTotal = detail.quantity * detail.price;

    // Calcular descuento
    let discountAmount = 0;
    if (detail.discount > 0) {
      discountAmount =
        detail.discountMethod === 'percentage'
          ? (baseTotal * detail.discount) / 100
          : detail.discount;
    }

    // Calcular total después del descuento
    const totalAfterDiscount = baseTotal - discountAmount;

    // Calcular impuestos
    // Asumimos que siempre hay un taxRate en el detalle o lo heredamos de la orden
    const taxRate = 0; // Este valor debería venir de la orden o del detalle
    const taxAmount =
      detail.taxMethod === 'inclusive'
        ? totalAfterDiscount - totalAfterDiscount / (1 + taxRate / 100)
        : (totalAfterDiscount * taxRate) / 100;

    // Total final
    const finalTotal =
      detail.taxMethod === 'inclusive'
        ? totalAfterDiscount
        : totalAfterDiscount + taxAmount;

    return {
      ...detail,
      total: finalTotal,
      taxNet: taxAmount,
    };
  }

  private async generateOrderReference(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().substring(2); // Últimos 2 dígitos del año
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    // Obtener la última referencia de orden para este mes
    const lastOrder = await this.prisma.order.findFirst({
      where: {
        ref: {
          startsWith: `ORD-${year}${month}`,
        },
      },
      orderBy: {
        ref: 'desc',
      },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.ref.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `ORD-${year}${month}-${sequence.toString().padStart(4, '0')}`;
  }

  private validateRequiredFields(dto: CreateOrderDto | UpdateOrderDto): void {
    const requiredFields = ['clientId', 'userId', 'date', 'taxRate'];

    for (const field of requiredFields) {
      if (dto[field] === undefined || dto[field] === null) {
        throw new BadRequestException(`El campo ${field} es obligatorio`);
      }
    }
  }

  private validateNonNegativeValues(
    dto: Partial<CreateOrderDto | UpdateOrderDto>,
  ): void {
    const nonNegativeFields = [
      'shipping',
      'taxRate',
      'discount',
      'total',
      'taxNet',
      'grandTotal',
    ];

    for (const field of nonNegativeFields) {
      if (dto[field] !== undefined && dto[field] < 0) {
        throw new BadRequestException(
          `El campo ${field} no puede ser negativo`,
        );
      }
    }

    // Validar valores no negativos en detalles
    if (dto.details && Array.isArray(dto.details)) {
      for (const detail of dto.details) {
        if (detail.quantity <= 0) {
          throw new BadRequestException('La cantidad debe ser mayor que cero');
        }
        if (detail.price < 0) {
          throw new BadRequestException('El precio no puede ser negativo');
        }
      }
    }
  }
}
