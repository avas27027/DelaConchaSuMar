import { useEffect, useMemo, useState } from "react";
import MesasCard, { type MesasCardProps } from "./MesasCard";
import Modal from "./Modal";
import "./MesasGrid.css";
import { getTableStatePriority, toTableVisualState, type TableVisualState, listenSocket, verifySessionToken, type UserJSONInterface, type SalesOrderJSONInterface, beepAudio } from "../../controller/salesOrders.hook";

export default function MesasGrid() {

    const [mesasCard, setMesasCard] = useState<MesasCardProps[]>([])
    const [orders, setOrders] = useState<SalesOrderJSONInterface[]>([])
    const [userData, setUserData] = useState<UserJSONInterface | null>(null);

    useEffect(() => {
        verifySessionToken().then((res) => {
            if (!res.success || !res.data) throw new Error("Error al cargar la sesion");
            setUserData(res.data)
        }).catch((error: any) => {
            console.error(error.message);
            alert("No se pudo obtener la sesion, por favor recargue la pagina o inicie sesion nuevamente");
        });

        const unsubscribeTables = listenSocket("table", (snapshot) => {
            setMesasCard((prev) => {
                return snapshot.map((table) => {
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

        const unsubscribeSalesOrders = listenSocket("order", (snapshot) => {
            const newOrderSalesMap = new Map<string, typeof snapshot>();
            const salesOrders = snapshot.filter((order) => order.state !== "paid")
            setOrders(salesOrders); // Para validar que no haya una orden pendiente de entregar por el usuario
            salesOrders.forEach((order) => {
                const ordersForTable = newOrderSalesMap.get(order.table.id) || [];
                newOrderSalesMap.set(order.table.id, [...ordersForTable, order]);
            });

            setMesasCard((prevMesasCard) => prevMesasCard.map((mesa) => {
                const ordersForTable = newOrderSalesMap.get(mesa.id) || [];
                const allOrdersCooked = ordersForTable.length > 0 && ordersForTable.every((order) => order.state === "cooked" || order.state === "toPay");
                let updateAt = "";
                const visualStateFromOrders = ordersForTable.reduce((state, order) => {
                    const orderVisualState = toTableVisualState(order.state);
                    if (getTableStatePriority(orderVisualState) > getTableStatePriority(state)) {
                        updateAt = order.updatedAt || order.createdAt || "";
                        return orderVisualState;
                    }
                    return state;
                }, "libre" as TableVisualState);
                const visualState = allOrdersCooked ? "entregado" : visualStateFromOrders;
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

    useEffect(() => {
        const ordersToDeliver = orders.filter((order) => order.user == userData?.id && order.state === "cooked")
        if (ordersToDeliver.length > 0) {
            const mesaNames = ordersToDeliver.map((order) => order.table.name);
            beepAudio();
            alert(`Los pedidos de las mesas ${mesaNames.join(", ")} estan listos para ser entregados`);
        }
    }, [orders, userData]);

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
