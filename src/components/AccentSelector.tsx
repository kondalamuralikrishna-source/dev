import React from "react";
import { Globe, Check } from "lucide-react";
import { EnglishAccent, ACCENT_OPTIONS, getSavedAccent, saveAccent } from "../utils/speechUtils";

interface AccentSelectorProps {
  currentAccent: EnglishAccent;
  onAccentChange: (accent: EnglishAccent) => void;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export const AccentSelector: React.FC<AccentSelectorProps> = ({
  currentAccent,
  onAccentChange,
  size = "sm",
  showLabel = true,
  className = "",
}) => {
  const handleSelect = (accent: EnglishAccent) => {
    saveAccent(accent);
    onAccentChange(accent);
  };

  return (
    <div className={`inline-flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200 shadow-xs ${className}`}>
      {showLabel && (
        <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1 shrink-0">
          <Globe size={12} className="text-indigo-600" />
          <span>Accent:</span>
        </span>
      )}
      <div className="flex items-center gap-1">
        {ACCENT_OPTIONS.map((opt) => {
          const isSelected = currentAccent === opt.code;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => handleSelect(opt.code)}
              title={`${opt.name} Pronunciation`}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                isSelected
                  ? "bg-white text-indigo-700 shadow-xs border border-indigo-200/80 ring-1 ring-indigo-500/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              } ${size === "sm" ? "text-[11px] py-0.5" : "text-xs py-1"}`}
            >
              <span>{opt.flag}</span>
              <span className="hidden sm:inline">{opt.name.split(" ")[0]}</span>
              {isSelected && <Check size={11} className="text-indigo-600 ml-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
