"use client";

import React from "react";
import { Star, Quote, CheckCircle2 } from "lucide-react";

export default function CustomerReviews() {
  const reviews = [
    {
      name: "Srinivas Rao",
      role: "Frequent Visitor • Sangivalasa",
      rating: 5,
      comment:
        "The Ghee Karam Dosa here is unmatched anywhere near ANITS College Road & Sangivalasa. That fiery garlic karam roasted in pure ghee gives the crispest crunch every morning.",
    },
    {
      name: "Ananya Reddy",
      role: "Family Diner • Tagarapuvalasa",
      rating: 5,
      comment:
        "We visit regularly for Chitti Idly and Sambar Wada. The sambar is so flavorful and fresh, you can taste the drumsticks and freshly roasted spices. Super clean and fast service!",
    },
    {
      name: "Mohd. Farhan",
      role: "ANITS Campus Regular",
      rating: 5,
      comment:
        "Their Veg & Chicken Hakka Noodles and Fried Rice from 12 PM onwards are unbeatable. Outstanding hygiene, pocket-friendly pricing, and warm hospitality by Sri Vamsi.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-brand-cream text-[#141210] border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
          <div>
            <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-brand-700 text-xs font-black uppercase tracking-wider mb-2">
              <Star className="w-3.5 h-3.5 fill-current text-[#D4AF37]" />
              <span>4.8 / 5.0 Star Rated (1,200+ Diners)</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-brand-950">
              What Our Guests Cherish
            </h2>
            <p className="text-stone-600 text-sm mt-1">
              Honest impressions from local families and morning tiffin enthusiasts.
            </p>
          </div>

          <div className="flex items-center space-x-1 text-[#D4AF37]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.name}
              className="p-6 rounded-3xl bg-white border border-brand-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1 text-[#D4AF37]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-5 h-5 text-brand-700/25" />
                </div>

                <p className="text-stone-700 text-sm leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-brand-surface flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-brand-950 font-heading">
                    {rev.name}
                  </h4>
                  <span className="text-[11px] text-stone-500 block">
                    {rev.role}
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-[10px] text-[#2D5A27] font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Diner</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
