import { IsOptional } from "class-validator"

export class CreateSalesOrderDto {
    @IsOptional()
    salesId?: string
    tableId: string = ''
    state: string = ''
    @IsOptional()
    userId?: string
    products: {
        productId?: string, //Para crear el producto con su referencia
        product?: string, //Para darle update al producto (ya viene como referencia)
        quantity: number,
        observations?: string
    }[] = []
}
