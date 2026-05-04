import React, { useState } from 'react';

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

interface CurrentOrderProps {
    readonly name: string;
    readonly orders: OrderItem[];
    readonly onRemoveOrder: (id: string) => void;
}

export default function CurrentOrder({ name, orders, onRemoveOrder }: CurrentOrderProps) {
    const [observations, setObservations] = useState('');

    const total = orders.reduce((acc, order) => acc + (order.price * order.quantity), 0);
    const igv = total * 0.18;
    const subtotal = total - igv;

    const sendToKitchen = () => {
        const sendJson = {
            tableId: name,
            state: 'toCook',
            observations: observations,
            products: orders.map((order) => {
                return {
                    productId: order.id,
                    quantity: order.quantity
                }
            })
        }
        console.log(sendJson);

        fetch(
            `${"http://127.0.0.1:3001"}/sales-orders`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(sendJson),
            },
        )
            .then((res) => res.json())
            .catch((error) => {
                console.error("Error creating sale:", error);
                return { data: [] };
            });

    };

    const confirmOrder = () => {
        const sendJson = {
            tableId: name,
            state: 'toPay',
            observations: observations,
            products: orders.map((order) => {
                return {
                    productId: order.id,
                    quantity: order.quantity
                }
            })
        }
        console.log(sendJson);

    };

    return (
        <aside className="current-order">
            <div className="order-header">
                <h2>Pedido Actual</h2>
                <span className="table-badge">{name}</span>
            </div>

            <div className="order-content">
                <div className="order-items">
                    {orders.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: '20px' }}>No hay platillos seleccionados.</p>
                    ) : (
                        orders.map((order) => (
                            <div className="order-item" key={order.id}>
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
                        ))
                    )}

                    <div className="order-footer">
                        <div className="observations-group">
                            <label htmlFor="observations">Observaciones</label>
                            <textarea
                                id="observations"
                                placeholder="Ej: Sin picante, extra ají..."
                                value={observations}
                                onChange={(e) => setObservations(e.target.value)}
                                className="observations-input"
                            ></textarea>
                        </div>

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
                            <button className="btn-kitchen" onClick={sendToKitchen}> Enviar a cocina </button>
                            <button className="btn-confirm" onClick={confirmOrder}> Confirmar Pedido </button>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
