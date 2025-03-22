import { CreateQuotationDetailDto } from './create-quotation-detail.dto';

export class CreateQuotationDto {
  readonly quotationNumber?: string;
  readonly date: Date;
  readonly validUntil?: Date;
  readonly clientId: string;
  readonly userId: string;
  readonly employeeAssignedId?: string;
  readonly observations?: string;
  readonly internalNotes?: string;
  readonly paymentTerms?: string;
  readonly deliveryDate?: string;
  readonly shipping: number = 0;
  readonly taxRate: number;
  readonly includesTax: boolean = true;
  readonly status: number;
  readonly statusComment: string;
  readonly subTotal: number;
  readonly taxAmount: number;
  readonly grandTotal: number;
  readonly details: CreateQuotationDetailDto[];
}
