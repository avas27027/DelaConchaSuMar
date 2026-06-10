import { defineMiddleware } from "astro:middleware";
import { verifySessionToken } from "../controller/salesOrders.hook";

export const onRequest = defineMiddleware(async ({ cookies, url, redirect }, next) => {
    // Solo proteger rutas que empiecen con /admin
    if (!url.pathname.startsWith("/login")) {
        const sessionCookie = cookies.get("session")?.value;

        if (!sessionCookie) {
            return redirect("/login");
        }

        try {
            const user = await verifySessionToken(sessionCookie);
            if (!user.success) {
                return redirect("/login");
            }

        } catch (error: any) {
            console.error("Error verifying session cookie:", error);
            return redirect("/login");
        }
    }

    return next();
});