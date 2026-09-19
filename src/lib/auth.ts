import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "upahar_secret_key_default_2026";
const COOKIE_NAME = "upahar_admin_token";

export interface AdminPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function signToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  // Optional check if user still exists in database
  const user = await prisma.adminUser.findUnique({
    where: { id: payload.id },
  });

  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
