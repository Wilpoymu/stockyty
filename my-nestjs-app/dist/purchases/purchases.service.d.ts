import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { Purchase } from '@prisma/client';
export declare class PurchasesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createPurchaseDto: CreatePurchaseDto): Promise<Purchase>;
    findAll(): Promise<Purchase[]>;
    findOne(id: string): Promise<Purchase | null>;
    update(id: string, updatePurchaseDto: UpdatePurchaseDto): Promise<Purchase>;
    remove(id: string): Promise<Purchase>;
    private validateRequiredFields;
    private validateNonNegativeValues;
    private parseNumber;
    private handlePrismaError;
}
