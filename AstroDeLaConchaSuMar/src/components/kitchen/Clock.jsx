import { useState, useEffect } from 'react';

export default function ContadorReact({ horaInicialStr }) {
    const [tiempo, setTiempo] = useState('');

    // Función para convertir YYYYMMDDHHmmSS a milisegundos
    const parsearFecha = (str) => {
        const y = str.substring(0, 4);
        const m = str.substring(4, 6) - 1;
        const d = str.substring(6, 8);
        const h = str.substring(8, 10);
        const min = str.substring(10, 12);
        const s = str.substring(12, 14);
        return new Date(y, m, d, h, min, s).getTime();
    };

    useEffect(() => {
        const inicioMs = parsearFecha(horaInicialStr);

        const intervalo = setInterval(() => {
            const ahora = Date.now();
            const diferencia = ahora - inicioMs;

            if (diferencia < 0) {
                setTiempo("Fecha futura");
                return;
            }

            const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

            const fmt = (n) => n.toString().padStart(2, '0');
            setTiempo(`${fmt(minutos)}m ${fmt(segundos)}s`);
        }, 1000);

        // Limpieza al desmontar el componente
        return () => clearInterval(intervalo);
    }, [horaInicialStr]);

    return (
        <div >
            <span className="order-time" style={{fontSize:'14px', color:'var(--color-text-secondary)'}}>{tiempo || 'Cargando...'}</span>
        </div>
    );
}

