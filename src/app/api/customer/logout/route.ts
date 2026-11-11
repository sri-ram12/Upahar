import { NextResponse } from "next/server";
import { clearCustomerAuthCookie } from "@/lib/customer-auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearCustomerAuthCookie(response);
  return response;
}

