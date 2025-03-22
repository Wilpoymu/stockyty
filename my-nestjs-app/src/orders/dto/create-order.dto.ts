import { CreateOrderDetailDto } from './create-orderdetail.dto';

export class CreateOrderDto {
  readonly date: Date;
  readonly ref: string;
  readonly clientId: string;
  readonly quotationId?: string;
  readonly status: string;
  readonly notes?: string;
  readonly total: number;
  readonly taxNet: number;
  readonly taxRate: number;
  readonly discount: number;
  readonly shipping: number;
  readonly grandTotal: number;
  readonly userId: string;
  readonly details: [CreateOrderDetailDto];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
