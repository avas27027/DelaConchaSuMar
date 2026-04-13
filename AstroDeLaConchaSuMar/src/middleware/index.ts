import { defineMiddleware } from "astro:middleware";
import { auth } from '../controller/firebaseAdmin';

export const onRequest = defineMiddleware(async ({ cookies, url, redirect }, next) => {
    // Solo proteger rutas que empiecen con /admin
    if (!url.pathname.startsWith("/login")) {
        const sessionCookie = cookies.get("session")?.value;

        if (!sessionCookie) {
            return redirect("/login");
        }

        try {
            //const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
            const res = await fetch("http://localhost:3001/authentication/verifyToken", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${sessionCookie}`,
                },
            });

            console.log("Respuesta del backend:", res);
            const data = await res.json();
            if (!data.success) {
                return redirect("/login");
            }

        } catch (error: any) {
            console.error("Error verifying session cookie:", error);
            return redirect("/login");
        }
    }

    return next();
});