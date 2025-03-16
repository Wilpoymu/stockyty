import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Provider } from '@prisma/client';
export declare class ProvidersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createProviderDto: CreateProviderDto): Promise<Provider>;
    findAll(): Promise<Provider[]>;
    findOne(id: string): Promise<Provider | null>;
    update(id: string, updateProviderDto: UpdateProviderDto): Promise<Provider>;
    remove(id: string): Promise<Provider>;
}
