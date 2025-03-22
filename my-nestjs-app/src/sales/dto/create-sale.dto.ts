import { CreateSaleDetailDto } from './create-sale-detail.dto';

export class CreateSaleDto {
  date: Date;
  ref: string;
  isPos: number;
  clientId: string;
  accountId: string;
  grandTotal: number;
  qteRetturn: number;
  taxNet: number;
  taxRate: number;
  notes?: string;
  totalReturn: number;
  userId: string;
  status: string;
  discount: number;
  shipping: number;
  paidAmount: number;
  paymentStatus: string;
  shippingStatus: string;
  orderId: string;
  details: [CreateSaleDetailDto];
}
