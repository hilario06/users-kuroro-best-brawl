import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async createUser(data: User): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    return this.prisma.user.create({
      data,
    });
  }

  async updateUserExperience(
    userId: number,
    experience: number,
  ): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser) {
      throw new BadRequestException('User does not exist');
    }
    experience += existingUser.experience;
    return this.prisma.user.update({
      where: { id: userId },
      data: { experience },
    });
  }

  async updateUser(id: number, data: User): Promise<User> {
    return this.prisma.user.update({
      where: {
        id: id,
      },
      data,
    });
  }
}
