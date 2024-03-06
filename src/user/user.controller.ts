import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Headers,
  Req,
  Inject,
} from '@nestjs/common';
import * as requestIp from 'request-ip';
import { Request } from 'express';
import { UserService } from './user.service';
import { IpAddressService } from './ip-address.service';
import { User } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly ipAddressService: IpAddressService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Post()
  async createUser(@Body() data: User) {
    const user = await this.userService.createUser(data);
    const cacheKey = `userExperience_${user.id}`;
    await this.cacheManager.set(cacheKey, user.id, 3600000);
    return user;
  }

  @Put('experience')
  async updateUserExperience(
    @Headers('authorization') authorizationHeader: string,
    @Body('experience') experience: number,
    @Req() request: Request,
  ) {
    const authorizationValue = authorizationHeader;
    const idUser = authorizationValue.split(' ')[1];

    const cacheKey = `userExperience_${idUser}`;
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (!cachedResult) {
      const clientIp = requestIp.getClientIp(request);
      await this.ipAddressService.createIpAddress(clientIp, Number(idUser));
      await this.cacheManager.set(cacheKey, idUser, 3600000);
    }
    return await this.userService.updateUserExperience(
      Number(idUser),
      experience,
    );
  }
}
