import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { CommonsModule } from '@/commons/commons.module';

@Module({
  imports: [CommonsModule],
  controllers: [TablesController],
  providers: [TablesService],
})
export class TablesModule {}
