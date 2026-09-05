import React, { useState } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { speakText, stopSpeaking, EnglishAccent, getSavedAccent } from "../utils/speechUtils";

interface AudioButtonProps {
  text: string;
  speed?: number;
  lang?: EnglishAccent | string;
  accent?: EnglishAccent;
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "pill" | "inline";
  label?: string;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  speed = 0.9,
  lang,
  accent,
  size = "md",
  className = "",
  variant = "ghost",
  label,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const targetAccent = accent || (lang as EnglishAccent) || getSavedAccent();

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }

    try {
      setIsPlaying(true);
      await speakText(text, speed, 1.0, targetAccent);
    } catch (err) {
      console.error("Audio playback error:", err);
    } finally {
      setIsPlaying(false);
    }
  };

  const sizeClasses = {
    sm: "p-1.5 text-xs",
    md: "p-2 text-sm",
    lg: "p-3 text-base",
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  const variantClasses = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer",
    secondary: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 active:scale-95 transition-all cursor-pointer",
    ghost: "text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg active:scale-95 transition-all cursor-pointer",
    pill: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-200 font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer",
    inline: "p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md active:scale-95 transition-all cursor-pointer",
  };

  return (
    <button
      id={`audio-btn-${text.slice(0, 15).replace(/[^a-zA-Z0-9]/g, "_")}`}
      type="button"
      onClick={handlePlay}
      title={isPlaying ? "Stop audio" : `Pronounce (${targetAccent === "en-GB" ? "UK 🇬🇧" : targetAccent === "en-AU" ? "AU 🇦🇺" : "US 🇺🇸"}): "${text}"`}
      className={`inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${variantClasses[variant]} ${
        variant !== "pill" && variant !== "inline" ? sizeClasses[size] : ""
      } ${className}`}
    >
      {isPlaying ? (
        <VolumeX size={iconSizes[size]} className="animate-pulse text-indigo-500" />
      ) : (
        <Volume2 size={iconSizes[size]} className={isPlaying ? "text-indigo-600" : ""} />
      )}
      {label && <span className="ml-1.5 text-xs">{isPlaying ? "Speaking..." : label}</span>}
    </button>
  );
};
