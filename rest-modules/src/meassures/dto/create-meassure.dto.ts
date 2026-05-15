import { IsOptional } from "class-validator";

export class CreateMeassureDto {
    name: string;
    longName: string;

    @IsOptional()
    description?: string = '';
    symbol: string;
}
