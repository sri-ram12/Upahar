import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "upahar-customer-secret-key-2026";

async function resolveCustomerId(req: NextRequest, fallbackId?: string | null) {
  const cookieStore = await cookies();
  const token = cookieStore.get("upahar_customer_token")?.value;
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { id: string };
      if (payload?.id) return payload.id;
    } catch {}
  }
  return fallbackId || null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = await resolveCustomerId(req, searchParams.get("customerId"));

    if (!customerId) {
      return NextResponse.json({ addresses: [] });
    }

    const addresses = await prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json({ error: "Failed to load saved addresses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const customerId = await resolveCustomerId(req, body.customerId);

    if (!customerId) {
      return NextResponse.json({ error: "Please sign in to save addresses" }, { status: 401 });
    }

    const { label = "Home", address, landmark, locality, lat, lng, distanceKm, isDefault = false } = body;

    if (!address || !String(address).trim()) {
      return NextResponse.json({ error: "Address details are required" }, { status: 400 });
    }

    if (isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });
    }

    const created = await prisma.customerAddress.create({
      data: {
        customerId,
        label: String(label).trim(),
        address: String(address).trim(),
        landmark: landmark ? String(landmark).trim() : null,
        locality: locality || "ANITS Campus & Hostels",
        lat: lat !== undefined && lat !== null ? Number(lat) : null,
        lng: lng !== undefined && lng !== null ? Number(lng) : null,
        distanceKm: distanceKm !== undefined && distanceKm !== null ? Number(distanceKm) : null,
        isDefault: Boolean(isDefault),
      },
    });

    // Also mirror default address on CustomerUser profile for backward compatibility
    if (isDefault) {
      await prisma.customerUser.update({
        where: { id: customerId },
        data: {
          address: created.address,
          landmark: created.landmark,
          locality: created.locality,
        },
      });
    }

    const addresses = await prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, address: created, addresses });
  } catch (error: any) {
    console.error("Error saving address:", error);
    return NextResponse.json(
      { error: "Failed to save address: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const customerId = await resolveCustomerId(req, searchParams.get("customerId"));

    if (!id || !customerId) {
      return NextResponse.json({ error: "Address ID and sign-in required" }, { status: 400 });
    }

    await prisma.customerAddress.deleteMany({
      where: { id, customerId },
    });

    const addresses = await prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}

