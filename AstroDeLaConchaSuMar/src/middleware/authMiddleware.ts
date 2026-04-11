import { defineMiddleware } from "astro:middleware";
import { auth } from '../controller/firebaseAdmin';

export const onRequest = defineMiddleware(async ({ cookies, url, redirect }, next) => {
    // Solo proteger rutas que empiecen con /admin
    if (url.pathname.startsWith("/admin")) {
        const sessionCookie = cookies.get("session")?.value;

        if (!sessionCookie) {
            return redirect("/login");
        }

        try {
            const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

            // Validar el Rol
            if (decodedClaims.role !== "admin") {
                return redirect("/403"); // No autorizado
            }
        } catch (error: any) {
            console.error("Error verifying session cookie:", error);
            return redirect("/login");
        }
    }

    return next();
});