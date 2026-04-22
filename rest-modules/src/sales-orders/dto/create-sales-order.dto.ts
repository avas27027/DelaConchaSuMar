export class CreateSalesOrderDto {
    salesId: string = ''
    tableId: string = ''
    state: string = ''
    observations: string = ''
    userId: string = ''
    products: {
        productId: string,
        quantity: number
    }[] = []
}
