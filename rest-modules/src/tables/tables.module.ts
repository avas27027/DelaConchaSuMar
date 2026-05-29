import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { CommonsModule } from '@/commons/commons.module';
import { TablesPostgresService } from './tables.postgres.service';

@Module({
  imports: [CommonsModule],
  controllers: [TablesController],
  providers: [TablesService, TablesPostgresService],
})
export class TablesModule {}
