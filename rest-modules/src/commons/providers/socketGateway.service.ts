import {
    ConnectedSocket,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Prisma, Tables } from '../../../generated/prisma/client';
import { PostgresService } from './postgres.service';
import { Logger } from '@nestjs/common';

type SalesOrderWithRelations = Prisma.SalesOrdersGetPayload<{
    include: {
        tables: true,
        salesOrderProducts: {
            include: {
                products: true,
            }
        }
    },
}>

type ClientSalesOrder = Omit<SalesOrderWithRelations, 'table' | 'tables' | 'salesOrderProducts'> & {
    table: SalesOrderWithRelations['tables'];
    products: {
        product: SalesOrderWithRelations['salesOrderProducts'][number]['products'];
        quantity: SalesOrderWithRelations['salesOrderProducts'][number]['quantity'];
        observations: string;
    }[];
};

type ProductWithRelations = Prisma.ProductsGetPayload<{
    include: {
        productsIngredients: {
            include: {
                ingredients: true,
            }
        },
        priceMeassures: true,
    },
}>

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class EventsGateway {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(EventsGateway.name)
    constructor(private readonly db: PostgresService) { }

    handleConnection(client: Socket) {
        this.logger.debug(`Cliente conectado: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.debug(`Cliente desconectado: ${client.id}`);
    }

    @SubscribeMessage('order:subscribe')
    async handleOrderSubscribe(@ConnectedSocket() client: Socket) {
        const orders = await this.findAllSalesOrders();
        client.emit('order:updated', this.toClientSalesOrders(orders));
    }

    emitSalesOrder(order: SalesOrderWithRelations[]) {
        this.server.emit('order:updated', this.toClientSalesOrders(order));
    }

    @SubscribeMessage('table:subscribe')
    async handleTablesSubscribe(@ConnectedSocket() client: Socket) {
        const tables = await this.findAllTables();
        client.emit('table:updated', tables);
    }

    emitTables(tables: Tables[]) {
        this.server.emit('table:updated', tables);
    }

    @SubscribeMessage('menu:subscribe')
    async handleMenuSubscribe(@ConnectedSocket() client: Socket) {
        const menu = await this.findAllMenu();
        client.emit('menu:updated', menu);
    }

    emitMenu(menu: ProductWithRelations[]) {
        this.server.emit('menu:updated', menu);
    }

    private findAllSalesOrders() {
        return this.db.salesOrders.findMany({
            include: {
                tables: true,
                salesOrderProducts: {
                    include: {
                        products: true,
                    },
                },
            },
        });
    }

    private findAllTables() {
        return this.db.tables.findMany();
    }

    private findAllMenu() {
        return this.db.products.findMany({
            include: {
                productsIngredients: {
                    include: {
                        ingredients: true,
                    },
                },
                priceMeassures: true,
            },
        });
    }

    private toClientSalesOrders(orders: SalesOrderWithRelations[]): ClientSalesOrder[] {
        return orders.map(({ tables, salesOrderProducts, ...order }) => ({
            ...order,
            table: tables,
            products: salesOrderProducts.map(({ products, quantity, observations }) => ({
                product: products,
                quantity,
                observations,
            })),
        }));
    }
}
