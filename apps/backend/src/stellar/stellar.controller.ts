import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StellarService } from './stellar.service';

@ApiTags('stellar')
@Controller('stellar')
export class StellarController {
  constructor(private stellarService: StellarService) {}

  @Get('balance/:publicKey')
  getBalance(@Param('publicKey') publicKey: string) {
    return this.stellarService.getAccountBalance(publicKey);
  }
}
