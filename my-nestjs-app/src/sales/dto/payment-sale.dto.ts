export class PaymentSaleDto {
  id: string;
  saleId: string;
  amount: number;
  charge: number;
  ref: string;
  reglement: string;
  userId: string;
  date: Date;
  notes: string;
  accountId?: string;
  createdAt: Date;
  updatedAt: Date;
}
