import { Module } from '@nestjs/common';
import { IngredientAjustmentService } from './ingredient-ajustment.service';
import { IngredientAjustmentController } from './ingredient-ajustment.controller';
import { CommonsModule } from '@/commons/commons.module';

@Module({
  imports: [CommonsModule],
  controllers: [IngredientAjustmentController],
  providers: [IngredientAjustmentService],
})
export class IngredientAjustmentModule { }
