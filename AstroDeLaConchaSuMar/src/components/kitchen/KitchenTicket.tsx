import { useState, useEffect } from 'react';
import './KitchenTicket.css';

interface KitchenTicketProps {
    readonly orderNumber: string;
    readonly customerName: string;
    readonly time: string;
    readonly items: readonly {
        readonly quantity: number;
        readonly name: string;
        readonly note?: string;
    }[];
}

export default function KitchenTicket({ orderNumber, customerName, time, items }: KitchenTicketProps) {
    const [tiempo, setTiempo] = useState('');
    const [urgency, setUrgency] = useState('new');

    const urgencyColors: Record<string, string> = {
        'high': '#ba1a1a',
        'medium': '#973307',
        'new': '#007791',
        'in-progress': '#005d72'
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
        'in-progress': '#005d72'
    };

    const borderColor = urgencyColors[urgency];

    // Función para convertir YYYYMMDDHHmmSS a milisegundos
    const parsearFecha = (str: any) => {
        const y = str.substring(0, 4);
        const m = str.substring(4, 6) - 1;
        const d = str.substring(6, 8);
        const h = str.substring(8, 10);
        const min = str.substring(10, 12);
        const s = str.substring(12, 14);
        return new Date(y, m, d, h, min, s).getTime();
    };

    useEffect(() => {
        const inicioMs = parsearFecha(time);

        const intervalo = setInterval(() => {
            const ahora = Date.now();
            const diferencia = ahora - inicioMs;

            if (diferencia < 0) {
                setTiempo("Fecha futura");
                return;
            }

            const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

            if(minutos >= 10) {
                setUrgency('high');
            } else if(minutos >= 5) {
                setUrgency('medium');
            } else if(minutos >= 1) {
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
        <div className="kitchen-ticket" style={{ borderColor: borderColor}}>
            <div className="ticket-header">
                <div className="header-left">
                    <h2 className="order-number">Pedido #{orderNumber}</h2>
                    <p className="customer-name">{customerName}</p>
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
                    <div key={`item-${i+1}`} className="ticket-item">
                        <div className="item-quantity">{item.quantity}</div>
                        <div className="item-details">
                            <p className="item-name">{item.name}</p>
                            {item.note && <p className="item-note">{item.note}</p>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="ticket-footer">
                <button className="btn-ready">Marcar como Listo</button>
            </div>
        </div>
    );
}

