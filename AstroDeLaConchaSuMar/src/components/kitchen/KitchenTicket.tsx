import { useState, useEffect } from 'react';
import './KitchenTicket.css';

export interface KitchenTicketProps {
    readonly id: string;
    readonly orderNumber: string;
    readonly customerName: string;
    readonly time: number;
    readonly items: readonly {
        readonly quantity: number;
        readonly name: string;
        readonly note?: string;
    }[];
}
const backendUrl = import.meta.env.PUBLIC_BACKEND_URL ?? "http://127.0.0.1:3001";

export default function KitchenTicket({ id, orderNumber, customerName, time, items }: KitchenTicketProps) {
    const [tiempo, setTiempo] = useState('');
    const [urgency, setUrgency] = useState('new');
    const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

    const urgencyColors: Record<string, string> = {
        'high': '#ba1a1a',
        'medium': '#973307',
        'new': '#007791',
        'in-progress': 'var(--color-sea-cyan)'
    };

    const urgencyTags: Record<string, string> = {
        'high': 'Alta Prioridad',
        'medium': 'Pendiente',
        'new': 'Nuevo',
        'in-progress': 'En Proceso'
    };

    const urgencyTagBg: Record<string, string> = {
        'high': '#ffdad6',
        'medium': '#fff1e0',
        'new': '#b5ebff',
        'in-progress': '#dbe4ea'
    };

    const urgencyTagText: Record<string, string> = {
        'high': '#ba1a1a',
        'medium': '#973307',
        'new': '#007791',
        'in-progress': 'var(--color-sea-cyan)'
    };

    const borderColor = urgencyColors[urgency];
    const allItemsChecked = items.length > 0 && checkedItems.size === items.length;

    const toggleItemCheck = (itemIndex: number) => {
        setCheckedItems((prev) => {
            const nextCheckedItems = new Set(prev);

            if (nextCheckedItems.has(itemIndex)) {
                nextCheckedItems.delete(itemIndex);
            } else {
                nextCheckedItems.add(itemIndex);
            }

            return nextCheckedItems;
        });
    };

    const handleReady = () => {
        if (!allItemsChecked) return;

        fetch(`${backendUrl}/sales-orders/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                state: 'cooked',
            }),
        }).then(() => {
            console.log('Order marked as cooked');
        });
    }

    useEffect(() => {
        setCheckedItems(new Set());
    }, [id, items]);

    useEffect(() => {
        const inicioMs = time;
        const intervalo = setInterval(() => {
            const ahora = Date.now();
            const diferencia = ahora - inicioMs;

            if (diferencia < 0) {
                setTiempo("Fecha futura");
                return;
            }

            const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

            if (minutos >= 10) {
                setUrgency('high');
            } else if (minutos >= 5) {
                setUrgency('medium');
            } else if (minutos >= 1) {
                setUrgency('in-progress');
            } else {
                setUrgency('new');
            }

            const fmt = (n: number) => n.toString().padStart(2, '0');
            setTiempo(`${fmt(minutos)}m ${fmt(segundos)}s`);
        }, 1000);

        // Limpieza al desmontar el componente
        return () => clearInterval(intervalo);
    }, [time]);

    return (
        <div className="kitchen-ticket" style={{ borderColor: borderColor }}>
            <div className="ticket-header">
                <div className="header-left">
                    <h2 className="order-number">Pedido #{orderNumber}</h2>
                    <p className="customer-name">Mesa 0{customerName} - {id}</p>
                </div>
                <div className="header-right">
                    <span className="urgency-tag" style={{ backgroundColor: urgencyTagBg[urgency], color: urgencyTagText[urgency] }}>
                        {urgencyTags[urgency]}
                    </span>
                    <span className="order-time">{tiempo || 'Cargando...'}</span>
                </div>
            </div>

            <div className="ticket-items">
                {items.map((item, i) => (
                    <div key={`item-${i + 1}`} className="ticket-item">
                        <input
                            type="checkbox"
                            className="item-check"
                            checked={checkedItems.has(i)}
                            onChange={() => toggleItemCheck(i)}
                            aria-label={`Marcar ${item.name} como preparado`}
                        />
                        <div className="item-quantity">{item.quantity}</div>
                        <div className="item-details">
                            <p className={`item-name ${checkedItems.has(i) ? 'checked' : ''}`}>{item.name}</p>
                            {item.note && <p className="item-note">{item.note}</p>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="ticket-footer">
                <button className="btn-ready" onClick={handleReady} disabled={!allItemsChecked}>Marcar como Listo</button>
            </div>
        </div>
    );
}

