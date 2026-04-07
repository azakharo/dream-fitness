import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for accessing an endpoint
 * Must be used in conjunction with RolesGuard
 *
 * @example
 * @Roles('admin')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * adminOnlyRoute() {}
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
