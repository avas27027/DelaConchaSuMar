import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

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
            { name: "waiter" }
        ],
        skipDuplicates: true
    });

    const admin = await prisma.roles.findFirst({
        where: { name: "admin" }
    });

    const cook = await prisma.roles.findFirst({
        where: { name: "cook" }
    });

    const barman = await prisma.roles.findFirst({
        where: { name: "barman" }
    });

    const waiter = await prisma.roles.findFirst({
        where: { name: "waiter" }
    });

    /** 
     * USUARIOS
     */
    await prisma.users.createMany({
        data: [
            {
                email: "alvaro_10_12@hotmail.com",
            },
            {
                email: "alvas27027@gmail.com",
            }
        ],
        skipDuplicates: true
    });

    const correo1 = await prisma.users.findFirst({
        where: { email: "alvaro_10_12@hotmail.com" }
    });

    const correo2 = await prisma.users.findFirst({
        where: { email: "alvas27027@gmail.com" }
    });

    /**
     * RELACION USERS ROLES
     */
    await prisma.usersRoles.createMany({
        data: [
            {
                role: admin!.id,
                user: correo1!.id
            },
            {
                role: admin!.id,
                user: correo2!.id
            },
            {
                role: cook!.id,
                user: correo1!.id
            },
            {
                role: barman!.id,
                user: correo2!.id
            },
            {
                role: waiter!.id,
                user: correo1!.id
            },
            {
                role: waiter!.id,
                user: correo2!.id
            }
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
            { name: "Unidad", symbol: "u", longName: "Unidad" }
        ],
        skipDuplicates: true
    });

    const kg = await prisma.meassureUnits.findFirst({
        where: { symbol: "kg" }
    });

    const unidad = await prisma.meassureUnits.findFirst({
        where: { symbol: "u" }
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
                name: "Mesa 1",
                place: "Terraza"
            },
            {
                name: "Mesa 2",
                place: "Salón principal"
            },
            {
                name: "Mesa 3",
                place: "Ventana"
            },
            {
                name: "Mesa 4",
                place: "VIP"
            }
        ],
        skipDuplicates: true
    });

    /*
     * PRODUCTOS
     */
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
