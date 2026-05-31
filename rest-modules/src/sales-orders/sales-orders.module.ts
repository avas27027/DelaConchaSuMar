import { Module } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { SalesOrdersController } from './sales-orders.controller';
import { CommonsModule } from '@/commons/commons.module';
import { SalesOrdersPostgresService } from './sales-orders.postgres.service';

@Module({
  imports: [CommonsModule],
  controllers: [SalesOrdersController],
  providers: [SalesOrdersService, SalesOrdersPostgresService],
})
export class SalesOrdersModule {}
