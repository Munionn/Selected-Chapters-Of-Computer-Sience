import { Module } from '@nestjs/common';
import { BankController } from './banks/bank.controller';

@Module({
    controllers: [BankController],
})
export class AppModule {}
