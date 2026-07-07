import { Injectable, Logger } from "@nestjs/common";
import { AuthRefreshIN, AuthRefreshOUT, CatalogoOUT, EndPoint, ErpTypesMap, Method } from "../interfaces/erp.interface";

type CreateMenuDto = {
    name: string;
    imageUrl: string;
    description: string;
    category: string;
    price: number;
    priceMeassure?: string;
    ingredients?: {
        ingredient: string;
        quantity: number;
    }[];
}
export class CreateIngredientDto {
    name: string = "";
    description: string = "";
    category: string = "";
    currentStock: string = "";
    unit: number = 0;
    minimumStock: number = 0;
}


@Injectable()
export class ErpProviderService {
    private readonly logger = new Logger(ErpProviderService.name);
    private readonly erpUrl = process.env.ERP_URL ?? "https://facttor.providevcloud.com";
    private readonly endPointMap: Record<EndPoint, { url: string, method: Method }> = {
        auth: { url: "/api/mobile/v1/auth/login", method: "POST" },
        catalogo: { url: "/api/facturacion/v1/items", method: "GET" },
        sessionActive: { url: "/api/mobile/v1/pos/sesiones/activa", method: "GET" },
        sessionOpen: { url: "/api/mobile/v1/pos/sesiones", method: "POST" },
        sessionClose: { url: "/api/mobile/v1/pos/sesiones", method: "POST" },
        catalogoPos: { url: "/api/mobile/v1/pos/1/catalogo", method: "GET" }
    }
    async erpConection<T extends EndPoint>(endPoint: T, token: string, body?: ErpTypesMap[T]["IN"], param?: string): Promise<ErpTypesMap[T]["OUT"] | null> {
        try {
            const response = await fetch(this.erpUrl + this.endPointMap[endPoint].url + (param ? "/" + param : ""), {
                method: this.endPointMap[endPoint].method,
                ...(body && { body: JSON.stringify(body) }),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }).then(res => res.json()).then((data: ErpTypesMap[T]["OUT"]) => {
                return data
            }).catch((error) => {
                console.error(error)
                return {
                    ok: false,
                    message: error.message,
                }
            })

            if (response.ok) {
                const responseOk = response
                this.logger.log(`ERP Connection -> ${this.endPointMap[endPoint].method} ${endPoint} ${param ? '/' + param : ''} - ${JSON.stringify(responseOk)}`)
                return responseOk
            } else {
                const responseError = response as { ok: boolean, message: string }
                throw new Error(responseError.message);
            }
        } catch (error) {
            this.logger.error(`Error Erp conection: ${error.message}`)
            return null
        }
    }

    async refreshToken(refresh_token: string): Promise<string | null> {
        const body: AuthRefreshIN = {
            refresh_token,
            client_id: "facttor_mobile_external"
        }
        try {
            const response = await fetch(process.env.ERP_URL + "/api/mobile/v1/auth/refresh", {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then(res => res.json()).then((data: AuthRefreshOUT) => {
                return data
            }).catch((error) => {
                return {
                    ok: false,
                    message: error.message,
                }
            })

            if (response.ok) {
                const responseOk = response as AuthRefreshOUT
                return responseOk.data.access_token
            } else {
                const responseError = response as { ok: boolean, message: string }
                throw new Error(responseError.message);
            }
        } catch (error) {
            this.logger.error(`Error al generar el Erp Token: ${error.message}`)
            return null;
        }
    }

    convertErpItemToMenuItem(erpItems: CatalogoOUT["data"]): CreateMenuDto[] {
        let list: CreateMenuDto[] = [];
        for (const item of erpItems) {
            list.push({
                name: item.descripcion,
                imageUrl: item.imagen || "",
                description: item.descripcion_adicional || "",
                category: item.tipo || "",
                price: item.precio1 || item.precio2 || 0,
                ingredients: item.ingredientes.map(ingredient => ({
                    ingredient: ingredient.id_insumo.toString(),
                    quantity: ingredient.cantidad,
                })) || []
            })
        }

        return list
    }

    async getFormatedItems(refresh_token: string): Promise<{ products: CreateMenuDto[], ingredients: CreateIngredientDto[] }> {
        const catalogo = await this.erpConection("catalogo", refresh_token)
        const catalogoPos = await this.erpConection("catalogoPos", refresh_token)

        const products = catalogo?.data.filter(item => item.tipo === "retail").map(item => {
            const itemPos = catalogoPos?.data.find(itemPos => itemPos.id === item.id)
            return {
                id: item.id,
                name: item.descripcion,
                imageUrl: item.imagen || "",
                description: item.descripcion_adicional || "",
                category: itemPos?.categoria_nombre ?? "",
                price: item.precio1 || item.precio2 || 0,
                priceMeassure: "6",
                ingredients: item.ingredientes.map(ingredient => ({
                    ingredient: ingredient.id_insumo.toString(),
                    quantity: ingredient.cantidad,
                })) || []
            }
        }) || []

        const ingredients = catalogo?.data.filter(item => item.tipo === "insumo").map(item => {
            const itemPos = catalogoPos?.data.find(itemPos => itemPos.id === item.id)
            return {
                id: item.id,
                name: item.descripcion,
                description: item.descripcion_adicional || "",
                category: itemPos?.categoria_nombre ?? "",
                currentStock: item.stock?.toString() || "",
                unit: 1,
                minimumStock: item.stock_minimo || 0,
            }
        }) || []

        return { products, ingredients }

    }
}