import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { FirebaseService } from '@/commons/providers/firebase.service';
import { Response } from '@/commons/interfaces';

@Injectable()
export class TablesService {
  private readonly firestore: FirebaseFirestore.Firestore;
  private readonly logger = new Logger(TablesService.name);
  private readonly collectionName: string;

  constructor(private readonly firebase: FirebaseService) {
    this.firestore = firebase.getFirestore();
    this.collectionName = firebase.collectionNames[TablesService.name]
  }

  async create(createTableDto: CreateTableDto): Promise<Response> {
    try {

      const docRef = await this.firestore.collection(this.collectionName).add({
        ...createTableDto,
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Mesa creada exitosamente',
        data: { id: docRef.id },
      };
    } catch (error: any) {
      this.logger.error(`Error al crear mesa: ${error.message}`);
      return { success: false, message: error.message, data: {} };
    }
  }

  async findAll(): Promise<Response> {
    try {
      this.logger.log('Obteniendo todas las mesas');
      const snapshot = await this.firestore.collection(this.collectionName).get();

      const tables = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        success: true,
        message: 'Mesas obtenidas con éxito',
        data: tables,
      };
    } catch (error: any) {
      this.logger.error(`Error al obtener mesas: ${error.message}`);
      return { success: false, message: error.message, data: [] };
    }
  }

  async findOne(id: string): Promise<Response> {
    try {
      const doc = await this.firestore.collection(this.collectionName).doc(id).get();

      if (!doc.exists) {
        throw new NotFoundException(`La mesa con ID ${id} no existe`);
      }

      return {
        success: true,
        message: 'Mesa encontrada',
        data: { id: doc.id, ...doc.data() },
      };
    } catch (error: any) {
      return { success: false, message: error.message, data: {} };
    }
  }

  async update(id: string, updateTableDto: UpdateTableDto): Promise<Response> {
    try {
      const docRef = this.firestore.collection(this.collectionName).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundException('Mesa no encontrada');
      }

      await docRef.update({
        ...updateTableDto,
        updatedAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Mesa actualizada correctamente',
        data: { id },
      };
    } catch (error: any) {
      return { success: false, message: error.message, data: {} };
    }
  }

  async remove(id: string): Promise<Response> {
    try {
      const docRef = this.firestore.collection(this.collectionName).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundException('Mesa no encontrada');
      }

      await docRef.delete();

      return {
        success: true,
        message: `Mesa ${id} eliminada correctamente`,
        data: {},
      };
    } catch (error: any) {
      return { success: false, message: error.message, data: {} };
    }
  }
}