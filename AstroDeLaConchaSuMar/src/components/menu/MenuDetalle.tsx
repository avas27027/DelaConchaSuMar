import React, { useEffect, useState } from 'react';
import DishGrid from './DishGrid';
import CurrentOrder, { type OrderItem } from './CurrentOrder';
import type { DishCardProps } from './DishCard';
import './MenuDetalle.css';
import { subscribeToTableOrders } from '../../controller/salesOrders.hook';

interface MenuDetalleProps {
    readonly mesaName: string;
    readonly initialDishes: DishCardProps[];
}

export default function MenuDetalle({ mesaName, initialDishes }: MenuDetalleProps) {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [prevOrders, setPrevOrders] = useState<Array<{ orderId: string, state: string, products: OrderItem[] }>>([])

    useEffect(() => {
        const unsubscribe = subscribeToTableOrders(["pending", "cooked", "toCook"], (orders) => {
            setPrevOrders(orders.map((order) => {
                const products: OrderItem[] = []
                order.products.forEach(product =>
                    products.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: product.quantity,
                        observations: product.observations
                    })
                );
                return {
                    orderId: order.id,
                    state: order.state,
                    products
                }
            }));
        }, mesaName);
        return () => {
            unsubscribe();
        }
    }, [mesaName]);

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
            <CurrentOrder name={mesaName} orders={orders} prevOrders={prevOrders} onRemoveOrder={handleRemoveOrder} />
        </div>
    );
}
