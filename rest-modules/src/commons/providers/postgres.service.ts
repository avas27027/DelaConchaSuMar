import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma/client';
import { ErpProviderService } from '@/commons/providers/erp.provider.service';
import { Response } from '../interfaces';

type CreateMenuDto = {
  id?: number;
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
type CreateIngredientDto = {
  id?: number;
  name: string;
  description: string;
  category: string;
  currentStock: string;
  unit: string;
  minimumStock: number;
}

@Injectable()
export class PostgresService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly erpService: ErpProviderService) {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }


  async mergeProductsIngredients(menuList: CreateMenuDto[], ingredients: CreateIngredientDto[]) {
    let response: Response = {
      success: false,
      message: "",
    }
    try {
      await this.$transaction(async (tx) => {
        const productIds = menuList
          .map((product) => product.id)
          .filter((id): id is number => typeof id === "number");
        const ingredientIds = ingredients
          .map((ingredient) => ingredient.id)
          .filter((id): id is number => typeof id === "number");

        await tx.productsIngredients.deleteMany();

        await tx.products.deleteMany({
          where: {
            id: { notIn: productIds },
          },
        });

        await tx.ingredients.deleteMany({
          where: {
            id: { notIn: ingredientIds },
          },
        });

        for (const ingredient of ingredients) {
          if (!ingredient.id) continue;

          const { id, unit, ...ingredientData } = ingredient;

          await tx.ingredients.upsert({
            where: { id },
            create: {
              id,
              ...ingredientData,
              unit: Number.parseInt(unit),
            },
            update: {
              ...ingredientData,
              unit: Number.parseInt(unit),
              updatedAt: new Date(),
            },
          });
        }

        for (const product of menuList) {
          if (!product.id) continue;

          const { id, ingredients: productIngredients, priceMeassure, ...productData } = product;

          await tx.products.upsert({
            where: { id },
            create: {
              id,
              ...productData,
              priceMeassure: Number.parseInt(product.priceMeassure ?? '6'),
              productsIngredients: {
                createMany: {
                  data: productIngredients?.map(ingredient => ({
                    ingredient: Number.parseInt(ingredient.ingredient ?? '0'),
                    quantity: ingredient.quantity
                  })) ?? []
                }
              }
            },
            update: {
              ...productData,
              priceMeassure: Number.parseInt(priceMeassure ?? '6'),
              updatedAt: new Date(),
              productsIngredients: {
                createMany: {
                  data: productIngredients?.map(ingredient => ({
                    ingredient: Number.parseInt(ingredient.ingredient ?? '0'),
                    quantity: ingredient.quantity
                  })) ?? []
                }
              }
            },
          });
        }
        await tx.$executeRaw`
          SELECT setval(
            pg_get_serial_sequence('ingredients', 'id'),
            COALESCE((SELECT MAX(id) FROM ingredients), 1),
            (SELECT MAX(id) FROM ingredients) IS NOT NULL
          )
        `;
        await tx.$executeRaw`
          SELECT setval(
            pg_get_serial_sequence('products', 'id'),
            COALESCE((SELECT MAX(id) FROM products), 1),
            (SELECT MAX(id) FROM products) IS NOT NULL
          )
        `;
        await tx.$executeRaw`
          SELECT setval(
            pg_get_serial_sequence('products_ingredients', 'id'),
            COALESCE((SELECT MAX(id) FROM products_ingredients), 1),
            (SELECT MAX(id) FROM products_ingredients) IS NOT NULL
          )
        `;
      })
      response.message = "Successful operation"
      response.success = true
    } catch (error: any) {
      response.message = error.message
    }
    return response
  }
}
