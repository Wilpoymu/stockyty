import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CreateSaleDetailDto } from './dto/create-sale-detail.dto';
import { CreatePaymentSaleDto } from './dto/create-payment-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sale } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const {
      date,
      ref,
      isPos,
      clientId,
      taxNet,
      taxRate,
      notes,
      userId,
      status,
      discount,
      shipping,
      paidAmount,
      paymentStatus,
      shippingStatus,
      orderId,
      details,
    } = createSaleDto;

    // Validar campos requeridos
    this.validateRequiredFields(createSaleDto);

    // Validar valores no negativos
    this.validateNonNegativeValues(createSaleDto);

    // Verificar si la referencia ya existe
    if (ref) {
      const existingSale = await this.prisma.sale.findFirst({
        where: {
          ref,
        },
      });
      if (existingSale) {
        throw new BadRequestException(
          'La referencia de venta ya está registrada',
        );
      }
    }

    // Calcular totales
    const calculatedDetails = details.map((detail) =>
      this.calculateDetailTotals(detail),
    );

    // Calcular subtotal (suma de todos los totales de los detalles)
    const subtotal = calculatedDetails.reduce((sum, detail) => {
      return sum + detail.total;
    }, 0);

    // Calcular impuestos
    const calculatedTaxNet = taxNet || (subtotal * taxRate) / 100;

    // Calcular total con impuestos y envío
    const calculatedGrandTotal =
      subtotal + calculatedTaxNet + shipping - discount;

    try {
      // Generar referencia si no se proporciona
      const saleRef = ref || (await this.generateSaleReference());

      const sale = await this.prisma.sale.create({
        data: {
          date: date || new Date(),
          ref: saleRef,
          isPos: isPos || 0,
          grandTotal: calculatedGrandTotal,
          taxNet: calculatedTaxNet,
          taxRate,
          notes: notes || '',
          totalReturn: 0, // Valor inicial
          qteRetturn: 0, // Valor inicial
          status: status || 'pending',
          discount: discount || 0,
          shipping: shipping || 0,
          paidAmount: paidAmount || 0,
          paymentStatus: paymentStatus || 'pending',
          shippingStatus: shippingStatus || 'pending',
          clientId: clientId,
          user: {
            connect: {
              id: userId,
            },
          },
          order: orderId
            ? {
                connect: {
                  id: orderId,
                },
              }
            : undefined,
          details: {
            create: calculatedDetails.map((detail) => ({
              date: detail.date || new Date(),
              saleUnitId: detail.saleUnitId,
              quantity: detail.quantity,
              product: {
                connect: {
                  id: detail.productId,
                },
              },
              total: detail.total,
              productVariantId: detail.productVariantId,
              price: detail.price,
              TaxNet: detail.TaxNet || 0,
              discount: detail.discount || 0,
              discountMethod: detail.discountMethod || 'percentage',
              taxMethod: detail.taxMethod || 'exclusive',
            })),
          },
        },
        include: {
          user: true,
          details: {
            include: {
              product: true,
            },
          },
          facture: true,
          order: true,
        },
      });

      // Si hay pago inicial, registrarlo
      if (paidAmount && paidAmount > 0) {
        await this.registerPayment({
          saleId: sale.id,
          amount: paidAmount,
          charge: 0,
          ref: `PAY-${saleRef}`,
          reglement: 'efectivo',
          userId: userId,
          date: new Date(),
          notes: 'Pago inicial',
          accountId: createSaleDto.accountId,
        });

        // Actualizar el estado de pago si es necesario
        if (paidAmount >= calculatedGrandTotal) {
          await this.prisma.sale.update({
            where: { id: sale.id },
            data: { paymentStatus: 'paid' },
          });
        } else if (paidAmount > 0) {
          await this.prisma.sale.update({
            where: { id: sale.id },
            data: { paymentStatus: 'partial' },
          });
        }
      }

      return sale;
    } catch (error) {
      console.error('Error al crear la venta:', error);
      throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<Sale[]> {
    const sales = await this.prisma.sale.findMany({
      include: {
        user: true,
        details: {
          include: {
            product: true,
          },
        },
        facture: true,
        order: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    if (sales.length === 0) {
      throw new NotFoundException('No se encontraron ventas');
    }

    return sales;
  }

  async findOne(id: string): Promise<Sale> {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
    }

    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        user: true,
        details: {
          include: {
            product: true,
          },
        },
        facture: true,
        order: true,
      },
    });

    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    return sale;
  }

  private prepareSaleUpdateData(dto: any) {
    // Crea una copia del DTO excluyendo campos especiales
    const { userId, details, ...updateData } = dto;

    // Objeto de salida con los datos básicos
    const prismaData: any = { ...updateData };

    // Añade relaciones si existen en el DTO original
    if (userId) {
      prismaData.user = { connect: { id: userId } };
    }

    return prismaData;
  }

  async update(id: string, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
    }

    const existingSale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        details: true,
        facture: true,
      },
    });

    if (!existingSale) {
      throw new NotFoundException('Venta no encontrada');
    }

    if (Object.keys(updateSaleDto).length === 0) {
      throw new BadRequestException('No hay datos para actualizar');
    }

    // Usar transacción para todas las operaciones
    return this.prisma.$transaction(async (prismaClient) => {
      // Si hay cambios en los detalles
      if (updateSaleDto.details && Array.isArray(updateSaleDto.details)) {
        // Eliminar detalles existentes
        await prismaClient.saleDetail.deleteMany({
          where: { saleId: id },
        });

        // Crear nuevos detalles
        const calculatedDetails = updateSaleDto.details.map((detail) =>
          this.calculateDetailTotals(detail),
        );

        // Calcular nuevos totales
        const subtotal = calculatedDetails.reduce((sum, detail) => {
          return sum + detail.total;
        }, 0);

        const taxRate = updateSaleDto.taxRate || existingSale.taxRate;
        const calculatedTaxNet =
          updateSaleDto.taxNet || (subtotal * taxRate) / 100;
        const discount = updateSaleDto.discount || existingSale.discount;
        const shipping = updateSaleDto.shipping || existingSale.shipping;

        const calculatedGrandTotal =
          subtotal + calculatedTaxNet + shipping - discount;

        // Crear nuevos detalles
        for (const detail of calculatedDetails) {
          await prismaClient.saleDetail.create({
            data: {
              sale: { connect: { id } },
              date: detail.date || new Date(),
              saleUnitId: detail.saleUnitId,
              quantity: detail.quantity,
              product: { connect: { id: detail.productId } },
              total: detail.total,
              productVariantId: detail.productVariantId,
              price: detail.price,
              TaxNet: detail.TaxNet || 0,
              discount: detail.discount || 0,
              discountMethod: detail.discountMethod || 'percentage',
              taxMethod: detail.taxMethod || 'exclusive',
            },
          });
        }
        // Actualizar la venta principal con nuevos totales
        await prismaClient.sale.update({
          where: { id },
          data: {
            ...this.prepareSaleUpdateData(updateSaleDto),
            grandTotal: calculatedGrandTotal,
            taxNet: calculatedTaxNet,
          },
        });
      } else {
        // Solo actualizar campos de la venta sin recalcular
        await prismaClient.sale.update({
          where: { id },
          data: this.prepareSaleUpdateData(updateSaleDto),
        });
      }

      // Obtener la venta actualizada
      return this.findOne(id);
    });
  }

  async remove(id: string): Promise<Sale> {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
    }

    const existingSale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        details: true,
        facture: true,
      },
    });

    if (!existingSale) {
      throw new NotFoundException('Venta no encontrada');
    }

    await this.prisma.$transaction(async (prisma) => {
      // 1. Eliminar detalles de venta
      await prisma.saleDetail.deleteMany({
        where: { saleId: id },
      });

      // 2. Eliminar pagos asociados
      await prisma.paymentSale.deleteMany({
        where: { saleId: id },
      });

      // 3. Finalmente, eliminar la venta
      await prisma.sale.delete({
        where: { id },
      });
    });

    return existingSale;
  }

  async updateStatus(id: string, status: string): Promise<Sale> {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
    }

    const existingSale = await this.prisma.sale.findUnique({
      where: { id },
    });

    if (!existingSale) {
      throw new NotFoundException('Venta no encontrada');
    }

    const updatedSale = await this.prisma.sale.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        details: {
          include: {
            product: true,
          },
        },
        facture: true,
        order: true,
      },
    });

    return updatedSale;
  }

  async updatePaymentStatus(id: string, paymentStatus: string): Promise<Sale> {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
    }

    const existingSale = await this.prisma.sale.findUnique({
      where: { id },
    });

    if (!existingSale) {
      throw new NotFoundException('Venta no encontrada');
    }

    const updatedSale = await this.prisma.sale.update({
      where: { id },
      data: { paymentStatus },
      include: {
        user: true,
        details: {
          include: {
            product: true,
          },
        },
        facture: true,
        order: true,
      },
    });

    return updatedSale;
  }

  async updateShippingStatus(
    id: string,
    shippingStatus: string,
  ): Promise<Sale> {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
    }

    const existingSale = await this.prisma.sale.findUnique({
      where: { id },
    });

    if (!existingSale) {
      throw new NotFoundException('Venta no encontrada');
    }

    const updatedSale = await this.prisma.sale.update({
      where: { id },
      data: { shippingStatus },
      include: {
        user: true,
        details: {
          include: {
            product: true,
          },
        },
        facture: true,
        order: true,
      },
    });

    return updatedSale;
  }

  async registerPayment(paymentData: CreatePaymentSaleDto): Promise<any> {
    const {
      saleId,
      amount,
      charge,
      ref,
      reglement,
      userId,
      date,
      notes,
      accountId,
    } = paymentData;

    if (!saleId || !amount || !userId) {
      throw new BadRequestException('Faltan campos obligatorios para el pago');
    }

    const sale = await this.prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        facture: true,
      },
    });

    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    return this.prisma.$transaction(async (prismaClient) => {
      // 1. Registrar el pago
      const payment = await prismaClient.paymentSale.create({
        data: {
          sale: { connect: { id: saleId } },
          amount,
          charge: charge || 0,
          ref: ref || `PAY-${Date.now()}`,
          reglement,
          user: { connect: { id: userId } },
          date: date || new Date(),
          notes: notes || '',
          account: accountId ? { connect: { id: accountId } } : undefined,
        },
        include: {
          sale: true,
          user: true,
          account: true,
        },
      });

      // 2. Actualizar el monto pagado en la venta
      const totalPaid = sale.paidAmount + amount;
      let newPaymentStatus = sale.paymentStatus;

      if (totalPaid >= sale.grandTotal) {
        newPaymentStatus = 'paid';
      } else if (totalPaid > 0) {
        newPaymentStatus = 'partial';
      }

      await prismaClient.sale.update({
        where: { id: saleId },
        data: {
          paidAmount: totalPaid,
          paymentStatus: newPaymentStatus,
        },
      });

      // 3. Actualizar el balance de la cuenta si se especifica
      if (accountId) {
        const account = await prismaClient.account.findUnique({
          where: { id: accountId },
        });

        if (account) {
          await prismaClient.account.update({
            where: { id: accountId },
            data: {
              balance: account.balance + amount,
            },
          });
        }
      }

      return payment;
    });
  }

  async getPayments(saleId: string): Promise<any[]> {
    if (!saleId) {
      throw new BadRequestException('El ID de venta es obligatorio');
    }

    const sale = await this.prisma.sale.findUnique({
      where: { id: saleId },
    });

    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    const payments = await this.prisma.paymentSale.findMany({
      where: { saleId },
      include: {
        user: true,
        account: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return payments;
  }

  async generatePaymentReceipt(paymentId: string): Promise<any> {
    if (!paymentId) {
      throw new BadRequestException('El ID de pago es obligatorio');
    }

    const payment = await this.prisma.paymentSale.findUnique({
      where: { id: paymentId },
      include: {
        sale: {
          include: {
            user: true,
            details: {
              include: {
                product: true,
              },
            },
          },
        },
        user: true,
        account: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    // Aquí se podría generar un PDF o un objeto con la información del comprobante
    return {
      receiptNumber: `REC-${payment.ref}`,
      date: payment.date,
      amount: payment.amount,
      charge: payment.charge,
      paymentMethod: payment.reglement,
      saleRef: payment.sale.ref,
      saleDate: payment.sale.date,
      saleTotal: payment.sale.grandTotal,
      remainingBalance: payment.sale.grandTotal - payment.sale.paidAmount,
      client: {
        id: payment.sale.clientId,
        // Aquí se podrían incluir más detalles del cliente
      },
      cashier: {
        id: payment.userId,
        name: payment.user.username,
      },
      account: payment.account
        ? {
            id: payment.account.id,
            name: payment.account.accountName,
            number: payment.account.accountNumber,
          }
        : null,
    };
  }

  private calculateDetailTotals(detail: CreateSaleDetailDto): any {
    // Base price
    const basePrice = detail.price;

    // Discount calculation
    let discountAmount = 0;
    if (detail.discount && detail.discount > 0) {
      if (detail.discountMethod === 'percentage') {
        discountAmount = (basePrice * detail.discount) / 100;
      } else {
        discountAmount = detail.discount;
      }
    }

    // Price after discount
    const priceAfterDiscount = basePrice - discountAmount;

    // Tax calculation
    let taxAmount = 0;
    if (detail.TaxNet && detail.TaxNet > 0) {
      if (detail.taxMethod === 'exclusive') {
        taxAmount = (priceAfterDiscount * detail.TaxNet) / 100;
      } else {
        // Inclusive tax
        taxAmount =
          priceAfterDiscount - priceAfterDiscount / (1 + detail.TaxNet / 100);
      }
    }

    // Calculate total
    let total = 0;
    if (detail.taxMethod === 'exclusive') {
      total = (priceAfterDiscount + taxAmount) * detail.quantity;
    } else {
      total = priceAfterDiscount * detail.quantity;
    }

    return {
      ...detail,
      total: Math.round(total * 100) / 100,
    };
  }

  private async generateSaleReference(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().substring(2); // Últimos 2 dígitos del año
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Obtener la última referencia de venta para este día
    const lastSale = await this.prisma.sale.findFirst({
      where: {
        ref: {
          startsWith: `INV-${year}${month}${day}`,
        },
      },
      orderBy: {
        ref: 'desc',
      },
    });

    let sequence = 1;
    if (lastSale) {
      const lastSequence = parseInt(lastSale.ref.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `INV-${year}${month}${day}-${sequence.toString().padStart(4, '0')}`;
  }

  private validateRequiredFields(dto: CreateSaleDto): void {
    const requiredFields = ['clientId', 'userId', 'date', 'details'];

    for (const field of requiredFields) {
      if (dto[field] === undefined || dto[field] === null) {
        throw new BadRequestException(`El campo ${field} es obligatorio`);
      }
    }

    // Validar que hay al menos un detalle
    if (!dto.details?.length) {
      throw new BadRequestException(
        'Debe incluir al menos un detalle en la venta',
      );
    }

    // Validar detalles
    dto.details.forEach((detail, index) => {
      if (!detail.productId) {
        throw new BadRequestException(
          `El detalle ${index + 1} no tiene un producto asignado`,
        );
      }
      if (!detail.quantity || detail.quantity <= 0) {
        throw new BadRequestException(
          `El detalle ${index + 1} tiene una cantidad inválida`,
        );
      }
      if (!detail.price || detail.price < 0) {
        throw new BadRequestException(
          `El detalle ${index + 1} tiene un precio inválido`,
        );
      }
    });
  }

  private validateNonNegativeValues(dto: CreateSaleDto): void {
    const nonNegativeFields = ['shipping', 'taxRate', 'discount', 'paidAmount'];

    for (const field of nonNegativeFields) {
      if (dto[field] !== undefined && dto[field] < 0) {
        throw new BadRequestException(
          `El campo ${field} no puede ser negativo`,
        );
      }
    }
  }
}
