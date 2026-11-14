import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { calculateCouponDiscount } from "@/lib/coupons";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("all") === "true";

    const coupons = await prisma.coupon.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    const response = NextResponse.json({ coupons });
    response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
    return response;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json({ error: "Failed to load coupons" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Customer validation flow
    if (body.action === "validate") {
      const code = String(body.code || "").trim().toUpperCase();
      const subtotal = Number(body.subtotal || 0);

      if (!code) {
        return NextResponse.json({ error: "Please enter a promo code" }, { status: 400 });
      }

      const coupon = await prisma.coupon.findUnique({ where: { code } });
      if (!coupon || !coupon.isActive) {
        return NextResponse.json(
          { error: `Promo code "${code}" is invalid or expired.` },
          { status: 404 }
        );
      }

      const check = calculateCouponDiscount(coupon, subtotal);
      if (!check.valid) {
        return NextResponse.json({ error: check.reason }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        coupon,
        discountAmount: check.discountAmount,
        message: `Coupon ${coupon.code} applied! You saved ₹${check.discountAmount}.`,
      });
    }

    // Admin create coupon flow
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const code = String(body.code || "").trim().toUpperCase();
    if (!code || !body.discountValue) {
      return NextResponse.json(
        { error: "Coupon code and discount value are required" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        description: body.description || `${code} Special Offer`,
        discountType: body.discountType === "PERCENT" ? "PERCENT" : "FLAT",
        discountValue: Number(body.discountValue),
        minOrderAmount: Number(body.minOrderAmount || 0),
        maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error("Coupon API error:", error);
    return NextResponse.json(
      { error: "Coupon operation failed: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, isActive } = body;
    if (!id) return NextResponse.json({ error: "Coupon ID required" }, { status: 400 });

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}
