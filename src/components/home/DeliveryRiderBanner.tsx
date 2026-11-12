"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface DeliveryRiderBannerProps {
  isDarkHub?: boolean;
  isEmergencyStopped?: boolean;
}

function CitySkylineTile({
  backColor,
  midColor,
  foliageColor,
  windowHighlight,
  skyBg,
}: {
  backColor: string;
  midColor: string;
  foliageColor: string;
  windowHighlight: string;
  skyBg: string;
}) {
  return (
    <g>
      {/* Back-layer buildings including tall tapered Shard-style glass tower */}
      <polygon points="74,144 98,16 108,12 134,144" fill={backColor} />
      <g stroke={skyBg} strokeWidth="1.2" opacity="0.75">
        <line x1="94" y1="38" x2="113" y2="38" />
        <line x1="90" y1="58" x2="117" y2="58" />
        <line x1="86" y1="78" x2="121" y2="78" />
        <line x1="82" y1="98" x2="125" y2="98" />
        <line x1="78" y1="118" x2="129" y2="118" />
        <line x1="103" y1="14" x2="88" y2="144" />
        <line x1="103" y1="14" x2="118" y2="144" />
      </g>

      <rect x="148" y="42" width="46" height="102" fill={backColor} />
      <g fill={windowHighlight} opacity="0.7">
        <rect x="155" y="52" width="4" height="78" />
        <rect x="165" y="52" width="4" height="78" />
        <rect x="175" y="52" width="4" height="78" />
        <rect x="184" y="52" width="4" height="78" />
      </g>

      <rect x="226" y="66" width="54" height="78" fill={backColor} />
      <rect x="336" y="46" width="48" height="98" fill={backColor} />
      <g fill={windowHighlight} opacity="0.7">
        <rect x="342" y="56" width="36" height="4" />
        <rect x="342" y="68" width="36" height="4" />
        <rect x="342" y="80" width="36" height="4" />
        <rect x="342" y="92" width="36" height="4" />
      </g>

      <rect x="454" y="60" width="60" height="84" fill={backColor} />
      <rect x="572" y="34" width="46" height="110" fill={backColor} />
      <g fill={windowHighlight} opacity="0.65">
        <rect x="579" y="44" width="5" height="88" />
        <rect x="589" y="44" width="5" height="88" />
        <rect x="599" y="44" width="5" height="88" />
      </g>
      <rect x="684" y="68" width="56" height="76" fill={backColor} />

      {/* Mid-layer buildings */}
      <rect x="24" y="82" width="42" height="62" fill={midColor} />
      <rect x="186" y="74" width="46" height="70" fill={midColor} />
      <rect x="276" y="84" width="54" height="60" fill={midColor} />
      <rect x="394" y="68" width="50" height="76" fill={midColor} />
      <rect x="514" y="76" width="52" height="68" fill={midColor} />
      <rect x="630" y="64" width="46" height="80" fill={midColor} />
      <rect x="744" y="80" width="48" height="64" fill={midColor} />

      {/* Crisp window stripes on mid-layer buildings */}
      <g fill={backColor} opacity="0.75">
        <rect x="32" y="92" width="26" height="3" />
        <rect x="32" y="102" width="26" height="3" />
        <rect x="32" y="112" width="26" height="3" />
        <rect x="402" y="78" width="6" height="54" />
        <rect x="415" y="78" width="6" height="54" />
        <rect x="428" y="78" width="6" height="54" />
        <rect x="638" y="74" width="30" height="3" />
        <rect x="638" y="84" width="30" height="3" />
        <rect x="638" y="94" width="30" height="3" />
      </g>

      {/* Rounded flat-vector trees & bushes along skyline base */}
      <g fill={foliageColor}>
        <circle cx="16" cy="133" r="12" />
        <circle cx="30" cy="137" r="8" />
        <circle cx="140" cy="130" r="14" />
        <circle cx="155" cy="136" r="9" />
        <circle cx="252" cy="133" r="12" />
        <circle cx="266" cy="137" r="8" />
        <circle cx="378" cy="131" r="13" />
        <circle cx="392" cy="137" r="9" />
        <circle cx="496" cy="132" r="12" />
        <circle cx="512" cy="137" r="8" />
        <circle cx="614" cy="130" r="14" />
        <circle cx="628" cy="137" r="8" />
        <circle cx="732" cy="132" r="12" />
        <circle cx="748" cy="137" r="9" />
        <rect x="0" y="140" width="800" height="5" />
      </g>
    </g>
  );
}

