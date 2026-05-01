// dto/create-menu.dto.ts
import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";
export class CreateMenuDto {
  name: string = '';

  @IsOptional()
  imageUrl: string = '';

  description: string = '';
  category: string = '';

  @IsNumber()
  @Type(() => Number)
  price: number = 0;

  meassureUnitId?: string = 'vA5JtuCa5F6aNepR8fbP';
}