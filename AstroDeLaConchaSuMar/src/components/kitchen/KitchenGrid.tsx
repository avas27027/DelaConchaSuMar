import React, { useEffect, useMemo, useState } from 'react';
import KitchenTicket from './KitchenTicket';
import './KitchenGrid.css';
import { listenSocket, type ProductJSONInterface, type SalesOrderJSONInterface, type TableJSONInterface } from '../../controller/salesOrders.hook';

export default function KitchenGrid() {
    const [orders, setOrders] = useState<SalesOrderJSONInterface[]>([]);
    const [tables, setTables] = useState<Map<string, TableJSONInterface>>(new Map());
    const [products, setProducts] = useState<Map<string, ProductJSONInterface>>(new Map());

    useEffect(() => {
        const unsubscribeTables = listenSocket("table", (snapshot) => {
            setTables(new Map(snapshot.map((table) => [table.id, table])));
        })
        const unsubscribeProducts = listenSocket("menu", (snapshot) => {
            setProducts(new Map(snapshot.map((product) => [product.id, product])));
        })
        const unsubscribeOrders = listenSocket("order", (snapshot) => {
            setOrders(snapshot.filter(order => order.state === "toCook"));
        });
        return () => {
            unsubscribeOrders();
            unsubscribeProducts();
            unsubscribeTables();
        }
    }, [])

    const kitchenOrders = useMemo(() => {
        return orders.map((order, i) => {
            const orderProducts = order.products.map(
                ({ observations, product, quantity }) => ({
                    observations,
                    name: products.get(product.id)?.name || "",
                    quantity,
                })
            );

            return {
                id: order.id,
                orderNumber: `0${i + 1}`,
                customerName: tables.get(order.table.id)?.name || "",
                time: new Date(order.createdAt ?? order.updatedAt).getTime(),
                items: orderProducts,
            };
        });
    }, [orders, products, tables]);

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
