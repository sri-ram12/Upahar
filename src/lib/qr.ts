import QRCode from "qrcode";

export interface QRCodeOptions {
  size?: number;
  darkColor?: string;
  lightColor?: string;
  includeLogo?: boolean;
  logoUrl?: string;
}

/**
 * Generates a high-resolution QR code data URL (PNG format).
 * Runs in the browser using HTML Canvas or Node.js via QRCode.toDataURL.
 */
export async function generateQRCodeDataUrl(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    size = 600,
    darkColor = "#2B070E", // Upahar Deep Maroon
    lightColor = "#FFFFFF",
    includeLogo = true,
    logoUrl = "/images/upahar_logo.jpg",
  } = options;

  // Basic QR data URL from the qrcode package
  const qrDataUrl = await QRCode.toDataURL(text, {
    width: size,
    margin: 2,
    errorCorrectionLevel: "H", // High error correction (30%) allows placing the logo safely
    color: {
      dark: darkColor,
      light: lightColor,
    },
  });

  // If not running in a browser or logo not requested, return pure QR
  if (typeof window === "undefined" || !includeLogo || !logoUrl) {
    return qrDataUrl;
  }

  // Draw logo on top in the center with a circular shield and gold ring
  return new Promise<string>((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(qrDataUrl);
      return;
    }

    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 0, 0, size, size);

      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.onload = () => {
        const logoSize = Math.floor(size * 0.22); // 22% of QR code width
        const center = size / 2;
        const radius = logoSize / 2;

        // Draw white background disc behind logo
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        ctx.fill();
        ctx.restore();

        // Draw gold circular border
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, radius + 3, 0, Math.PI * 2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#D4AF37"; // Upahar Gold
        ctx.stroke();
        ctx.restore();

        // Clip circular path and draw logo inside
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(
          logoImg,
          center - radius,
          center - radius,
          logoSize,
          logoSize
        );
        ctx.restore();

        resolve(canvas.toDataURL("image/png"));
      };

      logoImg.onerror = () => {
        // Fallback: Return QR code without logo if image fails to load
        resolve(qrDataUrl);
      };

      logoImg.src = logoUrl;
    };

    qrImg.onerror = () => {
      resolve(qrDataUrl);
    };

    qrImg.src = qrDataUrl;
  });
}
