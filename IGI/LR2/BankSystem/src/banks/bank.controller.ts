import { Controller, Get } from '@nestjs/common';

@Controller('banks')
export class BankController {
    // @Get()
    getAllBanks() {
        return [{ id: 1, name: 'Bank A' }, { id: 2, name: 'Bank B' }];
    }
}
