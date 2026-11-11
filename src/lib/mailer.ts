import nodemailer from "nodemailer";

function getSmtpConfig() {
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER || "").trim();
  const pass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "").trim();
  const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = Number(process.env.SMTP_PORT || 465);
  const from = (process.env.SMTP_FROM || (user ? `UPAHAR <${user}>` : "UPAHAR <no-reply@upahar.com>")).trim();

  return { host, port, user, pass, from, configured: Boolean(user && pass) };
}

export function isSmtpConfigured(): boolean {
  return getSmtpConfig().configured;
}

function createTransporter() {
  const cfg = getSmtpConfig();
  if (!cfg.configured) return null;

  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
  });
}

export async function sendEmailOtp(params: {
  to: string;
  code: string;
  purpose: string;
  customerName?: string | null;
}): Promise<{ delivered: boolean; provider: "GMAIL_SMTP" | "DEV_PREVIEW"; error?: string }> {
  const cfg = getSmtpConfig();
  const transporter = createTransporter();

  if (!transporter) {
    return { delivered: false, provider: "DEV_PREVIEW" };
  }

  const purposeTitle =
    params.purpose === "VERIFY_EMAIL" || params.purpose === "SIGNUP"
      ? "Complete Your Registration"
      : params.purpose === "RESET_PASSWORD"
      ? "Reset Your Password"
      : "Sign In Verification Code";

  const greetingName = params.customerName ? `Namaste ${params.customerName},` : "Namaste,";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #FAF7F2; border: 1px solid #EADBCE; border-radius: 16px; overflow: hidden;">
      <div style="background: #580D1A; padding: 20px 24px; color: #FFFFFF;">
        <div style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #DFC17B; font-weight: bold;">UPAHAR • Sangivalasa</div>
        <h1 style="margin: 6px 0 0; font-size: 20px; color: #FFFFFF;">${purposeTitle}</h1>
      </div>
      <div style="padding: 24px; color: #1C1917; font-size: 14px; line-height: 1.6;">
        <p style="margin-top: 0;">${greetingName}</p>
        <p>Use the verification OTP below to verify your email address on the <strong>UPAHAR</strong> customer portal:</p>
        <div style="margin: 20px 0; padding: 16px; background: #FFFFFF; border: 2px dashed #580D1A; border-radius: 12px; text-align: center;">
          <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #580D1A; font-family: monospace;">${params.code}</div>
          <div style="font-size: 11px; color: #57534E; margin-top: 6px;">Valid for 5 minutes. Do not share this code with anyone.</div>
        </div>
        <p style="font-size: 12px; color: #57534E; margin-bottom: 0;">
          If you did not request this code, you can safely ignore this email.<br/>
          UPAHAR • 1-1, Sangivalasa, ANITS College Road, Beside SBI
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: cfg.from,
      to: params.to,
      subject: `${params.code} is your UPAHAR verification OTP`,
      text: `${greetingName}\n\nYour UPAHAR verification OTP is ${params.code}. It expires in 5 minutes.\n\nIf you did not request this, please ignore this email.`,
      html,
    });
    return { delivered: true, provider: "GMAIL_SMTP" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed sending SMTP email";
    console.error("SMTP sendEmailOtp error:", msg);
    return { delivered: false, provider: "DEV_PREVIEW", error: msg };
  }
}

export async function sendOrderConfirmationEmail(params: {
  to: string;
  order: {
    orderNumber: string;
    customerName: string;
    orderType: string;
    totalAmount: number;
    deliveryOtp: string;
    paymentMethod: string;
    deliveryAddress?: string | null;
    items: { name: string; quantity: number; price: number }[];
  };
}): Promise<{ delivered: boolean }> {
  const cfg = getSmtpConfig();
  const transporter = createTransporter();
  if (!transporter) return { delivered: false };

  const itemsRows = params.order.items
    .map(
      (it) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #EFE9DC;">${it.quantity}× ${it.name}</td><td style="padding:6px 0;border-bottom:1px solid #EFE9DC;text-align:right;font-weight:bold;">₹${it.price * it.quantity}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #FAF7F2; border: 1px solid #EADBCE; border-radius: 16px; overflow: hidden;">
      <div style="background: #580D1A; padding: 20px 24px; color: #FFFFFF;">
        <div style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #DFC17B; font-weight: bold;">Order Confirmed • ${params.order.orderNumber}</div>
        <h1 style="margin: 6px 0 0; font-size: 20px; color: #FFFFFF;">Thank you, ${params.order.customerName}!</h1>
      </div>
      <div style="padding: 24px; color: #1C1917; font-size: 13px; line-height: 1.6;">
        <p style="margin-top: 0;">We have received your order (<strong>${params.order.orderType}</strong> • ${params.order.paymentMethod}).</p>
        ${
          params.order.deliveryAddress
            ? `<p style="background:#FFFFFF;padding:10px 12px;border-radius:10px;border:1px solid #EADBCE;"><strong>Address:</strong> ${params.order.deliveryAddress}</p>`
            : ""
        }
        <table style="width:100%;border-collapse:collapse;margin:12px 0;">
          ${itemsRows}
          <tr>
            <td style="padding:10px 0;font-weight:900;font-size:15px;">Total</td>
            <td style="padding:10px 0;text-align:right;font-weight:900;font-size:15px;color:#580D1A;">₹${params.order.totalAmount}</td>
          </tr>
        </table>
        ${
          params.order.orderType === "DELIVERY"
            ? `<div style="padding:12px;background:#FFF7ED;border:1px solid #FDBA74;border-radius:10px;text-align:center;">
                <span style="font-size:11px;text-transform:uppercase;font-weight:bold;color:#9A3412;">Secret Delivery Handover OTP</span><br/>
                <strong style="font-size:24px;letter-spacing:6px;color:#580D1A;">${params.order.deliveryOtp}</strong>
              </div>`
            : ""
        }
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: cfg.from,
      to: params.to,
      subject: `UPAHAR Order ${params.order.orderNumber} Confirmed (₹${params.order.totalAmount})`,
      html,
    });
    return { delivered: true };
  } catch (err) {
    console.error("SMTP order confirmation error:", err);
    return { delivered: false };
  }
}

