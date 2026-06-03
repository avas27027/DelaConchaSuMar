import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { FirebaseService } from '@/commons/providers/firebase.service';
import { Response } from '@/commons/interfaces';
import { error } from 'node:console';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { v4 as uuidv4 } from 'uuid';
import { Bucket } from '@google-cloud/storage';

@Injectable()
export class MenuService {
  private readonly firestore: FirebaseFirestore.Firestore;
  private readonly logger = new Logger(MenuService.name);
  private readonly collectionName: string;
  private readonly bucket: Bucket;

  constructor(private readonly firebase: FirebaseService) {
    this.firestore = firebase.getFirestore();
    this.collectionName = firebase.collectionNames[MenuService.name];
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

  private normalizeIngredients(ingredients: CreateMenuDto['ingredients'] | string | undefined) {
    if (!ingredients) return [];
    if (typeof ingredients !== 'string') return ingredients;

    try {
      return JSON.parse(ingredients);
    } catch (error: any) {
      this.logger.error(`Error parsing ingredients: ${error.message}`);
      return [];
    }
  }

  async registerImage(file: Express.Multer.File, createMenuDto: CreateMenuDto): Promise<Response> {
    const response: Response = {
      success: true,
      message: 'Successful operation',
      data: {}
    }

    try {
      const publicUrl = file ? await this.uploadMenuImage(file) : createMenuDto.imageUrl;
      const responseDish = await this.create({ ...createMenuDto, imageUrl: publicUrl })
      if (!responseDish.success) throw new Error(responseDish.message);

      response.data.id = responseDish.data.id
    } catch (error: any) {
      this.logger.error(error);
      response.success = false
      response.message = error.message
    }
    return response
  }

  async count() {
    const snapshot = await this.firestore.collection(this.collectionName).get();
    return snapshot.size;
  }

  async getProducts(limit = 10, cursor?: string): Promise<Response> {
    const response: Response = {
      success: true,
      message: 'Successful operation',
      data: {}
    }
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

      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const lastDoc = snapshot.docs.at(-1);

      this.logger.log(`Finding ${products.length} menus`);
      response.data = {
        products,
        nextCursor: lastDoc ? lastDoc.id : null,
        hasMore: snapshot.docs.length === limit,
        total: await this.count()
      }
    } catch (error: any) {
      this.logger.error(error);
      response.success = false
      response.message = error.message
    }
    return response
  }

  async create(createMenuDto: CreateMenuDto): Promise<Response> {
    const response: Response = {
      success: true,
      message: 'Successful operation',
      data: {}
    }
    try {
      const { priceMeassure, ingredients, ...menuData } = createMenuDto;
      const meassureRef = this.firestore.doc(`${this.firebase.collectionNames.MeassuresService}/vA5JtuCa5F6aNepR8fbP`);

      const docRef = await this.firestore.collection(this.collectionName).add({
        ...menuData,
        ingredients: this.normalizeIngredients(ingredients),
        priceMeassure: meassureRef, // Guardamos la referencia real
        createdAt: new Date().toISOString(),
      });

      this.logger.log('Dish Created');
      response.success = true
      response.message = 'Successful operation'
      response.data = { id: docRef.id }
    } catch (error: any) {
      this.logger.error(error);
      response.success = false
      response.message = error.message
    }

    return response
  }

  async findAll(): Promise<Response> {
    const response: Response = {
      success: true,
      message: 'Successful operation',
      data: {}
    }
    try {
      this.logger.log('Finding all menus');
      const productsSnapshot = await this.firestore.collection(this.collectionName).get();

      if (!productsSnapshot.docs) throw error('No success executing call');

      this.logger.debug(productsSnapshot.docs.length);
      // Mapeamos los docs para incluir el ID dentro del objeto de datos
      const menus = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      response.success = true;
      response.data = menus;
    } catch (error) {
      this.logger.error(error);
      response.success = false;
      response.message = 'Error finding menus';
      return response;
    }
    return response;
  }

  async findOne(id: string): Promise<Response> {
    const response: Response = {
      success: true,
      message: 'Successful operation',
      data: {}
    };
    try {
      this.logger.debug(id)
      const docRef = this.firestore.collection(this.collectionName).doc(id);
      const doc = await docRef.get();
      if (!doc.exists) throw new NotFoundException('Menu not found');
      response.data = { id: doc.id, ...doc.data() };
    } catch (error) {
      this.logger.error(error);
      response.success = false;
      response.message = 'Error finding menu';
      return response;
    }
    return response;
  }

  async update(id: string, updateMenuDto: UpdateMenuDto, image?: Express.Multer.File): Promise<Response> {
    const response: Response = {
      success: true,
      message: 'Successful operation',
      data: {}
    }
    try {
      const docRef = this.firestore.collection(this.collectionName).doc(id);
      const meassureRef = this.firestore.doc(`${this.firebase.collectionNames.MeassuresService}/vA5JtuCa5F6aNepR8fbP`);
      const doc = await docRef.get();

      if (!doc.exists) throw new NotFoundException('Element not found');

      this.logger.debug("update", updateMenuDto)
      const { ingredients, priceMeassure, ...restDto } = updateMenuDto;
      const imageUrl = image ? await this.uploadMenuImage(image) : restDto.imageUrl;

      await docRef.update({
        ...restDto,
        priceMeassure: meassureRef,
        ...(imageUrl ? { imageUrl } : {}),
        ingredients: this.normalizeIngredients(ingredients),
        updatedAt: new Date().toISOString(),
      });

      response.data = { id: docRef.id }
    } catch (error) {
      this.logger.error(error);
      response.success = false;
      response.message = 'Error updating menus';
      return response;
    }
    return response
  }

  async remove(id: string): Promise<Response> {
    const response: Response = {
      success: true,
      message: 'Successful operation',
      data: {}
    };
    try {
      const docRef = this.firestore.collection(this.collectionName).doc(id);
      const doc = await docRef.get();
      if (!doc.exists) throw new NotFoundException('Menu not found');
      await docRef.delete();
      response.data = { id };
    } catch (error) {
      this.logger.error(error);
      response.success = false;
      response.message = 'Error removing menu';
      return response;
    }
    return response;
  }
}
