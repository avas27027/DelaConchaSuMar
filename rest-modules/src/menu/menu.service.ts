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

  async registerImage(file: Express.Multer.File, createMenuDto: CreateMenuDto): Promise<Response> {
    const response: Response = {
      success: true,
      message: 'Successful operation',
      data: {}
    }

    const fileName = `menu/${uuidv4()}-${file.originalname}`;
    const fileUpload = this.bucket.file(fileName);

    try {
      await fileUpload.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });
      await fileUpload.makePublic();
      const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${encodeURIComponent(fileName)}`;
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

  async create(createMenuDto: CreateMenuDto): Promise<Response> {
    const response: Response = {
      success: true,
      message: 'Successful operation',
      data: {}
    }
    try {
      const { meassureUnitId, ...menuData } = createMenuDto;
      const meassureRef = this.firestore.doc(`meassureUnits/${meassureUnitId}`);

      const docRef = await this.firestore.collection(this.collectionName).add({
        ...menuData,
        priceMeassure: meassureRef, // Guardamos la referencia real
        createdAt: new Date().toISOString(),
      });

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
      const productsSnapshot = await this.firestore.collection('products').get();

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

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Response> {
    const response: Response = {
      success: true,
      message: 'Successful operation',
      data: {}
    }
    try {
      const docRef = this.firestore.collection(this.collectionName).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) throw new NotFoundException('Element not found');

      await docRef.update({
        ...updateMenuDto,
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
