/*
  Warnings:

  - You are about to drop the `clientes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `compras` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `detalle_tributario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `insumo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orden_insumos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orden_productos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orden_venta` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productos_insumos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `proveedor_insumos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `proveedores` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `unidades_medidas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ventas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "compras" DROP CONSTRAINT "compras_proveedorId_fkey";

-- DropForeignKey
ALTER TABLE "compras" DROP CONSTRAINT "compras_unidadMedidaId_fkey";

-- DropForeignKey
ALTER TABLE "compras" DROP CONSTRAINT "compras_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "detalle_tributario" DROP CONSTRAINT "detalle_tributario_operacionId_fkey";

-- DropForeignKey
ALTER TABLE "insumo" DROP CONSTRAINT "insumo_unidadMedidaId_fkey";

-- DropForeignKey
ALTER TABLE "orden_insumos" DROP CONSTRAINT "orden_insumos_insumoId_fkey";

-- DropForeignKey
ALTER TABLE "orden_insumos" DROP CONSTRAINT "orden_insumos_ordenId_fkey";

-- DropForeignKey
ALTER TABLE "orden_insumos" DROP CONSTRAINT "orden_insumos_unidadMedidaId_fkey";

-- DropForeignKey
ALTER TABLE "orden_productos" DROP CONSTRAINT "orden_productos_ordenId_fkey";

-- DropForeignKey
ALTER TABLE "orden_productos" DROP CONSTRAINT "orden_productos_productoId_fkey";

-- DropForeignKey
ALTER TABLE "orden_venta" DROP CONSTRAINT "orden_venta_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "orden_venta" DROP CONSTRAINT "orden_venta_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "orden_venta" DROP CONSTRAINT "orden_venta_ventaId_fkey";

-- DropForeignKey
ALTER TABLE "productos" DROP CONSTRAINT "productos_unidadMedidaId_fkey";

-- DropForeignKey
ALTER TABLE "productos_insumos" DROP CONSTRAINT "productos_insumos_insumoId_fkey";

-- DropForeignKey
ALTER TABLE "productos_insumos" DROP CONSTRAINT "productos_insumos_productoId_fkey";

-- DropForeignKey
ALTER TABLE "productos_insumos" DROP CONSTRAINT "productos_insumos_unidadMedidaId_fkey";

-- DropForeignKey
ALTER TABLE "proveedor_insumos" DROP CONSTRAINT "proveedor_insumos_insumoId_fkey";

-- DropForeignKey
ALTER TABLE "proveedor_insumos" DROP CONSTRAINT "proveedor_insumos_proveedorId_fkey";

-- DropForeignKey
ALTER TABLE "proveedor_insumos" DROP CONSTRAINT "proveedor_insumos_unidadMedidaId_fkey";

-- DropForeignKey
ALTER TABLE "ventas" DROP CONSTRAINT "ventas_unidadMedidaId_fkey";

-- DropForeignKey
ALTER TABLE "ventas" DROP CONSTRAINT "ventas_usuarioId_fkey";

-- DropTable
DROP TABLE "clientes";

-- DropTable
DROP TABLE "compras";

-- DropTable
DROP TABLE "detalle_tributario";

-- DropTable
DROP TABLE "insumo";

-- DropTable
DROP TABLE "orden_insumos";

-- DropTable
DROP TABLE "orden_productos";

-- DropTable
DROP TABLE "orden_venta";

-- DropTable
DROP TABLE "productos";

-- DropTable
DROP TABLE "productos_insumos";

-- DropTable
DROP TABLE "proveedor_insumos";

-- DropTable
DROP TABLE "proveedores";

-- DropTable
DROP TABLE "unidades_medidas";

-- DropTable
DROP TABLE "usuario";

-- DropTable
DROP TABLE "ventas";

-- CreateTable
CREATE TABLE "sales_orders" (
    "id" SERIAL NOT NULL,
    "state" TEXT NOT NULL,
    "table" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "products" INTEGER NOT NULL,

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_orders_products" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "observations" TEXT NOT NULL,

    CONSTRAINT "sales_orders_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priceMeassure" INTEGER NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentStock" DECIMAL(65,30) NOT NULL,
    "name" TEXT NOT NULL,
    "minimumStock" DECIMAL(65,30) NOT NULL,
    "unit" INTEGER NOT NULL,
    "suppliers" INTEGER NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tables" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "place" TEXT NOT NULL,

    CONSTRAINT "tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients_suppliers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "ingredients_suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meassure_units" (
    "id" SERIAL NOT NULL,
    "longName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meassure_units_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_products_fkey" FOREIGN KEY ("products") REFERENCES "sales_orders_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders_products" ADD CONSTRAINT "sales_orders_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_priceMeassure_fkey" FOREIGN KEY ("priceMeassure") REFERENCES "meassure_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_suppliers_fkey" FOREIGN KEY ("suppliers") REFERENCES "ingredients_suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_unit_fkey" FOREIGN KEY ("unit") REFERENCES "meassure_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
