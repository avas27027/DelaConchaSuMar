import { Module } from '@nestjs/common';
import { CommonsService } from './commons.service';
import { FirebaseService } from './providers/firebase.service';
import { PostgresService } from './providers/postgres.service';
import { EventsGateway } from './providers/socketGateway.service';

@Module({
  providers: [CommonsService, FirebaseService, PostgresService, EventsGateway],
  exports: [CommonsService, FirebaseService, PostgresService, EventsGateway],
})
export class CommonsModule { }
