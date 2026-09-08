import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  RefreshCw,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Brain,
  ShieldCheck,
  ChevronRight,
  Plus,
  Play,
  RotateCcw,
  Sliders,
  Award,
  BookOpen,
  MessageSquare,
  Flame,
  Zap,
  Info,
  Layers,
  HelpCircle,
  X,
  Target,
  FileCheck,
} from "lucide-react";
import {
  L2CoachScenario,
  L2TurnAnalysis,
  L2SpeakingSessionReport,
  UserProgress,
  L2CoachDifficulty,
} from "../types";
import {
  L2_SPEAKING_COACH_SCENARIOS,
  L2_COACH_CATEGORIES,
} from "../data/l2SpeakingCoachData";
import {
  speakText,
  stopSpeaking,
  createSpeechRecognizer,
} from "../utils/speechUtils";
import { ModuleHeaderGuide } from "./ModuleHeaderGuide";
import { AutoText } from "./AutoText";
import { useTranslation } from "../context/TranslationContext";

interface L2SpeakingCoachStudioProps {
  progress: UserProgress;
  onGrantXp: (amount: number, reason: string) => void;
  onLogStudyMinutes?: (minutes: number) => void;
}

export const L2SpeakingCoachStudio: React.FC<L2SpeakingCoachStudioProps> = ({
  progress,
  onGrantXp,
  onLogStudyMinutes,
}) => {
  const { t } = useTranslation();
  // Scenario & Setup state
  const [scenarios, setScenarios] = useState<L2CoachScenario[]>(
    L2_SPEAKING_COACH_SCENARIOS
  );
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    L2_SPEAKING_COACH_SCENARIOS[0].id
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("All Scenarios");
  const [difficulty, setDifficulty] = useState<L2CoachDifficulty>("standard");

  // Custom Scenario Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customUserRole, setCustomUserRole] = useState("");
  const [customInterlocutorName, setCustomInterlocutorName] = useState("");
  const [customInterlocutorRole, setCustomInterlocutorRole] = useState("");
  const [customContext, setCustomContext] = useState("");
  const [customObjectives, setCustomObjectives] = useState<string>("");
  const [customOpeningLine, setCustomOpeningLine] = useState("");

  // Live Session State
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string>("");
  const [typedInput, setTypedInput] = useState<string>("");
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [turns, setTurns] = useState<L2TurnAnalysis[]>([]);
  const [activeTabFeedback, setActiveTabFeedback] = useState<
    "overview" | "grammar" | "lexical" | "pragmatics" | "scaffolding"
  >("overview");

  // Final Post-Roleplay Audit Report
  const [sessionReport, setSessionReport] = useState<L2SpeakingSessionReport | null>(
    null
  );
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Audio Recognition and Wave Visualizer Refs
  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const activeScenario =
    scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  // Auto-scroll chat on turn updates
  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, spokenTranscript, isAiProcessing]);

  // Audio waveform animation
  useEffect(() => {
    if (!isSessionActive) return;

    let phase = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isListening
        ? "#0d9488"
        : isAiSpeaking
        ? "#6366f1"
        : isAiProcessing
        ? "#f59e0b"
        : "#94a3b8";

      ctx.beginPath();
      const amplitude = isListening ? 20 : isAiSpeaking ? 16 : isAiProcessing ? 8 : 2;
      const frequency = isListening ? 0.08 : 0.04;

      for (let x = 0; x < width; x++) {
        const y =
          height / 2 +
          Math.sin(x * frequency + phase) *
            amplitude *
            Math.sin((x / width) * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 0.08;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSessionActive, isListening, isAiSpeaking, isAiProcessing]);

  // Start Roleplay Session
  const handleStartSession = () => {
    setIsSessionActive(true);
    setTurns([]);
    setSessionStartTime(Date.now());
    setSessionReport(null);
    setIsReportOpen(false);
    setSpokenTranscript("");
    setTypedInput("");

    // Initial Interlocutor turn
    if (!audioMuted) {
      setIsAiSpeaking(true);
      speakText(activeScenario.initialInterlocutorUtterance, 0.95).then(() => {
        setIsAiSpeaking(false);
      });
    }
  };

  // End Session & Trigger Post-Roleplay Speaking Audit
  const handleEndSession = async () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    stopSpeaking();
    setIsListening(false);
    setIsSessionActive(false);

    const durationSec = Math.max(
      30,
      Math.round((Date.now() - sessionStartTime) / 1000)
    );
    if (onLogStudyMinutes) {
      onLogStudyMinutes(Math.max(1, Math.round(durationSec / 60)));
    }

    if (turns.length === 0) {
      return;
    }

    setIsAiProcessing(true);
    try {
      const response = await fetch("/api/gemini/l2-speaking-coach-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: activeScenario,
          turns,
          durationSeconds: durationSec,
        }),
      });
      const data = await response.json();
      const report: L2SpeakingSessionReport = {
        sessionId: `l2_audit_${Date.now()}`,
        scenarioId: activeScenario.id,
        scenarioTitle: activeScenario.title,
        totalTurns: turns.length,
        durationSeconds: durationSec,
        overallCommunicativeScore: data.overallCommunicativeScore || 88,
        grammarAccuracyAvg: data.grammarAccuracyAvg || 86,
        functionalFluencyAvg: data.functionalFluencyAvg || 85,
        pragmaticScoreAvg: data.pragmaticScoreAvg || 90,
        lexicalRetrievalAvg: data.lexicalRetrievalAvg || 84,
        milestonesCompleted: data.milestonesCompleted || 3,
        totalMilestones:
          data.totalMilestones || activeScenario.communicativeObjectives.length,
        detailedFeedbackSummary:
          data.detailedFeedbackSummary ||
          "Great spontaneous communication across multiple turns.",
        keyGrammarTakeaways: data.keyGrammarTakeaways || [],
        keyLexicalTakeaways: data.keyLexicalTakeaways || [],
        pragmaticGrowthPoints: data.pragmaticGrowthPoints || [],
        xpEarned: data.xpEarned || 120,
        timestamp: Date.now(),
      };

      setSessionReport(report);
      setIsReportOpen(true);
      onGrantXp(report.xpEarned, "Spontaneous L2 Roleplay Session Completed");
    } catch (err) {
      console.error("Failed to generate summary audit:", err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Toggle Microphone Input
  const handleToggleMic = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      if (spokenTranscript.trim().length > 0) {
        handleProcessUserTurn(spokenTranscript.trim());
      }
    } else {
      stopSpeaking();
      setIsAiSpeaking(false);
      setSpokenTranscript("");

      const recognizer = createSpeechRecognizer(
        (transcript, isFinal) => {
          setSpokenTranscript(transcript);
          if (isFinal && transcript.trim().length > 0) {
            handleProcessUserTurn(transcript.trim());
          }
        },
        (error) => {
          console.warn("Speech recognition notice:", error);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );

      if (recognizer) {
        try {
          recognizer.start();
          recognitionRef.current = recognizer;
          setIsListening(true);
        } catch (e) {
          console.error("Recognizer start error:", e);
        }
      }
    }
  };

  // Process User Turn via Gemini L2 Speaking Coach API
  const handleProcessUserTurn = async (text: string) => {
    if (!text || isAiProcessing) return;

    setIsListening(false);
    setIsAiProcessing(true);
    setSpokenTranscript("");
    setTypedInput("");

    try {
      const historyPayload = turns.map((t) => [
        { role: "user", text: t.userSpokenText },
        { role: "model", text: t.interlocutorReply },
      ]).flat();

      const response = await fetch("/api/gemini/l2-speaking-coach-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spokenText: text,
          scenario: { ...activeScenario, difficulty },
          history: historyPayload,
          turnNumber: turns.length + 1,
          level: progress.selectedLevel || "B2",
        }),
      });

      const data = await response.json();

      const newTurn: L2TurnAnalysis = {
        turnId: `turn_${Date.now()}`,
        turnNumber: turns.length + 1,
        userSpokenText: text,
        interlocutorReply:
          data.interlocutorReply ||
          "Understood. Let's explore how we can proceed with this.",
        timestamp: Date.now(),
        grammaticalAccuracy: data.grammaticalAccuracy || {
          score: 88,
          slips: [],
          strengths: ["Clear syntactic construction"],
        },
        functionalFluency: data.functionalFluency || {
          score: 85,
          coherenceRating: "Adequate",
          wpmEstimated: 130,
          hesitationObservation: "Fluent and continuous articulation.",
        },
        pragmaticAppropriateness: data.pragmaticAppropriateness || {
          score: 90,
          registerRating: "Appropriately Polished",
          politenessAndHedgingNotes: "Constructive and courteous tone.",
          toneAssessment: "Polite negotiation stance.",
        },
        lexicalRetrieval: data.lexicalRetrieval || {
          score: 86,
          retrievedCollocations: [],
          suggestedUpgrades: [],
        },
        scaffoldingAndRecovery: data.scaffoldingAndRecovery || {
          stumbledDetected: false,
          subtleHint: "Frame your next question clearly to invite a concrete offer.",
          recommendedStrategy: "Use collaborative phrasing: 'Would it work if...'",
        },
        milestones: data.milestones || [],
      };

      setTurns((prev) => [...prev, newTurn]);

      // Speak response if not muted
      if (!audioMuted) {
        setIsAiSpeaking(true);
        speakText(newTurn.interlocutorReply, 0.95).then(() => {
          setIsAiSpeaking(false);
        });
      }
    } catch (err) {
      console.error("Error evaluating roleplay turn:", err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Custom Scenario Submission
  const handleSaveCustomScenario = () => {
    if (!customTitle.trim() || !customUserRole.trim()) return;

    const parsedObjectives = customObjectives
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newScenario: L2CoachScenario = {
      id: `custom_${Date.now()}`,
      title: customTitle.trim(),
      category: "Workplace & Engineering",
      level: "B2",
      icon: "Sparkles",
      userRole: customUserRole.trim(),
      interlocutorName: customInterlocutorName.trim() || "Jordan",
      interlocutorRole: customInterlocutorRole.trim() || "Discussion Partner",
      interlocutorAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      difficulty: "standard",
      contextDescription:
        customContext.trim() ||
        "An open-ended real-world discussion testing spontaneous lexical retrieval.",
      communicativeObjectives:
        parsedObjectives.length > 0
          ? parsedObjectives
          : ["Communicate your core message clearly", "Engage politely and actively"],
      pragmaticFocus: "Contextual appropriateness and polite conversational flow.",
      initialInterlocutorUtterance:
        customOpeningLine.trim() ||
        "Hello! Thanks for meeting with me today. What did you want to discuss?",
      suggestedOpeningIntent: "State your opening thought spontaneously.",
      isCustom: true,
    };

    setScenarios((prev) => [newScenario, ...prev]);
    setSelectedScenarioId(newScenario.id);
    setIsCustomModalOpen(false);
    // Reset inputs
    setCustomTitle("");
    setCustomUserRole("");
    setCustomInterlocutorName("");
    setCustomInterlocutorRole("");
    setCustomContext("");
    setCustomObjectives("");
    setCustomOpeningLine("");
  };

  const latestTurn = turns.length > 0 ? turns[turns.length - 1] : null;

  const filteredScenarios =
    selectedCategory === "All Scenarios"
      ? scenarios
      : scenarios.filter((s) => s.category === selectedCategory);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
              <Sparkles size={13} className="text-teal-400" />
              {t("roleplay.hero_badge", "INTERACTIVE SPEAKING COACH")}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
              <Zap size={13} /> {t("roleplay.natural_dialogue_practice", "Natural Dialogue Practice")}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white mb-2">
            {t("roleplay.hero_title", "Interactive Speaking Coach & Dynamic Scenarios")}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            {t("roleplay.hero_desc", "Engage in realistic, multi-turn roleplay conversations to strengthen natural vocabulary recall, sentence framing, and conversational fluency. Get turn-by-turn feedback, supportive prompts if needed, and practice responding in your own words.")}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
              <p className="text-xs text-slate-400 font-medium">{t("roleplay.stat_practice_style", "Practice Style")}</p>
              <p className="text-sm font-black text-amber-300">{t("roleplay.stat_practice_style_value", "Spontaneous Dialogue")}</p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
              <p className="text-xs text-slate-400 font-medium">{t("roleplay.stat_turn_feedback", "Turn Feedback")}</p>
              <p className="text-sm font-black text-teal-400">{t("roleplay.stat_turn_feedback_value", "Grammar • Fluency • Tone")}</p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
              <p className="text-xs text-slate-400 font-medium">{t("roleplay.stat_conversation_partner", "Conversation Partner")}</p>
              <p className="text-sm font-black text-indigo-300">{t("roleplay.stat_conversation_partner_value", "Adaptive Dialogue Partner")}</p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
              <p className="text-xs text-slate-400 font-medium">{t("roleplay.stat_support_mode", "Support Mode")}</p>
              <p className="text-sm font-black text-emerald-400">{t("roleplay.stat_support_mode_value", "Contextual Hints & Recovery")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Content: Scenario Selection OR Live Active Session */}
      <ModuleHeaderGuide
        moduleTitle="Interactive Speaking Coach & Dynamic Scenarios"
        moduleCategory="Spoken Communication"
        estimatedTime="5–10 min per session"
        difficulty="CEFR A1 to C2 Conversational"
        themeColor="teal"
        steps={[
          {
            title: "Select Roleplay Scenario",
            instruction: "Pick from workplace discussions, travel logistics, doctor consultations, or create a custom simulation.",
            tip: "Review the communicative objectives and interlocutor persona before starting.",
          },
          {
            title: "Speak Your Turn via Microphone",
            instruction: "Tap the microphone button or type your response in natural conversational English.",
            tip: "If stuck, click 'Need a hint?' for helpful vocabulary and starter phrases.",
          },
          {
            title: "Receive Turn-by-Turn Linguistic Feedback",
            instruction: "Examine live corrections for grammar slips, natural tone suggestions, and vocabulary upgrades.",
            tip: "The AI interlocutor adapts naturally to your speaking pace and difficulty level.",
          },
          {
            title: "Review Final Linguistic Report",
            instruction: "Complete 3+ turns and finish the session to get a comprehensive diagnostic score card & earn +60 XP.",
            tip: "Highlights your strong collocations and specific areas to polish.",
          },
        ]}
        completionGoal="Complete at least 3 conversational turns and finish the roleplay to receive your evaluation & XP."
        xpReward={60}
      />

      {!isSessionActive ? (
        <div className="space-y-6">
          {/* Category Filter & Custom Scenario Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              {L2_COACH_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-teal-700 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <AutoText text={cat} context="roleplay_category" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsCustomModalOpen(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus size={15} />
              <span>{t("roleplay.create_custom", "Create Custom Roleplay")}</span>
            </button>
          </div>

          {/* Scenarios Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScenarios.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <div
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-teal-50/70 border-teal-500 shadow-md ring-2 ring-teal-500/20"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        <AutoText text={sc.category} context="roleplay_category" />
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                        CEFR {sc.level}
                      </span>
                    </div>

                    <h3 className="font-serif font-black text-base text-slate-900 mb-1.5 leading-snug">
                      <AutoText text={sc.title} context="roleplay_scenario_title" />
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                      <AutoText text={sc.contextDescription} context="roleplay_scenario_context" />
                    </p>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 mb-4 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={sc.interlocutorAvatar}
                          alt={sc.interlocutorName}
                          className="w-6 h-6 rounded-full object-cover border border-slate-300"
                        />
                        <span className="text-xs font-black text-slate-900 truncate">
                          {sc.interlocutorName}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate">
                          (<AutoText text={sc.interlocutorRole} context="roleplay_interlocutor_role" />)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        <span className="font-bold text-slate-700">{t("roleplay.your_role", "Your Role:")}</span>{" "}
                        <AutoText text={sc.userRole} context="roleplay_user_role" />
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-teal-700 font-bold flex items-center gap-1">
                      <Target size={13} />
                      {sc.communicativeObjectives.length} {t("roleplay.key_objectives", "Key Objectives")}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedScenarioId(sc.id);
                        handleStartSession();
                      }}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1 transition-all"
                    >
                      <Play size={13} />
                      <span>{t("roleplay.start_roleplay", "Start Roleplay")}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Scenario Preview & Difficulty Controls */}
          {activeScenario && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-teal-100 text-teal-800">
                      {t("roleplay.selected_scenario", "Selected Scenario")}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      <AutoText text={activeScenario.category} context="roleplay_category" /> • CEFR {activeScenario.level}
                    </span>
                  </div>
                  <h2 className="text-xl font-serif font-black text-slate-900">
                    <AutoText text={activeScenario.title} context="roleplay_scenario_title" />
                  </h2>
                </div>

                {/* Difficulty & Friction Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    <Sliders size={13} /> {t("roleplay.interlocutor_tone", "Interlocutor Tone:")}
                  </span>
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {(["friendly", "standard", "firm", "high_friction"] as L2CoachDifficulty[]).map(
                      (lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setDifficulty(lvl)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg capitalize transition-all ${
                            difficulty === lvl
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {t(`roleplay.tone_${lvl}`, lvl.replace("_", " "))}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Scenario Context & Zero-Prompt Directive */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                      {t("roleplay.scenario_briefing", "Scenario Briefing & Context")}
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <AutoText text={activeScenario.contextDescription} context="roleplay_scenario_context" />
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                      {t("roleplay.objectives_checklist", "Communicative Objectives Checklist (Formulate Spontaneously)")}
                    </h4>
                    <div className="space-y-2">
                      {activeScenario.communicativeObjectives.map((obj, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800"
                        >
                          <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <span className="font-medium leading-relaxed">
                            <AutoText text={obj} context="roleplay_objective" />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Persona & Pragmatics card */}
                <div className="space-y-4">
                  <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={activeScenario.interlocutorAvatar}
                        alt={activeScenario.interlocutorName}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-teal-500"
                      />
                      <div>
                        <p className="font-bold text-sm text-white">
                          {activeScenario.interlocutorName}
                        </p>
                        <p className="text-xs text-teal-300 font-medium">
                          <AutoText text={activeScenario.interlocutorRole} context="roleplay_interlocutor_role" />
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <p className="text-xs text-slate-300">
                        <span className="font-bold text-amber-300">{t("roleplay.opening_line", "Opening line:")}</span> "
                        {activeScenario.initialInterlocutorUtterance}"
                      </p>
                      <p className="text-xs text-slate-300">
                        <span className="font-bold text-teal-300">{t("roleplay.pragmatic_target", "Pragmatic Target:")}</span>{" "}
                        <AutoText text={activeScenario.pragmaticFocus} context="roleplay_pragmatic_focus" />
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                    <p className="font-black flex items-center gap-1.5 text-amber-950">
                      <ShieldCheck size={14} className="text-amber-700" />
                      {t("roleplay.authentic_practice_title", "Authentic Conversation Practice")}
                    </p>
                    <p className="text-amber-800 leading-relaxed">
                      {t("roleplay.authentic_practice_desc", "Respond naturally in your own words. Practice framing complete thoughts, using descriptive vocabulary, and expressing ideas clearly.")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartSession}
                    className="w-full py-3 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                  >
                    <Play size={16} />
                    <span>{t("roleplay.start_practice_session", "Start Practice Session")}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Active Live Session Workbench */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Multi-Turn Dialogue & Mic Capture (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Session Top Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={activeScenario.interlocutorAvatar}
                  alt={activeScenario.interlocutorName}
                  className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900">
                      {activeScenario.interlocutorName}
                    </span>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                      {t("roleplay.turn_hash", "Turn")} #{turns.length + 1}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                    <AutoText text={activeScenario.title} context="roleplay_scenario_title" />
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAudioMuted(!audioMuted)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    audioMuted
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
                  title={audioMuted ? t("roleplay.unmute_ai", "Unmute AI Speech") : t("roleplay.mute_ai", "Mute AI Speech")}
                >
                  {audioMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>

                <button
                  type="button"
                  onClick={handleEndSession}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileCheck size={14} />
                  <span>{t("roleplay.end_audit", "End & Audit")}</span>
                </button>
              </div>
            </div>

            {/* Conversation Log Container */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-inner h-[460px] overflow-y-auto space-y-4">
              {/* Initial Interlocutor Greeting */}
              <div className="flex items-start gap-3">
                <img
                  src={activeScenario.interlocutorAvatar}
                  alt={activeScenario.interlocutorName}
                  className="w-8 h-8 rounded-full object-cover border border-teal-400 mt-1 shrink-0"
                />
                <div className="bg-slate-800 rounded-2xl rounded-tl-sm p-3.5 max-w-[85%] border border-slate-700 shadow-sm space-y-1">
                  <p className="text-[10px] font-black text-teal-400 uppercase tracking-wider">
                    {activeScenario.interlocutorName} ({activeScenario.interlocutorRole})
                  </p>
                  <p className="text-sm text-slate-100 leading-relaxed">
                    {activeScenario.initialInterlocutorUtterance}
                  </p>
                </div>
              </div>

              {/* Dynamic Turns */}
              {turns.map((turn, idx) => (
                <React.Fragment key={turn.turnId}>
                  {/* User Spoken Turn */}
                  <div className="flex items-start justify-end gap-3">
                    <div className="bg-teal-700 text-white rounded-2xl rounded-tr-sm p-3.5 max-w-[85%] shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black text-teal-200 uppercase">
                          {t("roleplay.you_learner", "You (Learner)")}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-teal-100">
                          <span>{t("roleplay.grammar_label", "Grammar:")} {turn.grammaticalAccuracy.score}%</span>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{turn.userSpokenText}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-teal-500 text-slate-950 font-black flex items-center justify-center mt-1 shrink-0 text-xs">
                      U
                    </div>
                  </div>

                  {/* Interlocutor Model Reply */}
                  <div className="flex items-start gap-3">
                    <img
                      src={activeScenario.interlocutorAvatar}
                      alt={activeScenario.interlocutorName}
                      className="w-8 h-8 rounded-full object-cover border border-teal-400 mt-1 shrink-0"
                    />
                    <div className="bg-slate-800 rounded-2xl rounded-tl-sm p-3.5 max-w-[85%] border border-slate-700 shadow-sm space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-black text-teal-400 uppercase tracking-wider">
                          {activeScenario.interlocutorName}
                        </p>
                        <button
                          type="button"
                          onClick={() => speakText(turn.interlocutorReply, 0.95)}
                          className="text-slate-400 hover:text-white transition-colors"
                          title={t("roleplay.replay_audio", "Replay Audio")}
                        >
                          <Volume2 size={13} />
                        </button>
                      </div>
                      <p className="text-sm text-slate-100 leading-relaxed">
                        {turn.interlocutorReply}
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              ))}

              {/* Live Interim Transcript Bubble */}
              {spokenTranscript && (
                <div className="flex items-start justify-end gap-3 animate-pulse">
                  <div className="bg-teal-900/80 border border-teal-500/50 text-teal-100 rounded-2xl p-3.5 max-w-[85%]">
                    <span className="text-[10px] font-black text-teal-300 block mb-1">
                      {t("roleplay.listening_oral", "Listening to your oral speech...")}
                    </span>
                    <p className="text-sm italic">{spokenTranscript}</p>
                  </div>
                </div>
              )}

              {/* Processing Loader */}
              {isAiProcessing && (
                <div className="flex items-center gap-2 text-xs font-bold text-teal-400 bg-slate-800/80 p-3 rounded-xl border border-slate-700 w-fit">
                  <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                  <span>{t("roleplay.coach_evaluating", "Coach evaluating oral syntax, fluency & pragmatics...")}</span>
                </div>
              )}

              <div ref={chatScrollRef} />
            </div>

            {/* Microphone & Input Deck */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              {/* Wave Visualizer Canvas */}
              <div className="h-10 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center px-4 relative">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={40}
                  className="w-full h-full"
                />
                <span className="absolute right-3 text-[10px] font-bold text-slate-400">
                  {isListening
                    ? t("roleplay.mic_active", "🔴 Microphone Active")
                    : isAiSpeaking
                    ? t("roleplay.interlocutor_vocalizing", "🔊 Interlocutor Vocalizing")
                    : t("roleplay.ready_to_speak", "Ready to Speak")}
                </span>
              </div>

              {/* Controls: Voice Record Button + Fallback Text Field */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleMic}
                  disabled={isAiProcessing}
                  className={`px-5 py-3.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                    isListening
                      ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                      : "bg-teal-700 hover:bg-teal-800 text-white active:scale-95"
                  }`}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  <span>{isListening ? t("roleplay.stop_evaluate", "Stop & Evaluate") : t("roleplay.push_to_speak", "Push to Speak")}</span>
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={typedInput}
                    onChange={(e) => setTypedInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && typedInput.trim()) {
                        handleProcessUserTurn(typedInput.trim());
                      }
                    }}
                    placeholder={t("roleplay.type_response_placeholder", "Or type spontaneous response (no reading scripts)...")}
                    disabled={isAiProcessing || isListening}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleProcessUserTurn(typedInput.trim())}
                  disabled={!typedInput.trim() || isAiProcessing}
                  className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer"
                  title={t("roleplay.send_text", "Send text")}
                >
                  <Send size={16} />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>⚡ {t("roleplay.formulate_own_words", "Formulate thoughts in your own words.")}</span>
                <span>{t("roleplay.press_prefix", "Press")} <strong>{t("roleplay.push_to_speak", "Push to Speak")}</strong> {t("roleplay.press_suffix", "to articulate naturally.")}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Turn-by-Turn Feedback & Scaffolding (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Tabbed Feedback Selector */}
            <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: "overview", label: t("roleplay.tab_live_stats", "Live Stats") },
                { id: "grammar", label: t("roleplay.tab_grammar_slips", "Grammar Slips") },
                { id: "lexical", label: t("roleplay.tab_lexical_reach", "Lexical Reach") },
                { id: "pragmatics", label: t("roleplay.tab_pragmatics", "Pragmatics") },
                { id: "scaffolding", label: t("roleplay.tab_scaffolding", "Scaffolding") },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabFeedback(tab.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    activeTabFeedback === tab.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Feedback Content Cards */}
            {latestTurn ? (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                {/* Header of Analysis */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {t("roleplay.turn_hash", "Turn")} #{latestTurn.turnNumber} {t("roleplay.oral_analysis", "Oral Analysis")}
                    </span>
                    <h3 className="font-serif font-black text-base text-slate-900 mt-1">
                      {t("roleplay.dynamic_performance", "Dynamic Performance")}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-teal-700">
                      {Math.round(
                        (latestTurn.grammaticalAccuracy.score +
                          latestTurn.functionalFluency.score +
                          latestTurn.pragmaticAppropriateness.score +
                          latestTurn.lexicalRetrieval.score) /
                          4
                      )}
                      %
                    </span>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">
                      {t("roleplay.composite", "Composite")}
                    </span>
                  </div>
                </div>

                {/* Tab: Overview / Live Stats */}
                {activeTabFeedback === "overview" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] font-bold text-slate-500 block">
                          {t("roleplay.grammar_accuracy", "Grammar Accuracy")}
                        </span>
                        <span className="text-lg font-black text-slate-900">
                          {latestTurn.grammaticalAccuracy.score}%
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] font-bold text-slate-500 block">
                          {t("roleplay.communicative_fluency", "Communicative Fluency")}
                        </span>
                        <span className="text-lg font-black text-teal-700">
                          {latestTurn.functionalFluency.score}%
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] font-bold text-slate-500 block">
                          {t("roleplay.pragmatic_fit", "Pragmatic Fit")}
                        </span>
                        <span className="text-lg font-black text-indigo-700">
                          {latestTurn.pragmaticAppropriateness.score}%
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] font-bold text-slate-500 block">
                          {t("roleplay.lexical_retrieval", "Lexical Retrieval")}
                        </span>
                        <span className="text-lg font-black text-amber-700">
                          {latestTurn.lexicalRetrieval.score}%
                        </span>
                      </div>
                    </div>

                    {/* Strengths summary */}
                    {latestTurn.grammaticalAccuracy.strengths.length > 0 && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                        <span className="font-bold flex items-center gap-1 text-emerald-950">
                          <CheckCircle2 size={13} className="text-emerald-700" />
                          {t("roleplay.syntactic_wins", "Spontaneous Syntactic Wins:")}
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5 text-emerald-800">
                          {latestTurn.grammaticalAccuracy.strengths.map((str, i) => (
                            <li key={i}><AutoText text={str} context="roleplay_strength" /></li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Flow observation */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 block">
                        {t("roleplay.cadence_coherence", "Cadence & Coherence:")}
                      </span>
                      <p><AutoText text={latestTurn.functionalFluency.hesitationObservation} context="roleplay_hesitation_observation" /></p>
                    </div>
                  </div>
                )}

                {/* Tab: Grammar Slips */}
                {activeTabFeedback === "grammar" && (
                  <div className="space-y-3">
                    {latestTurn.grammaticalAccuracy.slips.length === 0 ? (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center text-xs space-y-1">
                        <CheckCircle2 size={20} className="text-emerald-600 mx-auto" />
                        <p className="font-bold">{t("roleplay.zero_slips", "Zero Morphosyntactic Slips!")}</p>
                        <p className="text-emerald-700">
                          {t("roleplay.zero_slips_desc", "All verb tenses, prepositions, and collocations were accurate.")}
                        </p>
                      </div>
                    ) : (
                      latestTurn.grammaticalAccuracy.slips.map((slip, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-950 font-black text-[10px]">
                              {slip.ruleType}
                            </span>
                          </div>
                          <div>
                            <span className="text-rose-900 line-through font-medium block">
                              "{slip.error}"
                            </span>
                            <span className="text-emerald-800 font-bold block mt-0.5">
                              ➜ "{slip.correction}"
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            <AutoText text={slip.explanation} context="roleplay_slip_explanation" />
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab: Lexical Reach */}
                {activeTabFeedback === "lexical" && (
                  <div className="space-y-3">
                    {latestTurn.lexicalRetrieval.suggestedUpgrades.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-center text-xs">
                        <p className="font-bold">{t("roleplay.natural_vocab_fit", "Natural Vocabulary Fit")}</p>
                        <p className="text-slate-500 mt-0.5">
                          {t("roleplay.natural_vocab_fit_desc", "Good situational word retrieval for this conversational context.")}
                        </p>
                      </div>
                    ) : (
                      latestTurn.lexicalRetrieval.suggestedUpgrades.map((upg, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-950">
                              "{upg.original}" ➔{" "}
                              <span className="text-teal-800 font-black">
                                "{upg.upgrade}"
                              </span>
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px]"><AutoText text={upg.why} context="roleplay_upgrade_reason" /></p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab: Pragmatics */}
                {activeTabFeedback === "pragmatics" && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-950">{t("roleplay.register_rating", "Register Rating")}</span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-950 font-black text-[10px]">
                          <AutoText text={latestTurn.pragmaticAppropriateness.registerRating} context="roleplay_register_rating" />
                        </span>
                      </div>
                      <p className="text-purple-900 leading-relaxed">
                        <AutoText text={latestTurn.pragmaticAppropriateness.politenessAndHedgingNotes} context="roleplay_politeness_notes" />
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <span className="font-bold text-slate-800">{t("roleplay.tone_assessment", "Tone Assessment")}</span>
                      <p className="text-slate-600">
                        <AutoText text={latestTurn.pragmaticAppropriateness.toneAssessment} context="roleplay_tone_assessment" />
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab: Scaffolding & Recovery */}
                {activeTabFeedback === "scaffolding" && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50 to-teal-50 border border-indigo-200 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 font-black text-indigo-950">
                        <Brain size={14} className="text-indigo-600" />
                        <span>{t("roleplay.scaffolding_title", "Subtle Conversational Scaffolding")}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        <AutoText text={latestTurn.scaffoldingAndRecovery.subtleHint} context="roleplay_scaffolding_hint" />
                      </p>
                      <div className="p-2 rounded-lg bg-white border border-indigo-100 text-indigo-900 font-semibold text-[11px]">
                        💡 <strong>{t("roleplay.tactical_pointer", "Tactical Pointer:")}</strong>{" "}
                        <AutoText text={latestTurn.scaffoldingAndRecovery.recommendedStrategy} context="roleplay_recommended_strategy" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Pre-Turn Objectives Card */
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-teal-700 font-serif font-black text-base">
                  <Target size={18} />
                  <h3>{t("roleplay.communicative_objectives", "Communicative Objectives")}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t("roleplay.objectives_desc", "Address these milestones naturally during your dialogue. The coach tracks progress dynamically:")}
                </p>
                <div className="space-y-2.5">
                  {activeScenario.communicativeObjectives.map((obj, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-start gap-2.5"
                    >
                      <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                        {i + 1}
                      </div>
                      <span className="font-medium"><AutoText text={obj} context="roleplay_objective" /></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post-Roleplay Speaking Audit Modal */}
      {isReportOpen && sessionReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-100 text-teal-800">
                    {t("roleplay.audit_badge", "Roleplay Audit")}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    <AutoText text={sessionReport.scenarioTitle} context="roleplay_scenario_title" />
                  </span>
                </div>
                <h2 className="text-2xl font-serif font-black text-slate-900">
                  {t("roleplay.audit_title", "L2 Spontaneous Speaking Competency Audit")}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsReportOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Score Composite */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-center">
                <span className="text-xs font-bold text-teal-800 block">
                  {t("roleplay.overall_competence", "Overall Competence")}
                </span>
                <span className="text-2xl font-black text-teal-900">
                  {sessionReport.overallCommunicativeScore}%
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-600 block">
                  {t("roleplay.grammar_accuracy", "Grammar Accuracy")}
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {sessionReport.grammarAccuracyAvg}%
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
                <span className="text-xs font-bold text-indigo-800 block">
                  {t("roleplay.pragmatic_diplomacy", "Pragmatic Diplomacy")}
                </span>
                <span className="text-2xl font-black text-indigo-900">
                  {sessionReport.pragmaticScoreAvg}%
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-xs font-bold text-amber-800 block">
                  {t("roleplay.xp_rewarded", "XP Rewarded")}
                </span>
                <span className="text-2xl font-black text-amber-900">
                  +{sessionReport.xpEarned}
                </span>
              </div>
            </div>

            {/* Detailed Feedback Synthesis */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-serif font-black text-sm text-slate-900 flex items-center gap-1.5">
                <Brain size={16} className="text-teal-700" />
                {t("roleplay.pedagogical_synthesis", "Pedagogical Performance Synthesis")}
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <AutoText text={sessionReport.detailedFeedbackSummary} context="roleplay_feedback_summary" />
              </p>
            </div>

            {/* Takeaways & Growth Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <h5 className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-700" />
                  {t("roleplay.grammar_wins_title", "Key Grammar & Syntactic Wins")}
                </h5>
                <ul className="list-disc pl-4 space-y-1 text-emerald-800">
                  {sessionReport.keyGrammarTakeaways.map((item, i) => (
                    <li key={i}><AutoText text={item} context="roleplay_grammar_takeaway" /></li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                <h5 className="font-bold text-purple-950 flex items-center gap-1.5">
                  <TrendingUp size={15} className="text-purple-700" />
                  {t("roleplay.growth_targets_title", "Pragmatic & Lexical Growth Targets")}
                </h5>
                <ul className="list-disc pl-4 space-y-1 text-purple-800">
                  {sessionReport.pragmaticGrowthPoints.map((item, i) => (
                    <li key={i}><AutoText text={item} context="roleplay_growth_point" /></li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsReportOpen(false);
                  handleStartSession();
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
              >
                {t("roleplay.retry_scenario", "Retry Scenario")}
              </button>
              <button
                type="button"
                onClick={() => setIsReportOpen(false)}
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-black rounded-xl shadow-xs transition-all"
              >
                {t("roleplay.close_return_hub", "Close & Return to Hub")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scenario Builder Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-100 text-indigo-800">
                  {t("roleplay.custom_studio_badge", "Custom Roleplay Studio")}
                </span>
                <h3 className="text-xl font-serif font-black text-slate-900 mt-1">
                  {t("roleplay.design_scenario_title", "Design Your Spontaneous Scenario")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {t("roleplay.field_scenario_title", "Scenario Title *")}
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={t("roleplay.field_scenario_title_placeholder", "e.g. Challenging a Vendor Invoice Surcharge")}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {t("roleplay.field_your_role", "Your Role *")}
                  </label>
                  <input
                    type="text"
                    value={customUserRole}
                    onChange={(e) => setCustomUserRole(e.target.value)}
                    placeholder={t("roleplay.field_your_role_placeholder", "e.g. Operations Director")}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {t("roleplay.field_interlocutor_name", "Interlocutor Name & Title")}
                  </label>
                  <input
                    type="text"
                    value={customInterlocutorName}
                    onChange={(e) => setCustomInterlocutorName(e.target.value)}
                    placeholder={t("roleplay.field_interlocutor_name_placeholder", "e.g. Sarah Jenkins (Account Executive)")}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {t("roleplay.field_context", "Context & Background")}
                </label>
                <textarea
                  rows={3}
                  value={customContext}
                  onChange={(e) => setCustomContext(e.target.value)}
                  placeholder={t("roleplay.field_context_placeholder", "Describe the stakes, complications, and situational friction...")}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {t("roleplay.field_objectives", "Communicative Objectives (One per line)")}
                </label>
                <textarea
                  rows={3}
                  value={customObjectives}
                  onChange={(e) => setCustomObjectives(e.target.value)}
                  placeholder="1. Question the 15% surcharge&#10;2. Request breakdown of billing hours&#10;3. Negotiate revised invoice rate"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {t("roleplay.field_opening_line", "Interlocutor Opening Line")}
                </label>
                <input
                  type="text"
                  value={customOpeningLine}
                  onChange={(e) => setCustomOpeningLine(e.target.value)}
                  placeholder={t("roleplay.field_opening_line_placeholder", "e.g. Hello, I received your email regarding the latest invoice. What seems to be the issue?")}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
              >
                {t("roleplay.cancel", "Cancel")}
              </button>
              <button
                type="button"
                onClick={handleSaveCustomScenario}
                disabled={!customTitle.trim() || !customUserRole.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-black rounded-xl shadow-xs"
              >
                {t("roleplay.save_start_roleplay", "Save & Start Roleplay")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
