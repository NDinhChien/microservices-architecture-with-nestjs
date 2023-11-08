import { applyDecorators } from '@nestjs/common/decorators/core/apply-decorators';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { RoleGuard } from '../guards/role.guard';
import { AuthGuard } from '../guards/auth.guard';
import { SetMetadata } from '@nestjs/common';

export const Auth = (...roles: string[]) => {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RoleGuard),
  );
};
