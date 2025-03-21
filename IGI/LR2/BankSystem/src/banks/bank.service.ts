import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class BankService {
    async getAllBanks() {
        return prisma.bank.findMany();
    }
}
