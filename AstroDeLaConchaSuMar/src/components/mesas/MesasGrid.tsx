import { useEffect, useMemo, useState } from "react";
import MesasCard, { type MesasCardProps } from "./MesasCard";
import Modal from "./Modal";
import "./MesasGrid.css";
import { salesOrdersHook, tablesHook, type SalesOrderJSONInterface, getTableStatePriority, toTableVisualState, type TableVisualState } from "../../controller/salesOrders.hook";

const backendUrl = import.meta.env.PUBLIC_BACKEND_URL ?? "http://127.0.0.1:3001";

export default function MesasGrid() {

    const [mesasCard, setMesasCard] = useState<MesasCardProps[]>([])

    useEffect(() => {
        const unsubscribeTables = tablesHook((tables) => {
            const newMesasCard = tables.map((table) => ({
                id: table.id,
                name: table.place,
                chairs: 4,
                state: "libre" as TableVisualState,
                number: Number.parseInt(table.name) || 0
            }))
            setMesasCard(newMesasCard);
        })

        const unsubscribeSalesOrders = salesOrdersHook((salesOrders) => {
            const newOrderSalesMap = new Map<string, SalesOrderJSONInterface[]>();
            salesOrders.forEach((order) => {
                const tableId = order.table;
                const ordersForTable = newOrderSalesMap.get(tableId) || [];
                ordersForTable.push(order);
                newOrderSalesMap.set(tableId, ordersForTable);
            });

            setMesasCard((prevMesasCard) => prevMesasCard.map((mesa) => {
                const ordersForTable = newOrderSalesMap.get(mesa.id) || [];
                let updateAt = "";
                const visualState = ordersForTable.reduce((state, order) => {
                    const orderVisualState = toTableVisualState(order.state);
                    if (getTableStatePriority(orderVisualState) > getTableStatePriority(state)) {
                        updateAt = order.updateAt || "";
                        return orderVisualState;
                    }
                    return state;
                }, "libre" as TableVisualState);
                return {
                    ...mesa, state: visualState, updateAt: updateAt
                }
            }))
        })

        return () => {
            unsubscribeTables();
            unsubscribeSalesOrders();
        }
    }, [mesasCard]);

    const content = useMemo(() => {
        return mesasCard.map((mesa) => <MesasCard key={mesa.id} {...mesa} />);
    }, [mesasCard]);

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
