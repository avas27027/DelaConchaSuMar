import { IsOptional } from "class-validator"

export class CreateSalesOrderDto {
    @IsOptional()
    salesId?: string
    tableId: string = ''
    state: string = ''
    observations: string = ''
    @IsOptional()
    userId?: string
    products: {
        productId: string,
        quantity: number
    }[] = []
}
