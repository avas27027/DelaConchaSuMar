import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonsModule } from './commons/commons.module';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from './authentication/authentication.module';

@Module({
  imports: [CommonsModule, ConfigModule.forRoot({ isGlobal: true }), AuthenticationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
