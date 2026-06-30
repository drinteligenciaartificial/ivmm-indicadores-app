import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { kommoRedirectUri, saveKommoAuthorization } from "@/lib/kommo";

const appUrl = process.env.APP_URL || "https://ivmm-indicadores-app.onrender.com";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRADOR") return NextResponse.redirect(new URL("/login", appUrl));
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const referrer = request.nextUrl.searchParams.get("referrer") || request.nextUrl.searchParams.get("referer");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("kommo_oauth_state")?.value;
  const subdomain = referrer?.replace(/^https?:\/\//, "").split(".")[0].toLowerCase();
  if (!code || !state || state !== expectedState || !subdomain || !/^[a-z0-9-]+$/.test(subdomain)) {
    return NextResponse.redirect(new URL("/integracoes/kommo?erro=oauth", appUrl));
  }
  try {
    const response = await fetch(`https://${subdomain}.kommo.com/oauth2/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.KOMMO_CLIENT_ID,
        client_secret: process.env.KOMMO_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: kommoRedirectUri(),
      }),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`OAuth Kommo: ${response.status}`);
    const tokens = await response.json() as { access_token: string; refresh_token: string; expires_in: number };
    await saveKommoAuthorization({ subdomain, accessToken: tokens.access_token, refreshToken: tokens.refresh_token, expiresIn: tokens.expires_in });
    const redirect = NextResponse.redirect(new URL("/integracoes/kommo?conectado=1", appUrl));
    redirect.cookies.delete("kommo_oauth_state");
    return redirect;
  } catch {
    return NextResponse.redirect(new URL("/integracoes/kommo?erro=oauth", appUrl));
  }
}
