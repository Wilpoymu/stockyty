import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Debug user object
    this.logger.debug(`User object: ${JSON.stringify(user)}`);
    this.logger.debug(`Required roles: ${JSON.stringify(requiredRoles)}`);

    if (!user) {
      this.logger.error('No user object found in request');
      throw new ForbiddenException('No user information available');
    }

    // Handle different potential role structures
    const hasRole = this.checkRoles(user, requiredRoles);

    if (!hasRole) {
      this.logger.warn(
        `User ${user.username || user.id} does not have required roles`,
      );
    }

    return hasRole;
  }

  private checkRoles(user: any, requiredRoles: string[]): boolean {
    // Check for roles as an array of objects with name property
    if (
      Array.isArray(user.roles) &&
      user.roles.length > 0 &&
      typeof user.roles[0] === 'object'
    ) {
      return requiredRoles.some((role) =>
        user.roles.some((userRole) => userRole.name === role),
      );
    }

    // Check for roles as an array of role names
    if (
      Array.isArray(user.roles) &&
      user.roles.length > 0 &&
      typeof user.roles[0] === 'string'
    ) {
      return requiredRoles.some((role) => user.roles.includes(role));
    }

    // Check for roleUsers structure (based on your Prisma schema)
    if (Array.isArray(user.roleUsers) && user.roleUsers.length > 0) {
      return requiredRoles.some((role) =>
        user.roleUsers.some(
          (roleUser) =>
            roleUser.role?.name === role || roleUser.roleId === role,
        ),
      );
    }

    // If we can't find roles in the expected formats, log and return false
    this.logger.error(
      `Could not find roles in user object: ${JSON.stringify(user)}`,
    );
    return false;
  }
}
