import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Volume2,
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  RotateCw,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid,
  List,
  Flame,
  Globe,
  ArrowRight,
  ArrowLeft,
  Keyboard,
} from "lucide-react";
import confetti from "canvas-confetti";
import { CEFRLevel, UserProgress, VocabWord } from "../types";
import { VOCABULARY_COLLECTIONS } from "../data/curriculumData";
import { AudioButton } from "./AudioButton";
import { AccentSelector } from "./AccentSelector";
import { EnglishAccent, getSavedAccent } from "../utils/speechUtils";
import { ModuleHeaderGuide } from "./ModuleHeaderGuide";
import { RegionalConceptHelper } from "./RegionalConceptHelper";
import { useTranslation } from "../context/TranslationContext";

interface VocabularyHubProps {
  progress: UserProgress;
  activeCollectionId: string | null;
  onToggleSaveWord: (wordId: string) => void;
  onMarkWordMastered: (wordId: string) => void;
}

export const VocabularyHub: React.FC<VocabularyHubProps> = ({
  progress,
  activeCollectionId,
  onToggleSaveWord,
  onMarkWordMastered,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    activeCollectionId || "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"flashcards" | "list">("flashcards");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterSavedOnly, setFilterSavedOnly] = useState(false);
  const [currentAccent, setCurrentAccent] = useState<EnglishAccent>(getSavedAccent());
  const { isRegionalActive, currentLanguageConfig } = useTranslation();

  // Flatten all words or filter
  const allWords = VOCABULARY_COLLECTIONS.flatMap((c) => c.words);

  const filteredWords = allWords.filter((w) => {
    const matchesCategory =
      selectedCategory === "all" ||
      VOCABULARY_COLLECTIONS.find((c) => c.id === selectedCategory)?.words.some(
        (cw) => cw.id === w.id
      );
    const matchesSearch =
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSaved = !filterSavedOnly || progress.savedVocabIds.includes(w.id);

    return matchesCategory && matchesSearch && matchesSaved;
  });

  const currentWord: VocabWord | undefined = filteredWords[currentCardIndex];

  // Keyboard navigation for flashcards
  useEffect(() => {
    if (viewMode !== "flashcards") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      if ((e.target as HTMLElement).tagName === "INPUT") return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextCard();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevCard();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, currentCardIndex, filteredWords.length]);

  const handleNextCard = () => {
    setIsFlipped(false);
    if (currentCardIndex < filteredWords.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
    } else {
      setCurrentCardIndex(filteredWords.length - 1);
    }
  };

  const handleMarkMastered = (wordId: string) => {
    onMarkWordMastered(wordId);
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 },
    });
    handleNextCard();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Module Header Guide */}
      <ModuleHeaderGuide
        moduleTitle="Vocabulary Vault & Flashcards"
        moduleCategory="Lexical Acquisition"
        estimatedTime="5–10 min per set"
        difficulty="CEFR A1 to C2 Vocab"
        themeColor="emerald"
        steps={[
          {
            title: "Choose Topic Collection",
            instruction: "Select from business, conversational, academic, or phrasal verb collections.",
            tip: "Use the search bar or 'Saved Words' filter to focus on specific terms.",
          },
          {
            title: "Flip Card & Check Phonetics",
            instruction: "Tap the flashcard or press Spacebar to reveal definition, IPA pronunciation, and contextual example.",
            tip: "Listen to natural audio pronunciations across US, UK, and AUS accents.",
          },
          {
            title: "Mark Mastered or Save for Review",
            instruction: "Click 'Mark Mastered' (or press M) if you know it, or bookmark it to review later.",
            tip: "Mastered words feed into your Spaced Repetition mastery tracker.",
          },
          {
            title: "Switch Between Flashcard & List",
            instruction: "Toggle between interactive 3D Flashcard mode and complete dictionary list view.",
            tip: "List mode provides quick scanning of definitions and example sentences.",
          },
        ]}
        completionGoal="Review the current collection and mark target words as 'Mastered' to build your vocabulary vault."
        xpReward={25}
      />

      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Vocabulary Vault & Flashcards
              </h1>
              <span className="text-xs px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold rounded-md border border-emerald-200">
                Spaced Repetition
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              High-frequency words, professional idioms, and phrasal verbs with multi-accent audio.
            </p>
          </div>

          {/* Accent toggle, View mode & Search */}
          <div className="flex items-center gap-3 flex-wrap">
            <AccentSelector
              currentAccent={currentAccent}
              onAccentChange={setCurrentAccent}
              size="sm"
            />

            <div className="relative w-full sm:w-56">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search words & idioms..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentCardIndex(0);
                }}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("flashcards")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "flashcards"
                    ? "bg-white text-indigo-600 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Flashcard Deck Mode"
              >
                <Grid size={17} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-indigo-600 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Vocabulary List Mode"
              >
                <List size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setCurrentCardIndex(0);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Collections ({allWords.length})
          </button>
          {VOCABULARY_COLLECTIONS.map((col) => (
            <button
              key={col.id}
              type="button"
              onClick={() => {
                setSelectedCategory(col.id);
                setCurrentCardIndex(0);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === col.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {col.title} ({col.words.length})
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              setFilterSavedOnly((prev) => !prev);
              setCurrentCardIndex(0);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              filterSavedOnly
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Bookmark size={13} />
            <span>Saved ({progress.savedVocabIds.length})</span>
          </button>
        </div>
      </div>

      {filteredWords.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <BookOpen size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No words found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or collection filter.
          </p>
        </div>
      ) : viewMode === "flashcards" ? (
        /* FLASHCARD DECK MODE */
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Card counter & Instructions banner */}
          <div className="bg-indigo-50/70 border border-indigo-100/90 rounded-2xl px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-indigo-950 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-xs">
                Card {currentCardIndex + 1} of {filteredWords.length}
              </span>
              <span className="text-slate-600 hidden sm:inline">
                • {currentWord?.category}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-600">
              <span className="flex items-center gap-1 text-indigo-700 font-bold">
                <RotateCw size={12} /> Tap Card to Flip
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Keyboard size={12} /> Use [←] [→] [Space]
              </span>
            </div>
          </div>

          {/* Flashcard with flanking navigation arrows */}
          <div className="relative flex items-center justify-center gap-2 sm:gap-3">
            {/* Quick Left Navigation Button */}
            <button
              id="flashcard-quick-prev"
              type="button"
              onClick={handlePrevCard}
              title="Previous Word (Left Arrow key)"
              className="p-3 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-2xl border border-slate-200 shadow-sm transition-all active:scale-90 cursor-pointer shrink-0 hidden sm:flex items-center justify-center"
            >
              <ChevronLeft size={22} />
            </button>

            {/* 3D Flip Card Container */}
            {currentWord && (
              <div
                id="vocab-flashcard"
                onClick={() => setIsFlipped((prev) => !prev)}
                className="relative w-full max-w-xl h-[390px] cursor-pointer [perspective:1000px] select-none"
              >
                <div
                  className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform ${
                    isFlipped ? "[transform:rotateY(180deg)]" : ""
                  }`}
                >
                  {/* FRONT OF FLASHCARD */}
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white rounded-3xl p-7 border-2 border-indigo-100 shadow-lg flex flex-col justify-between items-center text-center">
                    <div className="w-full flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-lg border border-indigo-200">
                        Level {currentWord.level}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSaveWord(currentWord.id);
                        }}
                        className="p-2 text-slate-400 hover:text-amber-500 rounded-full transition-colors cursor-pointer"
                        title="Save to Notebook"
                      >
                        {progress.savedVocabIds.includes(currentWord.id) ? (
                          <BookmarkCheck size={22} className="text-amber-500 fill-amber-500" />
                        ) : (
                          <Bookmark size={22} />
                        )}
                      </button>
                    </div>

                    <div className="space-y-3 my-auto">
                      <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        {currentWord.word}
                      </h2>
                      <p className="text-sm font-mono text-indigo-600 font-semibold">
                        {currentWord.phonetic}
                      </p>
                      <span className="inline-block px-3 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full italic">
                        {currentWord.partOfSpeech}
                      </span>
                    </div>

                    <div className="space-y-3 w-full">
                      <div className="flex items-center justify-center gap-2">
                        <AudioButton
                          text={currentWord.word}
                          accent={currentAccent}
                          size="lg"
                          variant="primary"
                          label={`Listen Native (${currentAccent === "en-GB" ? "UK 🇬🇧" : currentAccent === "en-AU" ? "AU 🇦🇺" : "US 🇺🇸"})`}
                        />
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold px-2">
                        <span className="flex items-center gap-1">
                          <RotateCw size={12} /> Tap to see definition & example
                        </span>
                        <span className="text-slate-400 font-normal text-[11px]">
                          Card {currentCardIndex + 1}/{filteredWords.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BACK OF FLASHCARD */}
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-7 text-white shadow-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-extrabold text-indigo-300 tracking-wide">
                        {currentWord.category}
                      </span>
                      <span className="text-xs text-amber-300 font-mono font-bold">
                        {currentWord.partOfSpeech}
                      </span>
                    </div>

                    <div className="space-y-4 my-auto">
                      <div>
                        <span className="text-xs text-indigo-300 font-bold block mb-1">
                          Definition:
                        </span>
                        <p className="text-base font-bold text-white leading-snug">
                          {currentWord.definition}
                        </p>
                      </div>

                      <div className="p-3 bg-white/10 rounded-2xl border border-white/15">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-amber-300 font-bold">
                            Contextual Example:
                          </span>
                          <AudioButton
                            text={currentWord.exampleSentence}
                            accent={currentAccent}
                            size="sm"
                            variant="secondary"
                          />
                        </div>
                        <p className="text-xs text-indigo-100 italic leading-relaxed">
                          "{currentWord.exampleSentence}"
                        </p>
                      </div>

                      {currentWord.collocations && currentWord.collocations.length > 0 && (
                        <div className="text-xs text-slate-300">
                          <span className="font-bold text-indigo-200">Collocations: </span>
                          {currentWord.collocations.join(" • ")}
                        </div>
                      )}

                      {/* Regional Translation Scaffold */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <RegionalConceptHelper
                          englishText={`${currentWord.word}: ${currentWord.definition} | "${currentWord.exampleSentence}"`}
                          context={`Vocabulary Word: ${currentWord.word}`}
                          compact={true}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400">
                        <RotateCw size={12} /> Tap to flip back
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextCard();
                        }}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center gap-1 shadow-xs cursor-pointer text-xs transition-colors"
                      >
                        <span>Next Word</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Right Navigation Button */}
            <button
              id="flashcard-quick-next"
              type="button"
              onClick={handleNextCard}
              title="Next Word (Right Arrow key)"
              className="p-3 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-2xl border border-slate-200 shadow-sm transition-all active:scale-90 cursor-pointer shrink-0 hidden sm:flex items-center justify-center"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Flashcard Primary Action Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <button
              id="btn-prev-card"
              type="button"
              onClick={handlePrevCard}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>Previous Word</span>
            </button>

            {currentWord && (
              <button
                id="btn-mark-mastered"
                type="button"
                onClick={() => handleMarkMastered(currentWord.id)}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <CheckCircle size={15} />
                <span>Mark Mastered (+20 XP)</span>
              </button>
            )}

            <button
              id="btn-next-card"
              type="button"
              onClick={handleNextCard}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <span>Next Word</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Mini-Carousel Dots / Index Strip */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar justify-center flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0">
              Jump to Card:
            </span>
            {filteredWords.map((w, idx) => {
              const isActive = idx === currentCardIndex;
              const isMastered = progress.masteredVocabIds.includes(w.id);

              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex(idx);
                  }}
                  title={`Word ${idx + 1}: ${w.word}`}
                  className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs scale-110 ring-2 ring-indigo-300"
                      : isMastered
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* LIST VIEW MODE */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWords.map((word) => {
            const isSaved = progress.savedVocabIds.includes(word.id);
            const isMastered = progress.masteredVocabIds.includes(word.id);

            return (
              <div
                key={word.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-lg">
                          {word.word}
                        </h3>
                        <span className="text-xs font-mono text-indigo-600 font-semibold">
                          {word.phonetic}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 italic">
                        {word.partOfSpeech} • {word.category} (Level {word.level})
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <AudioButton
                        text={word.word}
                        accent={currentAccent}
                        size="sm"
                        variant="secondary"
                      />
                      <button
                        type="button"
                        onClick={() => onToggleSaveWord(word.id)}
                        className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg transition-colors cursor-pointer"
                        title="Bookmark"
                      >
                        {isSaved ? (
                          <BookmarkCheck size={18} className="text-amber-500 fill-amber-500" />
                        ) : (
                          <Bookmark size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-700 leading-relaxed">
                    {word.definition}
                  </p>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 italic">
                    "{word.exampleSentence}"
                  </div>

                  {/* Regional Translation in List Item */}
                  <RegionalConceptHelper
                    englishText={`${word.word}: ${word.definition}. Example: "${word.exampleSentence}"`}
                    context={`Vocabulary Word: ${word.word}`}
                    compact={true}
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  {isMastered ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle size={14} /> Mastered
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMarkMastered(word.id)}
                      className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle size={14} /> Mark Mastered (+20 XP)
                    </button>
                  )}
                  <AudioButton
                    text={word.exampleSentence}
                    accent={currentAccent}
                    size="sm"
                    variant="ghost"
                    label="Example Audio"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
