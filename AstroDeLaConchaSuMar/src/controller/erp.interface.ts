export type CreateMenuDto = {
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
    unit: string = "";
    minimumStock: number = 0;
}

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
        efectivo_esperado: number
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

type VentaDirectaIN = {
    pos_id: number,
    cliente_id: number,
    items: {
        producto_id: number,
        cantidad: number,
        precio_unitario: number
    }[],
    pagos: {
        metodo_pago_id: number,
        monto: number,
        monto_recibido: number
    }[],
}

type VentaDirectaOUT = {
    ok: boolean,
    data: {
        id: number,
        numero: string,
        sesion_id: number,
        id_empresa: number,
        mesa_id: number | null,
        cliente_id: number | null,
        lista_precio_id: string | null,
        cajero_id: number,
        canal_origen: string,
        estado: string,
        subtotal: string,
        descuento_total: string,
        total: string,
        cotizacion_id: string | null,
        comprobante_id: string | null,
        tipo_division: string | null,
        created_at: string,
        updated_at: string,
        pagada_en: string,
        pos_id: number,
        almacen_id: number,
        mesa_nombre: string | null,
        cajero_nombre: string,
        cliente_nombre: string,
        cliente_documento: string,
    },
    itmes: any[]
}

type OrdenAbiertaIN = {
    pos_id: number,
    mesa_id?: number,
    notas?: string,
    items: {
        producto_id: number,
        cantidad: number,
        nota_preparacion?: string
    }[]
}
type OrdenAbiertaOUT = {
    ok: true,
    data: {
        id: number,
        numero: string,
        sesion_id: number,
        id_empresa: number,
        mesa_id: number | null,
        cliente_id: number | null,
        lista_precio_id: string | null,
        cajero_id: number,
        canal_origen: string,
        estado: string,
        subtotal: string,
        descuento_total: string,
        total: string,
        notas: string | null,
        cotizacion_id: string | null,
        comprobante_id: string | null,
        tipo_division: string | null,
        created_at: string,
        updated_at: string,
        pagada_en: string | null,
        comentario: string | null,
        pos_id: number,
        almacen_id: number,
        mesa_nombre: string | null,
        cajero_nombre: string | null,
        cliente_nombre: string | null,
        cliente_documento: string | null,
        items: {
            id: number,
            orden_id: number,
            producto_id: number,
            nombre_snapshot: string,
            precio_unitario: string,
            cantidad: string,
            costo_extra: string,
            subtotal: string,
            nota_preparacion: string | null,
            es_componente_kit: number,
            kit_item_id: number | null,
            estado_kds: string,
            item_tipo: string,
            kds_enviado: number,
            kds_estado_real: string,
            kds_comanda_estado: string | null,
            kds_pantalla_nombre: string | null,
            kds_pantalla_color: string | null,
            kds_timer_ts: number | null,
            kds_ambar_min: number | null,
            kds_rojo_min: number | null,
            kds_mostrar_tiempo_mesero: number | null
        }[],
    }
}

export type {
    AuthLoginIN,
    AuthLoginOUT,
    AuthRefreshIN,
    AuthRefreshOUT,
    CatalogoOUT,
    CatalogoPOSOUT,
    SessionActiveOUT,
    SessionOpenIN,
    SessionCloseIN,
    VentaDirectaIN,
    VentaDirectaOUT,
    OrdenAbiertaIN,
    OrdenAbiertaOUT
}