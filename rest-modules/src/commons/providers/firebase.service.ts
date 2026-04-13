import { Injectable } from "@nestjs/common";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

@Injectable()
export class FirebaseService {
  private readonly projectId = process.env.FIREBASE_PROJECT_ID;
  private readonly clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  private readonly privateKey = process.env.FIREBASE_PRIVATE_KEY!.replaceAll("\\n", "\n");

  constructor() {
    const credential = {
      projectId: this.projectId,
      clientEmail: this.clientEmail,
      privateKey: this.privateKey
    };
    if (!getApps().length) {
      initializeApp(credential ? { credential: cert(credential) } : undefined);
    }
  }

  getAuth() {
    return getAuth();
  }

  getFirestore() {
    return getFirestore();
  }
}