import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IpAddressService {
  constructor(private readonly prisma: PrismaService) {}

  async createIpAddress(ip: string, userId: number) {
    const existingIpAddress = await this.prisma.ipAddress.findFirst({
      where: {
        userId: userId,
        ip: ip,
      },
    });
    if (!existingIpAddress) {
      await this.prisma.ipAddress.create({
        data: { ip, userId },
      });
    }
  }
}
