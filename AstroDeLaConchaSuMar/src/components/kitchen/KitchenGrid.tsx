import React, { useEffect, useMemo, useState } from 'react';
import KitchenTicket, { type KitchenTicketProps } from './KitchenTicket';
import './KitchenGrid.css';
import { productsHook, salesOrdersHook, tablesHook, type ProductJSONInterface, type SalesOrderJSONInterface, type TableJSONInterface } from '../../controller/salesOrders.hook';

export default function KitchenGrid() {
    const [orders, setOrders] = useState<SalesOrderJSONInterface[]>([]);
    const [tables, setTables] = useState<Map<string, TableJSONInterface>>(new Map());
    const [products, setProducts] = useState<Map<string, ProductJSONInterface>>(new Map());

    useEffect(() => {
        const unsubscribeTables = tablesHook((tables) => {
            setTables(new Map(tables.map((table) => [table.id, table])));
        })
        const unsubscribeProducts = productsHook((products) => {
            setProducts(new Map(products.map((product) => [product.id, product])));
        })
        const unsubscribeOrders = salesOrdersHook((orders) => {
            setOrders(orders);
        }, [{ prop: "state", operation: "in", value: [ "toCook"] }])
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
                time: new Date(order.createdAt).getTime(),
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
