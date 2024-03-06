import { Controller } from '@nestjs/common';
import { IpAddressService } from './ip-address.service';

@Controller('ip-addresses')
export class IpAddressController {
  constructor(private readonly ipAddressService: IpAddressService) {}
}
