-- CreateTable
CREATE TABLE "ingredients_ajustments" (
    "id" SERIAL NOT NULL,
    "ingredient" INTEGER NOT NULL,
    "previousStock" DECIMAL(65,30) NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "newStock" DECIMAL(65,30) NOT NULL,
    "reason" TEXT NOT NULL,
    "observations" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingredients_ajustments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ingredients_ajustments" ADD CONSTRAINT "ingredients_ajustments_ingredient_fkey" FOREIGN KEY ("ingredient") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
