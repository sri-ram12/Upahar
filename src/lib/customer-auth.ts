import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CustomerUser } from "@/types";

export const CUSTOMER_COOKIE_NAME = "upahar_customer_token";
const JWT_SECRET = process.env.JWT_SECRET || "upahar-customer-secret-key-2026";

export function sanitizeCustomerForClient(customer: {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  emailVerified: boolean;
  avatarUrl: string | null;
  authProvider: string;
  address: string | null;
  landmark: string | null;
  locality: string | null;
  addresses?: CustomerUser["addresses"];
  createdAt?: Date | string;
}): CustomerUser {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    emailVerified: customer.emailVerified,
    avatarUrl: customer.avatarUrl,
    authProvider: customer.authProvider,
    address: customer.address,
    landmark: customer.landmark,
    locality: customer.locality,
    addresses: customer.addresses || [],
    createdAt: customer.createdAt,
  };
}

export function signCustomerToken(customer: {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}) {
  return jwt.sign(
    {
      id: customer.id,
      name: customer.name,
      phone: customer.phone || undefined,
      email: customer.email || undefined,
    },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

export function setCustomerAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function clearCustomerAuthCookie(response: NextResponse) {
  response.cookies.set(CUSTOMER_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getAuthenticatedCustomer() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = jwt.verify(token, JWT_SECRET) as { id?: string };
    if (!payload?.id) return null;

    const customer = await prisma.customerUser.findUnique({
      where: { id: payload.id },
      include: { addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] } },
    });

    return customer ? sanitizeCustomerForClient(customer) : null;
  } catch {
    return null;
  }
}

export function isGoogleOAuthConfigured(): boolean {
  const clientId = (process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || "").trim();
  return Boolean(clientId && clientSecret);
}

function isLoopbackHost(hostOrUrl: string): boolean {
  const normalized = hostOrUrl.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
  return (
    normalized.startsWith("localhost") ||
    normalized.startsWith("127.0.0.1") ||
    normalized.startsWith("0.0.0.0") ||
    normalized.startsWith("[::1]")
  );
}

/**
 * Resolves the browser-facing origin behind reverse proxies like Render/Vercel,
 * where req.nextUrl.origin can internally resolve to https://localhost:10000.
 */
export function getPublicOrigin(req: NextRequest): string {
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwardedHost && !isLoopbackHost(forwardedHost)) {
    return `${forwardedProto || "https"}://${forwardedHost}`;
  }

  const host = req.headers.get("host")?.trim();
  if (host && !isLoopbackHost(host)) {
    return `${forwardedProto || "https"}://${host}`;
  }

  const envSite = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/+$/, "");
  if (process.env.NODE_ENV === "production") {
    if (envSite && !isLoopbackHost(envSite)) {
      return envSite;
    }
    const envRedirect = (process.env.GOOGLE_REDIRECT_URI || "").trim();
    if (envRedirect) {
      try {
        const parsed = new URL(envRedirect);
        if (!isLoopbackHost(parsed.host)) {
          return parsed.origin;
        }
      } catch {}
    }
  }

  if (host && isLoopbackHost(host)) {
    return `${forwardedProto || "http"}://${host}`;
  }

  return req.nextUrl.origin;
}

export function resolveGoogleRedirectUri(req: NextRequest, origin: string): string {
  const envRedirect = (process.env.GOOGLE_REDIRECT_URI || "").trim();
  if (envRedirect && !isLoopbackHost(origin)) {
    return envRedirect;
  }
  return `${origin}/api/auth/google/callback`;
}

