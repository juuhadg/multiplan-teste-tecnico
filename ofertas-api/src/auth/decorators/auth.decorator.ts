import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { Role } from '../enums/role.enum';

export const AUTH_ROLE_KEY = 'auth:role';

export const Auth = (role?: Role) =>
  applyDecorators(SetMetadata(AUTH_ROLE_KEY, role), UseGuards(AuthGuard));
