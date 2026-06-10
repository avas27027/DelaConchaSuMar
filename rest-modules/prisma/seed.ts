import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import fs from "node:fs";
import path from "node:path";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});
const prisma = new PrismaClient({ adapter });

async function main() {
    /**
     * ROLES
     */
    await prisma.roles.createMany({
        data: [
            { name: "admin" },
            { name: "cashier" },
            { name: "cook" },
            { name: "barman" },
            { name: "cookBar" },
            { name: "waiter" }
        ],
        skipDuplicates: true
    });
    /*
   * UNIDADES
   */
    await prisma.meassureUnits.createMany({
        data: [
            { name: "Kilogramo", symbol: "kg", longName: "Kilogramo" },
            { name: "Gramo", symbol: "g", longName: "Gramo" },
            { name: "Litro", symbol: "L", longName: "Litro" },
            { name: "Mililitro", symbol: "ml", longName: "Mililitro" },
            { name: "Unidad", symbol: "u", longName: "Unidad" },
            { name: "Soles", symbol: "S/", longName: "Soles" }
        ],
        skipDuplicates: true
    });

    const kg = await prisma.meassureUnits.findFirst({
        where: { symbol: "kg" }
    });

    const unidad = await prisma.meassureUnits.findFirst({
        where: { symbol: "u" }
    });

    const sol = await prisma.meassureUnits.findFirst({
        where: { symbol: "S/" }
    });

    /*
     * INGREDIENTES
     */
    await prisma.ingredients.createMany({
        data: [
            {
                name: "Pescado fresco",
                category: "Mariscos",
                description: "Pescado fresco",
                currentStock: 20,
                minimumStock: 5,
                unit: kg!.id
            },
            {
                name: "Limón",
                category: "Frutas",
                description: "Limón",
                currentStock: 100,
                minimumStock: 20,
                unit: unidad!.id
            },
            {
                name: "Cebolla roja",
                category: "Verduras",
                description: "Cebolla roja",
                currentStock: 25,
                minimumStock: 5,
                unit: kg!.id
            },
            {
                name: "Ají limo",
                category: "Condimentos",
                description: "Ají limo",
                currentStock: 50,
                minimumStock: 10,
                unit: unidad!.id
            },
            {
                name: "Camote",
                category: "Tubérculos",
                description: "Camote",
                currentStock: 30,
                minimumStock: 5,
                unit: kg!.id
            },
            {
                name: "Cancha serrana",
                category: "Acompañamientos",
                description: "Cancha serrana",
                currentStock: 15,
                minimumStock: 3,
                unit: kg!.id
            }
        ],
        skipDuplicates: true
    });

    /*
     * PROVEEDORES
     */
    await prisma.suppliers.createMany({
        data: [
            {
                name: "Pesquera San Pedro",
            },
            {
                name: "Mercado Mayorista La Parada",
            },
            {
                name: "Distribuidora Marina Perú",
            }
        ],
        skipDuplicates: true
    });

    /*
     * MESAS / CLIENTES
     */
    await prisma.tables.createMany({
        data: [
            {
                name: "1",
                place: "Terraza"
            },
            {
                name: "2",
                place: "Salón principal"
            },
            {
                name: "3",
                place: "Ventana"
            },
            {
                name: "4",
                place: "VIP"
            }
        ],
        skipDuplicates: true
    });

    /*
     * PRODUCTOS
     */
    const productsJSON = JSON.parse(fs.readFileSync(path.resolve(__dirname, "products.json"), "utf8"));
    await prisma.products.createMany({
        data: productsJSON.map((product: any) => ({
            name: product.name,
            description: product.description,
            category: product.category,
            imageUrl: product.imageUrl,
            price: product.price,
            priceMeassure: sol!.id
        })),
        skipDuplicates: true
    });

    const ceviche = await prisma.products.create({
        data: {
            name: "Ceviche clásico",
            description: "Pescado fresco marinado",
            category: "Entradas",
            imageUrl: "",
            price: 38,
            priceMeassure: unidad!.id
        }
    });

    const tiradito = await prisma.products.create({
        data: {
            name: "Tiradito de pescado",
            description: "Láminas finas con salsa",
            imageUrl: "",
            category: "Entradas",
            price: 42,
            priceMeassure: unidad!.id
        }
    });

    /*
     * RELACIONES PRODUCTO-INSUMO
     */
    const pescado = await prisma.ingredients.findFirst({
        where: { name: "Pescado fresco" }
    });

    const limon = await prisma.ingredients.findFirst({
        where: { name: "Limón" }
    });

    const cebolla = await prisma.ingredients.findFirst({
        where: { name: "Cebolla roja" }
    });

    await prisma.productsIngredients.createMany({
        data: [
            {
                product: ceviche.id,
                ingredient: pescado!.id,
                quantity: 0.25,
            },
            {
                product: ceviche.id,
                ingredient: limon!.id,
                quantity: 4,
            },
            {
                product: ceviche.id,
                ingredient: cebolla!.id,
                quantity: 0.05,
            },

            {
                product: tiradito.id,
                ingredient: pescado!.id,
                quantity: 0.25,
            },
            {
                product: tiradito.id,
                ingredient: limon!.id,
                quantity: 3,
            }
        ],
        skipDuplicates: true
    });
    /*
    * INGREDIENTES - SUPPLIERS
    */

    const aji = await prisma.ingredients.findFirst({
        where: { name: "Ají limo" },
    });

    const pesquera = await prisma.suppliers.findFirst({
        where: { name: "Pesquera San Pedro" },
    });

    const mayorista = await prisma.suppliers.findFirst({
        where: { name: "Mercado Mayorista La Parada" },
    });

    const marina = await prisma.suppliers.findFirst({
        where: { name: "Distribuidora Marina Perú" },
    });

    await prisma.ingredientsSuppliers.createMany({
        data: [
            {
                ingredient: pescado!.id,
                supplier: pesquera!.id,
                price: 24.5,
                type: "kg",
            },
            {
                ingredient: pescado!.id,
                supplier: marina!.id,
                price: 26,
                type: "kg",
            },

            {
                ingredient: limon!.id,
                supplier: mayorista!.id,
                price: 0.6,
                type: "unidad",
            },

            {
                ingredient: cebolla!.id,
                supplier: mayorista!.id,
                price: 4.2,
                type: "kg",
            },

            {
                ingredient: aji!.id,
                supplier: mayorista!.id,
                price: 0.4,
                type: "unidad",
            },

            {
                ingredient: aji!.id,
                supplier: marina!.id,
                price: 0.5,
                type: "unidad",
            },
        ],

        skipDuplicates: true,
    });
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
