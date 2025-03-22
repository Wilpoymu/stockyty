import { SaleDetailDto } from './sale-detail.dto';
import { PaymentSaleDto } from './payment-sale.dto';

export class SaleWithRelationsDto {
  id: string;
  date: Date;
  ref: string;
  isPos: number;
  clientId: string;
  grandTotal: number;
  qteReturn: number;
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
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  details?: SaleDetailDto[];
  facture?: PaymentSaleDto[];
  user?: {
    id: string;
    username: string;
  };
  order?: {
    id: string;
  };
}
