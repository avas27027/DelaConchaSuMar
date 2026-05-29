import { Module } from '@nestjs/common';
import { MeassuresService } from './meassures.service';
import { MeassuresController } from './meassures.controller';
import { CommonsModule } from '../commons/commons.module';
import { MeassuresPostgresService } from './meassures.postgres.service';

@Module({
  imports: [CommonsModule],
  controllers: [MeassuresController],
  providers: [MeassuresService, MeassuresPostgresService],
})
export class MeassuresModule { }
