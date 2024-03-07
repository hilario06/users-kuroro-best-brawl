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

interface UserIps {
  [key: string]: {
    userId: number;
    ip: string;
  };
}
const IP_STORAGE_DURATION = 60000;

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

          let userIps: UserIps | undefined =
            await this.cacheManager.get('user_ip_addresses');

          if (!userIps || Object.keys(userIps).length === 0) {
            await this.cacheManager.set(
              'ip_storage_duration_3600000',
              'user.ips',
              IP_STORAGE_DURATION,
            );
          }

          userIps = userIps || {};
          userIps[userId] = {
            userId: Number(userId),
            ip: requestIp.getClientIp(request),
          };
          await this.cacheManager.set('user_ip_addresses', userIps, 0);
          const ip_storage_duration_3600000 = await this.cacheManager.get(
            'ip_storage_duration_3600000',
          );
          if (!ip_storage_duration_3600000) {
            await this.ipAddressService.createIpAddressMany(
              Object.values(userIps),
            );
            await this.cacheManager.set('user_ip_addresses', {}, 0);
            await this.cacheManager.set(
              'ip_storage_duration_3600000',
              'user.ips',
              IP_STORAGE_DURATION,
            );
          }
        }),
      );
    } else {
      return next.handle();
    }
  }
}
