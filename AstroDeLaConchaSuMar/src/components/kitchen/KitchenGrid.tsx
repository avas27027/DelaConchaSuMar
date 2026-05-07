import React, { useEffect } from 'react';
import KitchenTicket, { type KitchenTicketProps } from './KitchenTicket';
import './KitchenGrid.css';
import { subscribeToOrders, type SalesOrderJSONInterface } from '../../controller/salesOrders.hook';

const orders = [
    {
        orderNumber: "042",
        customerName: "Mesa 4 - Juan Pérez",
        time: "20260414173800",
        items: [
            { quantity: 2, name: "Cebiche de Pescado", note: "Sin picante" },
            { quantity: 1, name: "Chicharrón de Calamar" },
            { quantity: 1, name: "Arroz con Mariscos" },
        ],
    },
    {
        orderNumber: "045",
        customerName: "Mesa 12 - Ana García",
        time: "20260414112800",
        items: [
            { quantity: 1, name: "Tiradito en Crema de Rocoto" },
            { quantity: 2, name: "Limonada Jarra" },
        ],
    },
    {
        orderNumber: "048",
        customerName: "Mesa 7 - Carlos Ruiz",
        time: "20260414113800",
        items: [
            { quantity: 3, name: "Causa Acevichada" },
            { quantity: 1, name: "Jalea Mixta" },
        ],
    },
    {
        orderNumber: "040",
        customerName: "Mesa 2 - Para Llevar",
        time: "20260414174000",
        items: [
            { quantity: 1, name: "Chupe de Camarones" },
            { quantity: 1, name: "Parihuela Especial" },
        ],
    },
];

export default function KitchenGrid() {
    const [kitchenOrders, setKitchenOrders] = React.useState<KitchenTicketProps[]>([]);

    useEffect(() => {
        const unsubscribe = subscribeToOrders(['toCook', 'inProgress'], (orders) => {
            console.log(orders);
            const kO: KitchenTicketProps[] = orders.map((order: SalesOrderJSONInterface, i: number) => ({
                id: order.id,
                orderNumber: `0${i + 1}`,
                customerName: order.table.name,
                time: new Date(order.createdAt).getTime(),
                items: order.products.map((p: typeof order.products[number]) => ({
                    quantity: p.quantity,
                    name: p.name,
                    note: p.observations,
                })),
            }));
            setKitchenOrders(kO);
        })
        return () => unsubscribe();
    }, [])
    return (
        <div className="kitchen-grid">
            {kitchenOrders.map((order) => (
                <KitchenTicket key={order.id} {...order} />
            ))}

            <div className="empty-state-filler">
                <p>Espacio para nuevos pedidos</p>
            </div>
        </div>
    );
}
