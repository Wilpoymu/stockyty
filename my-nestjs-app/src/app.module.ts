import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PurchasesModule } from './purchases/purchases.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { ProvidersModule } from './providers/providers.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { PermissionsModule } from './permissions/permissions.module';
import { QuotationsModule } from './quotations/quotations.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AgendaModule } from './agenda/agenda.module';
import { EmailModule } from './email/email.module';
import { OrdersModule } from './orders/orders.module';
import { SalesModule } from './sales/sales.module';
/**
 * @module AppModule
 * @description Root module of the application.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PurchasesModule,
    UsersModule,
    RolesModule,
    ProvidersModule,
    ProductsModule,
    CategoriesModule,
    PermissionsModule,
    AuthModule,
    QuotationsModule,
    AgendaModule,
    EmailModule.register(), // Utiliza el método register en lugar de importación directa
    OrdersModule,
    SalesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
