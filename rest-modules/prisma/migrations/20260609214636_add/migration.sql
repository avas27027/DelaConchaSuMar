/*
  Warnings:

  - A unique constraint covering the columns `[uid]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user` to the `sales_orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sales_orders" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_uid_key" ON "users"("uid");

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_user_fkey" FOREIGN KEY ("user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
