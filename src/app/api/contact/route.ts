import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, contact, email, subject, message } = await req.json();

    if (!name || !contact || !message) {
      return NextResponse.json(
        { error: "Name, contact number, and message are required." },
        { status: 400 }
      );
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        contact: contact.trim(),
        email: email ? email.trim() : null,
        subject: subject ? subject.trim() : null,
        message: message.trim(),
      },
    });

    return NextResponse.json(
      { success: true, message: "Thank you! Your message has been received." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating contact message:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact messages" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, isRead } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Message ID required" }, { status: 400 });
    }

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: Boolean(isRead) },
    });

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
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
      return NextResponse.json({ error: "Message ID required" }, { status: 400 });
    }

    await prisma.contactMessage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
