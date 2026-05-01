import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) { }

  @Post('/register')
  @UseInterceptors(FileInterceptor('image'))
  registerDish(@UploadedFile() image: Express.Multer.File, @Body() CreateMenuDto: CreateMenuDto) {
    return this.menuService.registerImage(image, CreateMenuDto);
  }

  @Post()
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }

  @Get()
  findAll() {
    return this.menuService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.update(id, updateMenuDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}
