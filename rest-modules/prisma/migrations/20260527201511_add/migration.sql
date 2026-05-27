/*
  Warnings:

  - You are about to drop the column `products` on the `sales_orders` table. All the data in the column will be lost.
  - Added the required column `order` to the `sales_orders_products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "sales_orders" DROP CONSTRAINT "sales_orders_products_fkey";

-- AlterTable
ALTER TABLE "ingredients" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sales_orders" DROP COLUMN "products";

-- AlterTable
ALTER TABLE "sales_orders_products" ADD COLUMN     "order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "tables" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "products_ingredients" (
    "id" SERIAL NOT NULL,
    "product" INTEGER NOT NULL,
    "ingredient" INTEGER NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "products_ingredients_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_table_fkey" FOREIGN KEY ("table") REFERENCES "tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders_products" ADD CONSTRAINT "sales_orders_products_order_fkey" FOREIGN KEY ("order") REFERENCES "sales_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_ingredients" ADD CONSTRAINT "products_ingredients_product_fkey" FOREIGN KEY ("product") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_ingredients" ADD CONSTRAINT "products_ingredients_ingredient_fkey" FOREIGN KEY ("ingredient") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
