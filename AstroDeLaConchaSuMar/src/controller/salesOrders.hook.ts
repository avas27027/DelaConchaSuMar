import { db } from "./firebase";
import { collection, query, where, onSnapshot, doc, getDoc, getDocs } from "firebase/firestore";

export const subscribeToTableOrders = (tableId: string, states: string[], callback: (orders: any[]) => void) => {
    // 1. Referencia a la mesa específica
    const tableRef = doc(db, "tables", tableId);

    // 2. Query para buscar órdenes de esa mesa
    const q = query(
        collection(db, "salesOrders"),
        where("table", "==", tableRef),
        where("state", "in", states)
    );

    // 3. Listener en tiempo real
    return onSnapshot(q, async (snapshot) => {
        const ordersPromises = snapshot.docs.map(async (orderDoc) => {
            const orderData = orderDoc.data();

            // 4. Buscar productos vinculados a esta orden
            const detailsQuery = query(
                collection(db, "salesOrders_x_products"),
                where("order", "==", orderDoc.ref)
            );

            // Nota: onSnapshot no es ideal dentro de un map, 
            // aquí hacemos un getDoc para simplificar la hidratación
            const detailsSnapshot = await getDocs(detailsQuery);

            const products = await Promise.all(
                detailsSnapshot.docs.map(async (detailDoc) => {
                    const detailData = detailDoc.data();
                    const productSnap = await getDoc(detailData.product); // Hidratar referencia
                    return {
                        id: detailDoc.id,
                        quantity: detailData.quantity,
                        ...(productSnap.data() || {})
                    };
                })
            );

            return {
                id: orderDoc.id,
                ...orderData,
                products
            };
        });

        const fullOrders = await Promise.all(ordersPromises);
        callback(fullOrders);
    });
};

export const subscribeToOrders = (states: string[], callback: (orders: any[]) => void) => {
    const q = query(
        collection(db, "salesOrders"),
        where("state", "in", states)
    );

    const productUnsubscribers: Record<string, () => void> = {};
    // Usamos un Map para que sea más fácil borrar órdenes por ID
    let currentOrdersMap = new Map<string, any>();

    return onSnapshot(q, (snapshot) => {
        // 1. Detectar qué órdenes ya no están en el snapshot (cambiaron de estado)
        const activeIds = snapshot.docs.map(doc => doc.id);

        currentOrdersMap.forEach((_, id) => {
            if (!activeIds.includes(id)) {
                // Limpiar el listener de productos
                if (productUnsubscribers[id]) {
                    productUnsubscribers[id]();
                    delete productUnsubscribers[id];
                }
                // Eliminar del mapa local
                currentOrdersMap.delete(id);
            }
        });

        // Si el snapshot está vacío, mandamos array vacío de inmediato
        if (snapshot.empty) {
            callback([]);
            return;
        }

        // 2. Procesar las órdenes actuales
        snapshot.docs.forEach((orderDoc) => {
            const orderId = orderDoc.id;

            if (productUnsubscribers[orderId]) {
                // Si la orden ya existe pero cambió algún dato básico (como observations)
                // actualizamos solo esos datos sin recrear el listener de productos
                const existingOrder = currentOrdersMap.get(orderId);
                if (existingOrder) {
                    currentOrdersMap.set(orderId, { ...existingOrder, ...orderDoc.data() });
                    callback(Array.from(currentOrdersMap.values()));
                }
                return;
            }

            // Listener para productos (solo se crea una vez por orden)
            const detailsQuery = query(
                collection(db, "salesOrders_x_products"),
                where("order", "==", orderDoc.ref)
            );

            productUnsubscribers[orderId] = onSnapshot(detailsQuery, async (detailsSnapshot) => {
                const orderData = orderDoc.data();

                const products = await Promise.all(
                    detailsSnapshot.docs.map(async (detailDoc) => {
                        const detailData = detailDoc.data();
                        const productSnap = await getDoc(detailData.product);
                        return {
                            id: detailDoc.id,
                            quantity: detailData.quantity,
                            ...(productSnap.data() || {})
                        };
                    })
                );

                const tableSnap = await getDoc(orderData.table);

                // Actualizamos el mapa
                currentOrdersMap.set(orderId, {
                    id: orderId,
                    ...orderData,
                    products,
                    table: tableSnap.data()
                });

                // Emitir cambios
                callback(Array.from(currentOrdersMap.values()));
            });
        });
    });
};