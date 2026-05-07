import type { TableVisualState } from "../../controller/salesOrders.hook";
import "./MesasCard.css";


export interface MesasCardProps {
    readonly id: string;
    readonly name: string;
    readonly state: TableVisualState;
    readonly number: number;
    readonly chairs: number;
}

const stateColors: Record<TableVisualState, readonly [string, string]> = {
    libre: ["var(--color-white)", "var(--color-brand-cyan)"],
    preparacion: ["var(--color-brand-cyan)", "var(--color-white)"],
    cocinado: ["var(--color-yellow)", "var(--color-white)"],
};

export default function MesasCard({
    id,
    name,
    chairs,
    state,
    number,
}: MesasCardProps) {
    const [backgroundColor, textColor] = stateColors[state];

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
            </div>
            <div className="mesa-content">
                <h2 style={{ color: textColor }}>{name}</h2>
                <span style={{ color: textColor }}>{chairs} personas</span>
            </div>
        </a>
    );
}
