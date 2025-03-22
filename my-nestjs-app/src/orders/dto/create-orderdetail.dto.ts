export class CreateOrderDetailDto {
  readonly id: string;
  readonly orderId: string;
  readonly productId: string;
  readonly quotationId: string;
  readonly quantity: number;
  readonly price: number;
  readonly total: number;
  readonly taxNet: number;
  readonly discount: number;
  readonly discountMethod: string;
  readonly taxMethod: string;
  readonly productVariantId?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
