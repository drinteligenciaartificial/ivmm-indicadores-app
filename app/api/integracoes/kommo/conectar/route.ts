import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { kommoEnvironmentReady } from "@/lib/kommo";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRADOR") return NextResponse.redirect(new URL("/login", process.env.APP_URL || "https://ivmm-indicadores-app.onrender.com"));
  if (!kommoEnvironmentReady() || !process.env.KOMMO_CLIENT_ID) {
    return NextResponse.redirect(new URL("/integracoes/kommo?erro=ambiente", process.env.APP_URL || "https://ivmm-indicadores-app.onrender.com"));
  }
  const state = randomBytes(24).toString("base64url");
  const authorization = new URL("https://www.kommo.com/oauth");
  authorization.searchParams.set("client_id", process.env.KOMMO_CLIENT_ID);
  authorization.searchParams.set("state", state);
  authorization.searchParams.set("mode", "popup");
  const response = NextResponse.redirect(authorization);
  response.cookies.set("kommo_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 20 * 60, path: "/" });
  return response;
}
