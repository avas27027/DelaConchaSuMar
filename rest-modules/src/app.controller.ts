import { Controller, Get, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): object {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'rest-modules',
      version: '1.0.0'
    };
  }

  @Post()
  postData(@Req() request: Request): any {
    const authHeader = request.headers['authorization'];
    const token = authHeader?.replace('Bearer ', '');
    return { token };
  }
}
