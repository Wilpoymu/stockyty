import { CreatePaymentPurchaseDto } from './create-payment-purchase.dto';
import { CreatePurchaseDetailDto } from './create-purchase-detail.dto';

export class CreatePurchaseDto {
  readonly date!: Date;
  readonly ref?: string;
  readonly providerId!: string;
  readonly total: number;
  readonly taxRate!: number;
  readonly shipping!: number;
  readonly discount!: number;
  readonly notes?: string;
  readonly taxNet: number;
  readonly paidAmount!: number;
  readonly paymentStatus?: string;
  readonly status?: number;
  readonly grandTotal: number;
  readonly paymentType!: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly deletedAt?: Date;
  readonly userId!: string;
  readonly details!: CreatePurchaseDetailDto[];
  readonly payments?: CreatePaymentPurchaseDto[];
}
