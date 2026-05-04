import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { FirebaseService } from '@/commons/providers/firebase.service';
import { Response } from '@/commons/interfaces';

@Injectable()
export class SalesOrdersService {
  private readonly firestore: FirebaseFirestore.Firestore;
  private readonly logger = new Logger(SalesOrdersService.name);
  private readonly collectionName: string; // Nombre de la colección de órdenes

  constructor(private readonly firebase: FirebaseService) {
    this.firestore = firebase.getFirestore();
    this.collectionName = firebase.collectionNames[SalesOrdersService.name];
  }

  async create(createSalesOrderDto: CreateSalesOrderDto): Promise<Response> {
    try {
      this.logger.log(`Creando nueva orden para la mesa ID: ${createSalesOrderDto.tableId}`);

      const { tableId, userId, salesId, state, observations } = createSalesOrderDto;

      // Creamos las referencias a otros documentos
      const tableRef = this.firestore.doc(`${this.firebase.collectionNames.TablesService}/${tableId}`);
      const userRef = this.firestore.doc(`${this.firebase.collectionNames.AuthenticationService}/${userId}`);

      const newOrder = {
        salesId: salesId ?? null,
        state: state ?? 'PENDING',
        observations: observations,
        table: tableId !== '' ? tableRef : null,
        user: userId !== '' ? userRef : null,
        createdAt: new Date().toISOString(),
      };

      const docRef = await this.firestore.collection(this.collectionName).add(newOrder);
      const resProducts = await this.createSalesOrderxProducts(docRef.id, createSalesOrderDto.products)

      return {
        success: true,
        message: 'Orden creada',
        data: { id: docRef.id, products: resProducts.data ?? {} },
      };
    } catch (error: any) {
      this.logger.error(`Error al crear orden: ${error.message}`);
      return { success: false, message: error.message, data: {} };
    }
  }

  async findAll(): Promise<Response> {
    try {
      // Ordenamos por fecha para que el cocinero vea las más antiguas primero
      const snapshot = await this.firestore
        .collection(this.collectionName)
        .orderBy('createdAt', 'asc')
        .get();

      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        success: true,
        message: 'Órdenes obtenidas',
        data: orders,
      };
    } catch (error: any) {
      return { success: false, message: error.message, data: [] };
    }
  }

  async findOne(id: string): Promise<Response> {
    try {
      const doc = await this.firestore.collection(this.collectionName).doc(id).get();

      if (!doc.exists) {
        throw new NotFoundException(`La order con ID ${id} no existe`);
      }

      return {
        success: true,
        message: 'Order encontrada',
        data: { id: doc.id, ...doc.data() },
      };
    } catch (error: any) {
      return { success: false, message: error.message, data: {} };
    }
  }

  async update(id: string, updateSalesOrderDto: UpdateSalesOrderDto): Promise<Response> {
    const response = {
      success: true,
      message: 'Estado de orden actualizado',
      data: { id, products: {} },
    }
    try {
      const docRef = this.firestore.collection(this.collectionName).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) throw new NotFoundException('Orden no encontrada');

      await docRef.update({
        ...updateSalesOrderDto,
        updatedAt: new Date().toISOString(),
      });

      if (updateSalesOrderDto.products) {
        const resProducts = await this.updateSalesOrderxProducts(id, updateSalesOrderDto.products)
        response.data = { id, products: resProducts.data ?? {} }
      }

    } catch (error: any) {
      response.success = false
      response.message = error.message
    }
    return response
  }

  async remove(id: string): Promise<Response> {
    try {
      const docRef = this.firestore.collection(this.collectionName).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundException('Order no encontrada');
      }

      await docRef.delete();
      const resProducts = await this.deleteSalesOrderXProducts(id)

      return {
        success: true,
        message: `Order ${id} eliminada correctamente`,
        data: { products: resProducts.data ?? [] },
      };
    } catch (error: any) {
      return { success: false, message: error.message, data: {} };
    }
  }

  async createSalesOrderxProducts(salesOrderId: string, products: { productId: string, quantity: number }[]) {
    const batch = this.firestore.batch()
    const collectionRef = this.firestore.collection(this.firebase.collectionNames.SalesOrders_x_Products);

    try {
      products.forEach(({ productId, quantity }) => {
        const newDocRef = collectionRef.doc()
        const productRef = this.firestore.doc(`${this.firebase.collectionNames.MenuService}/${productId}`)
        const salesOrderRef = this.firestore.doc(`${this.firebase.collectionNames.SalesOrdersService}/${salesOrderId}`)

        batch.set(newDocRef, {
          order: salesOrderRef,
          product: productRef,
          quantity,
          createdAt: new Date().toISOString()
        })

      });
      await batch.commit();
      return {
        success: true,
        message: 'Productos añadidos correctamente',
        data: { count: products.length },
      };
    } catch (error: any) {
      this.logger.error(`Error en Batch: ${error.message}`);
      return { success: false, message: 'Error al insertar productos', data: {} };
    }
  }

  async deleteSalesOrderXProducts(orderId: string): Promise<Response> {
    const batch = this.firestore.batch();
    const response = {
      success: true,
      message: 'Productos eliminados correctamente',
      data: {}
    };
    try {
      this.logger.log(`Eliminando todos los items de la orden: ${orderId}`);
      const orderRef = this.firestore.doc(`${this.firebase.collectionNames.SalesOrdersService}/${orderId}`);

      const snapshot = await this.firestore
        .collection('order-items')
        .where('orderRef', '==', orderRef)
        .get();

      if (snapshot.empty) {
        response.message = 'No había items para eliminar'
      }
      else {
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();

        response.data = { deletedCount: snapshot.size }
      }

    } catch (error: any) {
      this.logger.error(`Error eliminando items: ${error.message}`);
      response.success = false
      response.message = error.message
    }
    return response
  }

  async updateSalesOrderxProducts(salesOrderId: string, products: { productId: string, quantity: number }[]) {
    const response = {
      success: true,
      message: 'Productos actualizados correctamente',
      data: {}
    };
    try {
      await this.deleteSalesOrderXProducts(salesOrderId)
      const resCreate = await this.createSalesOrderxProducts(salesOrderId, products)
      response.data = resCreate.data ?? {}
    } catch (error: any) {
      this.logger.error(`Error eliminando items: ${error.message}`);
      response.success = false
      response.message = error.message
    }
    return response
  }


}