import type { AuthLoginIN, AuthLoginOUT, AuthRefreshIN, AuthRefreshOUT, CatalogoOUT, SessionActiveOUT, SessionCloseIN, SessionOpenIN } from "./erp.interface";
import { getCookie } from "./salesOrders.hook";

const erpUrl = import.meta.env.ERP_URL ?? "https://facttor.providevcloud.com";
type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type EndPoint = keyof ErpTypesMap;
type ErpTypesMap = {
    auth: { IN: AuthLoginIN, OUT: AuthLoginOUT },
    catalogo: { IN: null, OUT: CatalogoOUT },
    sessionActive: { IN: null, OUT: SessionActiveOUT },
    sessionOpen: { IN: SessionOpenIN, OUT: { ok: boolean } },
    sessionClose: { IN: SessionCloseIN, OUT: { ok: boolean } }
};
const endPointMap: Record<EndPoint, { url: string, method: Method }> = {
    auth: { url: "/api/mobile/v1/auth/login", method: "POST" },
    catalogo: { url: "/api/facturacion/v1/items", method: "GET" },
    sessionActive: { url: "/api/mobile/v1/pos/sesiones/activa", method: "GET" },
    sessionOpen: { url: "/api/mobile/v1/pos/sesiones", method: "POST" },
    sessionClose: { url: "/api/mobile/v1/pos/sesiones", method: "POST" }
}
export async function erpConection<T extends EndPoint>(endPoint: T, options?: { param?: string, body: ErpTypesMap[T]["IN"] }): Promise<ErpTypesMap[T]["OUT"] | null> {
    const token = await refreshToken()
    if (!token) return null;
    const response = await fetch(erpUrl + endPointMap[endPoint].url + (options?.param ? "/" + options.param : ""), {
        method: endPointMap[endPoint].method,
        ...(options?.body && { body: JSON.stringify(options.body) }),
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
        console.debug(`%cERP CONECTION -> ${endPointMap[endPoint].method} ${endPoint} ${options?.param ? '/' + options.param : ''} - ${JSON.stringify(responseOk)}`, "color: green")
        return responseOk
    } else {
        const responseError = response as { ok: boolean, message: string }
        console.debug(`%cERP CONECTION -> ${endPointMap[endPoint].method} ${endPoint} ${options?.param ? '/' + options.param : ''} - ${JSON.stringify(responseError.message)}`, "color: red")
        return null;
    }
}
async function refreshToken() {
    const body: AuthRefreshIN = {
        refresh_token: getCookie("erp"),
        client_id: "facttor_mobile_external"
    }
    const response = await fetch(erpUrl + "/api/mobile/v1/auth/refresh", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
        },
    }).then(res => res.json()).then((data: AuthRefreshOUT) => {
        return data
    }).catch((error) => {
        console.error(error)
        return {
            ok: false,
            message: error.message,
        }
    })

    if (response.ok) {
        const responseOk = response as AuthRefreshOUT
        document.cookie = `erp_session=${responseOk.data.refresh_token}; path=/; max-age=${responseOk.data.refresh_expires_at}`;
        return responseOk.data.access_token
    } else {
        document.cookie = `erp_session=; path=/; max-age=0`;
        document.cookie = `session=; path=/; max-age=0`;
        alert("Error al regenerar token")
        globalThis.window.location.href = "/login"
    }
}
