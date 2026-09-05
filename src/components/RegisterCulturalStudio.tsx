import React, { useState } from "react";
import {
  Globe,
  Sliders,
  Sparkles,
  ShieldCheck,
  Building,
  Volume2,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Zap,
} from "lucide-react";
import { UserProgress, PragmaticAnalysisResult, RegisterShiftOption } from "../types";

interface RegisterCulturalStudioProps {
  progress: UserProgress;
  onGrantXp: (amount: number, reason: string) => void;
}

const REGISTER_PRESETS = [
  {
    id: "r1",
    title: "Declining an Impossible Timeline",
    input: "We cannot deliver this feature by Friday. It is impossible.",
    context: "Client asks for a major architectural change 2 days before sprint cut-off.",
  },
  {
    id: "r2",
    title: "Pushing Back on Unacceptable Pricing",
    input: "Your price is way too high. We will not pay that.",
    context: "Procurement negotiation with an enterprise software vendor.",
  },
  {
    id: "r3",
    title: "Delivering Critical Code Feedback",
    input: "This code is completely broken and has terrible performance.",
    context: "Pull request review for a cross-functional engineer.",
  },
  {
    id: "r4",
    title: "Requesting Budget Expansion",
    input: "Give us more money or the project fails.",
    context: "Quarterly resource review meeting with the executive board.",
  },
];

