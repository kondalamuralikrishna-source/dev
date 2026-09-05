// Speech synthesis & recognition utilities for browser with multi-accent support

export type EnglishAccent = "en-GB" | "en-US" | "en-AU";

export interface AccentOption {
  code: EnglishAccent;
  name: string;
  flag: string;
  label: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { code: "en-GB", name: "British (UK)", flag: "🇬🇧", label: "British RP" },
  { code: "en-US", name: "American (US)", flag: "🇺🇸", label: "American General" },
  { code: "en-AU", name: "Australian (AU)", flag: "🇦🇺", label: "Australian" },
];

let voicesCache: SpeechSynthesisVoice[] = [];

// Initialize voices cache
function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  voicesCache = window.speechSynthesis.getVoices();
  return voicesCache;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

export function getSavedAccent(): EnglishAccent {
  if (typeof window === "undefined") return "en-GB";
  const saved = localStorage.getItem("linguaflow_accent") as EnglishAccent;
  if (saved && (saved === "en-GB" || saved === "en-US" || saved === "en-AU")) {
    return saved;
  }
  return "en-GB"; // Default to British English as requested by user feedback
}

export function saveAccent(accent: EnglishAccent) {
  if (typeof window !== "undefined") {
    localStorage.setItem("linguaflow_accent", accent);
  }
}

export function getBestVoiceForAccent(accent: EnglishAccent): SpeechSynthesisVoice | undefined {
  const voices = voicesCache.length > 0 ? voicesCache : loadVoices();
  if (!voices || voices.length === 0) return undefined;

  const accentCode = accent.toLowerCase();

  if (accent === "en-GB") {
    return (
      voices.find((v) => v.lang.toLowerCase().replace("_", "-") === "en-gb" && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium"))) ||
      voices.find((v) => v.lang.toLowerCase().replace("_", "-") === "en-gb") ||
      voices.find((v) => v.name.toLowerCase().includes("british") || v.name.toLowerCase().includes("uk") || v.name.toLowerCase().includes("english (united kingdom)")) ||
      voices.find((v) => v.lang.startsWith("en"))
    );
  }

  if (accent === "en-AU") {
    return (
      voices.find((v) => v.lang.toLowerCase().replace("_", "-") === "en-au" && (v.name.includes("Google") || v.name.includes("Natural"))) ||
      voices.find((v) => v.lang.toLowerCase().replace("_", "-") === "en-au") ||
      voices.find((v) => v.name.toLowerCase().includes("australia") || v.name.toLowerCase().includes("karen") || v.name.toLowerCase().includes("lee")) ||
      voices.find((v) => v.lang.startsWith("en"))
    );
  }

  // Default / en-US
  return (
    voices.find((v) => v.lang.toLowerCase().replace("_", "-") === "en-us" && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium"))) ||
    voices.find((v) => v.lang.toLowerCase().replace("_", "-") === "en-us") ||
    voices.find((v) => v.lang.startsWith("en"))
  );
}

export function speakText(
  text: string,
  rate: number = 0.9,
  pitch: number = 1.0,
  lang?: string | EnglishAccent
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.warn("Speech synthesis not supported in this environment.");
      resolve();
      return;
    }

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel(); // Stop any pending utterances
    } catch (e) {
      console.warn("Error resetting speech synthesis:", e);
    }

    const cleanText = text.trim();
    if (!cleanText) {
      resolve();
      return;
    }

    const targetLang: EnglishAccent = (lang as EnglishAccent) || getSavedAccent();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = targetLang;

    const matchedVoice = getBestVoiceForAccent(targetLang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    let isFinished = false;
    const finish = () => {
      if (!isFinished) {
        isFinished = true;
        resolve();
      }
    };

    utterance.onend = () => finish();
    utterance.onerror = (e) => {
      console.warn("Speech utterance error:", e);
      finish();
    };

    // Safety timeout in case browser hangs
    const wordCount = cleanText.split(/\s+/).length;
    const timeoutMs = Math.max(3000, wordCount * 1200);
    setTimeout(finish, timeoutMs);

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("speechSynthesis.speak error:", err);
      finish();
    }
  });
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn("Error stopping speech:", e);
    }
  }
}

export const stopSpeech = stopSpeaking;

export function createSpeechRecognizer(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError?: (err: any) => void,
  onEnd?: () => void,
  lang: string = "en-US",
  continuous: boolean = false
) {
  if (typeof window === "undefined") return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = continuous;
  recognition.interimResults = true;
  recognition.lang = lang;

  recognition.onresult = (event: any) => {
    let interimTranscript = "";
    let finalTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    if (finalTranscript) {
      onResult(finalTranscript.trim(), true);
    } else if (interimTranscript) {
      onResult(interimTranscript.trim(), false);
    }
  };

  recognition.onerror = (event: any) => {
    // Non-fatal or transient events in browsers (e.g., brief network hiccup, silence timeout, or normal abort)
    if (event.error === "no-speech" || event.error === "aborted") {
      // Normal browser behavior when user is silent or switches tasks
      return;
    }
    if (event.error === "network") {
      console.warn("Speech recognition network notice: Browser speech service temporarily unreachable; fallback enabled.");
    } else {
      console.warn("Speech recognition notice:", event.error);
    }
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}
