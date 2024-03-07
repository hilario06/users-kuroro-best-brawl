import { Body, Controller, Get, Post, Put, Headers } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Post()
  async createUser(@Body() data: User) {
    const user = await this.userService.createUser(data);
    return user;
  }

  @Put('experience')
  async updateUserExperience(
    @Headers('authorization') authorizationHeader: string,
    @Body('experience') experience: number,
  ) {
    const authorizationValue = authorizationHeader;
    const userId = authorizationValue.split(' ')[1];
    return await this.userService.updateUserExperience(
      Number(userId),
      experience,
    );
  }
}