export const RegisterCulturalStudio: React.FC<RegisterCulturalStudioProps> = ({
  progress,
  onGrantXp,
}) => {
  const [inputText, setInputText] = useState(REGISTER_PRESETS[0].input);
  const [contextNote, setContextNote] = useState(REGISTER_PRESETS[0].context);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PragmaticAnalysisResult | null>(null);
  const [selectedTier, setSelectedTier] = useState<number>(4);

  const handleSpeakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = progress.speechSpeed || 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRunAnalysis = async (sentenceToAnalyze: string, context?: string) => {
    if (!sentenceToAnalyze.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/gemini/register-transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentence: sentenceToAnalyze,
          contextNotes: context || contextNote,
        }),
      });
      const data = await res.json();
      setAnalysis(data);
      setSelectedTier(4); // Default focus on Professional / Diplomatic
      onGrantXp(40, "Pragmatic Register & Cultural Nuance Analysis");
    } catch (e) {
      console.error("Error analyzing register:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPreset = (preset: typeof REGISTER_PRESETS[0]) => {
    setInputText(preset.input);
    setContextNote(preset.context);
    handleRunAnalysis(preset.input, preset.context);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
              <Globe size={13} className="text-purple-400" />
              MARKET DIFFERENTIATOR 3
            </span>
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Sparkles size={13} /> Pragmatic & Cultural Register Training
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white mb-2">
            Pragmatic & Cultural Register Transformation Lab
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Move beyond literal vocabulary accuracy to master register and cultural diplomacy.
            Analyze directness vs. face-saving politeness, manage power-distance dynamics, and
            transform blunt phrasing into 5 calibrated communication tiers.
          </p>

          {/* Quick Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
              <p className="text-xs text-slate-400 font-medium">5-Tier Ladder</p>
              <p className="text-sm font-black text-purple-300">Blunt ➔ Oratorical</p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
              <p className="text-xs text-slate-400 font-medium">Politeness Logic</p>
              <p className="text-sm font-black text-amber-300">Hedging & Stance</p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
              <p className="text-xs text-slate-400 font-medium">Cultural Matrices</p>
              <p className="text-sm font-black text-emerald-300">US, UK & Global</p>
            </div>
            <div className="bg-purple-900/60 backdrop-blur-sm rounded-xl p-3 border border-purple-700/60 flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-300 font-medium">Impact</p>
                <p className="text-sm font-black text-white">Face-Saving</p>
              </div>
              <ShieldCheck size={20} className="text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Preset Scenarios Carousel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            High-Stakes Workplace Scenarios (Common Directness Traps)
          </h3>
          <span className="text-xs text-slate-500">Select to transform</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {REGISTER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`text-left p-3.5 rounded-xl border transition-all ${
                inputText === preset.input
                  ? "bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/20"
                  : "bg-slate-50/60 hover:bg-slate-100 border-slate-200"
              }`}
            >
              <p className="text-xs font-black text-slate-900 mb-1">{preset.title}</p>
              <p className="text-[11px] text-rose-700 font-semibold line-clamp-1 mb-1">
                "{preset.input}"
              </p>
              <p className="text-[10px] text-slate-500 line-clamp-2">{preset.context}</p>
            </button>
          ))}
        </div>

        {/* Input Text Box */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Enter Any Statement to Calibrate Cultural Register:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g. You made a mistake in this calculation."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900"
              />
            </div>
            <div>
              <input
                type="text"
                value={contextNote}
                onChange={(e) => setContextNote(e.target.value)}
                placeholder="Context (e.g. Talking to Senior Executive)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => handleRunAnalysis(inputText, contextNote)}
              disabled={isAnalyzing || !inputText.trim()}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Auditing Pragmatic Register...</span>
                </>
              ) : (
                <>
                  <span>Transform Across 5 Registers</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Output & 5-Tier Transformation Ladder */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Tactical Politeness & Pragmatic Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-500">Directness Index</span>
                <span className="text-xs font-black text-rose-600">
                  {analysis.tacticalBreakdown?.directnessScore}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${analysis.tacticalBreakdown?.directnessScore}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                {analysis.tacticalBreakdown?.directnessScore > 75
                  ? "High bluntness risk"
                  : "Calibrated directness"}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-500">Diplomacy Score</span>
                <span className="text-xs font-black text-purple-600">
                  {analysis.tacticalBreakdown?.diplomacyScore}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${analysis.tacticalBreakdown?.diplomacyScore}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">Modal softening & hedging</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-500">Power Distance</span>
                <span className="text-xs font-black text-indigo-600">
                  {analysis.tacticalBreakdown?.powerDistanceScore}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${analysis.tacticalBreakdown?.powerDistanceScore}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">Hierarchy respect & deference</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-500">Face-Saving</span>
                <span className="text-xs font-black text-emerald-600">
                  {analysis.tacticalBreakdown?.faceSavingScore}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${analysis.tacticalBreakdown?.faceSavingScore}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">Preserves stakeholder rapport</p>
            </div>
          </div>

          {/* 5-Tier Transformation Ladder Interactive View */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-purple-600" />
                <h3 className="text-base font-black text-slate-900">
                  The 5-Tier Register Transformation Ladder
                </h3>
              </div>
              <span className="text-xs bg-purple-50 text-purple-800 font-bold px-2.5 py-1 rounded-full border border-purple-200">
                Current Input: Level {analysis.detectedRegister} ({analysis.detectedRegisterName})
              </span>
            </div>

            {/* Level Selector Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {analysis.transformations?.map((item) => (
                <button
                  key={item.level}
                  type="button"
                  onClick={() => setSelectedTier(item.level)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    selectedTier === item.level
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                  }`}
                >
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block mb-1.5 ${
                      selectedTier === item.level
                        ? "bg-purple-400 text-slate-950"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    Tier {item.level}
                  </span>
                  <p className="text-xs font-bold line-clamp-1">{item.levelName}</p>
                </button>
              ))}
            </div>

            {/* Detailed Selected Tier Card */}
            {(() => {
              const activeTransform =
                analysis.transformations?.find((t) => t.level === selectedTier) ||
                analysis.transformations?.[3];

              if (!activeTransform) return null;

              return (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-4 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/30 text-purple-300 border border-purple-500/40">
                        Tier {activeTransform.level}: {activeTransform.levelName}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          activeTransform.riskOfOffense === "High"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : activeTransform.riskOfOffense === "Medium"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        Risk of Friction: {activeTransform.riskOfOffense}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSpeakText(activeTransform.phrasing)}
                      className="p-2 text-purple-300 hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Volume2 size={16} />
                      <span>Hear Nuance</span>
                    </button>
                  </div>

                  {/* Phrasing Box */}
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 text-base sm:text-lg font-bold text-white leading-relaxed">
                    "{activeTransform.phrasing}"
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                      <p className="font-bold text-purple-300">Tactical Politeness Strategy:</p>
                      <p className="text-slate-300 leading-relaxed">{activeTransform.politenessStrategy}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                      <p className="font-bold text-amber-300">Hedging & Softening Markers:</p>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {activeTransform.hedgingTechniques?.map((h, hIdx) => (
                          <span
                            key={hIdx}
                            className="px-2 py-0.5 bg-slate-700 text-slate-200 rounded-md text-[11px] font-semibold"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 italic">
                    💡 Cultural Note: {activeTransform.culturalContextNote}
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Cultural Guidance Matrix */}
          {analysis.culturalGuidance && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Building size={18} className="text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">
                  Cross-Cultural Communication Matrices
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <span>🇺🇸 North American Business</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {analysis.culturalGuidance.northAmericanBusiness}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <span>🇬🇧 British Understatement</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {analysis.culturalGuidance.britishUnderstatement}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <span>🌐 Global Enterprise Matrix</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {analysis.culturalGuidance.globalEnterprise}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
