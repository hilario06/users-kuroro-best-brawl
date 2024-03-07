import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as requestIp from 'request-ip';
import { IpAddressService } from 'src/ip-address.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class IpAddressInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private ipAddressService: IpAddressService,
    private readonly userService: UserService,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const authorizationHeader = request.headers['authorization'];
    const userId = authorizationHeader ? authorizationHeader.split(' ')[1] : '';
    if (userId) {
      return next.handle().pipe(
        finalize(async () => {
          const user = await this.userService.getUserById(Number(userId));
          if (!user) return;
          const cacheKey = `userExperience_${userId}`;
          const cachedResult = await this.cacheManager.get(cacheKey);
          if (!cachedResult) {
            const clientIp = requestIp.getClientIp(request);
            await this.ipAddressService.createIpAddress(
              clientIp,
              Number(userId),
            );
            await this.cacheManager.set(cacheKey, userId, 3600000);
          }
        }),
      );
    } else {
      return next.handle();
    }
  }
}
