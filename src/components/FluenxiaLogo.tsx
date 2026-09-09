import React from "react";

interface FluenxiaLogoProps {
  variant?: "full" | "horizontal" | "compact" | "mark" | "badge";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  theme?: "light" | "dark" | "auto";
  showSubtitle?: boolean;
}

// Official brand mark ("FX" arrow monogram, navy/steel-blue) from the September 2026 brand
// refresh — replaces the earlier custom "Tree of Knowledge" illustration. Assets live in
// public/brand/ (see Fluenxia-Logo-Package.zip); PNG only, no vector source was provided.
export const FluenxiaLogo: React.FC<FluenxiaLogoProps> = ({
  variant = "full",
  size = "md",
  className = "",
  theme = "auto",
  showSubtitle = true,
}) => {
  const sizeStyles = {
    xs: { icon: "w-7 h-7", text: "text-xs", subtitle: "text-[7px]" },
    sm: { icon: "w-9 h-9", text: "text-sm", subtitle: "text-[8px]" },
    md: { icon: "w-12 h-12", text: "text-base", subtitle: "text-[9px]" },
    lg: { icon: "w-16 h-16", text: "text-xl", subtitle: "text-[11px]" },
    xl: { icon: "w-24 h-24", text: "text-2xl", subtitle: "text-xs" },
    hero: { icon: "w-36 h-36", text: "text-4xl", subtitle: "text-sm" },
  }[size];

  const isDark = theme === "dark";
  const primaryTextColor = isDark ? "#ffffff" : "#182642"; // Deep Navy from the brand palette
  const subtitleColor = isDark ? "#cbd5e1" : "#4E688C"; // Steel Blue from the brand palette
  const iconSrc = isDark ? "/brand/icon-white.png" : "/brand/icon-color.png";

  const renderMark = (customClass?: string) => (
    <img
      src={iconSrc}
      alt="Fluenxia"
      className={`${customClass || `${sizeStyles.icon} shrink-0`} object-contain`}
    />
  );

  // Variant: Mark only
  if (variant === "mark") {
    return <div className={`inline-flex items-center ${className}`}>{renderMark()}</div>;
  }

  // Variant: Badge (Icon in styled container)
  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center justify-center p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}
      >
        {renderMark()}
      </div>
    );
  }

  // Variant: Horizontal (Logo + Text in single horizontal line)
  if (variant === "horizontal") {
    return (
      <div className={`inline-flex items-center gap-3 select-none ${className}`}>
        {renderMark(sizeStyles.icon)}
        <div className="flex flex-col text-left">
          <span
            className={`font-sans font-black tracking-[0.14em] uppercase leading-none ${sizeStyles.text}`}
            style={{ color: primaryTextColor }}
          >
            FLUENXI<span style={{ color: "#4E688C" }}>A</span>
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
        {renderMark(sizeStyles.icon)}
        <div className="flex flex-col text-left">
          <span
            className={`font-sans font-black tracking-[0.12em] uppercase leading-none ${sizeStyles.text}`}
            style={{ color: primaryTextColor }}
          >
            FLUENXI<span style={{ color: "#4E688C" }}>A</span>
          </span>
          <span className="text-[10px] font-bold tracking-wider" style={{ color: "#4E688C" }}>
            Oral Assessment & LMS
          </span>
        </div>
      </div>
    );
  }

  // Variant: Full (Stacked)
  return (
    <div className={`inline-flex flex-col items-center text-center select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        {renderMark(
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

      <div
        className={`font-sans font-black tracking-[0.18em] uppercase mt-2 leading-tight ${sizeStyles.text}`}
        style={{ color: primaryTextColor }}
      >
        FLUENXI<span style={{ color: "#4E688C" }}>A</span>
      </div>

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
