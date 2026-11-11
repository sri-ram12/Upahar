import React, { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/effects/CustomCursor";
import ThemeSync from "@/components/layout/ThemeSync";

export const metadata: Metadata = {
  metadataBase: new URL("https://upahar.onrender.com"),
  title: {
    default: "UPAHAR TIFFINS AND FAST FOOD | Sangivalasa, ANITS College Road",
    template: "%s | UPAHAR TIFFINS AND FAST FOOD",
  },
  description:
    "Experience authentic South Indian tiffins & Indo-Chinese fast food at UPAHAR TIFFINS AND FAST FOOD, Sangivalasa, beside SBI, ANITS College Road. Hot dosas, button idlis, crispy bonda, poori, Hakka noodles, and Manchurian crafted fresh daily.",
  keywords: [
    "Upahar Tiffins",
    "Upahar Fast Food",
    "Upahar Sangivalasa",
    "ANITS College Road tiffins",
    "Upahar Sunrise to Sunset",
    "South Indian tiffins Sangivalasa",
    "Ghee Karam Dosa",
    "Fast Food Sangivalasa",
    "Chinese Noodles ANITS",
  ],
  openGraph: {
    title: "UPAHAR TIFFINS AND FAST FOOD",
    description: "Authentic Flavours. Freshly Served with Warmth Since Morning Light.",
    url: "https://upahartiffins.com",
    siteName: "UPAHAR TIFFINS AND FAST FOOD",
    images: [
      {
        url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "UPAHAR Signature Ghee Karam Dosa on Banana Leaf",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UPAHAR TIFFINS AND FAST FOOD",
    description: "The Soul of South Indian Tiffins & Street Classics.",
    images: ["https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1200&q=80"],
  },
};

import FloatingWhatsAppButton from "@/components/layout/FloatingWhatsAppButton";
import { CartProvider } from "@/context/CartContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import CartDrawer from "@/components/cart/CartDrawer";
import FloatingCartBar from "@/components/cart/FloatingCartBar";
import CustomerAuthModal from "@/components/auth/CustomerAuthModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "UPAHAR TIFFINS AND FAST FOOD",
    image: "/images/upahar_logo.jpg",
    description: "Authentic South Indian tiffins, crispy dosas, steaming button idlis, fast food noodles and fried rice in Sangivalasa.",
    servesCuisine: ["South Indian", "Fast Food", "Indo-Chinese"],
    priceRange: "₹",
    telephone: "+91 9885455342",
    hasMap: "https://maps.app.goo.gl/6611R6FD1JZagSJt9",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1-1, ANITS College Road, beside SBI",
      addressLocality: "Sangivalasa, Visakhapatnam",
      addressRegion: "Andhra Pradesh",
      postalCode: "531162",
      addressCountry: "IN",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "06:00",
        closes: "10:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "12:00",
        closes: "22:30",
      },
    ],
    hasMenu: "/menu",
  };

  const themeBootScript = `
    (function() {
      try {
        var path = (window.location.pathname || "/").toLowerCase();
        if (/^\\/(admin|kitchen|delivery|portal|dev)(\\/|$)/.test(path)) {
          document.documentElement.setAttribute("data-upahar-theme", "original-maroon");
          return;
        }
        if (path.indexOf("/tiffins") === 0) {
          document.documentElement.setAttribute("data-upahar-theme", "tiffins-green");
          return;
        }
        if (path.indexOf("/biryanis") === 0) {
          document.documentElement.setAttribute("data-upahar-theme", "biryanis-maroon");
          return;
        }
        if (path.indexOf("/fast-food") === 0) {
          document.documentElement.setAttribute("data-upahar-theme", "fastfood-gold");
          return;
        }
        if (path.indexOf("/pickles") === 0) {
          document.documentElement.setAttribute("data-upahar-theme", "pickles-red");
          return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = (params.get("theme") || "").toLowerCase().trim();
        if (q === "morning" || q === "green" || q === "tiffins") {
          document.documentElement.setAttribute("data-upahar-theme", "tiffins-green");
          return;
        }
        if (q === "maroon" || q === "biryanis") {
          document.documentElement.setAttribute("data-upahar-theme", "biryanis-maroon");
          return;
        }
        if (q === "fast-food" || q === "gold" || q === "yellow") {
          document.documentElement.setAttribute("data-upahar-theme", "fastfood-gold");
          return;
        }
        if (q === "pickles" || q === "red") {
          document.documentElement.setAttribute("data-upahar-theme", "pickles-red");
          return;
        }
        document.documentElement.setAttribute("data-upahar-theme", "light-hub");
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" className="scroll-smooth overflow-x-clip max-w-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-brand-cream text-[#141210] flex flex-col min-h-screen w-full max-w-full overflow-x-clip selection:bg-brand-800 selection:text-[#DFC17B]">
        <Suspense fallback={null}>
          <ThemeSync />
        </Suspense>
        <CustomerAuthProvider>
          <CartProvider>
            <Navbar />
            <div className="flex-1 w-full min-w-0 overflow-x-clip">{children}</div>
            <Footer />
            <CustomCursor />
            <FloatingCartBar />
            <CartDrawer />
            <CustomerAuthModal />
            <FloatingWhatsAppButton />
          </CartProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
