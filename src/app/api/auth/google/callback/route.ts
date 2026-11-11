import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getPublicOrigin,
  resolveGoogleRedirectUri,
  setCustomerAuthCookie,
  signCustomerToken,
} from "@/lib/customer-auth";

export async function GET(req: NextRequest) {
  const origin = getPublicOrigin(req);
  const code = req.nextUrl.searchParams.get("code");
  const returnedState = req.nextUrl.searchParams.get("state");
  const oauthError = req.nextUrl.searchParams.get("error");

  const stateCookieRaw = req.cookies.get("upahar_google_oauth_state")?.value;
  let expectedState: string | null = null;
  let redirectTo = "/";

  if (stateCookieRaw) {
    try {
      const parsed = JSON.parse(stateCookieRaw) as { state?: string; redirectTo?: string };
      expectedState = parsed.state || null;
      if (parsed.redirectTo && parsed.redirectTo.startsWith("/")) {
        redirectTo = parsed.redirectTo;
      }
    } catch {}
  }

  const clearStateAndRedirect = (targetUrl: string) => {
    const res = NextResponse.redirect(targetUrl);
    res.cookies.set("upahar_google_oauth_state", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return res;
  };

  const sep = redirectTo.includes("?") ? "&" : "?";

  if (oauthError) {
    return clearStateAndRedirect(`${origin}${redirectTo}${sep}authError=google_cancelled`);
  }

  if (!code || !returnedState || !expectedState || returnedState !== expectedState) {
    return clearStateAndRedirect(`${origin}${redirectTo}${sep}authError=google_state_invalid`);
  }

  const clientId = (process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || "").trim();
  const redirectUri = resolveGoogleRedirectUri(req, origin);

  if (!clientId || !clientSecret) {
    return clearStateAndRedirect(`${origin}${redirectTo}${sep}authError=google_not_configured`);
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenJson = (await tokenRes.json()) as { access_token?: string; error?: string };
    if (!tokenRes.ok || !tokenJson.access_token) {
      console.error("Google token exchange failed:", tokenJson);
      return clearStateAndRedirect(`${origin}${redirectTo}${sep}authError=google_token_failed`);
    }

    // 2. Fetch verified Google user profile
    const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    const profile = (await profileRes.json()) as {
      sub?: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
      picture?: string;
    };

    if (!profileRes.ok || !profile.sub || !profile.email) {
      return clearStateAndRedirect(`${origin}${redirectTo}${sep}authError=google_profile_failed`);
    }

    const cleanEmail = profile.email.trim().toLowerCase();
    const displayName = (profile.name || cleanEmail.split("@")[0]).trim();

    // 3. Find or link CustomerUser account
    let customer = await prisma.customerUser.findFirst({
      where: {
        OR: [{ googleId: profile.sub }, { email: cleanEmail }],
      },
      include: { addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] } },
    });

    if (customer) {
      customer = await prisma.customerUser.update({
        where: { id: customer.id },
        data: {
          googleId: customer.googleId || profile.sub,
          email: cleanEmail,
          emailVerified: profile.email_verified !== false,
          avatarUrl: profile.picture || customer.avatarUrl,
          authProvider: customer.passwordHash ? "HYBRID" : "GOOGLE",
        },
        include: { addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] } },
      });
    } else {
      customer = await prisma.customerUser.create({
        data: {
          name: displayName,
          email: cleanEmail,
          emailVerified: profile.email_verified !== false,
          googleId: profile.sub,
          avatarUrl: profile.picture || null,
          authProvider: "GOOGLE",
        },
        include: { addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] } },
      });
    }

    const sessionToken = signCustomerToken(customer);
    const response = clearStateAndRedirect(`${origin}${redirectTo}${sep}authSuccess=google`);
    setCustomerAuthCookie(response, sessionToken);
    return response;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return clearStateAndRedirect(`${origin}${redirectTo}${sep}authError=google_server_error`);
  }
}

