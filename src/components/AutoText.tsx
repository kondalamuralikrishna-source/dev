import React, { useEffect, useState } from "react";
import { useTranslation } from "../context/TranslationContext";

// Module-level cache so the same string+language pair is never re-requested across renders or
// across different AutoText instances (on top of the context's own cache and the server's).
const autoTextCache = new Map<string, string>();

/**
 * Translates arbitrary dynamic content (lesson titles, section headings, quiz questions, etc.)
 * in place using the existing Gemini-backed translateWithAI pipeline. Renders the English source
 * immediately, then swaps to the translated string once it resolves. Falls back to English on
 * error or while the current language is English.
 *
 * Use this for content that should be fully replaced (not appended as a helper below, like
 * RegionalConceptHelper) — headings, titles, instructions, and other text that isn't itself the
 * English practice material the learner is meant to read/hear.
 */
export function useAutoText(text: string | undefined | null, context?: string): string {
  const { currentLanguage, translateWithAI } = useTranslation();
  const safeText = text || "";
  const cacheKey = `${currentLanguage}:::${context || ""}:::${safeText}`;
  const [display, setDisplay] = useState<string>(() => autoTextCache.get(cacheKey) || safeText);

  useEffect(() => {
    let cancelled = false;

    if (!safeText || currentLanguage === "en") {
      setDisplay(safeText);
      return;
    }

    const cached = autoTextCache.get(cacheKey);
    if (cached) {
      setDisplay(cached);
      return;
    }

    setDisplay(safeText);
    translateWithAI(safeText, context)
      .then((res) => {
        if (cancelled) return;
        const result = res.translatedText || safeText;
        autoTextCache.set(cacheKey, result);
        setDisplay(result);
      })
      .catch(() => {
        if (!cancelled) setDisplay(safeText);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, safeText, currentLanguage]);

  return display;
}

interface AutoTextProps {
  text: string;
  context?: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
}

export const AutoText: React.FC<AutoTextProps> = ({ text, context, as: Tag = "span", className }) => {
  const display = useAutoText(text, context);
  return <Tag className={className}>{display}</Tag>;
};