function SpinningWheel({ cx, cy, r = 13 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#1A1A1A" />
      <circle cx={cx} cy={cy} r={r * 0.58} fill="#B8B8B8" />
      <g className="animate-wheel-spin">
        <path
          d={`M ${cx - r * 0.42} ${cy} A ${r * 0.42} ${r * 0.42} 0 0 1 ${cx} ${cy - r * 0.42}`}
          fill="none"
          stroke="#EFEFEF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx + r * 0.42} ${cy} A ${r * 0.42} ${r * 0.42} 0 0 1 ${cx} ${cy + r * 0.42}`}
          fill="none"
          stroke="#DCDCDC"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>
      <circle cx={cx} cy={cy} r={r * 0.2} fill="#1A1A1A" />
    </g>
  );
}

function UpaharLogo({
  x,
  y,
  scale = 1,
}: {
  x: number;
  y: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* Elongated top speed-bar from stylized U */}
      <polygon points="1,0 36,0 34,2.2 0,2.2" fill="#E61E2A" />
      <text
        x="0"
        y="9.5"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontStyle="italic"
        fontSize="8.2"
        letterSpacing="-0.2"
      >
        <tspan fill="#E61E2A">U</tspan>
        <tspan fill="#1A1A1A">PAHAR</tspan>
      </text>
    </g>
  );
}

