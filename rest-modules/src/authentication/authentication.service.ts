import { Response } from '@/commons/interfaces';
import { FirebaseService } from '@/commons/providers/firebase.service';
import { Injectable } from '@nestjs/common';
import { Auth } from 'firebase-admin/auth';

@Injectable()
export class AuthenticationService {
    private readonly auth: Auth;
    private readonly firestore: FirebaseFirestore.Firestore;
    private readonly collectionName: string;

    constructor(private readonly firebase: FirebaseService) {
        this.auth = this.firebase.getAuth();
        this.firestore = this.firebase.getFirestore();
        this.collectionName = firebase.collectionNames[AuthenticationService.name]
    }

    async tokenCreate(token: string): Promise<Response> {
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días
        let sessionCookie: string | null = null;
        try {
            sessionCookie = await this.auth.createSessionCookie(token, { expiresIn });
        } catch (error) {
            console.error("Error creando session cookie:", error);

            return {
                success: false,
                message: "Error creating session cookie"
            };
        }
        return {
            success: true,
            message: "Session cookie created successfully",
            data: sessionCookie ?? {}
        };
    }

    async tokenVerify(token: string): Promise<Response> {
        try {
            const decodedClaims = await this.auth.verifySessionCookie(token, true);
            const uid = decodedClaims.uid;
            
            const usersSnapshot = await this.firestore.collection(this.collectionName).where('uid', '==', uid).get();
            const userDoc = usersSnapshot.docs[0];
            const userData = userDoc ? userDoc.data() : null;
            
            return {
                success: true,
                message: "Token verified successfully",
                data: userData || {}
            };
        } catch (error) {
            console.error("Error verifying session cookie:", error);
            return {
                success: false,
                message: "Invalid token"
            };
        }
    }
}
