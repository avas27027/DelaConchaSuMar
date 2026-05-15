import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MeassuresService } from './meassures.service';
import { CreateMeassureDto } from './dto/create-meassure.dto';
import { UpdateMeassureDto } from './dto/update-meassure.dto';

@Controller('meassures')
export class MeassuresController {
  constructor(private readonly meassuresService: MeassuresService) {}

  @Post()
  create(@Body() createMeassureDto: CreateMeassureDto) {
    return this.meassuresService.create(createMeassureDto);
  }

  @Get()
  findAll() {
    return this.meassuresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meassuresService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMeassureDto: UpdateMeassureDto) {
    return this.meassuresService.update(id, updateMeassureDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.meassuresService.remove(id);
  }
}
