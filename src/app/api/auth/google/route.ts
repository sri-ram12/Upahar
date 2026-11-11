import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const redirectParam = req.nextUrl.searchParams.get("redirect") || "/";
  const safeRedirect = redirectParam.startsWith("/") ? redirectParam : "/";

  const clientId = (process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || "").trim();
  const redirectUri = (process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`).trim();

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}${safeRedirect}${safeRedirect.includes("?") ? "&" : "?"}authError=google_not_configured`);
  }

  const state = crypto.randomBytes(24).toString("hex");
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set(
    "upahar_google_oauth_state",
    JSON.stringify({ state, redirectTo: safeRedirect }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 600,
    }
  );
  return response;
}

