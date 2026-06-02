import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { MenuPostgresService } from './menu.postgres.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuPostgresService) { }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(@UploadedFile() image: Express.Multer.File, @Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto, image);
  }

  @Get('paginate')
  getProducts(
    @Query('limit') limit = '10',
    @Query('cursor') cursor?: string,
  ) {
    return this.menuService.getProducts(Number(limit), cursor);
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
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return this.menuService.update(id, updateMenuDto, image);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}
