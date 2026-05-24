import React, { useEffect, useState } from 'react';
import KitchenTicket, { type KitchenTicketProps } from './KitchenTicket';
import './KitchenGrid.css';
import { productsHook, salesOrdersHook, tablesHook, type ProductJSONInterface, type SalesOrderJSONInterface, type TableJSONInterface } from '../../controller/salesOrders.hook';

export default function KitchenGrid() {
    const [kitchenOrders, setKitchenOrders] = useState<KitchenTicketProps[]>([]);
    const [tables, setTables] = useState<Map<string, TableJSONInterface>>(new Map());
    const [products, setProducts] = useState<Map<string, ProductJSONInterface>>(new Map());

    useEffect(() => {
        const unsubscribeTables = tablesHook((tables) => {
            setTables(new Map(tables.map(table => [table.id, table])));
        })
        const unsubscribeProducts = productsHook((products) => {
            setProducts(new Map(products.map(product => [product.id, product])));
        })
        const unsubscribeOrders = salesOrdersHook((orders) => {
            const kO: KitchenTicketProps[] = orders.map((order: SalesOrderJSONInterface, i: number) => {
                const order_x_products = order.products.map(({ observations, product, quantity }) => {
                    return { observations, name: products.get(product)?.name || "", quantity }
                })
                return {
                    id: order.id,
                    orderNumber: `0${i + 1}`,
                    customerName: tables.get(order.table)?.name || "",
                    time: new Date(order.createdAt).getTime(),
                    items: order_x_products
                }
            })
            setKitchenOrders(kO);
        })
        return () => {
            unsubscribeOrders();
            unsubscribeProducts();
            unsubscribeTables();
        }
    }, [kitchenOrders, products, tables])
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
