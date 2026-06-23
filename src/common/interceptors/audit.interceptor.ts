import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestUser } from '../types';
import { v4 as uuid } from 'uuid';

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method: string = request.method;

    if (!MUTATING_METHODS.includes(method)) {
      return next.handle();
    }

    const user: RequestUser | undefined = request.user;
    const path: string = request.route?.path || request.url;
    const controller = context.getClass().name;
    const handler = context.getHandler().name;

    return next.handle().pipe(
      tap(async () => {
        if (!user) return;
        try {
          await this.prisma.auditLog.create({
            data: {
              id: uuid(),
              actorUserId: user.id,
              tenantId: user.tenantId,
              action: `${method} ${handler}`,
              module: controller.replace('Controller', ''),
              entity: path,
              details: JSON.stringify({ method, path, body: this.sanitize(request.body) }),
              ipAddress: request.ip || null,
              device: request.headers['user-agent'] || null,
            },
          });
        } catch {
          // Audit write failure should not break the request
        }
      }),
    );
  }

  private sanitize(body: any): any {
    if (!body) return null;
    const sanitized = { ...body };
    delete sanitized.password;
    delete sanitized.passwordHash;
    delete sanitized.refreshToken;
    return sanitized;
  }
}
