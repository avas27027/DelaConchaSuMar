import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateMeassureDto } from './dto/create-meassure.dto';
import { UpdateMeassureDto } from './dto/update-meassure.dto';
import { FirebaseService } from '../commons/providers/firebase.service';
import { Response } from '@/commons/interfaces';

@Injectable()
export class MeassuresService {
  private readonly firestore: FirebaseFirestore.Firestore;
  private readonly logger = new Logger(MeassuresService.name);
  private readonly collectionName: string;

  constructor(private readonly firebase: FirebaseService) {
    this.firestore = firebase.getFirestore();
    this.collectionName = firebase.collectionNames[MeassuresService.name];
  }

  async create(createMeassureDto: CreateMeassureDto): Promise<Response> {
    try {
      const docRef = await this.firestore.collection(this.collectionName).add({
        ...createMeassureDto,
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Unidad de medida creada exitosamente',
        data: { id: docRef.id },
      };
    } catch (error: any) {
      this.logger.error(`Error al crear unidad de medida: ${error.message}`);
      return { success: false, message: error.message, data: {} };
    }
  }

  async findAll(): Promise<Response> {
    try {
      this.logger.log('Obteniendo todas las unidades de medida');
      const snapshot = await this.firestore.collection(this.collectionName).get();

      const meassures = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        success: true,
        message: 'Unidades de medida obtenidas con exito',
        data: meassures,
      };
    } catch (error: any) {
      this.logger.error(`Error al obtener unidades de medida: ${error.message}`);
      return { success: false, message: error.message, data: [] };
    }
  }

  async findOne(id: string): Promise<Response> {
    try {
      const doc = await this.firestore.collection(this.collectionName).doc(id).get();

      if (!doc.exists) {
        throw new NotFoundException(`La unidad de medida con ID ${id} no existe`);
      }

      return {
        success: true,
        message: 'Unidad de medida encontrada',
        data: { id: doc.id, ...doc.data() },
      };
    } catch (error: any) {
      this.logger.error(`Error al obtener unidad de medida ${id}: ${error.message}`);
      return { success: false, message: error.message, data: {} };
    }
  }

  async update(id: string, updateMeassureDto: UpdateMeassureDto): Promise<Response> {
    try {
      const docRef = this.firestore.collection(this.collectionName).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundException('Unidad de medida no encontrada');
      }

      await docRef.update({
        ...updateMeassureDto,
        updatedAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Unidad de medida actualizada correctamente',
        data: { id },
      };
    } catch (error: any) {
      this.logger.error(`Error al actualizar unidad de medida ${id}: ${error.message}`);
      return { success: false, message: error.message, data: {} };
    }
  }

  async remove(id: string): Promise<Response> {
    try {
      const docRef = this.firestore.collection(this.collectionName).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundException('Unidad de medida no encontrada');
      }

      await docRef.delete();

      return {
        success: true,
        message: `Unidad de medida ${id} eliminada correctamente`,
        data: {},
      };
    } catch (error: any) {
      this.logger.error(`Error al eliminar unidad de medida ${id}: ${error.message}`);
      return { success: false, message: error.message, data: {} };
    }
  }
}
