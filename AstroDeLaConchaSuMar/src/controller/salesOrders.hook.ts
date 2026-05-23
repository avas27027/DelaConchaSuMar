import { db } from "./firebase";
import { collection, query, where, onSnapshot, doc, getDoc, getDocs, type WhereFilterOp } from "firebase/firestore";

export interface ProductJSONInterface {
    createdAt: string;
    description: string;
    imageUrl: string;
    name: string;
    price: number;
}

export interface SalesOrderJSONInterface {
    createdAt: string;
    updateAt?: string;
    id: string;
    observations: string;
    state: string;
    table: string;
    user: string;
    products: {
        product: string;
        quantity: number;
        observations: string;
    }[];
}

interface TableJSONInterface {
    readonly id: string;
    readonly name: string;
    readonly place: string;
}

export type TableVisualState = "libre" | "preparacion" | "cocinado";
export interface TableStateInfo {
    state: TableVisualState;
    updateAt?: string;
}
export type TableStatesMap = Record<string, TableStateInfo>;

function toTableVisualState(orderState: string): TableVisualState {
    if (orderState === "cooked") {
        return "cocinado";
    }

    if (orderState === "pending" || orderState === "toCook") {
        return "preparacion";
    }

    return "libre";
}

function getTableStatePriority(state: TableVisualState): number {
    if (state === "cocinado") {
        return 3;
    }

    if (state === "preparacion") {
        return 2;
    }

    return 1;
}

export const subscribeToTableStates = (states: string[], callback: (tableStates: TableStatesMap) => void) => {
    const q = query(
        collection(db, "salesOrders"),
        where("state", "in", states)
    );

    return onSnapshot(q, (snapshot) => {
        const tableStates = snapshot.docs.reduce<TableStatesMap>((acc, orderDoc) => {
            const orderData = orderDoc.data();
            const tableId = orderData.table?.id;

            if (!tableId) {
                return acc;
            }

            const nextState = toTableVisualState(orderData.state);
            const currentState = acc[tableId]?.state ?? "libre";

            if (getTableStatePriority(nextState) > getTableStatePriority(currentState)) {
                acc[tableId] = {
                    state: nextState,
                    updateAt: orderData.updatedAt ?? orderData.createdAt ?? null,
                };
            }

            return acc;
        }, {});

        callback(tableStates);
    });
};

export const subscribeToTableOrders = (states: string[], callback: (orders: SalesOrderJSONInterface[]) => void, tableId?: string) => {
    let q = null;

    if (tableId) {
        // 1. Referencia a la mesa específica
        const tableRef = doc(db, "tables", tableId);
        q = query(
            collection(db, "salesOrders"),
            where("table", "==", tableRef),
            where("state", "in", states)
        );
    } else {
        q = query(
            collection(db, "salesOrders"),
            where("state", "in", states)
        );
    }

    // 3. Listener en tiempo real
    return onSnapshot(q, async (snapshot) => {
        const ordersPromises = snapshot.docs.map(async (orderDoc) => {
            const orderData = orderDoc.data();

            const tableSnap = await getDoc(orderData.table);

            return {
                id: orderDoc.id,
                ...orderData,
                table: {
                    id: tableSnap.id,
                    ...((tableSnap.data() ?? {}) as Record<string, string>)
                },
            } as SalesOrderJSONInterface;
        });

        const fullOrders = await Promise.all(ordersPromises);
        callback(fullOrders);
    });
};

type TypeWhereArg = {
    prop: string;
    operation: WhereFilterOp;
    value: unknown;
};
export const createQuery = (collectionArg: string, callback: (snapshot: any[]) => void, whereArgs: TypeWhereArg[] = []) => {
    const salesOrdersCollection = collection(db, collectionArg);
    const constraints = whereArgs.map(({ prop, operation, value }) => (
        where(prop, operation, value)
    ));
    const q = query(salesOrdersCollection, ...constraints);

    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    })
};

const salesOrdersHook = (callback: (snapshot: SalesOrderJSONInterface[]) => void, query?: TypeWhereArg[]) => createQuery("salesOrders", callback, query);
const productsHook = (callback: (snapshot: ProductJSONInterface[]) => void, query?: TypeWhereArg[]) => createQuery("products", callback, query);
const tablesHook = (callback: (snapshot: TableJSONInterface[]) => void, query?: TypeWhereArg[]) => createQuery("tables", callback, query);

export const subscribeToOrders = (states: string[], callback: (orders: SalesOrderJSONInterface[]) => void) => {
    const q = query(
        collection(db, "salesOrders"),
        where("state", "in", states)
    );

    const productUnsubscribers: Record<string, () => void> = {};
    // Usamos un Map para que sea más fácil borrar órdenes por ID
    let currentOrdersMap = new Map<string, SalesOrderJSONInterface>();

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
                    currentOrdersMap.set(orderId, { ...existingOrder, ...orderDoc.data() } as SalesOrderJSONInterface);
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
                            observations: detailData.observations ?? '',
                            ...((productSnap.data() ?? {}) as ProductJSONInterface)
                        } satisfies SalesOrderProductJSONInterface;
                    })
                );

                const tableSnap = await getDoc(orderData.table);

                // Actualizamos el mapa
                currentOrdersMap.set(orderId, {
                    id: orderId,
                    ...orderData,
                    products,
                    table: {
                        id: tableSnap.id,
                        ...((tableSnap.data() ?? {}) as Record<string, string>)
                    }
                } as SalesOrderJSONInterface);

                // Emitir cambios
                callback(Array.from(currentOrdersMap.values()));
            });
        });
    });
};
