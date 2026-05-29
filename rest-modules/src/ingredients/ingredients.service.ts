import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { FirebaseService } from '@/commons/providers/firebase.service';
import { Response } from '@/commons/interfaces';

@Injectable()
export class IngredientsService {
  private readonly firestore: FirebaseFirestore.Firestore;
  private readonly logger = new Logger(IngredientsService.name);
  private readonly collectionName: string;

  constructor(private readonly firebase: FirebaseService) {
    this.firestore = firebase.getFirestore();
    this.collectionName = firebase.collectionNames[IngredientsService.name];
  }

  private async mapIngredientDoc(doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot) {
    const data = doc.data() ?? {};
    const unitRef = data.unit as FirebaseFirestore.DocumentReference | undefined;
    let unit = data.unit;

    if (unitRef?.get) {
      const unitDoc = await unitRef.get();
      unit = unitDoc.exists ? { id: unitDoc.id, ...unitDoc.data() } : null;
    }

    return {
      id: doc.id,
      ...data,
      unit,
    };
  }

  async create(createIngredientDto: CreateIngredientDto): Promise<Response> {
    try {
      const { unit, ...data } = createIngredientDto;
      const meassureRef = this.firestore.doc(`${this.firebase.collectionNames.MeassuresService}/${unit}`);
      const docRef = await this.firestore.collection(this.collectionName).add({
        ...data,
        unit: meassureRef,
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Insumo creado exitosamente',
        data: { id: docRef.id },
      };
    } catch (error: any) {
      this.logger.error(`Error al crear insumo: ${error.message}`);
      return { success: false, message: error.message, data: {} };
    }
  }

  async count() {
    const snapshot = await this.firestore.collection(this.collectionName).get();
    return snapshot.size;
  }

  async getIngredients(limit = 10, cursor?: string): Promise<Response> {
    const response: Response = {
      success: true,
      message: 'Successful operation',
      data: {},
    };

    try {
      let query = this.firestore
        .collection(this.collectionName)
        .orderBy('createdAt', 'desc')
        .limit(limit);

      if (cursor) {
        const cursorDoc = await this.firestore.collection(this.collectionName).doc(cursor).get();

        if (cursorDoc.exists) {
          query = query.startAfter(cursorDoc);
        }
      }

      const snapshot = await query.get();

      const ingredients = await Promise.all(
        snapshot.docs.map((doc) => this.mapIngredientDoc(doc)),
      );

      const lastDoc = snapshot.docs.at(-1);

      this.logger.log(`Finding ${ingredients.length} ingredients`);
      response.data = {
        ingredients,
        nextCursor: lastDoc ? lastDoc.id : null,
        hasMore: snapshot.docs.length === limit,
        total: await this.count(),
      };
    } catch (error: any) {
      this.logger.error(error);
      response.success = false;
      response.message = error.message;
    }

    return response;
  }

  async findAll(): Promise<Response> {
    try {
      this.logger.log('Obteniendo todos los insumos');
      const snapshot = await this.firestore.collection(this.collectionName).get();

      const ingredients = await Promise.all(
        snapshot.docs.map((doc) => this.mapIngredientDoc(doc)),
      );

      return {
        success: true,
        message: 'Insumos obtenidos con exito',
        data: ingredients,
      };
    } catch (error: any) {
      this.logger.error(`Error al obtener insumos: ${error.message}`);
      return { success: false, message: error.message, data: [] };
    }
  }

  async findOne(id: string): Promise<Response> {
    try {
      const doc = await this.firestore.collection(this.collectionName).doc(id).get();

      if (!doc.exists) {
        throw new NotFoundException(`El insumo con ID ${id} no existe`);
      }

      return {
        success: true,
        message: 'Insumo encontrado',
        data: await this.mapIngredientDoc(doc),
      };
    } catch (error: any) {
      this.logger.error(`Error al obtener insumo ${id}: ${error.message}`);
      return { success: false, message: error.message, data: {} };
    }
  }

  async update(id: string, updateIngredientDto: UpdateIngredientDto): Promise<Response> {
    try {
      const docRef = this.firestore.collection(this.collectionName).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundException('Insumo no encontrado');
      }

      const { unit, ...data } = updateIngredientDto;

      await docRef.update({
        ...data,
        ...(unit && {
          unit: this.firestore.doc(`${this.firebase.collectionNames.MeassuresService}/${unit}`),
        }),
        updatedAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Insumo actualizado correctamente',
        data: { id },
      };
    } catch (error: any) {
      this.logger.error(`Error al actualizar insumo ${id}: ${error.message}`);
      return { success: false, message: error.message, data: {} };
    }
  }

  async remove(id: string): Promise<Response> {
    try {
      const docRef = this.firestore.collection(this.collectionName).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundException('Insumo no encontrado');
      }

      await docRef.delete();

      return {
        success: true,
        message: `Insumo ${id} eliminado correctamente`,
        data: {},
      };
    } catch (error: any) {
      this.logger.error(`Error al eliminar insumo ${id}: ${error.message}`);
      return { success: false, message: error.message, data: {} };
    }
  }
}
