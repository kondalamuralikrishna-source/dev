import React, { useState } from "react";
import {
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Play,
  Mic,
  MicOff,
  Volume2,
  Flame,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Filter,
  Plus,
  Trash2,
} from "lucide-react";
import { UserProgress, ErrorMemoryItem, ErrorSlipCategory } from "../types";
import {
  trackErrorSlip,
  recordErrorRetestAttempt,
  deleteErrorMemoryItem,
} from "../utils/storageUtils";

interface ErrorMemoryStudioProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onGrantXp: (amount: number, reason: string) => void;
}

export const ErrorMemoryStudio: React.FC<ErrorMemoryStudioProps> = ({
  progress,
  onUpdateProgress,
  onGrantXp,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"bank" | "retest_active" | "add_manual">("bank");
  
  // Retest Scenario State
  const [isGeneratingScenario, setIsGeneratingScenario] = useState<boolean>(false);
  const [currentScenario, setCurrentScenario] = useState<any | null>(null);
  const [userSpokenResponse, setUserSpokenResponse] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [evaluatingResult, setEvaluatingResult] = useState<boolean>(false);
  const [retestFeedback, setRetestFeedback] = useState<any | null>(null);
  const [timerLeft, setTimerLeft] = useState<number>(45);

  // Manual Add State
  const [manualError, setManualError] = useState<string>("");
  const [manualCorrection, setManualCorrection] = useState<string>("");
  const [manualExplanation, setManualExplanation] = useState<string>("");
  const [manualCategory, setManualCategory] = useState<ErrorSlipCategory>("Grammar & Syntax");
  const [manualContext, setManualContext] = useState<string>("Spoken Interaction");

  const memoryBank = progress.errorMemoryBank || [];

  const categories: { label: string; value: string; count: number }[] = [
    { label: "All Tracked Mistakes", value: "all", count: memoryBank.length },
    {
      label: "Grammar & Syntax",
      value: "Grammar & Syntax",
      count: memoryBank.filter((e) => e.category === "Grammar & Syntax").length,
    },
    {
      label: "Pronunciation & Phonetics",
      value: "Pronunciation & Phonetics",
      count: memoryBank.filter((e) => e.category === "Pronunciation & Phonetics").length,
    },
    {
      label: "Pragmatics & Register",
      value: "Pragmatics & Register",
      count: memoryBank.filter((e) => e.category === "Pragmatics & Register").length,
    },
    {
      label: "Vocabulary & Jargon",
      value: "Vocabulary & Jargon",
      count: memoryBank.filter((e) => e.category === "Vocabulary & Jargon").length,
    },
    {
      label: "Fluency & Fillers",
      value: "Fluency & Fillers",
      count: memoryBank.filter((e) => e.category === "Fluency & Fillers").length,
    },
  ];

  const filteredItems =
    selectedCategory === "all"
      ? memoryBank
      : memoryBank.filter((e) => e.category === selectedCategory);

  const pendingRetestCount = memoryBank.filter(
    (e) => e.status === "detected" || e.status === "retesting_under_pressure" || e.status === "in_drill"
  ).length;

  const masteredCount = memoryBank.filter((e) => e.status === "mastered").length;

  const handleSpeakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = progress.speechSpeed || 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleLaunchContextualRetest = async (targetItems?: ErrorMemoryItem[]) => {
    setIsGeneratingScenario(true);
    setCurrentScenario(null);
    setRetestFeedback(null);
    setUserSpokenResponse("");
    setActiveTab("retest_active");

    const itemsToTest = targetItems && targetItems.length > 0 ? targetItems : memoryBank.slice(0, 3);

    try {
      const res = await fetch("/api/gemini/contextual-retest-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackedErrors: itemsToTest,
          userLevel: progress.selectedLevel || "B1",
        }),
      });
      const data = await res.json();
      setCurrentScenario(data);
      setTimerLeft(data.timeLimitSeconds || 45);
      
      // Auto-speak interlocutor prompt
      if (data.interlocutorPrompt) {
        setTimeout(() => handleSpeakText(data.interlocutorPrompt), 400);
      }
    } catch (e) {
      console.error("Error generating scenario:", e);
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  const handleToggleVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. You can type your spoken response.");
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUserSpokenResponse(transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  const handleSubmitRetestResponse = async () => {
    if (!userSpokenResponse.trim() || !currentScenario) return;

    setEvaluatingResult(true);
    try {
      // Evaluate response with Gemini
      const res = await fetch("/api/gemini/fluidconvo-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interlocutorPrompt: currentScenario.interlocutorPrompt,
          userResponse: userSpokenResponse,
          scenarioContext: currentScenario.briefing,
          focusCategory: "Dynamic Error Retest",
        }),
      });
      const evalData = await res.json();

      // Honest gate: if the evaluator didn't return a usable score, do not assume
      // a passing grade of 75 -- treat it as a failed/incomplete evaluation.
      const hasScore = typeof evalData.score === "number";
      const isPassed = hasScore && evalData.score >= 70;
      setRetestFeedback({
        ...evalData,
        score: hasScore ? evalData.score : 0,
        passed: isPassed,
      });

      // Update the retested error items in storage
      if (currentScenario.targetErrorsEmbedded) {
        for (const target of currentScenario.targetErrorsEmbedded) {
          if (target.errorId) {
            const updated = recordErrorRetestAttempt(
              target.errorId,
              isPassed,
              currentScenario.title,
              userSpokenResponse,
              evalData.feedback || "Contextual Retest completed"
            );
            onUpdateProgress(updated);
          }
        }
      }

      if (isPassed) {
        onGrantXp(60, "Retested Error Mastered Under Pressure");
      } else {
        onGrantXp(20, "Retest Attempt Recorded");
      }
    } catch (e) {
      console.error("Evaluation error:", e);
      // Be honest that the retest could not be evaluated instead of fabricating
      // a passing score and positive feedback the learner never earned.
      setRetestFeedback({
        score: 0,
        passed: false,
        feedback: "We couldn't evaluate this retest attempt. Please try again.",
        grammarCheck: "",
        evaluationFailed: true,
      });
    } finally {
      setEvaluatingResult(false);
    }
  };

  const handleAddManualSlip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualError.trim() || !manualCorrection.trim()) return;

    const updated = trackErrorSlip(
      manualError.trim(),
      manualCorrection.trim(),
      manualExplanation.trim() || "Recorded learner slip",
      manualCategory,
      manualContext.trim() || "Manual Entry"
    );
    onUpdateProgress(updated);

    setManualError("");
    setManualCorrection("");
    setManualExplanation("");
    setActiveTab("bank");
  };

  const handleDeleteItem = (id: string) => {
    const updated = deleteErrorMemoryItem(id);
    onUpdateProgress(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Brain size={13} className="text-indigo-400" />
              MARKET DIFFERENTIATOR 1
            </span>
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Flame size={13} /> Contextual Re-testing Engine
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white mb-2">
            Dynamic Error Memory Bank
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Mistakes are never treated as isolated events. Fluenxia logs your specific grammar,
            phonetic, and pragmatic slips and dynamically weaves them into future high-stakes
            conversational scenarios to verify true retention under real-world pressure.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
              <p className="text-xs text-slate-400 font-medium">Tracked Slips</p>
              <p className="text-xl font-black text-white">{memoryBank.length}</p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
              <p className="text-xs text-amber-400 font-medium">Pending Re-test</p>
              <p className="text-xl font-black text-amber-400">{pendingRetestCount}</p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
              <p className="text-xs text-emerald-400 font-medium">Under Pressure Mastered</p>
              <p className="text-xl font-black text-emerald-400">{masteredCount}</p>
            </div>
            <div className="bg-indigo-900/60 backdrop-blur-sm rounded-xl p-3 border border-indigo-700/60 flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-300 font-medium">Target Level</p>
                <p className="text-xl font-black text-indigo-200">{progress.selectedLevel || "B1"}</p>
              </div>
              <Zap size={22} className="text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("bank")}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "bank"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Brain size={15} />
            <span>Active Error Memory ({memoryBank.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleLaunchContextualRetest()}
            disabled={memoryBank.length === 0}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "retest_active"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
            }`}
          >
            <ShieldAlert size={15} />
            <span>Launch Pressure Re-test</span>
            <span className="text-[10px] bg-rose-200 text-rose-950 font-black px-1.5 py-0.2 rounded-full">
              LIVE
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab("add_manual")}
          className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === "add_manual"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Plus size={14} />
          <span>Log Custom Slip</span>
        </button>
      </div>

      {/* VIEW 1: ACTIVE ERROR MEMORY BANK */}
      {activeTab === "bank" && (
        <div className="space-y-5">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <Filter size={14} className="text-slate-400 shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.value
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedCategory === cat.value
                      ? "bg-indigo-400 text-slate-950"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Error Items List */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto">
              <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">Zero Pending Slips in Category!</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                You have cleared or mastered all recorded mistakes in this area. Practice speaking to track new nuances.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                View All Categories
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const statusBadge =
                  item.status === "mastered"
                    ? { text: "Mastered Under Pressure", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" }
                    : item.status === "retesting_under_pressure"
                    ? { text: "Retesting Under Pressure", bg: "bg-rose-100 text-rose-800 border-rose-300 animate-pulse" }
                    : item.status === "in_drill"
                    ? { text: "Active Drill", bg: "bg-amber-100 text-amber-800 border-amber-300" }
                    : { text: "Newly Detected", bg: "bg-indigo-100 text-indigo-800 border-indigo-300" };

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Meta */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {item.category}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${statusBadge.bg}`}
                        >
                          {statusBadge.text}
                        </span>
                      </div>

                      {/* Slip vs Correction Box */}
                      <div className="space-y-2 mb-3">
                        <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200">
                          <p className="text-[10px] font-black uppercase text-rose-700 tracking-wider mb-0.5">
                            Recorded Slip (Freq: {item.frequency}x)
                          </p>
                          <p className="text-sm font-semibold text-rose-900 line-through">
                            "{item.errorSnippet}"
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase text-emerald-700 tracking-wider mb-0.5">
                              Target Correct Form
                            </p>
                            <p className="text-sm font-bold text-emerald-950">
                              "{item.correction}"
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSpeakText(item.correction)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-all"
                            title="Hear correct pronunciation"
                          >
                            <Volume2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Explanation */}
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">
                        <strong className="text-slate-800">Linguistic Context:</strong> {item.explanation}
                      </p>

                      {/* Source context */}
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-4">
                        <Clock size={12} /> Source: {item.sourceContext}
                      </p>
                    </div>

                    {/* Mastery Bar & Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex-1 max-w-[160px]">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                          <span>Mastery</span>
                          <span>{item.masteryScore}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.masteryScore >= 80
                                ? "bg-emerald-500"
                                : item.masteryScore >= 50
                                ? "bg-indigo-500"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${item.masteryScore}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleLaunchContextualRetest([item])}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                        >
                          <ShieldAlert size={13} />
                          <span>Re-test</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Remove from bank"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: LIVE CONTEXTUAL RE-TEST UNDER PRESSURE */}
      {activeTab === "retest_active" && (
        <div className="space-y-6">
          {isGeneratingScenario ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
              <RefreshCw size={36} className="text-indigo-600 animate-spin mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">
                Synthesizing Pressure Retest Scenario...
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Gemini is analyzing your error bank and embedding target structures into a high-stakes dialogue.
              </p>
            </div>
          ) : currentScenario ? (
            <div className="space-y-6">
              {/* Scenario Briefing Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert size={14} /> {currentScenario.pressureStakes}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-800 text-amber-300 font-bold px-2.5 py-1 rounded-full border border-slate-700 flex items-center gap-1">
                      <Clock size={12} /> Time Limit: {timerLeft}s
                    </span>
                  </div>
                </div>

                <h2 className="text-xl font-black font-serif text-white mb-2">
                  {currentScenario.title}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {currentScenario.briefing}
                </p>

                {/* Embedded Retest Targets Checklist */}
                <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/70">
                  <p className="text-[11px] font-black uppercase text-indigo-300 tracking-wider mb-2">
                    Implicit Linguistic Traps to Overcome (Retention Verification):
                  </p>
                  <div className="space-y-1.5">
                    {currentScenario.targetErrorsEmbedded?.map((tgt: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>
                          <strong className="text-white">{tgt.trapContext}</strong> (Target form:{" "}
                          <span className="text-emerald-400 font-semibold">{tgt.targetCorrectForm}</span>)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interlocutor Prompt */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      AI
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Interlocutor (Under Pressure)</p>
                      <p className="text-[11px] text-slate-500">Demanding immediate response</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSpeakText(currentScenario.interlocutorPrompt)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all flex items-center gap-1 text-xs font-bold"
                  >
                    <Volume2 size={16} />
                    <span>Listen</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-base font-semibold text-slate-800">
                  "{currentScenario.interlocutorPrompt}"
                </div>

                {/* User Response Area */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Your Spoken Defense / Response:
                  </label>
                  
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={userSpokenResponse}
                      onChange={(e) => setUserSpokenResponse(e.target.value)}
                      placeholder="Speak using the microphone or type your precise diplomatic and grammatically accurate response..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleToggleVoice}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                        isRecording
                          ? "bg-rose-600 text-white animate-pulse shadow-md shadow-rose-500/30"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                      }`}
                    >
                      {isRecording ? <MicOff size={15} /> : <Mic size={15} />}
                      <span>{isRecording ? "Listening (Click to Stop)..." : "Speak Response"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmitRetestResponse}
                      disabled={!userSpokenResponse.trim() || evaluatingResult}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      {evaluatingResult ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Auditing Linguistic Retention...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit & Verify Retention</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Retest Feedback Panel */}
              {retestFeedback && (
                <div
                  className={`rounded-2xl p-6 border shadow-sm space-y-4 animate-in fade-in ${
                    retestFeedback.passed
                      ? "bg-emerald-50/80 border-emerald-200"
                      : "bg-amber-50/80 border-amber-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {retestFeedback.passed ? (
                        <CheckCircle2 size={24} className="text-emerald-600" />
                      ) : (
                        <AlertTriangle size={24} className="text-amber-600" />
                      )}
                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          {retestFeedback.passed
                            ? "✅ Retest Succeeded: Mastery Level Elevated!"
                            : "⚠️ Partial Slip: Further Drill Recommended"}
                        </h4>
                        <p className="text-xs text-slate-600">
                          Retention Score: <strong>{retestFeedback.score || 80}/100</strong>
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-1 bg-white rounded-full border border-slate-200 shadow-2xs">
                      +{retestFeedback.passed ? "60" : "20"} XP Earned
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <p className="font-bold text-slate-900 mb-1">Applied Linguistic Feedback:</p>
                    <p>{retestFeedback.feedback || retestFeedback.grammarCheck}</p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleLaunchContextualRetest()}
                      className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-slate-800 transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw size={13} />
                      <span>Next Pressure Retest</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* VIEW 3: LOG CUSTOM SLIP */}
      {activeTab === "add_manual" && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-xl mx-auto space-y-5">
          <div>
            <h3 className="text-lg font-black text-slate-900">Log Specific Mistake to Memory Bank</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add any grammar slip, pronunciation hurdle, or colloquial crutch you want the AI to re-test you on in future sessions.
            </p>
          </div>

          <form onSubmit={handleAddManualSlip} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category:
              </label>
              <select
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value as ErrorSlipCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
              >
                <option value="Grammar & Syntax">Grammar & Syntax</option>
                <option value="Pronunciation & Phonetics">Pronunciation & Phonetics</option>
                <option value="Pragmatics & Register">Pragmatics & Register</option>
                <option value="Vocabulary & Jargon">Vocabulary & Jargon</option>
                <option value="Fluency & Fillers">Fluency & Fillers</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                The Mistake / Slip Phrase:
              </label>
              <input
                type="text"
                value={manualError}
                onChange={(e) => setManualError(e.target.value)}
                placeholder="e.g., 'He don't know the answer' or 'comfort-table'"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correct Form:
              </label>
              <input
                type="text"
                value={manualCorrection}
                onChange={(e) => setManualCorrection(e.target.value)}
                placeholder="e.g., 'He doesn't know the answer' or '/ˈkʌmftərbəl/'"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Explanation & Linguistic Rule (Optional):
              </label>
              <textarea
                rows={2}
                value={manualExplanation}
                onChange={(e) => setManualExplanation(e.target.value)}
                placeholder="e.g., 3rd-person singular requires 'doesn't' in present tense negation."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("bank")}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Save to Memory Bank</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
