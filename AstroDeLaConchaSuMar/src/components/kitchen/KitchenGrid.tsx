import React, { useEffect, useMemo, useState } from 'react';
import KitchenTicket from './KitchenTicket';
import './KitchenGrid.css';
import { backendConection, listenSocket, verifySessionToken, type IngredientAjustmentJSONInterface, type ProductJSONInterface, type SalesOrderJSONInterface, type TableJSONInterface, type UserJSONInterface } from '../../controller/salesOrders.hook';

export default function KitchenGrid() {
    const [orders, setOrders] = useState<SalesOrderJSONInterface[]>([]);
    const [tables, setTables] = useState<Map<string, TableJSONInterface>>(new Map());
    const [products, setProducts] = useState<Map<string, ProductJSONInterface>>(new Map());
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
            setTables(new Map(snapshot.map((table) => [table.id, table])));
        })
        const unsubscribeProducts = listenSocket("menu", (snapshot) => {
            setProducts(new Map(snapshot.map((product) => [product.id, product])));
        })
        const unsubscribeOrders = listenSocket("order", (snapshot) => {
            setOrders(snapshot.filter(order => order.state === "toCook"));
        });
        return () => {
            unsubscribeOrders();
            unsubscribeProducts();
            unsubscribeTables();
        }
    }, [])

    const inventoryUpdate = async (orderId: string): Promise<{ enoughIngredients: boolean, ingredientsUpdate: { id: string; currentStock: number }[] }> => {
        let enoughIngredients = true;
        const bkIngredients = new Map((await backendConection("GET", "ingredients"))?.data?.map(i => [i.id, i]))
        const bkproducts = new Map((await backendConection("GET", "menu"))?.data?.map(i => [i.id, i]))
        const ingredientsUpdate: { id: string; currentStock: number }[] = []
        orders.find(o => o.id === orderId)?.products.forEach(product => {
            bkproducts.get(product.product.id)?.productsIngredients?.forEach(ingredient => {
                const delta = (ingredient.quantity * product.quantity)
                const stock = (bkIngredients.get(ingredient.ingredient)?.currentStock ?? 0) - delta
                if (stock < 0) enoughIngredients = false
                ingredientsUpdate.push({ id: ingredient.ingredient, currentStock: Math.max(stock, 0) })
            })
        })
        return { enoughIngredients, ingredientsUpdate }
    }

    const kitchenOrders = useMemo(() => {
        let orderFiltered: SalesOrderJSONInterface[] = []
        const orderBebidas = orders.filter((order) => order.products.some((product) => ["bebidas", "cervezas", "nuevas bebidas"].includes(product.product.category.toLowerCase())))
        const orderComidas = orders.filter((order) => order.products.some((product) => !["bebidas", "cervezas", "nuevas bebidas"].includes(product.product.category.toLowerCase())))
        const roleValidate = (role: string) => userData?.usersRoles.some((r) => r.roles.name === role)

        if (!userData) return []
        if (roleValidate("barman") || roleValidate("admin") || roleValidate("cookBar")) orderFiltered = orderFiltered.concat(orderBebidas)
        if (roleValidate("cook") || roleValidate("admin") || roleValidate("cookBar")) orderFiltered = orderFiltered.concat(orderComidas)

        return orderFiltered.map((order, i) => {
            const orderProducts = order.products.map(
                ({ observations, product, quantity }) => ({
                    observations,
                    name: products.get(product.id)?.name || "",
                    quantity,
                })
            );

            return {
                id: order.id,
                orderNumber: `0${i + 1}`,
                customerName: tables.get(order.table.id)?.name || "",
                time: new Date(order.createdAt ?? order.updatedAt).getTime(),
                items: orderProducts,
            };
        });
    }, [orders, products, tables]);

    return (
        <div className="kitchen-grid">
            {kitchenOrders.map((order) => (
                <KitchenTicket key={order.id} {...order} inventoryUpdate={inventoryUpdate} />
            ))}

            <div className="empty-state-filler">
                <p>Espacio para nuevos pedidos</p>
            </div>
        </div>
    );
}
