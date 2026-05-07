import { useEffect, useMemo, useState } from "react";
import MesasCard, { type MesasCardProps } from "./MesasCard";
import Modal from "./Modal";
import "./MesasGrid.css";
import { subscribeToTableStates, type TableStatesMap } from "../../controller/salesOrders.hook";

interface RestTable {
    readonly id: string;
    readonly name: string;
    readonly place: string;
}

interface TablesResponse {
    readonly data?: readonly RestTable[];
}

const backendUrl = import.meta.env.PUBLIC_BACKEND_URL ?? "http://localhost:3001";

function toMesaCardProps({ id, name, place }: RestTable): MesasCardProps {
    return {
        id,
        number: Number.parseInt(name, 10),
        name: place,
        chairs: 0,
        state: "libre",
    };
}

export default function MesasGrid() {
    const [tables, setTables] = useState<MesasCardProps[]>([]);
    const [tableStates, setTableStates] = useState<TableStatesMap>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        async function loadTables() {
            try {
                const response = await fetch(`${backendUrl}/tables`, {
                    method: "GET",
                    signal: controller.signal,
                });
                const result = (await response.json()) as TablesResponse;
                const nextTables = (result.data ?? [])
                    .map(toMesaCardProps)
                    .sort((a, b) => a.number - b.number);

                setTables(nextTables);
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error("Error fetching tables:", error);
                    setTables([]);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        const unsubscribe = subscribeToTableStates(["pending", "toCook", "cooked"], setTableStates);

        loadTables();

        return () => {
            controller.abort();
            unsubscribe();
        }
    }, []);

    const content = useMemo(() => {
        if (isLoading) {
            return <p className="mesas-grid-status">Cargando mesas...</p>;
        }

        return tables.map((mesa) => (
            <MesasCard key={mesa.id} {...mesa} state={tableStates[mesa.id] ?? "libre"} />
        ));
    }, [isLoading, tables, tableStates]);

    return (
        <div className="mesas-grid">
            {content}
            <div className="mesa-bone">
                <Modal
                    title="Nueva Mesa"
                    height="194px"
                    width="100%"
                    button={<p>+</p>}
                />
            </div>
        </div>
    );
}
