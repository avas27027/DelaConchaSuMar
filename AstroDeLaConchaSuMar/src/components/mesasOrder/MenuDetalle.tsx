import React, { useEffect, useMemo, useState } from 'react';
import DishGrid from './DishGrid';
import CurrentOrder, { type OrderItem } from './CurrentOrder';
import type { DishCardProps } from './DishCard';
import './MenuDetalle.css';
import { listenSocket, type ProductJSONInterface, type SalesOrderJSONInterface, type TableJSONInterface } from '../../controller/salesOrders.hook';

interface MenuDetalleProps {
    readonly mesaName: string;
    readonly initialDishes: DishCardProps[];
}

export default function MenuDetalle({ mesaName, initialDishes }: MenuDetalleProps) {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [products, setProducts] = useState<Map<string, ProductJSONInterface>>(new Map());
    const [tables, setTables] = useState<Map<string, TableJSONInterface>>(new Map());
    const [ordersJSON, setOrdersJSON] = useState<SalesOrderJSONInterface[]>([]);

    useEffect(() => {
        const unsubscribeTables = listenSocket("table", (snapshot) => {
            setTables(new Map(snapshot.map((table) => [table.id, table])));
        })
        const unsubscribeProducts = listenSocket("menu", (snapshot) => {
            setProducts(new Map(snapshot.map((product) => [product.id, product])));
        })
        const unsubscribeOrders = listenSocket("order", (snapshot) => {
            setOrdersJSON(snapshot.filter((order) => order.state === "pending" || order.state === "cooked" || order.state === "toCook"));
        })
        return () => {
            unsubscribeOrders();
            unsubscribeProducts();
            unsubscribeTables();
        }
    }, []);

    const prevOrders = useMemo(() => {
        return ordersJSON
            .filter((order) => Number.parseInt(order.table.id) === Number.parseInt(mesaName))
            .map((order) => {
                const orderProducts = order.products.map(
                    ({ observations, product, quantity }) => ({
                        id: product.id,
                        name: products.get(product.id)?.name || "",
                        price: products.get(product.id)?.price || 0,
                        quantity,
                        observations,
                    })
                );
                return {
                    orderId: order.id,
                    state: order.state,
                    products: orderProducts,
                };
            });
    }, [ordersJSON, products, tables]);

    const handleDishClick = (dish: DishCardProps) => {
        setOrders(prevOrders => {
            const existingOrderIndex = prevOrders.findIndex(o => o.id === dish.id);
            if (existingOrderIndex >= 0) {
                const newOrders = [...prevOrders];
                newOrders[existingOrderIndex].quantity += 1;
                return newOrders;
            } else {
                return [...prevOrders, {
                    id: dish.id,
                    name: dish.title.replace('\n', ' '), // Handle multi-line titles if any
                    price: Number(dish.price),
                    quantity: 1
                }];
            }
        });
    };

    const handleRemoveOrder = (id: string) => {
        setOrders(prevOrders => prevOrders.filter(o => o.id !== id));
    };

    return (
        <div className="menuDetalle-container">
            <DishGrid dishes={initialDishes} onDishClick={handleDishClick} />
            <CurrentOrder
                name={mesaName}
                orders={orders}
                prevOrders={prevOrders}
                onRemoveOrder={handleRemoveOrder}
                onSubmit={() => setOrders([])} />
        </div>
    );
}
