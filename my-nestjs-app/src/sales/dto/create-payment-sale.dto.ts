export class CreatePaymentSaleDto {
  saleId: string;
  amount: number;
  charge: number;
  ref: string;
  reglement: string;
  userId: string;
  date: Date;
  notes: string;
  accountId?: string;
}
