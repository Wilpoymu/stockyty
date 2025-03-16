"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AgendaController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgendaController = void 0;
const common_1 = require("@nestjs/common");
const agenda_service_1 = require("./agenda.service");
const create_agenda_dto_1 = require("./dto/create-agenda.dto");
const update_agenda_dto_1 = require("./dto/update-agenda.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let AgendaController = AgendaController_1 = class AgendaController {
    constructor(agendaService) {
        this.agendaService = agendaService;
        this.logger = new common_1.Logger(AgendaController_1.name);
    }
    create(createAgendaDto, req) {
        this.logger.debug(`User trying to create agenda: ${JSON.stringify({
            id: req.user.id,
            roles: req.user.roles
        })}`);
        return this.agendaService.create(createAgendaDto, req.user.id);
    }
    async findAll(req, dateStr, status) {
        const date = dateStr ? new Date(dateStr) : undefined;
        const params = { date, status };
        const userRoles = req.user.roles.map((r) => r.name);
        if (!userRoles.includes('ADMIN') && !userRoles.includes('MANAGER')) {
            params.userId = req.user.id;
        }
        return this.agendaService.findAll(params);
    }
    findOne(id) {
        return this.agendaService.findOne(id);
    }
    update(id, updateAgendaDto) {
        return this.agendaService.update(id, updateAgendaDto);
    }
    remove(id) {
        return this.agendaService.remove(id);
    }
    assignUsers(id, body) {
        return this.agendaService.assignUsers(id, body.userIds);
    }
    updateStatus(id, body) {
        return this.agendaService.updateStatus(id, body.status);
    }
    checkAuth(req) {
        this.logger.debug(`User auth check: ${JSON.stringify({
            id: req.user.id,
            roles: req.user.roles,
            roleUsers: req.user.roleUsers
        })}`);
        return {
            message: 'You are authenticated',
            user: {
                id: req.user.id,
                email: req.user.email,
                roles: req.user.roles
            }
        };
    }
};
exports.AgendaController = AgendaController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_agenda_dto_1.CreateAgendaDto, Object]),
    __metadata("design:returntype", void 0)
], AgendaController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AgendaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AgendaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_agenda_dto_1.UpdateAgendaDto]),
    __metadata("design:returntype", void 0)
], AgendaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AgendaController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AgendaController.prototype, "assignUsers", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AgendaController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)('check-auth'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AgendaController.prototype, "checkAuth", null);
exports.AgendaController = AgendaController = AgendaController_1 = __decorate([
    (0, common_1.Controller)('api/agenda'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [agenda_service_1.AgendaService])
], AgendaController);
//# sourceMappingURL=agenda.controller.js.map