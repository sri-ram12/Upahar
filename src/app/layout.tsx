import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/effects/CustomCursor";

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
        closes: "10:00",
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
        opens: "18:00",
        closes: "22:30",
      },
    ],
    hasMenu: "/menu",
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-[#FAF7F2] text-[#141210] flex flex-col min-h-screen selection:bg-[#4A0E17] selection:text-[#DFC17B]">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
        <CustomCursor />
        <FloatingWhatsAppButton />
      </body>
    </html>
  );
}
