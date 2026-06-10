import React, { useEffect, useState } from 'react';
import { backendConection, verifySessionToken, type UserJSONInterface } from '../../controller/salesOrders.hook';

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    observations?: string;
}

interface CurrentOrderProps {
    readonly name: string;
    readonly orders: OrderItem[];
    readonly prevOrders: { orderId: string, state: string, products: OrderItem[] }[]
    readonly onRemoveOrder: (id: string) => void;
    readonly onSubmit: () => void;
}


export default function CurrentOrder({ name, orders, prevOrders, onRemoveOrder, onSubmit }: CurrentOrderProps) {
    const [productObservations, setProductObservations] = useState<Record<string, string>>({});
    const [userData, setUserData] = useState<UserJSONInterface | null>(null)

    const stateLabels: Record<string, string> = {
        pending: 'Pendiente',
        toCook: 'En cocina',
        cooked: 'Listo',
        toPay: 'Por pagar',
    };

    const total = orders.reduce((acc, order) => acc + (order.price * order.quantity), 0) +
        prevOrders.reduce((acc, order) => acc +
            (order.products.reduce((acc2, order2) => acc2 + (order2.price * order2.quantity), 0)),
            0
        );
    const igv = total * 0.18;
    const subtotal = total - igv;

    useEffect(() => {
        verifySessionToken().then((res) => {
            if (!res.success || !res.data) throw new Error("Error al cargar la sesion");
            setUserData(res.data)
        }).catch((error: any) => {
            console.error(error.message);
            alert("No se pudo obtener la sesion, por favor recargue la pagina o inicie sesion nuevamente");
        });
    }, [])


    const handleObservationChange = (productId: string, observation: string) => {
        setProductObservations((prev) => ({
            ...prev,
            [productId]: observation,
        }));
    };
    const sendToKitchen = async () => {
        if (!userData) return;
        const sendJson = {
            tableId: name,
            state: 'toCook',
            user: userData.id,
            products: orders.map((order) => {
                return {
                    productId: order.id,
                    quantity: order.quantity,
                    observations: productObservations[order.id] ?? '',
                }
            })
        }
        backendConection("POST", "sales-orders", undefined, sendJson)
            .then((res) => {
                if (res.success) {
                    alert("Pedido enviado a cocina")
                }
            })
        onSubmit();

    };

    const confirmOrder = () => {
        prevOrders.forEach((prevOrder) => {
            if (prevOrder.state != 'cooked') return;
            backendConection("PATCH", "sales-orders", prevOrder.orderId, { state: 'paid' })
                .then((res) => {
                    if (res.success) {
                        alert("Pedido enviado a caja, por favor dirigir al cliente a caja para pagar");
                    }
                })
        });
    };

    return (
        <aside className="current-order">
            <div className="order-header">
                <h2>Pedido Actual</h2>
            </div>

            <div className="order-content">
                <div className="order-items">
                    {[].map(() => {
                        console.log(prevOrders)
                        return <h1>hola</h1>
                    })}
                    {prevOrders.map((prevOrder) => (
                        prevOrder.products.map((product) => (
                            <div className="order-item" key={product.id}>
                                <div className="order-item-main">
                                    <div className="item-info">
                                        <span className="item-qty">{product.quantity}x</span>
                                        <span className="item-name">{product.name}</span>
                                    </div>
                                    <span className={`item-state item-state-${prevOrder.state}`}>
                                        {stateLabels[prevOrder.state] ?? prevOrder.state}
                                    </span>
                                    <span className="item-price">S/ {(product.price * product.quantity).toFixed(2)}</span>
                                </div>
                                {product.observations && (
                                    <p className="item-observations-text">{product.observations}</p>
                                )}
                            </div>
                        ))
                    ))}
                    {orders.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: '20px' }}>No hay platillos seleccionados.</p>
                    ) : (
                        orders.map((order) => (
                            <div className="order-item" key={order.id}>
                                <div className="order-item-main">
                                    <div className="item-info">
                                        <span className="item-qty">{order.quantity}x</span>
                                        <span className="item-name">{order.name}</span>
                                    </div>
                                    <span className="item-price">S/ {(order.price * order.quantity).toFixed(2)}</span>
                                    <button className="item-btn-delete" onClick={() => onRemoveOrder(order.id)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="none">
                                            <path d="M18 6V16.2C18 17.8802 18 18.7202 17.673 19.362C17.3854 19.9265 16.9265 20.3854 16.362 20.673C15.7202 21 14.8802 21 13.2 21H10.8C9.11984 21 8.27976 21 7.63803 20.673C7.07354 20.3854 6.6146 19.9265 6.32698 19.362C6 18.7202 6 17.8802 6 16.2V6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                                <textarea
                                    placeholder="Observacion para este plato..."
                                    value={productObservations[order.id] ?? ''}
                                    onChange={(e) => handleObservationChange(order.id, e.target.value)}
                                    className="item-observations-input"
                                ></textarea>
                            </div>
                        ))
                    )}

                    <div className="order-footer">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>S/ {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>IGV (18%)</span>
                            <span>S/ {igv.toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>S/ {total.toFixed(2)}</span>
                        </div>

                        <div className="order-buttons">
                            <button className="btn-kitchen" onClick={sendToKitchen} disabled={orders.length === 0}> Enviar a cocina </button>
                            <button className="btn-confirm" onClick={confirmOrder} disabled={!prevOrders.every((order) => order.state === "cooked") || prevOrders.length === 0}> Confirmar Pedido </button>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
