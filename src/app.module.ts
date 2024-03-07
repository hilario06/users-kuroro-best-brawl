import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { IpAddressInterceptor } from './interceptors/ip-address.interceptor';
import { IpAddressService } from './ip-address.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserService } from './user/user.service';

@Module({
  imports: [UserModule, CacheModule.register(), PrismaModule],
  controllers: [AppController],
  providers: [
    AppService,
    UserService,
    IpAddressService,
    {
      provide: APP_INTERCEPTOR,
      useClass: IpAddressInterceptor,
    },
  ],
})
export class AppModule {}
