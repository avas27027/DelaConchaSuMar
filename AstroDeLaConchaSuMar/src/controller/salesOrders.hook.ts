import { db } from "./firebase";
import { collection, query, where, onSnapshot, type WhereFilterOp, DocumentReference } from "firebase/firestore";

export interface ProductJSONInterface {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    price: number;
    category: string;
    priceMeassure: string;
    createdAt: string;
    updatedAt?: string;
    productsIngredients?: {
        id: string;
        product: string;
        ingredient: string;
        quantity: number;
        ingredients?: IngredientsJSONInterface
    }[]
    priceMeassures?: PriceMeassureJSONInterface
}

export type IngredientsJSONInterface = {
    id: string;
    category?: string;
    currentStock: string;
    name: string;
    minimumStock: string;
    unit: string;
    createdAt: string;
    updatedAt?: string;
    units?: PriceMeassureJSONInterface;
    ingredientsSuppliers?: {
        id: string;
        ingredient: string;
        supplier: string;
        price: string;
        type: string;
        suppliers: SuppliersJSONInterface;
    }
}

export type SuppliersJSONInterface = {
    id: string;
    name: string;
}
export type PriceMeassureJSONInterface = {
    id: string;
    name: string;
    longName: string;
    symbol: string;
    createdAt: string;
    updatedAt?: string;
}

export interface SalesOrderJSONInterface {
    createdAt: string;
    updatedAt?: string;
    id: string;
    observations: string;
    state: string;
    table: DocumentReference;
    user: string;
    products: {
        product: DocumentReference;
        quantity: number;
        observations: string;
    }[];
}

export interface TableJSONInterface {
    readonly id: string;
    readonly name: string;
    readonly place: string;
}

export type TableVisualState = "libre" | "preparacion" | "cocinado" | "entregado";
export interface TableStateInfo {
    state: TableVisualState;
    updateAt?: string;
}
export type TableStatesMap = Record<string, TableStateInfo>;

export function toTableVisualState(orderState: string): TableVisualState {
    if (orderState === "cooked") {
        return "cocinado";
    }

    if (orderState === "pending" || orderState === "toCook") {
        return "preparacion";
    }

    return "libre";
}

export function getTableStatePriority(state: TableVisualState): number {
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

type BackendMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type Response<T> = { success: boolean, message: string, data?: T }
type BackendEndPoint = keyof BackendTypesMap;
type BackendTypesMap = {
    salesOrders: SalesOrderJSONInterface[];
    tables: TableJSONInterface[];
    menu: ProductJSONInterface[];
    ingredients: IngredientsJSONInterface[];
};

export async function backendConection<T extends BackendEndPoint>(method: BackendMethod, endPoint: T, param?: string, body?: any): Promise<Response<BackendTypesMap[T]>> {
    const backendUrl = import.meta.env.PUBLIC_BACKEND_URL || "http://backend:3001";
    return fetch(backendUrl + "/" + endPoint + (param ? "/" + param : ""), {
        method: method,
        ...(body && { body: JSON.stringify(body) }),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(res => res.json())
        .then((data: Response<BackendTypesMap[T]>) => data)
        .catch((error) => {
            return {
                success: false,
                message: error.message,
            }
        });
}

export const createQuery = (collectionArg: string, callback: (snapshot: any[]) => void, whereArgs: TypeWhereArg[] = []) => {
    const collectionRef = collection(db, collectionArg);
    const constraints = whereArgs.map(({ prop, operation, value }) => (
        where(prop, operation, value)
    ));
    const q = query(collectionRef, ...constraints);

    return onSnapshot(q,
        (snapshot) => {
            callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            console.log(`Snapshot ${collectionArg}:`, snapshot.size);
        },
        (error) => {
            console.error(`Firestore listener error in ${collectionArg}:`, error);
        }
    )
};

export const salesOrdersHook = (callback: (snapshot: SalesOrderJSONInterface[]) => void, query?: TypeWhereArg[]) => createQuery("salesOrders", callback, query);
export const productsHook = (callback: (snapshot: ProductJSONInterface[]) => void, query?: TypeWhereArg[]) => createQuery("products", callback, query);
export const tablesHook = (callback: (snapshot: TableJSONInterface[]) => void, query?: TypeWhereArg[]) => createQuery("tables", callback, query);
