import React from "react";

interface FluenxiaLogoProps {
  variant?: "full" | "horizontal" | "compact" | "mark" | "badge";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  theme?: "light" | "dark" | "auto";
  showSubtitle?: boolean;
}

export const FluenxiaLogo: React.FC<FluenxiaLogoProps> = ({
  variant = "full",
  size = "md",
  className = "",
  theme = "auto",
  showSubtitle = true,
}) => {
  // Dimensions map
  const sizeStyles = {
    xs: { icon: "w-7 h-7", text: "text-xs", subtitle: "text-[7px]" },
    sm: { icon: "w-9 h-9", text: "text-sm", subtitle: "text-[8px]" },
    md: { icon: "w-12 h-12", text: "text-base", subtitle: "text-[9px]" },
    lg: { icon: "w-16 h-16", text: "text-xl", subtitle: "text-[11px]" },
    xl: { icon: "w-24 h-24", text: "text-2xl", subtitle: "text-xs" },
    hero: { icon: "w-36 h-36", text: "text-4xl", subtitle: "text-sm" },
  }[size];

  const isDark = theme === "dark";
  const primaryTextColor = isDark ? "#ffffff" : "#1B365D";
  const subtitleColor = isDark ? "#cbd5e1" : "#475569";

  // High-Fidelity Vector Tree-of-Knowledge & Open Book SVG Mark
  const renderVectorMark = (customClass?: string) => (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={customClass || `${sizeStyles.icon} shrink-0`}
      aria-label="Fluenxia Tree of Knowledge Logo"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="fluenxia-trunk" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="45%" stopColor="#0D9488" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>

        <linearGradient id="fluenxia-orange-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        <linearGradient id="fluenxia-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        <linearGradient id="fluenxia-green-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>

        <linearGradient id="fluenxia-book-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#1B365D" />
        </linearGradient>

        <linearGradient id="fluenxia-book-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0D9488" />
          <stop offset="100%" stopColor="#1B365D" />
        </linearGradient>

        <linearGradient id="fluenxia-star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      <g transform="translate(0, 10)">
        {/* =========================================================
            1. OPEN BOOK FOUNDATION (WINGS & INNER ACCENTS)
           ========================================================= */}
        
        {/* Left Book Base Wings (Navy-Blue) */}
        <path
          d="M 235 295 C 190 280 130 255 105 240 L 95 330 C 130 350 190 375 235 390 Z"
          fill="url(#fluenxia-book-left)"
        />
        <path
          d="M 105 240 L 95 330 L 115 340 L 123 250 Z"
          fill="#0284C7"
          opacity="0.9"
        />

        {/* Right Book Base Wings (Navy-Teal) */}
        <path
          d="M 265 295 C 310 280 370 255 395 240 L 405 330 C 370 350 310 375 265 390 Z"
          fill="url(#fluenxia-book-right)"
        />
        <path
          d="M 395 240 L 405 330 L 385 340 L 377 250 Z"
          fill="#0284C7"
          opacity="0.9"
        />

        {/* Left Dynamic Orange Page Ribbon */}
        <path
          d="M 240 378 C 200 360 145 335 125 320 L 132 245 C 150 260 200 285 238 298 Z"
          fill="url(#fluenxia-orange-grad)"
        />
        <path
          d="M 125 320 L 132 245 L 142 253 L 135 328 Z"
          fill="#EA580C"
        />

        {/* Right Dynamic Green Page Ribbon */}
        <path
          d="M 260 378 C 300 360 355 335 375 320 L 368 245 C 350 260 300 285 262 298 Z"
          fill="url(#fluenxia-green-grad)"
        />
        <path
          d="M 375 320 L 368 245 L 358 253 L 365 328 Z"
          fill="#15803D"
        />

        {/* Spine Bottom V-Notch Accent */}
        <path
          d="M 235 390 L 250 398 L 265 390 L 250 405 Z"
          fill="#0F172A"
        />

        {/* =========================================================
            2. CENTRAL TREE TRUNK & SPROUTING ROOTS / BRANCHES
           ========================================================= */}
        {/* Ascending Trunk (Blue to Teal to Green) */}
        <path
          d="M 235 385 C 242 340 238 290 240 240 C 242 195 247 160 250 120 C 253 160 258 195 260 240 C 262 290 258 340 265 385 C 255 380 245 380 235 385 Z"
          fill="url(#fluenxia-trunk)"
        />

        {/* Left Sprouting Inner Green Leaf */}
        <path
          d="M 235 300 C 205 285 175 270 155 285 C 150 300 175 320 215 315 Z"
          fill="url(#fluenxia-green-grad)"
        />

        {/* Right Sprouting Inner Green Leaf */}
        <path
          d="M 265 300 C 295 285 325 270 345 285 C 350 300 325 320 285 315 Z"
          fill="url(#fluenxia-green-grad)"
        />

        {/* =========================================================
            3. TREE OF KNOWLEDGE FOLIAGE LEAVES
           ========================================================= */}

        {/* Central Vertical Green Foliage */}
        <path
          d="M 250 130 C 240 155 240 185 250 205 C 260 185 260 155 250 130 Z"
          fill="#22C55E"
        />
        <path
          d="M 250 90 C 242 110 242 135 250 150 C 258 135 258 110 250 90 Z"
          fill="#16A34A"
        />

        {/* Left Canopy Foliage (Warm Orange Leaves) */}
        {/* Leaf 1 (Top Left) */}
        <path
          d="M 232 115 C 205 105 188 120 182 138 C 200 148 222 135 232 115 Z"
          fill="#F97316"
        />
        {/* Leaf 2 (Mid-High Left) */}
        <path
          d="M 215 145 C 185 140 168 158 162 178 C 182 188 205 170 215 145 Z"
          fill="#FB923C"
        />
        {/* Leaf 3 (Mid-Outer Left) */}
        <path
          d="M 230 170 C 198 175 180 195 178 218 C 200 222 222 200 230 170 Z"
          fill="#EA580C"
        />
        {/* Leaf 4 (Lower Left) */}
        <path
          d="M 238 205 C 210 218 198 240 205 260 C 225 258 238 235 238 205 Z"
          fill="#F97316"
        />
        {/* Leaf 5 (Small Top Left Accent) */}
        <path
          d="M 220 90 C 205 82 195 95 192 108 C 205 112 215 102 220 90 Z"
          fill="#FB923C"
        />

        {/* Right Canopy Foliage (Sky Cyan & Blue Leaves) */}
        {/* Leaf 1 (Top Right) */}
        <path
          d="M 268 115 C 295 105 312 120 318 138 C 300 148 278 135 268 115 Z"
          fill="#0284C7"
        />
        {/* Leaf 2 (Mid-High Right) */}
        <path
          d="M 285 145 C 315 140 332 158 338 178 C 318 188 295 170 285 145 Z"
          fill="#38BDF8"
        />
        {/* Leaf 3 (Mid-Outer Right) */}
        <path
          d="M 270 170 C 302 175 320 195 322 218 C 300 222 278 200 270 170 Z"
          fill="#0284C7"
        />
        {/* Leaf 4 (Lower Right) */}
        <path
          d="M 262 205 C 290 218 302 240 295 260 C 275 258 262 235 262 205 Z"
          fill="#0EA5E9"
        />
        {/* Leaf 5 (Small Top Right Accent) */}
        <path
          d="M 280 90 C 295 82 305 95 308 108 C 295 112 285 102 280 90 Z"
          fill="#38BDF8"
        />

        {/* =========================================================
            4. APEX STAR OF EXCELLENCE (5-POINT CREST)
           ========================================================= */}
        {/* Left half orange, right half blue star */}
        <g transform="translate(250, 75) scale(0.95)">
          <path
            d="M 0 -28 L 7 -9 L 27 -9 L 11 3 L 17 22 L 0 10 L -17 22 L -11 3 L -27 -9 L -7 -9 Z"
            fill="url(#fluenxia-star-grad)"
          />
        </g>
      </g>
    </svg>
  );

  // Variant: Mark only
  if (variant === "mark") {
    return <div className={`inline-flex items-center ${className}`}>{renderVectorMark()}</div>;
  }

  // Variant: Badge (Icon in styled warm container)
  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center justify-center p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}
      >
        {renderVectorMark()}
      </div>
    );
  }

  // Variant: Horizontal (Logo + Text in single horizontal line)
  if (variant === "horizontal") {
    return (
      <div className={`inline-flex items-center gap-3 select-none ${className}`}>
        {renderVectorMark(sizeStyles.icon)}
        <div className="flex flex-col text-left">
          <span
            className={`font-sans font-black tracking-[0.14em] uppercase leading-none ${sizeStyles.text}`}
            style={{ color: primaryTextColor }}
          >
            FLUENXI<span className="text-cyan-600 font-extrabold">A</span>
          </span>
          {showSubtitle && (
            <span
              className={`font-sans font-medium tracking-[0.08em] mt-1 leading-none ${sizeStyles.subtitle}`}
              style={{ color: subtitleColor }}
            >
              Empower Learning, Unleash Potential.
            </span>
          )}
        </div>
      </div>
    );
  }

  // Variant: Compact
  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
        {renderVectorMark(sizeStyles.icon)}
        <div className="flex flex-col text-left">
          <span
            className={`font-sans font-black tracking-[0.12em] uppercase leading-none ${sizeStyles.text}`}
            style={{ color: primaryTextColor }}
          >
            FLUENXI<span className="text-cyan-600 font-extrabold">A</span>
          </span>
          <span className="text-[10px] font-bold text-cyan-600 tracking-wider">
            Oral Assessment & LMS
          </span>
        </div>
      </div>
    );
  }

  // Variant: Full (Stacked exactly like the official brand image)
  return (
    <div className={`inline-flex flex-col items-center text-center select-none ${className}`}>
      {/* Top Tree-Book Mark */}
      <div className="relative flex items-center justify-center">
        {renderVectorMark(
          size === "hero"
            ? "w-44 h-44"
            : size === "xl"
            ? "w-32 h-32"
            : size === "lg"
            ? "w-24 h-24"
            : size === "md"
            ? "w-16 h-16"
            : "w-12 h-12"
        )}
      </div>

      {/* Main Title: FLUENXIA */}
      <div
        className={`font-sans font-black tracking-[0.18em] uppercase mt-2 leading-tight ${sizeStyles.text}`}
        style={{ color: primaryTextColor }}
      >
        FLUENXI<span className="text-cyan-600">A</span>
      </div>

      {/* Subtitle: Empower Learning, Unleash Potential. */}
      {showSubtitle && (
        <div
          className={`font-sans font-medium tracking-[0.06em] mt-1 leading-none ${sizeStyles.subtitle}`}
          style={{ color: subtitleColor }}
        >
          Empower Learning, Unleash Potential.
        </div>
      )}
    </div>
  );
};

// Also export as LinguaFlowLogo for backward compatibility across all modules
export const LinguaFlowLogo = FluenxiaLogo;
