import { Response } from '@/commons/interfaces';
import { PostgresService } from '@/commons/providers/postgres.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { CreateIngredientAjustmentDto } from './dto/create-ingredient-ajustment.dto';
import { UpdateIngredientAjustmentDto } from './dto/update-ingredient-ajustment.dto';

type IngredientAjustmentWithRelations =
  Prisma.IngredientsAjustmentGetPayload<{
    include: {
      ingredients: {
        include: { units: true };
      };
    };
  }>;

@Injectable()
export class IngredientAjustmentService {
  constructor(private readonly db: PostgresService) {}

  async create(
    createIngredientAjustmentDto: CreateIngredientAjustmentDto,
  ): Promise<Response<IngredientAjustmentWithRelations[]>> {
    const response: Response<IngredientAjustmentWithRelations[]> = {
      success: false,
      message: '',
      data: [],
    };

    try {
      const doc = await this.db.$transaction(async (tx) => {
        const adjustment = await tx.ingredientsAjustment.create({
          data: createIngredientAjustmentDto,
        });

        await tx.ingredients.update({
          where: { id: adjustment.ingredient },
          data: {
            currentStock: adjustment.newStock,
            updatedAt: new Date(),
          },
        });

        return tx.ingredientsAjustment.findUniqueOrThrow({
          where: { id: adjustment.id },
          include: {
            ingredients: {
              include: { units: true },
            },
          },
        });
      });

      response.data = [doc];
      response.message = `Ingredient adjustment ${doc.id} created successfully`;
      response.success = true;
    } catch (error: any) {
      response.message = error.message;
    }

    return response;
  }

  async findAll(): Promise<Response<IngredientAjustmentWithRelations[]>> {
    const response: Response<IngredientAjustmentWithRelations[]> = {
      success: false,
      message: '',
      data: [],
    };

    try {
      const docs = await this.db.ingredientsAjustment.findMany({
        include: {
          ingredients: {
            include: { units: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      response.data = docs;
      response.message = docs.length
        ? `${docs.length} ingredient adjustments retrieved successfully`
        : 'No ingredient adjustments found';
      response.success = true;
    } catch (error: any) {
      response.message = error.message;
    }

    return response;
  }

  async findOne(
    id: number,
  ): Promise<Response<IngredientAjustmentWithRelations[]>> {
    const response: Response<IngredientAjustmentWithRelations[]> = {
      success: false,
      message: '',
      data: [],
    };

    try {
      const doc = await this.db.ingredientsAjustment.findUnique({
        where: { id },
        include: {
          ingredients: {
            include: { units: true },
          },
        },
      });

      response.data = doc ? [doc] : [];
      response.message = doc
        ? `Ingredient adjustment with ID ${id} retrieved successfully`
        : 'Ingredient adjustment not found';
      response.success = true;
    } catch (error: any) {
      response.message = error.message;
    }

    return response;
  }

  async update(
    id: number,
    updateIngredientAjustmentDto: UpdateIngredientAjustmentDto,
  ): Promise<Response<IngredientAjustmentWithRelations[]>> {
    const response: Response<IngredientAjustmentWithRelations[]> = {
      success: false,
      message: '',
      data: [],
    };

    try {
      const doc = await this.db.$transaction(async (tx) => {
        const adjustment = await tx.ingredientsAjustment.update({
          where: { id },
          data: {
            ...updateIngredientAjustmentDto,
            updatedAt: new Date(),
          },
        });

        await tx.ingredients.update({
          where: { id: adjustment.ingredient },
          data: {
            currentStock: adjustment.newStock,
            updatedAt: new Date(),
          },
        });

        return tx.ingredientsAjustment.findUniqueOrThrow({
          where: { id: adjustment.id },
          include: {
            ingredients: {
              include: { units: true },
            },
          },
        });
      });

      response.data = [doc];
      response.message = `Ingredient adjustment with ID ${id} updated successfully`;
      response.success = true;
    } catch (error: any) {
      response.message = error.message;
    }

    return response;
  }

  async remove(
    id: number,
  ): Promise<Response<IngredientAjustmentWithRelations[]>> {
    const response: Response<IngredientAjustmentWithRelations[]> = {
      success: false,
      message: '',
      data: [],
    };

    try {
      const doc = await this.db.ingredientsAjustment.delete({
        where: { id },
        include: {
          ingredients: {
            include: { units: true },
          },
        },
      });

      response.data = [doc];
      response.message = `Ingredient adjustment with ID ${id} deleted successfully`;
      response.success = true;
    } catch (error: any) {
      response.message = error.message;
    }

    return response;
  }
}
