import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonsModule } from './commons/commons.module';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from './authentication/authentication.module';
import { MenuModule } from './menu/menu.module';
import { TablesModule } from './tables/tables.module';
import { SalesOrdersModule } from './sales-orders/sales-orders.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { MeassuresModule } from './meassures/meassures.module';

@Module({
  imports: [CommonsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthenticationModule,
    MenuModule,
    TablesModule,
    SalesOrdersModule,
    IngredientsModule,
    MeassuresModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
