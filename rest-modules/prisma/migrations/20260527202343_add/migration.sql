/*
  Warnings:

  - You are about to drop the column `suppliers` on the `ingredients` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ingredients_suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `sales_orders_products` table. All the data in the column will be lost.
  - Added the required column `ingredient` to the `ingredients_suppliers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplier` to the `ingredients_suppliers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product` to the `sales_orders_products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ingredients" DROP CONSTRAINT "ingredients_suppliers_fkey";

-- DropForeignKey
ALTER TABLE "sales_orders_products" DROP CONSTRAINT "sales_orders_products_productId_fkey";

-- AlterTable
ALTER TABLE "ingredients" DROP COLUMN "suppliers";

-- AlterTable
ALTER TABLE "ingredients_suppliers" DROP COLUMN "name",
ADD COLUMN     "ingredient" INTEGER NOT NULL,
ADD COLUMN     "supplier" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "sales_orders_products" DROP COLUMN "productId",
ADD COLUMN     "product" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "suppliers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sales_orders_products" ADD CONSTRAINT "sales_orders_products_product_fkey" FOREIGN KEY ("product") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients_suppliers" ADD CONSTRAINT "ingredients_suppliers_ingredient_fkey" FOREIGN KEY ("ingredient") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients_suppliers" ADD CONSTRAINT "ingredients_suppliers_supplier_fkey" FOREIGN KEY ("supplier") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
