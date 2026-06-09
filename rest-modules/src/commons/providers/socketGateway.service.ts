import {
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Prisma, Tables } from '../../../generated/prisma/client';

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

    handleConnection(client: Socket) {
        console.log('Cliente conectado:', client.id);
    }

    handleDisconnect(client: Socket) {
        console.log('Cliente desconectado:', client.id);
    }

    emitSalesOrder(order: SalesOrderWithRelations[]) {
        this.server.emit('salesOrder:updated', order);
    }

    emitTables(tables: Tables[]) {
        this.server.emit('tables:updated', tables);
    }

    emitMenu(menu: ProductWithRelations[]) {
        this.server.emit('menu:updated', menu);
    }
}
