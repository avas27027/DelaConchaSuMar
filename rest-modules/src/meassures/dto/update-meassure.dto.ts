import { PartialType } from '@nestjs/mapped-types';
import { CreateMeassureDto } from './create-meassure.dto';

export class UpdateMeassureDto extends PartialType(CreateMeassureDto) {}
