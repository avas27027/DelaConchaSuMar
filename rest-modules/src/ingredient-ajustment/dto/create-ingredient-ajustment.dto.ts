import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateIngredientAjustmentDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  ingredient: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  previousStock: number;

  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  newStock: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  observations: string;
}
