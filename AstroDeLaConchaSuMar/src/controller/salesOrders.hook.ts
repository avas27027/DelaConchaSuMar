import { db } from "./firebase";
import { collection, query, where, onSnapshot, doc, getDoc, getDocs, type WhereFilterOp } from "firebase/firestore";

export interface ProductJSONInterface {
    id: string;
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

export interface TableJSONInterface {
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

export const salesOrdersHook = (callback: (snapshot: SalesOrderJSONInterface[]) => void, query?: TypeWhereArg[]) => createQuery("salesOrders", callback, query);
export const productsHook = (callback: (snapshot: ProductJSONInterface[]) => void, query?: TypeWhereArg[]) => createQuery("products", callback, query);
export const tablesHook = (callback: (snapshot: TableJSONInterface[]) => void, query?: TypeWhereArg[]) => createQuery("tables", callback, query);
