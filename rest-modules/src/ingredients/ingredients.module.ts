import { Module } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { IngredientsController } from './ingredients.controller';
import { CommonsModule } from '@/commons/commons.module';
import { IngredientsPostgresService } from './ingredients.postgres.service';

@Module({
  imports: [CommonsModule],
  controllers: [IngredientsController],
  providers: [IngredientsService, IngredientsPostgresService],
})
export class IngredientsModule { }
