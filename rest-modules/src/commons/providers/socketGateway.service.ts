// src/events/events.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

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

    @SubscribeMessage('order:create')
    handleOrderCreate(
        @MessageBody() data: any,
        @ConnectedSocket() client: Socket,
    ) {
        this.server.emit('order:created', data);
    }

    emitOrderUpdated(order: any) {
        this.server.emit('order:updated', order);
    }
}