function DeliveryStageSvg({ isDarkHub }: { isDarkHub: boolean }) {
  const skyBg = isDarkHub ? "#171412" : "#EFEFEF";
  const skyBack = isDarkHub ? "#28221E" : "#DCDCDC";
  const skyMid = isDarkHub ? "#352D28" : "#B8B8B8";
  const foliage = isDarkHub ? "#473D36" : "#8E8E8E";
  const groundTone = isDarkHub ? "#211C18" : "#E2E2E2";
  const roadDash = isDarkHub ? "#D6CFC7" : "#1A1A1A";
  const originPinFill = isDarkHub ? "#FAF7F2" : "#1A1A1A";
  const originPinDot = isDarkHub ? "#171412" : "#FFFFFF";

  return (
    <svg
      viewBox="0 0 800 185"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full block select-none"
      role="img"
      aria-label="Animated red UPAHAR delivery rider on scooter travelling between route pins"
    >
      <defs>
        <linearGradient id="upaharGroundFade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={groundTone} stopOpacity="0" />
          <stop offset="10%" stopColor={groundTone} stopOpacity="0.9" />
          <stop offset="90%" stopColor={groundTone} stopOpacity="0.9" />
          <stop offset="100%" stopColor={groundTone} stopOpacity="0" />
        </linearGradient>
        <clipPath id="upaharStageClip">
          <rect x="0" y="0" width="800" height="185" />
        </clipPath>
      </defs>

      <g clipPath="url(#upaharStageClip)">
        {/* Plain Background */}
        <rect x="0" y="0" width="800" height="185" fill={skyBg} />

        {/* Continuous Right-to-Left Parallax Grayscale Cityscape */}
        <g className="animate-skyline-pan">
          <CitySkylineTile
            backColor={skyBack}
            midColor={skyMid}
            foliageColor={foliage}
            windowHighlight={skyBg}
            skyBg={skyBg}
          />
          <g transform="translate(800, 0)">
            <CitySkylineTile
              backColor={skyBack}
              midColor={skyMid}
              foliageColor={foliage}
              windowHighlight={skyBg}
              skyBg={skyBg}
            />
          </g>
        </g>

        {/* Subtle Ground Band Fading at Edges */}
        <rect x="10" y="144" width="780" height="32" fill="url(#upaharGroundFade)" />

        {/* Horizontal Dashed Road Line */}
        <line
          x1="46"
          y1="152"
          x2="754"
          y2="152"
          stroke={roadDash}
          strokeWidth="2.6"
          strokeDasharray="10 8"
          strokeLinecap="round"
        />

        {/* Left Origin Map Pin (Black / Light on Dark) */}
        <g>
          <path
            d="M46 152 C46 152 33 136 33 125 A13 13 0 1 1 59 125 C59 136 46 152 46 152 Z"
            fill={originPinFill}
          />
          <circle cx="46" cy="125" r="5" fill={originPinDot} />
        </g>

        {/* Right Destination Map Pin (Vibrant Red) */}
        <g>
          <circle cx="754" cy="152" r="10" fill="#E61E2A" className="animate-pin-arrival" />
          <path
            d="M754 152 C754 152 738 133 738 120 A16 16 0 1 1 770 120 C770 133 754 152 754 152 Z"
            fill="#E61E2A"
          />
          <circle cx="754" cy="120" r="6" fill="#FFFFFF" />
        </g>

        {/* PHASE 1 (0.2s – 6.5s): Red & Orange Scooter + Rider + Kraft UPAHAR Box */}
        <g className="animate-scooter-ride">
          {/* Wheels */}
          <SpinningWheel cx={26} cy={139} r={13} />
          <SpinningWheel cx={86} cy={139} r={13} />

          {/* Rear Luggage Rack */}
          <rect x="10" y="106" width="26" height="4" fill="#1A1A1A" rx="1" />
          <line x1="16" y1="110" x2="22" y2="119" stroke="#1A1A1A" strokeWidth="2.5" />

          {/* Tan/Kraft Cardboard Parcel Box with Cream Tape & UPAHAR */}
          <g>
            <rect x="3" y="75" width="33" height="31" rx="1.5" fill="#D9B88F" />
            <rect x="31" y="75" width="5" height="31" fill="#C7A275" />
            <rect x="17" y="75" width="5" height="9" fill="#EFE5D5" />
            <UpaharLogo x={5.5} y={89} scale={0.62} />
          </g>

          {/* Black Rear Fender & Exhaust */}
          <path d="M10 132 L32 132 L36 138 L12 138 Z" fill="#1A1A1A" />

          {/* Red Rear Vespa Body & Front Fender */}
          <path
            d="M14 128 C14 114 34 110 46 116 L51 135 L16 135 Z"
            fill="#ED1C24"
          />
          <path d="M18 131 L48 131 L50 135 L17 135 Z" fill="#7A0E14" />

          {/* Bright Orange Inner Apron & Floorboard Edge */}
          <path
            d="M47 135 L70 135 C74 116 77 98 75 87 L67 89 C67 107 62 123 48 127 Z"
            fill="#FF6A1A"
          />

          {/* Red Outer Front Shield, Headlight Cowl & Front Wheel Mudguard */}
          <path
            d="M73 132 C74 119 96 118 99 131 Z"
            fill="#ED1C24"
          />
          <path
            d="M68 135 L74 135 C79 116 81 97 79 86 L74 87 C76 99 74 117 68 135 Z"
            fill="#ED1C24"
          />
          <path
            d="M71 81 C71 78 82 77 84 83 C84 88 79 90 73 89 Z"
            fill="#ED1C24"
          />
          {/* White Teardrop Headlight */}
          <ellipse cx="83" cy="84" rx="2.5" ry="3.8" fill="#FFFFFF" />
          {/* Angled Black Windscreen */}
          <polygon points="75,79 70,66 74,65 79,79" fill="#1A1A1A" />

          {/* Curved Black Saddle Seat */}
          <path d="M33 111 C39 105 53 106 56 112 L34 114 Z" fill="#1A1A1A" />

          {/* Rider Trousers & Shoe */}
          <path
            d="M38 107 L56 109 C61 110 62 114 61 119 L59 133 L51 133 L52 117 L37 113 Z"
            fill="#1A1A1A"
          />
          <path d="M51 131 L65 132 C67 134 66 136 63 136 L51 136 Z" fill="#1A1A1A" />

          {/* Rider Red Sleeveless Vest */}
          <path
            d="M37 72 C44 68 53 71 54 78 L53 109 L36 109 Z"
            fill="#ED1C24"
          />
          {/* Dark Maroon Short Sleeve */}
          <path d="M44 73 L54 78 L50 86 L42 81 Z" fill="#7A0E14" />
          {/* Warm Peach Forearm & Hand on Handlebar */}
          <path d="M48 82 L72 82 L72 86 L46 86 Z" fill="#F5C49E" />
          <circle cx="73" cy="84" r="2.6" fill="#F5C49E" />
          <circle cx="74" cy="83" r="2" fill="#1A1A1A" />

          {/* Rider Neck, Face & Red Helmet with Black Visor Cutout */}
          <rect x="44" y="64" width="6" height="7" fill="#F5C49E" />
          <circle cx="49" cy="59" r="7" fill="#F5C49E" />
          <path
            d="M39 60 C39 48 53 45 59 53 L56 62 L41 64 Z"
            fill="#ED1C24"
          />
          <polygon points="50,54 59,54 57,60 49,59" fill="#1A1A1A" />
        </g>

        {/* HANDOFF TRANSITION: UPAHAR Parcel Box hovers briefly at Red Destination Pin */}
        <g className="animate-parcel-handoff">
          <g transform="translate(715, 76)">
            <rect x="0" y="0" width="33" height="31" rx="1.5" fill="#D9B88F" />
            <rect x="28" y="0" width="5" height="31" fill="#C7A275" />
            <rect x="14" y="0" width="5" height="9" fill="#EFE5D5" />
            <UpaharLogo x={2.5} y={14} scale={0.62} />
          </g>
        </g>
      </g>
    </svg>
  );
}

