import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { seedRolesIfNotExist } from '../seeders/roles.seeder';
import { seedAdminUserIfNotExist } from '../seeders/adminUser.seeder';
import { seedPermissionsIfNotExist } from 'seeders/permissions.seeder';
import { ValidationPipe } from '@nestjs/common';

/**
 * Bootstraps the NestJS application.
 *
 * This function initializes the application by seeding the roles and admin user,
 * then starts the HTTP server on the specified PORT or defaults to port 5000.
 *
 * @async
 * @function bootstrap
 */
async function bootstrap() {
  await seedRolesIfNotExist()
  await seedAdminUserIfNotExist();
  await seedPermissionsIfNotExist();
  const app = await NestFactory.create(AppModule);

  // Modify validation pipe to accept properties in DTOs without decorators
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false, // Don't strip properties not in DTO
      transform: true, // Enable automatic transformation
      forbidNonWhitelisted: false, // Don't throw errors on non-whitelisted properties
    }),
  );

  // Configure CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 5000);
}

void bootstrap();
