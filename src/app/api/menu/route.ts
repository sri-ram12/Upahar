import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { FALLBACK_MENU_ITEMS } from "@/lib/fallback-menu";
import {
  calculateStoreStatus,
  getCategorySessionPriority,
  getDivisionForCategory,
  getEffectiveSessionType,
  getItemSessionAvailability,
  isValidDivisionKey,
} from "@/lib/store-hours";
import { ensureSubsitesInitialized, getSubsitesAndSettings } from "@/lib/subsite-data";

function filterFallbackItems(searchParams: URLSearchParams) {
  const category = searchParams.get("category");
  const division = searchParams.get("division");
  const search = searchParams.get("search");
  const vegOnly = searchParams.get("vegOnly") === "true";
  const bestsellerOnly = searchParams.get("bestsellerOnly") === "true";
  const signatureOnly = searchParams.get("signatureOnly") === "true";
  const sort = searchParams.get("sort");

  let filtered = [...FALLBACK_MENU_ITEMS];

  if (division && isValidDivisionKey(division)) {
    filtered = filtered.filter(
      (item) => getDivisionForCategory(item.category || item.categoryId) === division
    );
  }

  if (category && category !== "all") {
    filtered = filtered.filter((item) => item.category?.slug === category || item.categoryId === category);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.ingredients && item.ingredients.toLowerCase().includes(q))
    );
  }

  if (vegOnly) {
    filtered = filtered.filter((item) => item.isVeg);
  }

  if (bestsellerOnly) {
    filtered = filtered.filter((item) => item.isBestseller);
  }

  if (signatureOnly) {
    filtered = filtered.filter((item) => item.isSignature);
  }

  if (sort === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    filtered.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  return filtered;
}

export async function GET(req: NextRequest) {
  try {
    await ensureSubsitesInitialized();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const division = searchParams.get("division");
    const search = searchParams.get("search");
    const vegOnly = searchParams.get("vegOnly") === "true";
    const bestsellerOnly = searchParams.get("bestsellerOnly") === "true";
    const signatureOnly = searchParams.get("signatureOnly") === "true";
    const includeInactive = searchParams.get("includeInactive") === "true";
    const respectSession = searchParams.get("respectSession") === "true";
    const includeLocked = searchParams.get("includeLocked") !== "false";
    const previewSession = searchParams.get("previewSession");
    const sort = searchParams.get("sort"); // "price-asc", "price-desc", "popular"

    const whereClause: any = {};

    if (!includeInactive) {
      whereClause.isAvailable = true;
    }

    if (category && category !== "all") {
      whereClause.category = {
        slug: category,
      };
    } else if (division && isValidDivisionKey(division)) {
      whereClause.category = {
        division,
      };
    }

    if (search && search.trim()) {
      whereClause.OR = [
        { name: { contains: search.trim() } },
        { description: { contains: search.trim() } },
        { ingredients: { contains: search.trim() } },
      ];
    }

    if (vegOnly) {
      whereClause.isVeg = true;
    }

    if (bestsellerOnly) {
      whereClause.isBestseller = true;
    }

    if (signatureOnly) {
      whereClause.isSignature = true;
    }

    let orderBy: any = [{ displayOrder: "asc" }, { isSignature: "desc" }, { isBestseller: "desc" }];
    if (sort === "price-asc") {
      orderBy = [{ price: "asc" }];
    } else if (sort === "price-desc") {
      orderBy = [{ price: "desc" }];
    } else if (sort === "name") {
      orderBy = [{ name: "asc" }];
    }

    const items = await prisma.foodItem.findMany({
      where: whereClause,
      include: {
        category: {
          select: { id: true, name: true, slug: true, division: true, image: true },
        },
      },
      orderBy,
    });

    if (!items || items.length === 0) {
      const hasSearchOrAttrFilter = Boolean(search || vegOnly || bestsellerOnly || signatureOnly);
      if (!hasSearchOrAttrFilter) {
        const dbScopeCount = await prisma.foodItem.count({
          where:
            category && category !== "all"
              ? { category: { slug: category } }
              : division && isValidDivisionKey(division)
              ? { category: { division } }
              : undefined,
        });
        if (dbScopeCount === 0) {
          return NextResponse.json({ items: filterFallbackItems(searchParams) });
        }
      }
      return NextResponse.json({ items: [] });
    }

    if (respectSession && !includeInactive) {
      const { settings, storeStatus, subsiteMap } = await getSubsitesAndSettings();
      const enforceHours = settings?.enforceStoreHours !== false;
      const effectiveSession = getEffectiveSessionType(storeStatus.sessionType, previewSession);

      const enriched = items.map((it) => {
        const availability = getItemSessionAvailability(
          it.category?.slug,
          effectiveSession,
          enforceHours,
          it.category?.division,
          subsiteMap,
          Boolean(settings?.isEmergencyClosed)
        );
        return {
          ...it,
          isSessionLocked: availability.isLocked,
          lockReason: availability.lockMessage,
          availableAtText: availability.availableAtText,
        };
      });

      const visible = includeLocked ? enriched : enriched.filter((it) => !it.isSessionLocked);

      // Sort by session relevance cleanly unless user chose explicit price/name sort
      if (!sort || sort === "popular") {
        visible.sort((a, b) => {
          if (Boolean(a.isSessionLocked) !== Boolean(b.isSessionLocked)) {
            return a.isSessionLocked ? 1 : -1;
          }
          const pa = getCategorySessionPriority(a.category?.slug, effectiveSession);
          const pb = getCategorySessionPriority(b.category?.slug, effectiveSession);
          if (pa !== pb) return pa - pb;
          return (a.displayOrder || 0) - (b.displayOrder || 0);
        });
      }

      return NextResponse.json({ items: visible });
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching menu items, using fallback:", error);
    const { searchParams } = new URL(req.url);
    const fallbackFiltered = filterFallbackItems(searchParams);
    return NextResponse.json({ items: fallbackFiltered });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      description,
      price,
      image,
      categoryId,
      isVeg = true,
      isSpicy = false,
      isBestseller = false,
      isSignature = false,
      isAvailable = true,
      prepTime = "10-15 mins",
      portionSize,
      ingredients,
      displayOrder = 0,
    } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: "Name, price, and category are required" },
        { status: 400 }
      );
    }

    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") + `-${Date.now().toString().slice(-4)}`;

    const item = await prisma.foodItem.create({
      data: {
        name,
        slug,
        description: description || "",
        price: parseFloat(price),
        image: image || "/butter-masala-dosa.jpg",
        categoryId,
        isVeg: Boolean(isVeg),
        isSpicy: Boolean(isSpicy),
        isBestseller: Boolean(isBestseller),
        isSignature: Boolean(isSignature),
        isAvailable: Boolean(isAvailable),
        prepTime: prepTime || "10-15 mins",
        portionSize: portionSize || null,
        ingredients: ingredients || null,
        displayOrder: parseInt(displayOrder, 10) || 0,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Error creating food item:", error);
    return NextResponse.json(
      { error: "Failed to create food item" },
      { status: 500 }
    );
  }
}
