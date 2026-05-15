import { Injectable } from "@nestjs/common";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

@Injectable()
export class FirebaseService {
  private readonly projectId = process.env.FIREBASE_PROJECT_ID;
  private readonly clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  private readonly privateKey = process.env.FIREBASE_PRIVATE_KEY!.replaceAll("\\n", "\n");
  private readonly storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  public readonly collectionNames = {
    MeassuresService: "meassureUnits",
    TablesService: "tables",
    AuthenticationService: "users",
    MenuService: "products",
    SalesOrdersService: "salesOrders",
    SalesOrders_x_Products: "salesOrders_x_products",
    IngredientsService: "ingredients",
  }

  constructor() {
    const credential = {
      projectId: this.projectId,
      clientEmail: this.clientEmail,
      privateKey: this.privateKey
    };
    if (!getApps().length) {
      initializeApp(credential ? {
        credential: cert(credential),
        storageBucket: this.storageBucket || `${this.projectId}.firebasestorage.app`
      } : undefined);
    }
  }

  getAuth() {
    return getAuth();
  }

  getFirestore() {
    return getFirestore();
  }

  getBucket() {
    return getStorage().bucket();
  }

  getCollectionNames(key: string) {
    return this.collectionNames[key] ?? ''
  }
}