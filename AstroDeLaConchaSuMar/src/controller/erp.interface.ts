type AuthLoginIN = {
    client_id: string,
    usuario: string,
    password: string,
    device_id: string,
    device_name: string,
    app_version: string
}

type AuthLoginOUT = {
    ok: boolean,
    data: {
        access_token: string,
        refresh_token: string,
        token_type: string,
        expires_in: number,
        access_expires_at: string,
        refresh_expires_at: string,
        scopes: string[]
        client_id: string,
        device_id: string,
        usuario: {
            id: string,
            nombre: string,
            usuario: string,
            rol: string
        },
        empresa: {
            id: string,
            ruc: string,
            nombre: string
        }
    }
}

type AuthRefreshIN = {
    client_id: string,
    refresh_token: string
}

type AuthRefreshOUT = AuthLoginOUT;

type CatalogoOUT = {
    ok: boolean,
    data: {
        items: {
            id: string,
            codigo: string,
            descripcion: string,
            descripcion_adicional: string,
            imagen?: string,
            tipo: string,
            tipo_unidad: string,
            purchase_uom?: string,
            purchase_uom_factor: number,
            codigo_producto_sunat: string,
            tipo_afectacion_igv: string,
            precio1: number,
            precio2?: number,
            stock: number,
            stock_minimo: number,
            receta_rendimiento: number,
            merma_esperada_pct: number,
            is_sold: boolean,
            is_purchased: boolean,
            has_recipe: boolean,
            activo: boolean,
            ingredientes: any[]
        }[],
        meta: any[]
    }
}

type SessionActiveOUT = {
    ok: boolean,
    data: {
        id: number,
        pos_id: number,
        id_empresa: number,
        usuario_apertura_id: number,
        fondo_inicial: string,
        fondo_cierre: string | null,
        diferencia: string | null,
        comentario_diferencia: string | null,
        supervisor_id: string | null,
        supervisor_aprobado_en: string | null,
        estado: string,
        abierta_en: string,
        cerrada_en: string | null,
        reporte_z_url: string | null
    },
    meta: any[]
}

type SessionOpenIN = {
    pos_id: number,
    fondo_inicial: number,
}

type SessionCloseIN = {
    fondo_cierre: number,
    comentario_diferencia: string,
    supervisor_pin: string
}

export type {
    AuthLoginIN,
    AuthLoginOUT,
    AuthRefreshIN,
    AuthRefreshOUT,
    CatalogoOUT,
    SessionActiveOUT,
    SessionOpenIN,
    SessionCloseIN
}