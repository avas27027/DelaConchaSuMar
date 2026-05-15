import { Module } from '@nestjs/common';
import { MeassuresService } from './meassures.service';
import { MeassuresController } from './meassures.controller';
import { CommonsModule } from '../commons/commons.module';

@Module({
  imports: [CommonsModule],
  controllers: [MeassuresController],
  providers: [MeassuresService],
})
export class MeassuresModule { }
