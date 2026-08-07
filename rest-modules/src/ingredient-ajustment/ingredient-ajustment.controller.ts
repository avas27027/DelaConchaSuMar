import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IngredientAjustmentService } from './ingredient-ajustment.service';
import { CreateIngredientAjustmentDto } from './dto/create-ingredient-ajustment.dto';
import { UpdateIngredientAjustmentDto } from './dto/update-ingredient-ajustment.dto';

@Controller('ingredient-ajustment')
export class IngredientAjustmentController {

  constructor(private readonly ingredientAjustmentService: IngredientAjustmentService) { }

  @Post()
  create(@Body() createIngredientAjustmentDto: CreateIngredientAjustmentDto) {
    return this.ingredientAjustmentService.create(createIngredientAjustmentDto);
  }

  @Get()
  findAll() {
    return this.ingredientAjustmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingredientAjustmentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIngredientAjustmentDto: UpdateIngredientAjustmentDto) {
    return this.ingredientAjustmentService.update(+id, updateIngredientAjustmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ingredientAjustmentService.remove(+id);
  }
}
