import { Response } from '@/commons/interfaces';
import { FirebaseService } from '@/commons/providers/firebase.service';
import { PostgresService } from '@/commons/providers/postgres.service';
import { Injectable, Logger } from '@nestjs/common';
import { Auth } from 'firebase-admin/auth';

@Injectable()
export class AuthenticationService {
    private readonly auth: Auth;
    private readonly logger = new Logger(AuthenticationService.name);

    constructor(
        private readonly firebase: FirebaseService,
        private readonly postgres: PostgresService,
    ) {
        this.auth = this.firebase.getAuth();
    }

    async tokenCreate(token: string): Promise<Response> {
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días
        let sessionCookie: string | null = null;
        try {
            sessionCookie = await this.auth.createSessionCookie(token, { expiresIn });
        } catch (error) {
            this.logger.error("Error creando session cookie:", error);

            return {
                success: false,
                message: "Error creating session cookie"
            };
        }
        this.logger.debug("Session cookie created successfully", sessionCookie)
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


            let user = await this.postgres.users.findUnique({
                where: { uid },
                include: {
                    usersRoles: {
                        include: {
                            roles: true
                        }
                    }
                }
            });

            if (!user) {
                const userEmail = (await this.auth.getUser(uid)).email;
                if (!userEmail) throw new Error("Token sin email");

                const userByEmail = await this.postgres.users.findFirst({
                    where: {
                        email: userEmail
                    }
                })
                if (userByEmail) {
                    user = await this.postgres.users.update({
                        where: {
                            id: userByEmail.id
                        },
                        data: {
                            uid: uid,
                        },
                        include: {
                            usersRoles: {
                                include: {
                                    roles: true
                                }
                            }
                        }
                    })
                }
                else throw new Error("Correo no registrado en BD")
            }

            this.logger.debug("Token verified successfully", user)
            return {
                success: true,
                message: "Token verified successfully",
                data: user || {}
            };
        } catch (error) {
            this.logger.error("Error verifying session cookie:", error);
            return {
                success: false,
                message: error.message
            };
        }
    }
}
