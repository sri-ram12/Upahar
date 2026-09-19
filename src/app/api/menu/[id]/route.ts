import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const item = await prisma.foodItem.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    // Related dishes from same category
    const related = await prisma.foodItem.findMany({
      where: {
        categoryId: item.categoryId,
        id: { not: item.id },
        isAvailable: true,
      },
      take: 4,
    });

    return NextResponse.json({ item, related });
  } catch (error) {
    console.error("Error fetching dish details:", error);
    return NextResponse.json(
      { error: "Failed to fetch dish details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const item = await prisma.foodItem.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.price !== undefined && { price: parseFloat(body.price) }),
        ...(body.image && { image: body.image }),
        ...(body.categoryId && { categoryId: body.categoryId }),
        ...(body.isVeg !== undefined && { isVeg: Boolean(body.isVeg) }),
        ...(body.isSpicy !== undefined && { isSpicy: Boolean(body.isSpicy) }),
        ...(body.isBestseller !== undefined && { isBestseller: Boolean(body.isBestseller) }),
        ...(body.isSignature !== undefined && { isSignature: Boolean(body.isSignature) }),
        ...(body.isAvailable !== undefined && { isAvailable: Boolean(body.isAvailable) }),
        ...(body.prepTime && { prepTime: body.prepTime }),
        ...(body.portionSize !== undefined && { portionSize: body.portionSize }),
        ...(body.ingredients !== undefined && { ingredients: body.ingredients }),
        ...(body.displayOrder !== undefined && { displayOrder: parseInt(body.displayOrder, 10) }),
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error updating food item:", error);
    return NextResponse.json(
      { error: "Failed to update food item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.foodItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting food item:", error);
    return NextResponse.json(
      { error: "Failed to delete food item" },
      { status: 500 }
    );
  }
}
