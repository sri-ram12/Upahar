import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { getDeliveryFee, calculateDistanceKm, UPAHAR_COORDINATES } from "@/lib/delivery-zones";
import { broadcastRealtimeEvent } from "@/lib/realtime-bus";
import { calculateCouponDiscount } from "@/lib/coupons";
import {
  evaluateDivisionStatus,
  getDivisionForCategory,
  type DivisionKey,
} from "@/lib/store-hours";
import { getSubsitesAndSettings } from "@/lib/subsite-data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const phone = searchParams.get("phone");
    const customerId = searchParams.get("customerId");
    const orderNumbersParam = searchParams.get("orderNumbers");
    const includeStats = searchParams.get("stats") === "true";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const customerFilters: any[] = [];
    if (phone) customerFilters.push({ customerPhone: phone.replace(/\D/g, "") });
    if (customerId) customerFilters.push({ customerId });
    if (orderNumbersParam) {
      const nums = orderNumbersParam
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean);
      if (nums.length > 0) {
        customerFilters.push({ orderNumber: { in: nums } });
      }
    }

    if (customerFilters.length === 1) {
      Object.assign(where, customerFilters[0]);
    } else if (customerFilters.length > 1) {
      where.OR = customerFilters;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        deliveryAgent: {
          select: { id: true, name: true, phone: true, vehicleNumber: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    if (!includeStats) {
      return NextResponse.json({ orders });
    }

    // Full DB aggregate revenue stats (never capped by limit=50)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [allDelivered, todayDelivered, codDelivered, upiDelivered, ratingAgg, totalOrdersCount] =
      await Promise.all([
        prisma.order.aggregate({
          where: { status: "DELIVERED" },
          _sum: { totalAmount: true },
          _count: { id: true },
        }),
        prisma.order.aggregate({
          where: { status: "DELIVERED", createdAt: { gte: startOfToday } },
          _sum: { totalAmount: true },
          _count: { id: true },
        }),
        prisma.order.aggregate({
          where: { status: "DELIVERED", paymentMethod: "COD" },
          _sum: { totalAmount: true },
        }),
        prisma.order.aggregate({
          where: { status: "DELIVERED", paymentMethod: { in: ["UPI", "QR_ON_DELIVERY"] } },
          _sum: { totalAmount: true },
        }),
        prisma.order.aggregate({
          where: { rating: { not: null } },
          _avg: { rating: true },
          _count: { rating: true },
        }),
        prisma.order.count(),
      ]);

    return NextResponse.json({
      orders,
      stats: {
        totalRevenue: allDelivered._sum.totalAmount || 0,
        todayRevenue: todayDelivered._sum.totalAmount || 0,
        totalDeliveredCount: allDelivered._count.id || 0,
        todayDeliveredCount: todayDelivered._count.id || 0,
        codRevenue: codDelivered._sum.totalAmount || 0,
        upiRevenue: upiDelivered._sum.totalAmount || 0,
        avgRating: ratingAgg._avg.rating ? Number(ratingAgg._avg.rating.toFixed(1)) : null,
        ratingCount: ratingAgg._count.rating || 0,
        totalOrdersCount,
      },
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // 0. Check Restaurant Emergency Website Stop & Online Ordering Toggle
    const settings = await prisma.restaurantSetting.findUnique({
      where: { id: "default" },
    });
    if (settings?.isEmergencyWebsiteStopped) {
      return NextResponse.json(
        {
          error:
            settings.emergencyStopMessage ||
            "Emergency Stop: Online food orders are temporarily suspended by the restaurant administration.",
        },
        { status: 403 }
      );
    }

    if (settings && settings.isOnlineOrderingEnabled === false) {
      return NextResponse.json(
        {
          error:
            "Online food ordering is currently paused by the restaurant. Please try again later or call +91 9885455342.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      customerId,
      customerName,
      customerPhone,
      orderType = "DELIVERY",
      tableNumber,
      deliveryAddress,
      landmark,
      locality,
      lat,
      lng,
      distanceKm: reportedDistance,
      specialInstructions,
      paymentMethod = "COD",
      couponCode,
      upiTransactionId,
      simulatorBypassHours = false,
      items,
    } = body;

    // 0b. Enforce Emergency Closed + Per-Subsite Operating Hours (Pickles 24x7, Tiffins 6-10:30 AM & 5-10:30 PM, Biryanis 12-10:30 PM, Fast Foods 5-10:30 PM)
    const { storeStatus, subsiteMap } = await getSubsitesAndSettings();

    if (settings?.isEmergencyClosed && !simulatorBypassHours) {
      return NextResponse.json(
        {
          error: `Kitchen is currently closed (${storeStatus.statusText}). ${storeStatus.subText}`,
        },
        { status: 403 }
      );
    }

    // 1. Validation
    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { error: "Customer name and phone number are required" },
        { status: 400 }
      );
    }

    const cleanPhone = String(customerPhone).replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Your order bag is empty" },
        { status: 400 }
      );
    }

    // 1b. Enforce Per-Division Operating Hours & Item Availability
    const foodIds = items.map((it: any) => it.foodItemId || it.id).filter(Boolean);
    const dbItems =
      foodIds.length > 0
        ? await prisma.foodItem.findMany({
            where: { id: { in: foodIds } },
            include: { category: { select: { slug: true, name: true, division: true } } },
          })
        : [];
    const dbItemMap = new Map(dbItems.map((d) => [d.id, d]));

    const soldOutItem = dbItems.find((d) => !d.isAvailable);
    if (soldOutItem) {
      return NextResponse.json(
        { error: `"${soldOutItem.name}" is currently Not Available. Please remove it from your bag.` },
        { status: 400 }
      );
    }

    const enforceHours = settings?.enforceStoreHours !== false && !simulatorBypassHours;
    if (enforceHours) {
      for (const it of items) {
        const dbMatch = dbItemMap.get(it.foodItemId || it.id);
        let divKey: DivisionKey;
        if (dbMatch?.category) {
          divKey = getDivisionForCategory(dbMatch.category);
        } else {
          const itemName = String(it.name || "").toLowerCase();
          if (itemName.includes("pickle") || itemName.includes("avakaya") || itemName.includes("gongura") || itemName.includes("magaya")) {
            divKey = "pickles";
          } else if (itemName.includes("biryani")) {
            divKey = "biryanis";
          } else if (
            itemName.includes("noodle") ||
            itemName.includes("rice") ||
            itemName.includes("manchurian") ||
            itemName.includes("chilli") ||
            itemName.includes("mughlai") ||
            itemName.includes("parotta") ||
            itemName.includes("chapati") ||
            itemName.includes("roti")
          ) {
            divKey = "fast-food";
          } else {
            divKey = "tiffins";
          }
        }

        const divEval = evaluateDivisionStatus(divKey, {
          isEmergencyClosed: Boolean(settings?.isEmergencyClosed),
          enforceStoreHours: true,
          dbConfig: subsiteMap[divKey],
        });

        if (!divEval.isOpen) {
          return NextResponse.json(
            {
              error: divEval.lockBanner || `"${it.name}" is only available during ${divEval.timingText}.`,
            },
            { status: 403 }
          );
        }
      }
    }

    // 2. Calculate subtotal & enforce Minimum Delivery Order
    const subtotal = items.reduce(
      (sum: number, it: any) => sum + Number(it.price) * Number(it.quantity),
      0
    );

    const minDeliveryOrderAmount = settings?.minDeliveryOrderAmount ?? 60;
    if (orderType === "DELIVERY" && subtotal < minDeliveryOrderAmount) {
      return NextResponse.json(
        {
          error: `Minimum order for doorstep delivery is ₹${minDeliveryOrderAmount}. Please add ₹${Math.ceil(
            minDeliveryOrderAmount - subtotal
          )} more or select Self-Pickup.`,
        },
        { status: 400 }
      );
    }

    // 3. Distance & Delivery Fee Verification honoring live RestaurantSetting
    const maxRadiusKm = settings?.deliveryRadiusKm ?? 5.0;
    let calculatedDistance = reportedDistance ? Number(reportedDistance) : 0;
    let deliveryFee = 0;

    if (orderType === "DELIVERY") {
      if (lat && lng) {
        calculatedDistance = calculateDistanceKm(
          UPAHAR_COORDINATES.lat,
          UPAHAR_COORDINATES.lng,
          Number(lat),
          Number(lng)
        );
      }

      if (calculatedDistance > maxRadiusKm) {
        return NextResponse.json(
          {
            error: `Sorry, this location is ${calculatedDistance}km away. We currently deliver only within ${maxRadiusKm}km of Tagarapuvalasa / Sangivalasa.`,
          },
          { status: 400 }
        );
      }

      const feeCalc = getDeliveryFee(calculatedDistance, subtotal, {
        maxRadiusKm,
        baseFee: settings?.deliveryBaseFee,
        freeAbove: settings?.minOrderFreeDelivery,
      });
      deliveryFee = feeCalc.fee;
    }

    // 4. Coupon Validation & Discount Calculation
    let appliedCouponCode: string | null = null;
    let discountAmount = 0;

    if (couponCode && String(couponCode).trim()) {
      const normalizedCode = String(couponCode).trim().toUpperCase();
      const coupon = await prisma.coupon.findUnique({ where: { code: normalizedCode } });
      if (!coupon || !coupon.isActive) {
        return NextResponse.json(
          { error: `Promo code "${normalizedCode}" is invalid or inactive.` },
          { status: 400 }
        );
      }
      const check = calculateCouponDiscount(coupon, subtotal);
      if (!check.valid) {
        return NextResponse.json({ error: check.reason }, { status: 400 });
      }
      appliedCouponCode = coupon.code;
      discountAmount = check.discountAmount;
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usageCount: { increment: 1 } },
      });
    }

    const packagingFee = orderType === "DINE_IN" ? 0 : settings?.packagingFee ?? 10;
    const totalAmount = Math.max(0, subtotal + packagingFee + deliveryFee - discountAmount);

    // 5. Cryptographically random 4-digit Order suffix & Delivery Verification OTP
    const randomSuffix = crypto.randomInt(1000, 10000);
    const orderNumber = `UPH-${randomSuffix}`;
    const deliveryOtp = crypto.randomInt(1000, 10000).toString();

    const cleanUtr = upiTransactionId ? String(upiTransactionId).trim() : null;
    const normalizedPaymentMethod =
      paymentMethod === "QR_ON_DELIVERY"
        ? "QR_ON_DELIVERY"
        : paymentMethod === "UPI"
        ? "UPI"
        : "COD";

    const initialPaymentStatus = cleanUtr ? "VERIFICATION_PENDING" : "PENDING";

    // 6. Create Order & Items in DB
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customerId || null,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        orderType,
        tableNumber: tableNumber ? String(tableNumber) : null,
        deliveryAddress: deliveryAddress ? String(deliveryAddress).trim() : null,
        landmark: landmark ? String(landmark).trim() : null,
        locality: locality ? String(locality).trim() : null,
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
        distanceKm: calculatedDistance || null,
        deliveryFee,
        packagingFee,
        couponCode: appliedCouponCode,
        discountAmount,
        subtotal,
        totalAmount,
        specialInstructions: specialInstructions ? String(specialInstructions).trim() : null,
        paymentMethod: normalizedPaymentMethod,
        paymentStatus: initialPaymentStatus,
        upiTransactionId: cleanUtr,
        paymentConfirmedBy: cleanUtr ? "CUSTOMER_UTR" : null,
        status: "PENDING",
        deliveryOtp,
        estimatedTime: orderType === "DELIVERY" ? "25-35 mins" : "15-20 mins",
        items: {
          create: items.map((it: any) => ({
            foodItemId: it.foodItemId || it.id || null,
            name: it.name,
            price: Number(it.price),
            quantity: Number(it.quantity),
            portionSize: it.portionSize || null,
          })),
        },
      },
      include: {
        items: true,
        deliveryAgent: true,
      },
    });

    // Broadcast instant real-time event to Admin & Kitchen panels (<50ms latency)
    broadcastRealtimeEvent("ORDER_CREATED", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      orderType: order.orderType,
      status: order.status,
      totalAmount: order.totalAmount,
      deliveryAddress: order.deliveryAddress,
      deliveryOtp: order.deliveryOtp,
      itemsCount: order.items.length,
    });

    return NextResponse.json({
      success: true,
      order,
      message: "Order placed successfully!",
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to place order: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
