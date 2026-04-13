import { Module } from '@nestjs/common';
import { CommonsService } from './commons.service';
import { FirebaseService } from './providers/firebase.service';

@Module({
  providers: [CommonsService, FirebaseService],
  exports: [CommonsService, FirebaseService],
})
export class CommonsModule {}
