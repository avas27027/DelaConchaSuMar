import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async ({ cookies, url, redirect }, next) => {
    // Solo proteger rutas que empiecen con /admin
    if (url.pathname.startsWith("/login")) {
        const sessionCookie = cookies.get("session")?.value;

        if (!sessionCookie) {
            return redirect("/login");
        }

        try {
            const backendUrl = process.env.BACKEND_URL ?? "http://backend:3001";
            const endpoint = new URL("/authentication/verifyToken", backendUrl).toString();
            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${sessionCookie}`,
                },
            }).then(res => res).then(res => res.json());

            const data = await res;
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