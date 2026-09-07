import React, { useState, useEffect } from "react";
import { Globe, Sparkles, ChevronDown, ChevronUp, BookOpen, Volume2 } from "lucide-react";
import { useTranslation } from "../context/TranslationContext";
import { DynamicTranslationResponse } from "../types";

interface RegionalConceptHelperProps {
  englishText: string;
  context?: string;
  className?: string;
  initialExpanded?: boolean;
  compact?: boolean;
}

export const RegionalConceptHelper: React.FC<RegionalConceptHelperProps> = ({
  englishText,
  context = "grammar_explanation",
  className = "",
  initialExpanded = false,
  compact = false,
}) => {
  const { currentLanguage, currentLanguageConfig, isRegionalActive, translateWithAI, contrastNotes } =
    useTranslation();
  const [isExpanded, setIsExpanded] = useState(initialExpanded || isRegionalActive);
  const [translationResult, setTranslationResult] = useState<DynamicTranslationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-translate as soon as a regional language is active (and whenever the source text or
  // target language changes) so switching the language selector updates this content
  // immediately, without requiring the user to click to expand it.
  useEffect(() => {
    let cancelled = false;
    setTranslationResult(null);
    if (!isRegionalActive || !englishText) return;
    setIsExpanded(true);
    setIsLoading(true);
    translateWithAI(englishText, context)
      .then((result) => {
        if (!cancelled) setTranslationResult(result);
      })
      .catch((err) => {
        console.error("Error loading regional translation:", err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRegionalActive, currentLanguage, englishText, context]);

  if (!isRegionalActive) {
    return null; // Don't show if user preferred standard English
  }

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  const playTTS = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // Try to find matching voice
      const voices = window.speechSynthesis.getVoices();
      const langVoice = voices.find((v) =>
        v.lang.toLowerCase().startsWith(currentLanguage)
      );
      if (langVoice) utterance.voice = langVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (compact) {
    return (
      <div className={`inline-block ${className}`}>
        <button
          type="button"
          onClick={handleToggle}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold transition-all cursor-pointer"
          title={`View in ${currentLanguageConfig.name} (${currentLanguageConfig.nativeName})`}
        >
          <Globe size={11} className="text-amber-600" />
          <span>{currentLanguageConfig.nativeName} లో చదవండి</span>
        </button>

        {isExpanded && translationResult && (
          <div className="mt-1.5 p-2 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-950 shadow-xs">
            <p className="font-semibold">{translationResult.translatedText}</p>
            {translationResult.transliteration && (
              <p className="text-[10px] text-amber-800 italic mt-0.5">
                Pronunciation: {translationResult.transliteration}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden ${
        isExpanded
          ? "bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-white border-amber-300 shadow-sm"
          : "bg-amber-50/40 hover:bg-amber-50/70 border-amber-200/80"
      } ${className}`}
    >
      {/* Banner / Toggle Header */}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full px-4 py-2.5 flex items-center justify-between text-left cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-xs">
            {currentLanguageConfig.flagBadge.split(" ")[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-950">
                {currentLanguageConfig.nativeName} వివరణ (Mother Tongue Support)
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-200 text-amber-900 font-bold rounded-full">
                {currentLanguageConfig.name}
              </span>
            </div>
            <p className="text-[10px] text-amber-800/90 font-medium">
              Click to view grammatical explanation & translation in {currentLanguageConfig.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          ) : isExpanded ? (
            <ChevronUp size={16} className="text-amber-700" />
          ) : (
            <ChevronDown size={16} className="text-amber-700" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-amber-200/60 space-y-3 animate-in fade-in duration-200">
          {/* Main Translated Concept */}
          <div className="bg-white/90 p-3 rounded-xl border border-amber-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-600" />
                {currentLanguageConfig.nativeName} అనువాదం / Concept Breakdown:
              </span>
              {translationResult?.translatedText && (
                <button
                  type="button"
                  onClick={() => playTTS(translationResult.translatedText)}
                  className="p-1 text-amber-700 hover:text-amber-900 rounded hover:bg-amber-100 transition-colors"
                  title="Listen to regional audio"
                >
                  <Volume2 size={13} />
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="py-2 flex items-center gap-2 text-xs text-amber-800 font-medium">
                <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                <span>Translating into {currentLanguageConfig.name} via AI...</span>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                  {translationResult?.translatedText || englishText}
                </p>
                {translationResult?.transliteration && (
                  <p className="text-xs text-slate-500 italic mt-1 font-mono">
                    [{translationResult.transliteration}]
                  </p>
                )}
                {translationResult?.explanation && (
                  <p className="text-xs text-amber-900/90 mt-2 pt-2 border-t border-amber-100 leading-normal">
                    💡 <strong>భాషా గమనిక (Linguistic Note):</strong> {translationResult.explanation}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Comparative Linguistic Contrast (English vs Mother Tongue) */}
          <div className="bg-amber-100/60 p-2.5 rounded-xl border border-amber-200/70 text-[11px] text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-1 text-amber-900">
              <BookOpen size={12} />
              <span>English vs {currentLanguageConfig.name} Structure:</span>
            </div>
            <p className="text-[11px] leading-snug">
              <strong>పదాల అమరిక (Word Order):</strong> {contrastNotes.wordOrder}
            </p>
            <p className="text-[11px] leading-snug">
              <strong>ఆర్టికల్స్ (Articles):</strong> {contrastNotes.articlesNote}
            </p>
            <p className="text-[11px] leading-snug">
              <strong>ఉచ్ఛారణ సలహా (Pronunciation Tip):</strong> {contrastNotes.pronunciationTip}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
