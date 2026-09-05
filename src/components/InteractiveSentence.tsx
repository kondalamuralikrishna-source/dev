import React, { useState } from "react";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import { speakText, stopSpeaking, EnglishAccent, getSavedAccent } from "../utils/speechUtils";
import { AudioButton } from "./AudioButton";

interface InteractiveSentenceProps {
  sentence: string;
  highlight?: string;
  accent?: EnglishAccent;
  translationOrMeaning?: string;
  className?: string;
}

export const InteractiveSentence: React.FC<InteractiveSentenceProps> = ({
  sentence,
  highlight,
  accent,
  translationOrMeaning,
  className = "",
}) => {
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const currentAccent = accent || getSavedAccent();

  // Split sentence into words and punctuation tokens
  // Matches words (including contractions like "don't" or "I'm") or punctuation
  const tokens = sentence.split(/(\s+|[.,!?;:()"]+)/g).filter(Boolean);

  const cleanWordForSpeech = (token: string) => {
    return token.replace(/[.,!?;:()"“”‘’]/g, "").trim();
  };

  const handleWordClick = async (rawToken: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanWord = cleanWordForSpeech(rawToken);
    if (!cleanWord || cleanWord.length <= 1 && !/^[a-zA-Z]$/.test(cleanWord)) return;

    try {
      setActiveWord(cleanWord);
      await speakText(cleanWord, 0.85, 1.0, currentAccent);
    } catch (err) {
      console.error("Word audio error:", err);
    } finally {
      setActiveWord(null);
    }
  };

  // Check if a word or token matches the highlight
  const isHighlighted = (token: string) => {
    if (!highlight) return false;
    const clean = cleanWordForSpeech(token).toLowerCase();
    const hlClean = highlight.toLowerCase();
    return clean.length > 0 && (hlClean.includes(clean) || clean.includes(hlClean));
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm sm:text-base leading-relaxed text-slate-800">
        {tokens.map((token, idx) => {
          const isSpaceOrPunct = /^\s+$/.test(token) || /^[.,!?;:()"]+$/.test(token);
          const clean = cleanWordForSpeech(token);
          const isTarget = isHighlighted(token);
          const isPlayingThisWord = activeWord === clean && clean.length > 0;

          if (isSpaceOrPunct) {
            return (
              <span key={idx} className="text-slate-700 select-text">
                {token}
              </span>
            );
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={(e) => handleWordClick(token, e)}
              title={`Click to hear word pronunciation: "${clean}"`}
              className={`inline-block px-1 py-0.5 rounded transition-all select-none cursor-pointer text-left font-medium ${
                isPlayingThisWord
                  ? "bg-indigo-600 text-white shadow-xs scale-105"
                  : isTarget
                  ? "bg-indigo-100 text-indigo-950 font-bold border-b-2 border-indigo-500 hover:bg-indigo-200"
                  : "hover:bg-indigo-50 hover:text-indigo-700 active:scale-95"
              }`}
            >
              {token}
            </button>
          );
        })}
      </div>

      {highlight && (
        <p className="text-xs text-indigo-600 font-mono flex items-center gap-1 pt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span>Grammar Focus: <strong>{highlight}</strong></span>
        </p>
      )}

      {translationOrMeaning && (
        <p className="text-xs text-slate-500 flex items-start gap-1">
          <span>💡</span>
          <span>{translationOrMeaning}</span>
        </p>
      )}
    </div>
  );
};
