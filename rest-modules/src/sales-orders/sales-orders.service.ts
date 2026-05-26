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
    let productsRef: any[] = []
    try {
      this.logger.log(`Creando nueva orden para la mesa ID: ${createSalesOrderDto.tableId}`);

      const { tableId, userId, salesId, state, products } = createSalesOrderDto;

      // Creamos las referencias a otros documentos
      const tableRef = this.firestore.doc(`${this.firebase.collectionNames.TablesService}/${tableId}`);
      const userRef = this.firestore.doc(`${this.firebase.collectionNames.AuthenticationService}/${userId}`);

      productsRef = products.map(({ productId, quantity, observations }) => {
        return { quantity, observations, product: this.firestore.doc(`${this.firebase.collectionNames.MenuService}/${productId}`) }
      });

      const newOrder = {
        salesId: salesId ?? null,
        state: state ?? 'libre',
        table: tableId === '' ? null : tableRef,
        user: userId === '' ? null : userRef,
        products: productsRef,
        createdAt: new Date().toISOString(),
      };

      const docRef = await this.firestore.collection(this.collectionName).add(newOrder);

      return {
        success: true,
        message: 'Orden creada',
        data: { id: docRef.id, products: products },
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
    let productsRef: any[] = []
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

      response.data.products = productsRef ?? {};
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

      return {
        success: true,
        message: `Order ${id} eliminada correctamente`,
        data: { id },
      };
    } catch (error: any) {
      return { success: false, message: error.message, data: {} };
    }
  }


}