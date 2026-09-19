import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const ambianceOnly = searchParams.get("ambianceOnly") === "true";
    const dishesOnly = searchParams.get("dishesOnly") === "true";

    const whereClause: any = {};
    if (category && category !== "All") {
      whereClause.category = category;
    }
    if (ambianceOnly) {
      whereClause.isAmbiance = true;
    }
    if (dishesOnly) {
      whereClause.isAmbiance = false;
    }

    const images = await prisma.galleryImage.findMany({
      where: whereClause,
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery images" },
      { status: 500 }
    );
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
      title,
      category = "Dishes",
      imageUrl,
      caption,
      isAmbiance = false,
      displayOrder = 0,
    } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "Title and Image URL are required" },
        { status: 400 }
      );
    }

    const image = await prisma.galleryImage.create({
      data: {
        title,
        category,
        imageUrl,
        caption: caption || null,
        isAmbiance: Boolean(isAmbiance),
        displayOrder: Number(displayOrder),
      },
    });

    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    console.error("Error creating gallery image:", error);
    return NextResponse.json(
      { error: "Failed to add image" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Image ID required" }, { status: 400 });
    }

    await prisma.galleryImage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
