import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Activity,
  Sparkles,
  TrendingUp,
  Wind,
  Layers,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  ArrowRight,
  Zap,
  Music,
} from "lucide-react";
import { UserProgress, GranularProsodyReport } from "../types";
import { SuprasegmentalProsodyTutor } from "./SuprasegmentalProsodyTutor";

interface GranularProsodyStudioProps {
  progress: UserProgress;
  onGrantXp: (amount: number, reason: string) => void;
}

const PROSODY_PRACTICE_PRESETS = [
  {
    id: "p1",
    title: "Executive Strategic Deference",
    phrase: "I'd really appreciate your feedback on the project.",
    focus: "Fall-Rise Diplomatic Intonation & Syllable Stress ('ap-PRE-ciate')",
    targetWpm: "130-145 WPM",
    category: "Diplomatic Register",
  },
  {
    id: "p2",
    title: "Crisis Resolution Assertion",
    phrase: "We need to mitigate this risk before the quarterly release.",
    focus: "Falling Definitive Contour & Connected Speech ('MIT-i-gate')",
    targetWpm: "135-150 WPM",
    category: "Crisis Command",
  },
  {
    id: "p3",
    title: "Venture Moat Articulation",
    phrase: "Our proprietary data moat creates defensible competitive advantage.",
    focus: "Multi-syllabic Prominence ('pro-PRI-e-tary') & Flap /t/",
    targetWpm: "125-140 WPM",
    category: "Investor Pitch",
  },
  {
    id: "p4",
    title: "Cross-Functional Inquiry",
    phrase: "Could you clarify the technical constraints we might encounter?",
    focus: "Rising Polite Question Contour & Weak Form ('might en-COUN-ter')",
    targetWpm: "130-145 WPM",
    category: "Technical Review",
  },
];

