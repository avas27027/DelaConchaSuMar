import { Response } from '@/commons/interfaces';
import { PostgresService } from '@/commons/providers/postgres.service';
import { Injectable } from '@nestjs/common';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Prisma } from '../../generated/prisma/client';

type IngredientsWithRelations = Prisma.IngredientsGetPayload<{
    include: {
        units: true,
        ingredientsSuppliers: {
            include: { suppliers: true },
        },
    },
}>

@Injectable()
export class IngredientsPostgresService {
    constructor(private readonly db: PostgresService) { }

    async count(): Promise<number> {
        return this.db.ingredients.count()
    }

    async getIngredients(limit = 10, cursor?: string): Promise<Response> {
        let response: Response = {
            success: false,
            message: "",
        }
        try {
            const parsedLimit = Number.isNaN(limit) || limit < 1 ? 10 : limit
            const ingredients = await this.db.ingredients.findMany({
                take: parsedLimit + 1,
                ...(cursor && {
                    cursor: { id: Number.parseInt(cursor) },
                    skip: 1,
                }),
                orderBy: { createdAt: 'desc' },
                include: { units: true },
            })
            const hasMore = ingredients.length > parsedLimit
            const data = ingredients.slice(0, parsedLimit)
            const lastIngredient = data.at(-1)

            response.data = data
            response.nextCursor = hasMore && lastIngredient ? String(lastIngredient.id) : null
            response.hasMore = hasMore
            response.total = await this.count()
            response.message = "Successful operation"
            response.success = true
        }
        catch (error: any) {
            response.message = error.message
        }
        return response
    }

    async findAll(): Promise<Response<IngredientsWithRelations[]>> {
        let response: Response<IngredientsWithRelations[]> = {
            success: false,
            message: "",
        }
        try {
            const docs = await this.db.ingredients.findMany({
                include: {
                    units: true,
                    ingredientsSuppliers: {
                        include: { suppliers: true },
                    },
                },
            })
            response.message = `${docs.length} ingredients retrieved successfully`
            if (docs.length === 0) {
                response.message = "No ingredients found"
            }
            response.data = docs
            response.success = true
        }
        catch (error: any) {
            response.message = error.message
        }
        return response
    }

    async findOne(id: string): Promise<Response<IngredientsWithRelations[]>> {
        let response: Response<IngredientsWithRelations[]> = {
            success: false,
            message: "",
        }
        try {
            const doc = await this.db.ingredients.findUnique({
                where: { id: Number.parseInt(id) },
                include: {
                    units: true,
                    ingredientsSuppliers: {
                        include: { suppliers: true },
                    },
                },
            })
            response.data = doc ? [doc] : []
            response.message = `Ingredient with ID ${id} retrieved successfully`
            if (!response.data) {
                response.message = "Ingredient not found"
            }
            response.success = true
        }
        catch (error: any) {
            response.message = error.message
        }
        return response
    }

    async create(createIngredientDto: CreateIngredientDto): Promise<Response<IngredientsWithRelations[]>> {
        let response: Response<IngredientsWithRelations[]> = {
            success: false,
            message: "",
            data: []
        }
        try {
            const { unit, ...data } = createIngredientDto

            const doc = await this.db.ingredients.create({
                data: { ...data, unit: Number.parseInt(unit) },
                include: {
                    units: true,
                    ingredientsSuppliers: {
                        include: { suppliers: true },
                    },
                },
            })
            response.data = doc ? [doc] : []
            response.message = `Ingredient ${response.data[0].id} created successfully`
            response.success = true
        }
        catch (error: any) {
            response.message = error.message
        }
        return response
    }

    async update(id: string, updateIngredientDto: UpdateIngredientDto): Promise<Response<IngredientsWithRelations[]>> {
        let response: Response<IngredientsWithRelations[]> = {
            success: false,
            message: "",
            data: []
        }
        try {
            const { unit, ...data } = updateIngredientDto

            const doc = await this.db.ingredients.update({
                where: { id: Number.parseInt(id) },
                data: { ...data, ...(unit && { unit: Number.parseInt(unit) }) },
                include: {
                    units: true,
                    ingredientsSuppliers: {
                        include: { suppliers: true },
                    },
                },
            })
            response.data = doc ? [doc] : []
            response.message = `Ingredient with ID ${id} updated successfully`
            if (!response.data) {
                response.message = "Ingredient not found"
            }
            response.success = true
        }
        catch (error: any) {
            response.message = error.message
        }
        return response
    }

    async remove(id: string): Promise<Response<IngredientsWithRelations[]>> {
        let response: Response<IngredientsWithRelations[]> = {
            success: false,
            message: "",
            data: []
        }
        try {
            const doc = await this.db.ingredients.delete({
                where: { id: Number.parseInt(id) },
                include: {
                    units: true,
                    ingredientsSuppliers: {
                        include: { suppliers: true },
                    },
                },
            })
            response.data = doc ? [doc] : []
            response.message = `Ingredient with ID ${id} deleted successfully`
            if (!response.data) {
                response.message = "Ingredient not found"
            }
            response.success = true
        }
        catch (error: any) {
            response.message = error.message
        }
        return response
    }
}
