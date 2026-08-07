import { PartialType } from '@nestjs/mapped-types';
import { CreateIngredientAjustmentDto } from './create-ingredient-ajustment.dto';

export class UpdateIngredientAjustmentDto extends PartialType(CreateIngredientAjustmentDto) {}
