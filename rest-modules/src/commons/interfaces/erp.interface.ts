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

type CatalogoPOSOUT = {
    ok: boolean,
    data: {
        id: string,
        codigo: string,
        descripcion: string,
        precio1: string,
        tipo_unidad: string,
        tipo: string,
        is_purchased: number,
        has_recipe: number,
        stock: string,
        stock_pos: string,
        disponible_pos: number,
        pos_activo: number,
        categoria_pos_id: number,
        nombre_pos: string,
        descripcion_pos: string,
        imagen_pos_url: string | null,
        es_kit: number,
        categoria_nombre: string,
        categoria_orden: number,
        categoria_color: string,
        pantalla_kds_id: string | null,
        pantalla_kds_nombre: string | null,
        pantalla_kds_color: string | null
    }[],
}

type CatalogoOUT = {
    ok: boolean,
    data: {
        id: string,
        codigo: string,
        descripcion: string,
        descripcion_adicional: string,
        imagen: string | null,
        tipo: string,
        tipo_unidad: string,
        purchase_uom: string | null,
        purchase_uom_factor: number,
        codigo_producto_sunat: string,
        tipo_afectacion_igv: string,
        precio1: number,
        precio2: number | null,
        stock: number,
        stock_minimo: number,
        receta_rendimiento: number,
        merma_esperada_pct: number,
        is_sold: boolean,
        is_purchased: boolean,
        has_recipe: boolean,
        activo: boolean,
        ingredientes: {
            id_insumo: number,
            codigo: string,
            descripcion: string,
            cantidad: number,
            tipo_unidad: string,
            notas: string
        }[]
    }[],
    meta: any[]
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

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type EndPoint = keyof ErpTypesMap;
type ErpTypesMap = {
    auth: { IN: AuthLoginIN, OUT: AuthLoginOUT },
    catalogo: { IN: undefined, OUT: CatalogoOUT },
    sessionActive: { IN: undefined, OUT: SessionActiveOUT },
    sessionOpen: { IN: SessionOpenIN, OUT: { ok: boolean } },
    sessionClose: { IN: SessionCloseIN, OUT: { ok: boolean } },
    catalogoPos: { IN: undefined, OUT: CatalogoPOSOUT }
};

type Options<T extends EndPoint> = { param?: string, body: ErpTypesMap[T]["IN"] }

export type {
    AuthLoginIN,
    AuthLoginOUT,
    AuthRefreshIN,
    AuthRefreshOUT,
    CatalogoOUT,
    SessionActiveOUT,
    SessionOpenIN,
    SessionCloseIN,
    Method,
    EndPoint,
    ErpTypesMap,
    Options
}