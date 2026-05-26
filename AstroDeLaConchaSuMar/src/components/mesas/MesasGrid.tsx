import { useEffect, useMemo, useState } from "react";
import MesasCard, { type MesasCardProps } from "./MesasCard";
import Modal from "./Modal";
import "./MesasGrid.css";
import { salesOrdersHook, tablesHook, type SalesOrderJSONInterface, getTableStatePriority, toTableVisualState, type TableVisualState } from "../../controller/salesOrders.hook";

export default function MesasGrid() {

    const [mesasCard, setMesasCard] = useState<MesasCardProps[]>([])

    useEffect(() => {
        const unsubscribeTables = tablesHook((tables) => {
            setMesasCard((prev) =>{
                return tables.map((table) => {
                    const prevMesa = prev.find((mesa) => mesa.id === table.id);
                    return {
                        id: table.id,
                        name: table.place,
                        chairs: 4,
                        state: prevMesa ? prevMesa.state : "libre",
                        number: Number.parseInt(table.name) || 0
                    }
                })
            });
        })

        const unsubscribeSalesOrders = salesOrdersHook((salesOrders) => {
            const newOrderSalesMap = new Map<string, SalesOrderJSONInterface[]>();
            salesOrders.forEach((order) => {
                const tableId = order.table.id;
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
                        updateAt = order.updatedAt || order.createdAt || "";
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
    }, []);

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
