import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { IpAddressController } from './ip-address.controller';
import { IpAddressService } from './ip-address.service';

@Module({
  controllers: [UserController, IpAddressController],
  providers: [UserService, IpAddressService],
  imports: [PrismaModule, CacheModule.register()],
})
export class UserModule {}
