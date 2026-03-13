import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect().catch((e) => {
      console.warn('[PrismaService] DB connection failed at startup:', e.message);
    });
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
