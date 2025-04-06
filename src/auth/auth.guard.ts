import {
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard as AuthGuardPassport } from '@nestjs/passport';
import { buildResponse } from 'src/common/response.util';
import { Observable, firstValueFrom } from 'rxjs';

export class AuthGuard extends AuthGuardPassport('jwt') {
  private requiredRoles: string[];

  constructor(requiredRoles?: string[]) {
    super();
    this.requiredRoles = requiredRoles || [];
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const result = await super.canActivate(context);
      if (result instanceof Observable) {
        return await firstValueFrom(result);
      }
      return result;
    } catch (error) {
      throw new UnauthorizedException(
        buildResponse(null, 'Authorization token is required', 401),
      );
    }
  }

  handleRequest(err, user) {
    if (err) {
      throw new UnauthorizedException(
        buildResponse(null, 'Invalid or expired token', 401),
      );
    }

    if (!user) {
      throw new UnauthorizedException(
        buildResponse(null, 'Authorization token is required', 401),
      );
    }

    if (
      this.requiredRoles.length > 0 &&
      !this.requiredRoles.includes(user.role)
    ) {
      throw new ForbiddenException(
        buildResponse(
          null,
          'You do not have permission to access this resource',
          403,
        ),
      );
    }

    return user;
  }
}
