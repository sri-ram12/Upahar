import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { FALLBACK_CATEGORIES } from "@/lib/fallback-menu";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    if (!categories || categories.length === 0) {
      return NextResponse.json({ categories: FALLBACK_CATEGORIES });
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
    const { name, description, icon, displayOrder = 0 } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const category = await prisma.category.create({
      data: {
        name,
        slug,
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
