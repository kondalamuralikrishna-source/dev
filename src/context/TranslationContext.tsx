import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { RegionalLanguageCode, RegionalLanguageConfig, DynamicTranslationResponse } from "../types";
import {
  REGIONAL_LANGUAGES,
  getLocalizedText,
  REGIONAL_LINGUISTIC_CONTRASTS,
} from "../data/regionalTranslations";

interface TranslationContextType {
  currentLanguage: RegionalLanguageCode;
  setLanguage: (lang: RegionalLanguageCode) => void;
  currentLanguageConfig: RegionalLanguageConfig;
  languages: RegionalLanguageConfig[];
  t: (key: string, fallback?: string) => string;
  translateWithAI: (
    text: string,
    context?: string
  ) => Promise<DynamicTranslationResponse>;
  isTranslating: boolean;
  isRegionalActive: boolean;
  contrastNotes: {
    wordOrder: string;
    articlesNote: string;
    prepositionsNote: string;
    tensesNote: string;
    pronunciationTip: string;
  };
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const LOCAL_STORAGE_LANG_KEY = "fluenxia_mother_tongue_language";

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<RegionalLanguageCode>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_LANG_KEY);
      if (
        saved &&
        ["en", "te", "hi", "ta", "kn", "bn", "mr"].includes(saved)
      ) {
        return saved as RegionalLanguageCode;
      }
    } catch (e) {
      console.warn("Could not read saved language:", e);
    }
    return "en";
  });

  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationCache, setTranslationCache] = useState<Record<string, DynamicTranslationResponse>>({});

  const setLanguage = useCallback((lang: RegionalLanguageCode) => {
    setCurrentLanguageState(lang);
    try {
      localStorage.setItem(LOCAL_STORAGE_LANG_KEY, lang);
    } catch (e) {
      console.warn("Could not save language to localStorage:", e);
    }
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) => {
      return getLocalizedText(key, currentLanguage, fallback);
    },
    [currentLanguage]
  );

  const translateWithAI = useCallback(
    async (text: string, context?: string): Promise<DynamicTranslationResponse> => {
      if (!text || !text.trim()) {
        return {
          translatedText: "",
          targetLanguage: currentLanguage,
        };
      }

      // If current language is English, return original
      if (currentLanguage === "en") {
        return {
          translatedText: text,
          targetLanguage: "en",
        };
      }

      const cacheKey = `${currentLanguage}:::${text.trim()}`;
      if (translationCache[cacheKey]) {
        return { ...translationCache[cacheKey], cached: true };
      }

      setIsTranslating(true);
      try {
        const response = await fetch("/api/translation/translate-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            targetLanguage: currentLanguage,
            context: context || "general_esl",
          }),
        });

        if (!response.ok) {
          throw new Error(`Translation API failed with status ${response.status}`);
        }

        const data: DynamicTranslationResponse = await response.json();
        setTranslationCache((prev) => ({
          ...prev,
          [cacheKey]: data,
        }));
        return data;
      } catch (err) {
        console.warn("Dynamic translation error, using fallback dictionary:", err);
        const fallbackObj: DynamicTranslationResponse = {
          translatedText: text, // Fallback to original text if API offline
          targetLanguage: currentLanguage,
          explanation: "Regional translation preview available.",
        };
        return fallbackObj;
      } finally {
        setIsTranslating(false);
      }
    },
    [currentLanguage, translationCache]
  );

  const currentLanguageConfig =
    REGIONAL_LANGUAGES.find((l) => l.code === currentLanguage) || REGIONAL_LANGUAGES[0];

  const contrastNotes =
    REGIONAL_LINGUISTIC_CONTRASTS[currentLanguage] || REGIONAL_LINGUISTIC_CONTRASTS.en;

  const value: TranslationContextType = {
    currentLanguage,
    setLanguage,
    currentLanguageConfig,
    languages: REGIONAL_LANGUAGES,
    t,
    translateWithAI,
    isTranslating,
    isRegionalActive: currentLanguage !== "en",
    contrastNotes,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
};