export const GranularProsodyStudio: React.FC<GranularProsodyStudioProps> = ({
  progress,
  onGrantXp,
}) => {
  const [activeProsodyMode, setActiveProsodyMode] = useState<"suprasegmental" | "phonetic">("suprasegmental");
  const [selectedPreset, setSelectedPreset] = useState(PROSODY_PRACTICE_PRESETS[0]);
  const [customPhrase, setCustomPhrase] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<GranularProsodyReport | null>(null);

  const activePhrase = isCustomMode ? customPhrase || "Please enter a phrase" : selectedPreset.phrase;

  const handleSpeakPhrase = (text: string, rate: number = 0.9) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. You can type or evaluate preset audio.");
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsRecording(true);
      setSpokenTranscript("");
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSpokenTranscript(transcript);
      setIsRecording(false);
      handleAnalyzeProsody(transcript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  const handleAnalyzeProsody = async (spokenText: string) => {
    if (!spokenText.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/gemini/prosody-phonetic-eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetPhrase: activePhrase,
          spokenTranscript: spokenText,
          audioMetrics: {
            estimatedDurationSeconds: (spokenText.split(" ").length / 2.3),
            approximateWpm: Math.round((spokenText.split(" ").length / 2.3) * 60),
          },
        }),
      });

      const data = await res.json();
      setReport(data);
      onGrantXp(35, "Acoustic Prosody & Phonetic Analysis");
    } catch (e) {
      console.error("Error analyzing prosody:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Prosody Studio Mode Selector Bar */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveProsodyMode("suprasegmental")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 ${
              activeProsodyMode === "suprasegmental"
                ? "bg-teal-700 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Music size={14} className={activeProsodyMode === "suprasegmental" ? "text-teal-200" : "text-teal-600"} />
            <span>Suprasegmental & Prosody Tutor (Rhythm & Intonation)</span>
            <span className="text-[10px] bg-teal-800 text-teal-100 px-1.5 py-0.2 rounded-full font-bold">
              New
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveProsodyMode("phonetic")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeProsodyMode === "phonetic"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Activity size={14} className={activeProsodyMode === "phonetic" ? "text-amber-300" : "text-slate-500"} />
            <span>Phonetic & Syllable Mechanics Lab</span>
          </button>
        </div>

        <span className="text-[11px] font-bold text-slate-500 hidden md:block pr-2">
          {activeProsodyMode === "suprasegmental"
            ? "F0 Contours • Clause Emphasis • Isochrony"
            : "Phonemes • Flap /t/ • Breath Groups"}
        </span>
      </div>

      {activeProsodyMode === "suprasegmental" ? (
        <SuprasegmentalProsodyTutor progress={progress} onGrantXp={onGrantXp} />
      ) : (
        <div className="space-y-6">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
                  <Activity size={13} className="text-teal-400" />
                  PHONETIC ACOUSTICS
                </span>
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Sparkles size={13} /> Acoustic Phonetics & Speech Mechanics
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white mb-2">
                Granular Prosody & Phonetic Acoustic Studio
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                Beyond binary right/wrong scores. Get granular, actionable feedback on real speech
                mechanics: syllable stress hierarchy, pitch contour curves, speech cadence (WPM),
                breath group pauses, and connected speech reductions.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
                  <p className="text-xs text-slate-400 font-medium">Cadence Target</p>
                  <p className="text-lg font-black text-teal-400">120–160 WPM</p>
                </div>
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
                  <p className="text-xs text-slate-400 font-medium">Contour Modes</p>
                  <p className="text-lg font-black text-amber-400">Fall / Rise / Fall-Rise</p>
                </div>
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
                  <p className="text-xs text-slate-400 font-medium">Acoustic Reduction</p>
                  <p className="text-lg font-black text-indigo-400">Flap /t/ & Weak Forms</p>
                </div>
                <div className="bg-teal-900/60 backdrop-blur-sm rounded-xl p-3 border border-teal-700/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-teal-300 font-medium">Precision</p>
                    <p className="text-lg font-black text-white">Phoneme-Level</p>
                  </div>
                  <Activity size={20} className="text-teal-400" />
                </div>
              </div>
            </div>
          </div>

      {/* Preset Selection & Phrase Workbench */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCustomMode(false)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                !isCustomMode
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Curated Acoustic Presets
            </button>
            <button
              type="button"
              onClick={() => setIsCustomMode(true)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isCustomMode
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Custom Target Sentence
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSpeakPhrase(activePhrase, 0.75)}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all flex items-center gap-1"
              title="Slow speed reference audio"
            >
              <Volume2 size={14} className="text-teal-600" />
              <span>0.75x Reference</span>
            </button>
            <button
              type="button"
              onClick={() => handleSpeakPhrase(activePhrase, 1.0)}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all flex items-center gap-1"
              title="Native speed reference audio"
            >
              <Volume2 size={14} className="text-indigo-600" />
              <span>1.0x Native</span>
            </button>
          </div>
        </div>

        {/* Preset Cards */}
        {!isCustomMode ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PROSODY_PRACTICE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSelectedPreset(preset);
                  setReport(null);
                }}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  selectedPreset.id === preset.id
                    ? "bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20"
                    : "bg-slate-50/50 hover:bg-slate-50 border-slate-200"
                }`}
              >
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block mb-1">
                  {preset.category}
                </span>
                <p className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
                  {preset.title}
                </p>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  "{preset.phrase}"
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Enter Any Sentence for Acoustic Analysis:
            </label>
            <input
              type="text"
              value={customPhrase}
              onChange={(e) => setCustomPhrase(e.target.value)}
              placeholder="e.g. In today's volatile macroeconomic environment, unit economics remain paramount."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900"
            />
          </div>
        )}

        {/* Target Phrase Box */}
        <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase text-teal-400 tracking-wider mb-1">
              Active Acoustic Target:
            </p>
            <p className="text-base sm:text-lg font-bold text-white tracking-wide">
              "{activePhrase}"
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md ${
                isRecording
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-teal-500 hover:bg-teal-400 text-slate-950"
              }`}
            >
              {isRecording ? <MicOff size={15} /> : <Mic size={15} />}
              <span>{isRecording ? "Recording Speech..." : "Record Spoken Attempt"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleAnalyzeProsody(activePhrase)}
              disabled={isAnalyzing}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
              title="Run benchmark analysis on standard phrase"
            >
              {isAnalyzing ? "Analyzing..." : "Acoustic Benchmark"}
            </button>
          </div>
        </div>
      </div>

      {/* Acoustic Analysis Report Display */}
      {report && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold">Prosody Mastery</p>
                <p className="text-2xl font-black text-slate-900">{report.overallProsodyScore}/100</p>
                <p className="text-[11px] text-teal-700 font-bold mt-0.5">Acoustic Balance</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-black text-sm">
                {report.overallProsodyScore}%
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold">Syllable Stress</p>
                <p className="text-2xl font-black text-indigo-700">{report.syllableStressScore}/100</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Pitch Prominence</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-black text-sm">
                {report.syllableStressScore}%
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold">Speech Rate</p>
                <p className="text-2xl font-black text-amber-600">{report.speechRateWpm} WPM</p>
                <p className="text-[11px] text-amber-700 font-bold mt-0.5">{report.speechRateBand}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-black text-sm">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold">Breath Control</p>
                <p className="text-2xl font-black text-emerald-600">{report.breathControlScore}/100</p>
                <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Syntactic Pausing</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-black text-sm">
                <Wind size={20} />
              </div>
            </div>
          </div>

          {/* Granular Section 1: Syllable Stress Map */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">
                  Granular Syllable Stress & Pitch Prominence Map
                </h3>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-800 font-bold px-2.5 py-1 rounded-full border border-indigo-200">
                Primary Stress = High Pitch + Extended Vowel
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {report.syllableStressBreakdown?.map((wordItem, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-900">{wordItem.word}</span>
                    <button
                      type="button"
                      onClick={() => handleSpeakPhrase(wordItem.word)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {wordItem.syllables?.map((syl, sIdx) => (
                      <div
                        key={sIdx}
                        className={`px-2.5 py-1 rounded-lg text-center border ${
                          syl.isStressed
                            ? "bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-400/30"
                            : syl.isSecondary
                            ? "bg-indigo-100 text-indigo-900 border-indigo-300"
                            : "bg-white text-slate-600 border-slate-200"
                        }`}
                      >
                        <p className="text-xs font-black tracking-wide">{syl.syllable}</p>
                        <p className="text-[10px] opacity-80 font-mono">{syl.ipa || "-"}</p>
                        <span className="text-[9px] block uppercase font-bold mt-0.5">
                          {syl.pitchLevel} pitch
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Granular Section 2: Pitch Contour & Intonation Inflection */}
          {report.pitchContour && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-teal-600" />
                  <h3 className="text-base font-black text-slate-900">
                    Pitch Contour & Intonation Inflection Curve
                  </h3>
                </div>
                <span className="text-xs bg-teal-50 text-teal-800 font-bold px-2.5 py-1 rounded-full border border-teal-200 uppercase">
                  Contour: {report.pitchContour.curveType}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-teal-400">Acoustic Curve:</strong> {report.pitchContour.curveDescription}
                </p>
                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-amber-300 flex items-start gap-2">
                  <Sparkles size={16} className="shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    <strong className="text-white">Pragmatic Communicative Impact:</strong>{" "}
                    {report.pitchContour.pragmaticEffect}
                  </span>
                </div>

                {/* Visual Pitch Nodes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {report.pitchContour.points?.map((pt, pIdx) => (
                    <div key={pIdx} className="bg-slate-800 rounded-lg p-2.5 border border-slate-700 text-center">
                      <p className="text-[10px] text-slate-400 font-medium">{pt.label}</p>
                      <p className="text-sm font-black text-teal-400">{pt.pitchHz} Hz</p>
                      <p className="text-[10px] text-slate-500">{pt.timePercent}% mark</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Granular Section 3: Connected Speech Reductions & Actionable Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Connected Speech Features */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Zap size={16} className="text-amber-500" />
                Connected Speech Mechanics
              </h4>

              <div className="space-y-2.5">
                {report.connectedSpeechFeatures?.map((feat, fIdx) => (
                  <div key={fIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">"{feat.textSnippet}"</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {feat.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600">
                      <span>Standard: {feat.standardIpa}</span>
                      <span>➔</span>
                      <span className="text-indigo-700 font-bold">Connected: {feat.connectedIpa}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{feat.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Mechanics Coaching */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Actionable Motor & Breath Mechanics Tips
              </h4>

              <div className="space-y-2.5">
                {report.actionableMechanicsTips?.map((tip, tIdx) => (
                  <div key={tIdx} className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-800 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-950 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      {tIdx + 1}
                    </span>
                    <p className="leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
};
