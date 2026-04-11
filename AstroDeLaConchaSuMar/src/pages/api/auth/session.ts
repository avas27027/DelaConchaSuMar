import type { APIRoute } from "astro";
import { auth } from "../../../controller/firebaseAdmin";

export const POST: APIRoute = async ({ request, cookies }) => {
    console.log("Recibiendo solicitud de creación de sesión...");
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Token no enviado" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const idToken = authorization.split("Bearer ")[1];
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días

  try {
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error creando session cookie:", error);
    return new Response(JSON.stringify({ error: "Token inválido" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
}
