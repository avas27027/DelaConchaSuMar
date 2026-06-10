import { Response } from '@/commons/interfaces';
import { PostgresService } from '@/commons/providers/postgres.service';
import { Injectable, Logger } from '@nestjs/common';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { Prisma, SalesOrders } from '../../generated/prisma/client';
import { EventsGateway } from '@/commons/providers/socketGateway.service';

type SalesOrderWithRelations = Prisma.SalesOrdersGetPayload<{
    include: {
        tables: true,
        salesOrderProducts: {
            include: {
                products: true,
            },
        },
    },
}>

@Injectable()
export class SalesOrdersPostgresService {
    private readonly logger = new Logger(SalesOrdersPostgresService.name)
    constructor(private readonly db: PostgresService,
        private readonly webSocket: EventsGateway,
    ) { }

    async separateProducts(order: CreateSalesOrderDto): Promise<{ drinks: CreateSalesOrderDto["products"], foods: CreateSalesOrderDto["products"] }> {
        const productIds = order.products.filter((product) => product.productId != undefined).map((product) => Number.parseInt(product.productId!))
        const drinks = await this.db.products.findMany({
            where: {
                id: {
                    in: productIds,
                },
                category: {
                    in: ["Bebidas", "Cervezas"],
                },
            },
            select: {
                id: true,
            }
        })
        const drinkIds = new Set(drinks.map((product) => product.id))
        const drinksOrder = order.products.filter((product) => product.productId && drinkIds.has(Number.parseInt(product.productId)))
        const foodsOrder = order.products.filter((product) => product.productId && !drinkIds.has(Number.parseInt(product.productId)))
        return { drinks: drinksOrder, foods: foodsOrder }
    }

    async createOrderDB(createSalesOrderDto: CreateSalesOrderDto) {
        const { tableId, state, products, user } = createSalesOrderDto;

        return await this.db.salesOrders.create({
            data: {
                state: state ?? 'libre',
                table: Number.parseInt(tableId),
                user: user,
                salesOrderProducts: {
                    createMany: {
                        data: products.map(({ productId, quantity, observations }: any) => ({
                            quantity,
                            observations,
                            product: Number.parseInt(productId),
                        })),
                    },
                },
            },
            include: {
                tables: true,
                salesOrderProducts: {
                    include: {
                        products: true,
                    },
                },
            },
        })
    }

    async create(createSalesOrderDto: CreateSalesOrderDto): Promise<Response> {
        let response: Response = {
            success: false,
            message: "",
        }
        try {
            const separateProducts = await this.separateProducts(createSalesOrderDto)
            const newOrder: SalesOrders[] = [];

            if (separateProducts.foods.length > 0) {
                const nOrder = await this.createOrderDB({ ...createSalesOrderDto, products: separateProducts.foods });
                newOrder.push(nOrder);
            }
            if (separateProducts.drinks.length > 0) {
                const nOrder = await this.createOrderDB({ ...createSalesOrderDto, products: separateProducts.drinks });
                newOrder.push(nOrder);
            }

            const all = await this.findAll()
            all?.data && this.webSocket.emitSalesOrder(all.data)
            response.data = newOrder;
            response.message = "Orden creada";
            response.success = true;
            this.logger.debug(`Orden creada: ${JSON.stringify(newOrder)}`)
        } catch (error: any) {
            this.logger.error(error.message)
            response.message = error.message;
        }
        return response
    }

    async findAll(): Promise<Response<SalesOrderWithRelations[]>> {
        let response: Response<SalesOrderWithRelations[]> = {
            success: false,
            message: "",
        }
        try {
            const doc = await this.db.salesOrders.findMany({
                include: {
                    tables: true,
                    salesOrderProducts: {
                        include: {
                            products: true,
                        },
                    },
                },
            })
            response.message = "Successful operation"
            response.success = true
            response.data = doc;
        }
        catch (error: any) {
            response.message = error.message
        }
        return response
    }

    async findOne(id: string): Promise<Response<SalesOrderWithRelations[]>> {
        let response: Response<SalesOrderWithRelations[]> = {
            success: false,
            message: "",
        }
        try {
            const doc = await this.db.salesOrders.findUnique({
                where: { id: Number.parseInt(id) },
                include: {
                    tables: true,
                    salesOrderProducts: {
                        include: {
                            products: true,
                        },
                    },
                },
            })
            response.message = 'Order encontrada';

            if (!doc) response.message = 'Order no encontrada';
            response.success = true;
            response.data = doc ? [doc] : [];
        } catch (error: any) {
            response.message = error.message;
        }
        return response
    }

    async update(id: string, updateSalesOrderDto: UpdateSalesOrderDto): Promise<Response<SalesOrderWithRelations[]>> {
        let response: Response<SalesOrderWithRelations[]> = {
            success: false,
            message: "",
        }
        try {
            const orderId = Number.parseInt(id)
            const { tableId, state, products } = updateSalesOrderDto

            const doc = await this.db.$transaction(async (tx) => {
                const updatedOrder = await tx.salesOrders.update({
                    where: { id: orderId },
                    data: {
                        ...(state && { state }),
                        ...(tableId && { table: Number.parseInt(tableId) }),
                        updatedAt: new Date(),
                    },
                })

                if (products) {
                    await tx.salesOrderProducts.deleteMany({
                        where: { order: orderId },
                    })

                    if (products.length > 0) {
                        await tx.salesOrderProducts.createMany({
                            data: products.map(({ productId, product, quantity, observations }: any) => ({
                                order: updatedOrder.id,
                                product: Number.parseInt(productId ?? product),
                                quantity,
                                observations: observations ?? '',
                            })),
                        })
                    }
                }

                return tx.salesOrders.findUnique({
                    where: { id: updatedOrder.id },
                    include: {
                        tables: true,
                        salesOrderProducts: {
                            include: {
                                products: true,
                            },
                        },
                    },
                })
            })

            const all = await this.findAll()
            all?.data && this.webSocket.emitSalesOrder(all.data)
            response.message = `Order with ID ${id} updated successfully`;
            response.success = true;
            response.data = doc ? [doc] : [];
        } catch (error: any) {
            response.message = error.message;
        }
        return response
    }

    async remove(id: string): Promise<Response<SalesOrderWithRelations[]>> {
        let response: Response<SalesOrderWithRelations[]> = {
            success: false,
            message: "",
        }
        try {
            const orderId = Number.parseInt(id)

            const doc = await this.db.$transaction(async (tx) => {
                await tx.salesOrderProducts.deleteMany({
                    where: { order: orderId },
                })

                return tx.salesOrders.delete({
                    where: { id: orderId },
                    include: {
                        tables: true,
                        salesOrderProducts: {
                            include: {
                                products: true,
                            },
                        },
                    },
                })
            })

            const all = await this.findAll()
            all?.data && this.webSocket.emitSalesOrder(all.data)
            response.message = `Order with ID ${id} deleted successfully`;
            response.success = true;
            response.data = doc ? [doc] : [];
        } catch (error: any) {
            response.message = error.message;
        }
        return response
    }

}
