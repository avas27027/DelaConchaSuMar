import { useEffect, useState } from "react";
import type { TableVisualState } from "../../controller/salesOrders.hook";
import "./MesasCard.css";


export interface MesasCardProps {
    readonly id: string;
    readonly name: string;
    readonly state: TableVisualState;
    readonly number: number;
    readonly chairs: number;
    readonly updateAt?: string;
}

const stateColors: Record<TableVisualState, readonly [string, string]> = {
    libre: ["var(--color-white)", "var(--color-brand-cyan)"],
    preparacion: ["var(--color-brand-cyan)", "var(--color-white)"],
    cocinado: ["var(--color-yellow)", "var(--color-white)"],
    entregado: ["var(--color-white)", "var(--color-accent-orange)"],
};

export default function MesasCard({
    id,
    name,
    chairs,
    state,
    number,
    updateAt,
}: MesasCardProps) {
    const [backgroundColor, textColor] = stateColors[state];
    const [tiempo, setTiempo] = useState("");

    useEffect(() => {
        if(!updateAt) return;
        const inicioMs = new Date(updateAt).getTime();
        const intervalo = setInterval(() => {
            const ahora = Date.now();
            const diferencia = ahora - inicioMs;

            if (diferencia < 0) {
                setTiempo("Fecha futura");
                return;
            }

            const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

            const fmt = (n: number) => n.toString().padStart(2, '0');
            setTiempo(`${fmt(minutos)}m ${fmt(segundos)}s`);
        }, 1000);

        // Limpieza al desmontar el componente
        return () => clearInterval(intervalo);
    }, [updateAt]);

    return (
        <a
            className="mesa-card"
            style={{ backgroundColor, color: textColor }}
            href={`/mesas/${id}`}
        >
            <div className="mesa-number">
                <span style={{ color: textColor }}>
                    {String(number).padStart(2, "0")}
                </span>
            </div>
            <div
                className="mesa-badge"
                style={{ backgroundColor: textColor }}
            >
                <span style={{ color: backgroundColor }}>{state}</span>
                <span style={{ color: backgroundColor }}>{tiempo}</span>
            </div>
            <div className="mesa-content">
                <h2 style={{ color: textColor }}>{name}</h2>
                <span style={{ color: textColor }}>{chairs} personas</span>
            </div>
        </a>
    );
}
