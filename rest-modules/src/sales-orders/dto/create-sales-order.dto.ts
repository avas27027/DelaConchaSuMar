import { IsOptional } from "class-validator"

export class CreateSalesOrderDto {
    @IsOptional()
    salesId?: string
    tableId: string = ''
    state: string = ''
    @IsOptional()
    userId?: string
    products: {
        productId: string,
        quantity: number,
        observations?: string
    }[] = []
}
