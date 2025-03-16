"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = void 0;
class Permission {
    inRole(role) {
        if (typeof role === 'string') {
            return this.roles?.some((r) => r.name === role) || false;
        }
        return (role?.some((r) => this.roles?.some((myRole) => myRole.id === r.id)) ||
            false);
    }
}
exports.Permission = Permission;
//# sourceMappingURL=permission.entity.js.map