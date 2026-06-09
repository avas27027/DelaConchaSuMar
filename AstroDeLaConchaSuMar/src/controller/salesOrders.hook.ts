import { io } from 'socket.io-client';

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

export type UserJSONInterface = {
    id: string;
    email: string;
    createdAt: string;
    updatedAt?: string;
    usersRoles: {
        roles: RoleJSONInterface;
    }[];
}

export type RoleJSONInterface = {
    id: string;
    name: string;
    createdAt: string;
    updatedAt?: string;
}

type Pagination = {
    nextCursor?: string | null,
    hasMore?: boolean,
    total?: number,
}

type IngredientsJSONInterface = {
    id: string;
    category: string;
    currentStock: string;
    name: string;
    description: string;
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

type SuppliersJSONInterface = {
    id: string;
    name: string;
}

type PriceMeassureJSONInterface = {
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
    table: TableJSONInterface;
    user: string;
    products: {
        product: ProductJSONInterface;
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

type BackendMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export type Response<T> = { success: boolean, message: string, data?: T } & Pagination;
type BackendEndPoint = keyof BackendTypesMap;
type BackendTypesMap = {
    "sales-orders": SalesOrderJSONInterface[];
    tables: TableJSONInterface[];
    menu: ProductJSONInterface[];
    ingredients: IngredientsJSONInterface[];
    meassures: PriceMeassureJSONInterface[];
    user: UserJSONInterface[];
};
const backendUrl = import.meta.env.PUBLIC_BACKEND_URL || "http://backend:3001";

export async function backendConection<T extends BackendEndPoint>(method: BackendMethod, endPoint: T, param?: string, body?: any): Promise<Response<BackendTypesMap[T]>> {
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

type SocketDataMap = {
    "order": SalesOrderJSONInterface[];
    "table": TableJSONInterface[];
    "menu": ProductJSONInterface[];
};

type SocketEvent = keyof SocketDataMap;

const socket = io(backendUrl);

export function listenSocket<TEvent extends SocketEvent>(
    event: TEvent,
    callback: (data: SocketDataMap[TEvent]) => void
) {
    const listener = (data: SocketDataMap[TEvent]) => {
        callback(data);
    };

    socket.on(`${event}:updated`, listener as any);
    socket.emit(`${event}:subscribe`);

    return () => {
        socket.off(`${event}:updated`, listener as any);
    };
}



