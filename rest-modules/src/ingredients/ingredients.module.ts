import { Module } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { IngredientsController } from './ingredients.controller';
import { CommonsModule } from '@/commons/commons.module';

@Module({
  imports: [CommonsModule],
  controllers: [IngredientsController],
  providers: [IngredientsService],
})
export class IngredientsModule { }
