-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "rol" TEXT NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades_medidas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "simbolo" TEXT NOT NULL,

    CONSTRAINT "unidades_medidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras" (
    "id" SERIAL NOT NULL,
    "observaciones" TEXT,
    "proveedorId" INTEGER NOT NULL,
    "metodoPago" TEXT NOT NULL,
    "unidadMedidaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hora" TIMESTAMP(3),

    CONSTRAINT "compras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insumo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT,
    "cantidad" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "unidadMedidaId" INTEGER NOT NULL,
    "stockMinimo" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "insumo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orden_insumos" (
    "id" SERIAL NOT NULL,
    "insumoId" INTEGER NOT NULL,
    "ordenId" INTEGER NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "unidadMedidaId" INTEGER NOT NULL,

    CONSTRAINT "orden_insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedor_insumos" (
    "id" SERIAL NOT NULL,
    "proveedorId" INTEGER NOT NULL,
    "insumoId" INTEGER NOT NULL,
    "precio" DECIMAL(65,30) NOT NULL,
    "unidadMedidaId" INTEGER NOT NULL,

    CONSTRAINT "proveedor_insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT,
    "precio" DECIMAL(65,30) NOT NULL,
    "unidadMedidaId" INTEGER NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos_insumos" (
    "id" SERIAL NOT NULL,
    "insumoId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidadInsumo" DECIMAL(65,30) NOT NULL,
    "unidadMedidaId" INTEGER NOT NULL,

    CONSTRAINT "productos_insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas" (
    "id" SERIAL NOT NULL,
    "unidadMedidaId" INTEGER NOT NULL,
    "metodoPago" TEXT NOT NULL,
    "observaciones" TEXT,
    "usuarioId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hora" TIMESTAMP(3),

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orden_venta" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "observaciones" TEXT,
    "usuarioId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hora" TIMESTAMP(3),

    CONSTRAINT "orden_venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orden_productos" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "ordenId" INTEGER NOT NULL,

    CONSTRAINT "orden_productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ambiente" TEXT,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalle_tributario" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT,
    "operacionId" INTEGER NOT NULL,
    "tipoOperacion" TEXT NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "tipoMovimiento" TEXT NOT NULL,

    CONSTRAINT "detalle_tributario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_unidadMedidaId_fkey" FOREIGN KEY ("unidadMedidaId") REFERENCES "unidades_medidas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insumo" ADD CONSTRAINT "insumo_unidadMedidaId_fkey" FOREIGN KEY ("unidadMedidaId") REFERENCES "unidades_medidas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_insumos" ADD CONSTRAINT "orden_insumos_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_insumos" ADD CONSTRAINT "orden_insumos_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "compras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_insumos" ADD CONSTRAINT "orden_insumos_unidadMedidaId_fkey" FOREIGN KEY ("unidadMedidaId") REFERENCES "unidades_medidas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proveedor_insumos" ADD CONSTRAINT "proveedor_insumos_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proveedor_insumos" ADD CONSTRAINT "proveedor_insumos_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proveedor_insumos" ADD CONSTRAINT "proveedor_insumos_unidadMedidaId_fkey" FOREIGN KEY ("unidadMedidaId") REFERENCES "unidades_medidas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_unidadMedidaId_fkey" FOREIGN KEY ("unidadMedidaId") REFERENCES "unidades_medidas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_insumos" ADD CONSTRAINT "productos_insumos_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_insumos" ADD CONSTRAINT "productos_insumos_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_insumos" ADD CONSTRAINT "productos_insumos_unidadMedidaId_fkey" FOREIGN KEY ("unidadMedidaId") REFERENCES "unidades_medidas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_unidadMedidaId_fkey" FOREIGN KEY ("unidadMedidaId") REFERENCES "unidades_medidas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_venta" ADD CONSTRAINT "orden_venta_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_venta" ADD CONSTRAINT "orden_venta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_venta" ADD CONSTRAINT "orden_venta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_productos" ADD CONSTRAINT "orden_productos_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_productos" ADD CONSTRAINT "orden_productos_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orden_venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_tributario" ADD CONSTRAINT "detalle_tributario_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
