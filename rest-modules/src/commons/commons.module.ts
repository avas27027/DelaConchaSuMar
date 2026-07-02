import { Module } from '@nestjs/common';
import { CommonsService } from './commons.service';
import { FirebaseService } from './providers/firebase.service';
import { PostgresService } from './providers/postgres.service';
import { EventsGateway } from './providers/socketGateway.service';
import { ErpProviderService } from './providers/erp.provider.service';

@Module({
  providers: [CommonsService, FirebaseService, PostgresService, EventsGateway, ErpProviderService],
  exports: [CommonsService, FirebaseService, PostgresService, EventsGateway, ErpProviderService],
})
export class CommonsModule { }
