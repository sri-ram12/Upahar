import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { FALLBACK_CATEGORIES } from "@/lib/fallback-menu";
import { getDivisionForCategorySlug, isValidDivisionKey } from "@/lib/store-hours";
import { ensureSubsitesInitialized } from "@/lib/subsite-data";

export async function GET(req: NextRequest) {
  try {
    await ensureSubsitesInitialized();
    const { searchParams } = new URL(req.url);
    const divisionParam = searchParams.get("division");

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        ...(divisionParam && isValidDivisionKey(divisionParam)
          ? { division: divisionParam }
          : {}),
      },
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    if (!categories || categories.length === 0) {
      const filteredFallback =
        divisionParam && isValidDivisionKey(divisionParam)
          ? FALLBACK_CATEGORIES.filter((c) => c.division === divisionParam)
          : FALLBACK_CATEGORIES;
      return NextResponse.json({ categories: filteredFallback });
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories, using fallback:", error);
    return NextResponse.json({ categories: FALLBACK_CATEGORIES });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, icon, image, division, displayOrder = 0 } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const resolvedDivision = isValidDivisionKey(division)
      ? division
      : getDivisionForCategorySlug(slug);

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        division: resolvedDivision,
        image: image ? String(image).trim() : null,
        description: description || "",
        icon: icon || "Utensils",
        displayOrder: Number(displayOrder),
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
