import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl =
      searchParams.get("url") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://upahar.onrender.com";
    const download = searchParams.get("download") === "true";
    const size = Math.min(Math.max(parseInt(searchParams.get("size") || "600", 10), 100), 2000);
    const color = searchParams.get("color") || "#2B070E";

    // Generate PNG buffer
    const buffer = await QRCode.toBuffer(targetUrl, {
      width: size,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: color,
        light: "#FFFFFF",
      },
    });

    const headers: Record<string, string> = {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    };

    if (download) {
      headers["Content-Disposition"] = 'attachment; filename="upahar-qr-code.png"';
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
