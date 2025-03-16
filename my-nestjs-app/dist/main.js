"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const roles_seeder_1 = require("./seeders/roles.seeder");
const adminUser_seeder_1 = require("./seeders/adminUser.seeder");
const permissions_seeder_1 = require("./seeders/permissions.seeder");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    await (0, roles_seeder_1.seedRolesIfNotExist)();
    await (0, adminUser_seeder_1.seedAdminUserIfNotExist)();
    await (0, permissions_seeder_1.seedPermissionsIfNotExist)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.enableCors({
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    await app.listen(process.env.PORT ?? 5000);
}
void bootstrap();
//# sourceMappingURL=main.js.map