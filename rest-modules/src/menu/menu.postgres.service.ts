import { Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '@/commons/providers/postgres.service';
import { Response } from '@/commons/interfaces';
import { v4 as uuidv4 } from 'uuid';
import { Bucket } from '@google-cloud/storage';
import { FirebaseService } from '@/commons/providers/firebase.service';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { EventsGateway } from '@/commons/providers/socketGateway.service';
import { Prisma } from '../../generated/prisma/client';

type ProductWithRelations = Prisma.ProductsGetPayload<{
    include: {
        productsIngredients: {
            include: {
                ingredients: true,
            }
        },
        priceMeassures: true,
    },
}>

@Injectable()
export class MenuPostgresService {
    private readonly logger = new Logger(MenuPostgresService.name);
    private readonly bucket: Bucket;
    constructor(
        private readonly db: PostgresService,
        private readonly firebase: FirebaseService,
        private readonly websocket: EventsGateway
    ) {
        this.bucket = firebase.getBucket();
    }

    private async uploadMenuImage(file: Express.Multer.File) {
        const fileName = `menu/${uuidv4()}-${file.originalname}`;
        const fileUpload = this.bucket.file(fileName);

        await fileUpload.save(file.buffer, {
            metadata: {
                contentType: file.mimetype,
            },
        });
        await fileUpload.makePublic();

        return `https://storage.googleapis.com/${this.bucket.name}/${encodeURIComponent(fileName)}`;
    }

    private parseMenuIngredients(ingredients?: CreateMenuDto['ingredients'] | string) {
        if (!ingredients) return [];
        if (Array.isArray(ingredients)) return ingredients;

        try {
            const parsedIngredients = JSON.parse(ingredients);
            return Array.isArray(parsedIngredients) ? parsedIngredients : [];
        } catch {
            return [];
        }
    }

    async getProducts(limit = 10, cursor?: string): Promise<Response> {
        let response: Response = {
            success: false,
            message: "",
        }
        try {
            const parsedLimit = Number.isNaN(limit) || limit < 1 ? 10 : limit
            const products = await this.db.products.findMany({
                take: parsedLimit + 1,
                ...(cursor && {
                    cursor: { id: Number.parseInt(cursor) },
                    skip: 1,
                }),
                orderBy: { createdAt: 'desc' },
                include: {
                    priceMeassures: true,
                    productsIngredients: {
                        include: {
                            ingredients: true
                        }
                    }
                },
            })
            const hasMore = products.length > parsedLimit
            const data = products.slice(0, parsedLimit)
            const lastProduct = data.at(-1)

            response.data = data
            response.nextCursor = hasMore && lastProduct ? String(lastProduct.id) : null
            response.hasMore = hasMore
            response.total = await this.db.products.count()
            response.message = "Successful operation"
            response.success = true
        }
        catch (error: any) {
            response.message = error.message
        }
        return response
    }

    async findAll(): Promise<Response<ProductWithRelations[]>> {
        let response: Response<ProductWithRelations[]> = {
            success: false,
            message: "",
        }
        try {
            const doc = await this.db.products.findMany({
                include: {
                    productsIngredients: {
                        include: {
                            ingredients: true
                        }
                    },
                    priceMeassures: true
                }
            })
            response.message = "Successful operation"
            response.success = true
            response.data = doc;
            this.logger.debug(response)
        }
        catch (error: any) {
            response.message = error.message
        }
        return response
    }
    async findOne(id: string): Promise<Response<ProductWithRelations[]>> {
        let response: Response<ProductWithRelations[]> = {
            success: false,
            message: "",
        }
        try {
            const doc = await this.db.products.findUnique({
                where: { id: Number.parseInt(id) },
                include: {
                    productsIngredients: {
                        include: {
                            ingredients: true
                        }
                    },
                    priceMeassures: true,
                }
            })
            response.message = 'Menu found';
            if (!doc) response.message = 'Menu not found';
            response.success = true;
            response.data = doc ? [doc] : [];
        } catch (error: any) {
            response.message = error.message;
        }
        return response
    }
    async create(menu: CreateMenuDto, file?: Express.Multer.File): Promise<Response> {
        let response: Response = {
            success: false,
            message: "",
        }
        try {
            let imageUrl: string | undefined = undefined;
            if (file) {
                imageUrl = await this.uploadMenuImage(file);
            }
            const { priceMeassure, ingredients, ...menuData } = menu
            const parsedIngredients = this.parseMenuIngredients(ingredients)
            const doc = await this.db.products.create({
                data: {
                    ...menuData,
                    priceMeassure: Number.parseInt(priceMeassure ?? '6'),
                    imageUrl: imageUrl ?? '',
                    ...(parsedIngredients.length > 0 && {
                        productsIngredients:
                        {
                            createMany: {
                                data: parsedIngredients.map((ingredient) => ({
                                    ingredient: Number.parseInt(ingredient.ingredient),
                                    quantity: Number(ingredient.quantity)
                                }))
                            }
                        }
                    })
                },
                include: {
                    productsIngredients: {
                        include: {
                            ingredients: true
                        }
                    },
                    priceMeassures: true,
                }
            })
            const allProducts = await this.findAll()
            allProducts.data && this.websocket.emitMenu(allProducts.data);
            response.message = 'Menu created successfully';
            response.success = true;
            response.data = doc;
        } catch (error: any) {
            response.message = error.message;
        }
        return response
    }
    async update(id: string, menu: UpdateMenuDto, file?: Express.Multer.File): Promise<Response<ProductWithRelations[]>> {
        let response: Response<ProductWithRelations[]> = {
            success: false,
            message: "",
        }
        try {
            let imageUrl: string | undefined = undefined;
            if (file) {
                imageUrl = await this.uploadMenuImage(file);
            }
            const { priceMeassure, ingredients, ...menuData } = menu
            const doc = await this.db.products.update({
                where: { id: Number.parseInt(id) },
                data: {
                    ...menuData,
                    ...(priceMeassure && { priceMeassure: Number.parseInt(priceMeassure) }),
                    ...(imageUrl && { imageUrl })
                },
                include: {
                    productsIngredients: {
                        include: {
                            ingredients: true
                        }
                    },
                    priceMeassures: true,
                }
            })
            const allProducts = await this.findAll()
            allProducts.data && this.websocket.emitMenu(allProducts.data);
            response.message = 'Menu updated successfully';
            response.success = true;
            response.data = doc ? [doc] : [];
        } catch (error: any) {
            response.message = error.message;
        }
        return response
    }
    async remove(id: string): Promise<Response<ProductWithRelations[]>> {
        let response: Response<ProductWithRelations[]> = {
            success: false,
            message: "",
        }
        try {
            const doc = await this.db.products.delete({
                where: { id: Number.parseInt(id) },
                include: {
                    productsIngredients: {
                        include: {
                            ingredients: true
                        }
                    },
                    priceMeassures: true,
                }
            })
            const allProducts = await this.findAll()
            allProducts.data && this.websocket.emitMenu(allProducts.data);
            response.message = 'Menu deleted successfully';
            response.success = true;
            response.data = doc ? [doc] : [];
        } catch (error: any) {
            response.message = error.message;
        }
        return response
    }

}