export default function DeliveryRiderBanner({
  isDarkHub = false,
  isEmergencyStopped = false,
}: DeliveryRiderBannerProps) {
  return (
    <Link
      href="/menu"
      className={`group block relative rounded-2xl border-2 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md ${
        isDarkHub
          ? "border-[#332A23] hover:border-[#DFC17B]/65 bg-[#171412]"
          : "border-[#E7E0D3] hover:border-[#E61E2A]/60 bg-[#EFEFEF]"
      }`}
    >
      {/* Mobile Compact Full-Width Vector Stage with Top Text Strip (< 640px) */}
      <div className="sm:hidden relative h-[130px] min-[390px]:h-[140px] w-full overflow-hidden">
        <div
          className={`relative z-10 flex items-center justify-between gap-2 px-3 pt-2 pb-0.5 ${
            isDarkHub ? "text-[#FAF7F2]" : "text-[#1C1917]"
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isEmergencyStopped ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
              }`}
            />
            <span className="text-[11px] min-[390px]:text-xs font-black tracking-wide uppercase truncate">
              {isEmergencyStopped ? "Delivery Temporarily Paused" : "Online Delivery Available"}
            </span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-[#E61E2A] text-white text-[10px] font-black inline-flex items-center gap-1 flex-shrink-0 shadow-xs">
            <span>Order</span>
            <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 top-5">
          <DeliveryStageSvg isDarkHub={isDarkHub} />
        </div>
      </div>

      {/* Tablet & Desktop Split Horizontal Rectangle (>= 640px) */}
      <div className="hidden sm:flex items-stretch h-[156px] lg:h-[172px]">
        <div
          className={`w-[38%] lg:w-[35%] px-5 lg:px-7 py-4 flex flex-col justify-between border-r transition-colors duration-300 ${
            isDarkHub
              ? "bg-[#181412] border-[#332A23] text-[#FAF7F2]"
              : "bg-white border-[#E7E0D3] text-[#1C1917]"
          }`}
        >
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/12 text-emerald-600 border border-emerald-500/25">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isEmergencyStopped ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
                }`}
              />
              <span>{isEmergencyStopped ? "Paused" : "7km Live Delivery"}</span>
            </div>

            <h2 className="font-display font-black text-lg lg:text-xl tracking-tight leading-tight uppercase">
              {isEmergencyStopped ? "Delivery Paused" : "Online Delivery Available"}
            </h2>

            <p
              className={`text-xs leading-snug line-clamp-2 ${
                isDarkHub ? "text-[#C7BEB5]" : "text-[#57534E]"
              }`}
            >
              Fresh hot food delivered across ANITS, Sangivalasa &amp; hostels • Free delivery ₹199+
            </p>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E61E2A] group-hover:bg-[#C81620] text-white text-xs font-black shadow-xs transition">
              <span>Order Online Now</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        <div
          className={`flex-1 relative overflow-hidden ${
            isDarkHub ? "bg-[#171412]" : "bg-[#EFEFEF]"
          }`}
        >
          <DeliveryStageSvg isDarkHub={isDarkHub} />
        </div>
      </div>
    </Link>
  );
}
