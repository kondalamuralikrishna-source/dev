import React, { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown, Sparkles, Languages, HelpCircle } from "lucide-react";
import { useTranslation } from "../context/TranslationContext";
import { RegionalLanguageCode, RegionalLanguageConfig } from "../types";

interface LanguageSelectorProps {
  variant?: "header" | "compact" | "card" | "admin" | "banner" | "floating" | "login";
  className?: string;
  showContrastTip?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = "header",
  className = "",
  showContrastTip = false,
}) => {
  const { currentLanguage, setLanguage, languages, currentLanguageConfig, isRegionalActive } =
    useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: RegionalLanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  // English's name and native name are both literally "English" — showing both reads as a
  // redundant "English (English)". Only append the native-script name when it differs.
  const formatLanguageLabel = (l: RegionalLanguageConfig) =>
    l.nativeName && l.nativeName !== l.name ? `${l.name} (${l.nativeName})` : l.name;

  // BANNER / CARD VARIANT (Prominent on Dashboard & Learning Modules)
  if (variant === "banner" || variant === "card") {
    return (
      <div
        id="regional-translation-banner"
        className={`bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border-2 border-amber-300/80 dark:border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-sm ${className}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-xs">
                <Languages size={18} />
              </span>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Regional Mother Tongue Translation
              </h3>
              {isRegionalActive ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 uppercase tracking-wider animate-pulse">
                  {currentLanguageConfig.name} Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                  English Standard
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Get instant native language explanations, phonetic transliteration, and grammar contrast notes in your preferred mother tongue:
            </p>
          </div>

          {/* Quick Language Selection Chips & Dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="banner-lang-select" className="text-xs font-bold text-slate-700 dark:text-slate-300 sr-only">
              Choose Language
            </label>
            <div className="relative flex items-center">
              <select
                id="banner-lang-select"
                aria-label="Select Mother Tongue Language"
                value={currentLanguage}
                onChange={(e) => handleSelect(e.target.value as RegionalLanguageCode)}
                className="text-xs font-black bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2 px-3.5 pr-8 rounded-xl border-2 border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm cursor-pointer"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flagBadge.split(" ")[0]} {formatLanguageLabel(l)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Language Chips Row */}
        <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-500/20 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mr-1">
            Quick Select:
          </span>
          {languages.map((lang) => {
            const isCurrent = lang.code === currentLanguage;
            return (
              <button
                key={lang.code}
                type="button"
                id={`banner-chip-${lang.code}`}
                onClick={() => handleSelect(lang.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-amber-500 text-slate-950 shadow-sm scale-105 ring-2 ring-amber-400"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                }`}
              >
                <span>{lang.flagBadge.split(" ")[0]}</span>
                <span>{lang.nativeName}</span>
                {lang.nativeName !== lang.name && (
                  <span className="text-[10px] opacity-75 font-semibold">({lang.name})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // FLOATING WIDGET (Always visible at bottom right of screen across all pages)
  if (variant === "floating") {
    return (
      <div
        id="floating-translation-widget"
        // On phones this sits just under the sticky header instead of bottom-right, since the
        // bottom-right corner is where most screens in this app place their primary CTA button
        // (e.g. "Retake Diagnostic", "Submit Answers") — anchoring it there caused it to overlap
        // and block those buttons on small viewports.
        className={`fixed top-16 right-2 sm:top-auto sm:bottom-4 sm:right-4 z-50 animate-in fade-in slide-in-from-bottom-2 max-w-[calc(100vw-1rem)] ${className}`}
      >
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl shadow-2xl border-2 border-amber-400 dark:border-amber-500 flex items-center gap-1.5 sm:gap-2 ring-2 ring-amber-400/20">
          <div className="flex items-center gap-1.5 pl-1">
            <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              <Globe size={14} />
            </span>
            <span className="text-xs font-black text-slate-800 dark:text-white hidden sm:inline">
              Translate:
            </span>
          </div>

          <label htmlFor="floating-lang-select" className="sr-only">
            Select Translation Language
          </label>
          <select
            id="floating-lang-select"
            aria-label="Select Mother Tongue Language"
            value={currentLanguage}
            onChange={(e) => handleSelect(e.target.value as RegionalLanguageCode)}
            className="text-xs font-bold bg-amber-50 dark:bg-slate-800 text-slate-900 dark:text-amber-300 py-1.5 px-2 sm:px-2.5 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer max-w-[42vw] sm:max-w-none truncate"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flagBadge.split(" ")[0]} {formatLanguageLabel(l)}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  // HEADER & LOGIN VARIANT
  const isAdmin = variant === "admin";
  const isLogin = variant === "login";

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`} ref={dropdownRef}>
      {/* Visual Label to make it 100% obvious this is the translation control */}
      <div className="hidden lg:flex items-center gap-1 text-[11px] font-extrabold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-800/60">
        <Languages size={12} />
        <span>Translate:</span>
      </div>

      {/* Direct Native HTML Select for 100% reliable clickability across all browsers */}
      <div className="relative flex items-center">
        <label htmlFor="header-regional-lang-select" className="sr-only">
          Select Regional Translation Language
        </label>
        <select
          id="header-regional-lang-select"
          aria-label="Select Regional Translation Language"
          value={currentLanguage}
          onChange={(e) => handleSelect(e.target.value as RegionalLanguageCode)}
          className={`text-xs font-bold py-1.5 pl-7 pr-8 rounded-xl border cursor-pointer transition-all shadow-xs appearance-none ${
            isAdmin
              ? "bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700 focus:ring-cyan-500"
              : isRegionalActive
              ? "bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-400 ring-1 ring-amber-400/40 font-black"
              : "bg-white hover:bg-slate-50 text-slate-800 border-slate-300 focus:ring-indigo-500"
          }`}
          title="Select Regional Language (Telugu, Hindi, Tamil, Kannada, Bengali, Marathi)"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flagBadge.split(" ")[0]} {formatLanguageLabel(l)}
            </option>
          ))}
        </select>

        {/* Leading Globe Icon */}
        <Globe
          size={13}
          className={`absolute left-2 pointer-events-none ${
            isRegionalActive ? "text-amber-600 animate-pulse" : "text-slate-500"
          }`}
        />

        {/* Trailing Chevron Icon */}
        <ChevronDown
          size={12}
          className="absolute right-2 pointer-events-none text-slate-500"
        />
      </div>

      {isRegionalActive && (
        <span
          className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 cursor-default"
          title={`Translations enabled in ${currentLanguageConfig.name}`}
        >
          L1 ON
        </span>
      )}
    </div>
  );
};
