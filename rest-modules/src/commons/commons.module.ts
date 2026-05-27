import { Module } from '@nestjs/common';
import { CommonsService } from './commons.service';
import { FirebaseService } from './providers/firebase.service';
import { PostgresService } from './providers/postgres.service';

@Module({
  providers: [CommonsService, FirebaseService, PostgresService],
  exports: [CommonsService, FirebaseService, PostgresService],
})
export class CommonsModule { }
