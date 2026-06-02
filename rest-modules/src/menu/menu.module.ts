import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { CommonsModule } from '@/commons/commons.module';
import { MenuPostgresService } from './menu.postgres.service';

@Module({
  imports: [CommonsModule],
  controllers: [MenuController],
  providers: [MenuService, MenuPostgresService],
})
export class MenuModule { }
