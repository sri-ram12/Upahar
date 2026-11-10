import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Clock,
  Flame,
  Sparkles,
  ShieldCheck,
  Compass,
  Phone,
  ArrowLeft,
  UtensilsCrossed,
} from "lucide-react";
import DishOrderControls from "@/components/menu/DishOrderControls";
import { evaluateDivisionStatus, getDivisionForCategory } from "@/lib/store-hours";
import { getSubsitesAndSettings } from "@/lib/subsite-data";

interface DishPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DishPageProps) {
  const { id } = await params;
  const item = await prisma.foodItem.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });

  if (!item) return { title: "Dish Not Found" };

  return {
    title: `${item.name} | UPAHAR TIFFINS AND FAST FOOD`,
    description: item.description,
    openGraph: {
      title: `${item.name} - ₹${item.price} | UPAHAR TIFFINS`,
      description: item.description,
      images: [{ url: item.image }],
    },
  };
}

export default async function DishDetailPage({ params }: DishPageProps) {
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
    notFound();
  }

  // Check live per-division operating hours (Pickles 24x7, Tiffins 6-10:30 AM & 5-10:30 PM, Biryanis 12-10:30 PM, Fast Foods 5-10:30 PM)
  const { settings, subsiteMap } = await getSubsitesAndSettings();
  const divKey = getDivisionForCategory(item.category);
  const divStatus = evaluateDivisionStatus(divKey, {
    isEmergencyClosed: Boolean(settings?.isEmergencyClosed),
    enforceStoreHours: settings?.enforceStoreHours !== false,
    dbConfig: subsiteMap[divKey],
  });

  let sessionBlockReason: string | null = null;
  if (settings?.isEmergencyWebsiteStopped) {
    sessionBlockReason = settings.emergencyStopMessage || "Online orders temporarily paused.";
  } else if (!item.isAvailable) {
    sessionBlockReason = "This item is currently marked Not Available by restaurant management.";
  } else if (divStatus.isLocked) {
    sessionBlockReason = divStatus.lockBanner;
  }

  // Related dishes from the same category
  const relatedDishes = await prisma.foodItem.findMany({
    where: {
      categoryId: item.categoryId,
      id: { not: item.id },
      isAvailable: true,
    },
    take: 3,
  });

  return (
    <div className="min-h-screen bg-brand-cream pb-24">
      {/* Breadcrumb Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href="/menu"
          className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-700 hover:text-brand-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complete Menu</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Dish Showcase */}
        <div className="bg-white rounded-3xl border border-brand-border shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10">
          {/* Dish Visual */}
          <div className="lg:col-span-6 relative h-80 sm:h-96 lg:h-[460px] rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-md group">
            <Image
              src={item.image}
              alt={item.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {item.isSignature && (
                <span className="bg-brand-700 text-[#DFC17B] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg border border-[#D4AF37]/50 shadow-md">
                  Chef's Signature
                </span>
              )}
              {item.isSpicy && (
                <span className="bg-[#8B1E26] text-white text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow-md">
                  <Flame className="w-3.5 h-3.5 text-[#DFC17B]" />
                  <span>Spicy</span>
                </span>
              )}
            </div>

            <div className="absolute top-4 right-4 bg-white/95 p-1.5 rounded-lg shadow-md">
              <div className={`w-4 h-4 border-2 ${item.isVeg ? "border-[#2D5A27]" : "border-[#8B1E26]"} rounded-xs flex items-center justify-center`}>
                <div className={`w-2 h-2 rounded-full ${item.isVeg ? "bg-[#2D5A27]" : "bg-[#8B1E26]"}`} />
              </div>
            </div>
          </div>

          {/* Dish Details */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              {item.category && (
                <span className="text-xs uppercase font-extrabold tracking-widest text-brand-600 block">
                  {item.category.name}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-black text-brand-950 font-display">
                {item.name}
              </h1>
            </div>

            <div className="flex items-baseline space-x-6 pb-4 border-b border-brand-border">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Restaurant Price
                </span>
                <span className="text-3xl font-black text-brand-950 font-display">
                  ₹{item.price}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Preparation Time
                </span>
                <span className="text-sm font-bold text-stone-700 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-brand-700" />
                  <span>{item.prepTime || "10-15 mins"}</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Dietary
                </span>
                <span className={`text-sm font-bold flex items-center space-x-1 ${item.isVeg ? "text-[#2D5A27]" : "text-[#8B1E26]"}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{item.isVeg ? "Pure Veg" : "Non-Veg"}</span>
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-brand-950">
                Description & Flavor Profile
              </h3>
              <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Portions & Ingredients */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {item.portionSize && (
                <div className="p-4 rounded-2xl bg-brand-cream border border-brand-border">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                    Portion
                  </span>
                  <span className="text-xs font-bold text-brand-950 mt-0.5 block">
                    {item.portionSize}
                  </span>
                </div>
              )}

              {item.ingredients && (
                <div className="p-4 rounded-2xl bg-brand-cream border border-brand-border">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                    Key Ingredients
                  </span>
                  <span className="text-xs font-bold text-brand-700 mt-0.5 block">
                    {item.ingredients}
                  </span>
                </div>
              )}
            </div>

            {/* Direct Online Order Stepper */}
            <div className="pt-2">
              <DishOrderControls item={item as any} disabledReason={sessionBlockReason} />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-brand-border flex flex-col sm:flex-row gap-3">
              <a
                href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-maroon-gold flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2"
              >
                <Compass className="w-4 h-4 text-[#DFC17B]" />
                <span>Visit Us to Taste</span>
              </a>

              <a
                href="tel:+919885455342"
                className="btn-gold-outline py-3 px-5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2"
              >
                <Phone className="w-4 h-4 text-brand-700" />
                <span>Call (9885455342)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Related Dishes */}
        {relatedDishes.length > 0 && (
          <div className="mt-16 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-brand-950">
                More from this Category
              </h2>
              <Link
                href="/menu"
                className="text-xs font-bold text-brand-700 hover:underline"
              >
                View Full Menu
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedDishes.map((rel) => (
                <Link key={rel.id} href={`/menu/${rel.slug || rel.id}`} className="block">
                  <div className="brand-card bg-white p-4 border border-brand-border rounded-2xl space-y-3 group hover:border-[#D4AF37] transition">
                    <div className="relative h-44 rounded-xl overflow-hidden bg-stone-100">
                      <Image
                        src={rel.image}
                        alt={rel.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-brand-950 group-hover:text-brand-700 transition line-clamp-1">
                        {rel.name}
                      </h4>
                      <span className="font-black text-brand-700 font-display">
                        ₹{rel.price}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-2">
                      {rel.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
