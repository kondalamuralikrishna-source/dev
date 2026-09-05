import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Play,
  RotateCcw,
  Send,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Activity,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  HelpCircle,
  Download,
  Flame,
  Zap,
  RefreshCw,
  Clock,
  Eye,
} from "lucide-react";
import {
  CEFRLevel,
  EvaluatorScenario,
  NextGenSpeechEvaluatorResponse,
  SegmentalFeedbackItem,
  UserProgress,
} from "../types";
import { VocalTractArticulatorVisualizer } from "./VocalTractArticulatorVisualizer";
import { PitchIntonationVisualizer } from "./PitchIntonationVisualizer";
import { speakText, stopSpeech } from "../utils/speechUtils";

interface NextGenSpeechEvaluatorStudioProps {
  progress: UserProgress;
  onGrantXp: (amount: number, reason: string) => void;
  onUpdateProgress?: (updated: UserProgress) => void;
}

const DEFAULT_SCENARIOS: EvaluatorScenario[] = [
  {
    id: "tech_distributed_architecture",
    title: "Distributed Architecture RFC Defense",
    category: "Leadership & Architecture",
    interlocutorName: "Dr. Marcus Vance",
    interlocutorTitle: "Chief Technology Officer & Senior Systems Architect",
    interlocutorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    difficulty: "C1",
    communicativeGoal: "Defend migrating high-throughput ingestion pipelines to an event-stream architecture with backpressure handling against a skeptical executive.",
    scenarioBrief: "You are the Lead Solutions Architect presenting to CTO Dr. Marcus Vance. He is concerned about distributed state complexity, operational overhead, and network latency. You must clearly articulate throughput guarantees, fault isolation, and state machine idempotency.",
    interlocutorOpeningLine: "Thanks for joining. I've glanced at your architectural RFC, but frankly, moving our billing and streaming ingest to an asynchronous Kafka event mesh seems like over-engineering that introduces distributed split-brain risks. Why shouldn't we simply scale our primary relational database cluster vertically?",
    suggestedFocusPhonemes: ["/θ/ vs /s/", "/v/ vs /w/", "/dʒ/ vs /ʒ/", "/æ/ vs /ʌ/"],
    suprasegmentalFocus: "Clause-level nuclear stress on strategic contrast words ('throughput', 'resiliency') and falling pitch contours on declarative architectural assertions.",
  },
  {
    id: "medical_emergency_triage",
    title: "Acute Trauma Resuscitation Clinical Handoff",
    category: "Medical & Emergency",
    interlocutorName: "Dr. Samantha Reed",
    interlocutorTitle: "Emergency Department Attending Physician & Trauma Lead",
    interlocutorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    difficulty: "B2",
    communicativeGoal: "Deliver a rapid, high-stakes SBAR (Situation, Background, Assessment, Recommendation) clinical handoff for an acute trauma patient while answering time-critical triage questions.",
    scenarioBrief: "You are the Flight Paramedic transferring a 54-year-old trauma patient with unstable oxygenation and flail chest. You must convey critical vitals, Glasgow Coma Scale, administered medications, and airway patency with zero ambiguity.",
    interlocutorOpeningLine: "Trauma team is ready. Give me the 30-second SBAR handoff. What is the airway status, Glasgow Coma Score, and what IV pressors or fluids have already been pushed?",
    suggestedFocusPhonemes: ["/p/ vs /b/ aspiration", "/t/ vs /d/ flap", "/ʃ/ vs /tʃ/", "/ɪ/ vs /iː/"],
    suprasegmentalFocus: "Stress-timed rhythmic cadence to maintain vital clarity under pressure without rising-inflection question tags on declarative clinical data.",
  },
  {
    id: "cross_border_commercial_negotiation",
    title: "Enterprise Multi-Region Cloud Contract Renewal",
    category: "Cross-Border Commercial",
    interlocutorName: "Elena Rostova",
    interlocutorTitle: "Global Procurement Director, APAC & EMEA",
    interlocutorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    difficulty: "C1",
    communicativeGoal: "Negotiate a 3-year multi-million enterprise contract renewal, pushing back against a 25% discount demand while trading uptime SLAs and dedicated technical account management.",
    scenarioBrief: "Elena is a seasoned, assertive procurement chief who uses aggressive anchoring and pauses. You must hedge gracefully, re-frame concessions around total cost of ownership (TCO), and maintain firm executive diplomacy.",
    interlocutorOpeningLine: "We appreciate your platform's reliability over the past 12 months, but your renewal quote is 30% above our allocated fiscal budget. Unless you can match our target numbers and include 99.999% SLA uptime penalties, we are prepared to issue a formal RFP to your competitors on Monday.",
    suggestedFocusPhonemes: ["/z/ vs /s/ voicing", "/ð/ vs /d/", "/l/ dark vs light", "/əʊ/ vs /ɔː/"],
    suprasegmentalFocus: "Hedging intonation contours (fall-rise on conditional clauses: 'While we understand your constraints...') followed by resolute falling terminal tone on value anchors.",
  },
  {
    id: "academic_defense_methodology",
    title: "Doctoral Dissertation Defense: AI Evaluation Gaps",
    category: "Academic & Research",
    interlocutorName: "Prof. Arthur Pendelton",
    interlocutorTitle: "Chair of Applied Linguistics & Computer Science",
    interlocutorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    difficulty: "C2",
    communicativeGoal: "Defend novel second language acquisition assessment methodologies prioritizing functional comprehensibility over acoustic native-likeness against conservative committee scrutiny.",
    scenarioBrief: "Prof. Pendelton questions whether abandoning native-speaker acoustic reference models degrades standardized benchmarking. You must unpack construct validity, acoustic intelligibility thresholds, and SLA empirical literature spontaneously.",
    interlocutorOpeningLine: "Your thesis proposes decoupling automated speech evaluation from native phonemic baselines. However, standard testing bodies rely on native phonetic corpora for normative scoring. How do you theoretically and mathematically prove that your 'functional intelligibility' construct avoids subjective drift?",
    suggestedFocusPhonemes: ["/θ/ vs /f/", "/ŋ/ velar nasal", "/r/ post-alveolar approximant", "/ɜː/ vs /ə/"],
    suprasegmentalFocus: "Syntactic chunking with rhythmic pauses at discourse markers and parenthetical pitch drops to clarify complex nested theoretical arguments.",
  },
];

interface ChatMessage {
  id: string;
  sender: "user" | "interlocutor";
  text: string;
  timestamp: Date;
  evaluation?: NextGenSpeechEvaluatorResponse["evaluation"];
  scaffolding?: NextGenSpeechEvaluatorResponse["pedagogical_scaffolding"];
  audioDuration?: number;
  wpm?: number;
}

export const NextGenSpeechEvaluatorStudio: React.FC<NextGenSpeechEvaluatorStudioProps> = ({
  progress,
  onGrantXp,
}) => {
  const [scenarios, setScenarios] = useState<EvaluatorScenario[]>(DEFAULT_SCENARIOS);
  const [activeScenario, setActiveScenario] = useState<EvaluatorScenario>(DEFAULT_SCENARIOS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInputText, setCurrentInputText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState<"roleplay" | "vocal_tract" | "prosody" | "json_export">("roleplay");
  const [autoSpeakInterlocutor, setAutoSpeakInterlocutor] = useState(true);
  const [selectedSegmentalSound, setSelectedSegmentalSound] = useState<SegmentalFeedbackItem | null>(null);
  const [drillPracticeText, setDrillPracticeText] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const recordingTimerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize first message when scenario changes
  useEffect(() => {
    setMessages([
      {
        id: "msg_init",
        sender: "interlocutor",
        text: activeScenario.interlocutorOpeningLine,
        timestamp: new Date(),
      },
    ]);
    if (autoSpeakInterlocutor) {
      speakText(activeScenario.interlocutorOpeningLine);
    }
  }, [activeScenario]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isEvaluating]);

  // Web Speech API initialization
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsRecording(false);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      stopSpeech();
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    } else {
      // Start recording
      setCurrentInputText("");
      setRecordingSeconds(0);
      try {
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
        setIsRecording(true);
        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.warn("Could not start speech recognition:", err);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || currentInputText).trim();
    if (!text || isEvaluating) return;

    // Stop recording if active
    if (isRecording) {
      toggleRecording();
    }

    const durationSec = Math.max(2, recordingSeconds);
    const wordCount = text.split(/\s+/).length;
    const computedWpm = Math.round((wordCount / durationSec) * 60);

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date(),
      audioDuration: durationSec,
      wpm: computedWpm,
    };

    setMessages((prev) => [...prev, userMsg]);
    setCurrentInputText("");
    setRecordingSeconds(0);
    setIsEvaluating(true);

    try {
      const historyPayload = messages.map((m) => ({
        speaker: m.sender,
        text: m.text,
      }));

      const res = await fetch("/api/speech-evaluator/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spokenText: text,
          scenarioTitle: activeScenario.title,
          scenarioCategory: activeScenario.category,
          scenarioBrief: activeScenario.scenarioBrief,
          interlocutorName: activeScenario.interlocutorName,
          interlocutorRole: activeScenario.interlocutorTitle,
          conversationHistory: historyPayload,
          learnerLevel: activeScenario.difficulty,
          targetPhonemes: activeScenario.suggestedFocusPhonemes,
          acousticMetrics: {
            wpm: computedWpm,
            avgF0Hz: 135,
            pauseCount: Math.floor(wordCount / 8),
          },
        }),
      });

      const data: NextGenSpeechEvaluatorResponse = await res.json();

      const interlocutorMsg: ChatMessage = {
        id: `eval_${Date.now()}`,
        sender: "interlocutor",
        text: data.conversational_response,
        timestamp: new Date(),
        evaluation: data.evaluation,
        scaffolding: data.pedagogical_scaffolding,
      };

      setMessages((prev) => [...prev, interlocutorMsg]);
      onGrantXp(40, "Completed Spontaneous Spoken Roleplay Turn");

      // Auto-set the first segmental error to visualizer if present
      if (data.evaluation?.segmental_feedback?.length > 0) {
        setSelectedSegmentalSound(data.evaluation.segmental_feedback[0]);
      }

      if (autoSpeakInterlocutor && data.conversational_response) {
        speakText(data.conversational_response);
      }
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSelectDrill = (drill: string) => {
    setDrillPracticeText(drill);
    setCurrentInputText(drill.replace(/[*_]/g, ""));
    setActiveTab("roleplay");
  };

  const latestEvaluation = [...messages].reverse().find((m) => m.evaluation)?.evaluation;
  const latestScaffolding = [...messages].reverse().find((m) => m.scaffolding)?.scaffolding;
  const latestUserMessage = [...messages].reverse().find((m) => m.sender === "user");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* SLA Engine Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 md:p-8 shadow-2xl text-white">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-400" />
                SLA Research-Backed CAPT/ASE Engine
              </span>
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-black uppercase tracking-wider">
                Functional Intelligibility &gt; Native-Likeness
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
                Multi-Metric Decoupled
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              NextGen Spoken Language Evaluator &amp; Pedagogy Engine
            </h1>

            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Addressing legacy CAPT shortcomings: continuous open-ended spontaneous roleplay, motor-articulatory mechanics (kinetic 3D vocal tract cues), $F_0$ pitch dynamics, and decoupled functional intelligibility assessments with anti-gaming heuristics.
            </p>
          </div>

          {/* Quick Stats / Action Pill */}
          <div className="flex flex-wrap lg:flex-col gap-3 shrink-0">
            <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-indigo-500/20 text-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                1-10
              </div>
              <div>
                <div className="font-bold text-white">Semantic Intelligibility</div>
                <div className="text-[11px] text-slate-400">Non-native accents respected</div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-indigo-500/20 text-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black">
                3D
              </div>
              <div>
                <div className="font-bold text-white">Motor Articulation</div>
                <div className="text-[11px] text-slate-400">Tongue, lip, jaw placement</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Switcher Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-400">
            <MessageSquare size={16} className="text-indigo-400" />
            Spontaneous Conversational Scenarios (Select Interactive Persona):
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button
              type="button"
              onClick={() => setAutoSpeakInterlocutor(!autoSpeakInterlocutor)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                autoSpeakInterlocutor
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
              }`}
            >
              <Volume2 size={14} />
              TTS Auto-Voice: {autoSpeakInterlocutor ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {scenarios.map((sc) => {
            const isSelected = sc.id === activeScenario.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => setActiveScenario(sc)}
                className={`text-left p-3.5 rounded-2xl transition-all border cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/40 shadow-md text-white"
                    : "bg-slate-950/60 border-slate-800 hover:bg-slate-800/80 text-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                      {sc.category}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {sc.difficulty}
                    </span>
                  </div>
                  <div className="font-bold text-xs line-clamp-1">{sc.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    w/ {sc.interlocutorName}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Viewport (Tabs) */}
      <div className="space-y-6">
        {/* Navigation Mode Bar */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("roleplay")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              activeTab === "roleplay"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <MessageSquare size={15} />
            Spontaneous Roleplay Arena
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("vocal_tract")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              activeTab === "vocal_tract"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Layers size={15} />
            3D Vocal Tract Articulator Model
            {latestEvaluation?.segmental_feedback && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("prosody")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              activeTab === "prosody"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <TrendingUp size={15} />
            $F_0$ Pitch &amp; Rhythm Dynamics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("json_export")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              activeTab === "json_export"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Download size={15} />
            SLA JSON Schema View
          </button>
        </div>

        {/* TAB 1: SPONTANEOUS ROLEPLAY ARENA */}
        {activeTab === "roleplay" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Conversation Log & Mic (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl min-h-[580px]">
              {/* Interlocutor Persona Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={activeScenario.interlocutorAvatar}
                    alt={activeScenario.interlocutorName}
                    className="w-11 h-11 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white">
                        {activeScenario.interlocutorName}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Live Roleplay
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{activeScenario.interlocutorTitle}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMessages([
                      {
                        id: `rst_${Date.now()}`,
                        sender: "interlocutor",
                        text: activeScenario.interlocutorOpeningLine,
                        timestamp: new Date(),
                      },
                    ]);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Reset Scenario"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 max-h-[380px] pr-2">
                {messages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                          isUser
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] font-bold opacity-75 mb-1">
                          <span>{isUser ? "You (Learner Spoken Input)" : activeScenario.interlocutorName}</span>
                          {!isUser && (
                            <button
                              type="button"
                              onClick={() => speakText(msg.text)}
                              className="hover:text-white transition cursor-pointer"
                              title="Listen"
                            >
                              <Volume2 size={13} />
                            </button>
                          )}
                          {isUser && msg.wpm && (
                            <span>{msg.wpm} WPM • {msg.audioDuration}s</span>
                          )}
                        </div>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  );
                })}

                {isEvaluating && (
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950 border border-indigo-500/30 text-xs text-indigo-300 animate-pulse">
                    <RefreshCw size={16} className="animate-spin text-indigo-400" />
                    <span>Evaluating functional intelligibility, prosody, and motor articulation...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area (Mic + Text) */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  {/* Push-to-Talk Mic Button */}
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                      isRecording
                        ? "bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/40 ring-2 ring-rose-400"
                        : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff size={16} />
                        Recording ({recordingSeconds}s)...
                      </>
                    ) : (
                      <>
                        <Mic size={16} />
                        Speak (Mic)
                      </>
                    )}
                  </button>

                  {/* Text Input */}
                  <input
                    type="text"
                    value={currentInputText}
                    onChange={(e) => setCurrentInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={
                      isRecording
                        ? "Listening to your spontaneous speech..."
                        : "Type response or press 'Speak (Mic)' to practice spontaneously..."
                    }
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!currentInputText.trim() || isEvaluating}
                    className="p-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    <Send size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Open-ended spontaneous scenario: construct natural reasoning in context.</span>
                  {drillPracticeText && (
                    <span className="text-amber-400 font-semibold truncate max-w-xs">
                      Drill active: {drillPracticeText}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Real-time SLA Diagnostics Sidebar (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Functional Intelligibility Metric Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-slate-100 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Award size={18} className="text-emerald-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                      SLA Multi-Metric Diagnostic
                    </h3>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    SLA Directive #1
                  </span>
                </div>

                {latestEvaluation ? (
                  <div className="space-y-4">
                    {/* Intelligibility Score */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30">
                      <div className="text-[11px] text-slate-400 uppercase font-black mb-1">
                        Functional Intelligibility Rating:
                      </div>
                      <div className="text-lg sm:text-xl font-black text-emerald-400">
                        {latestEvaluation.functional_intelligibility_score}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                        Scored on semantic clarity and listener ease. Accents are fully respected unless causing communicative breakdown.
                      </p>
                    </div>

                    {/* Spontaneous Morphosyntax & Grammar */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                      <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                        <Brain size={14} />
                        Spontaneous Morphosyntax &amp; Syntax Analysis:
                      </div>
                      <p className="text-slate-300 text-[11.5px] leading-relaxed">
                        {latestEvaluation.spontaneous_grammar_and_syntax}
                      </p>
                    </div>

                    {/* Segmental Phoneme Diagnostics */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                        <span>Segmental Phoneme Cues:</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab("vocal_tract")}
                          className="text-indigo-400 hover:text-indigo-300 text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          Open 3D Vocal Model <ArrowRight size={12} />
                        </button>
                      </div>

                      {latestEvaluation.segmental_feedback?.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedSegmentalSound(item);
                            setActiveTab("vocal_tract");
                          }}
                          className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 transition cursor-pointer text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-amber-300">Word: "{item.location}"</span>
                            <span className="font-mono text-emerald-400">
                              Target {item.target_sound} vs {item.produced_sound}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                            {item.articulatory_correction}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Pedagogical Scaffolding & High-Transfer Drill */}
                    {latestScaffolding && (
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-500/40 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-indigo-300 uppercase text-[10px] flex items-center gap-1.5">
                            <Zap size={14} className="text-amber-400" />
                            High-Transfer Pedagogical Drill
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSelectDrill(latestScaffolding.actionable_drills)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-500 transition cursor-pointer"
                          >
                            Practice Now
                          </button>
                        </div>
                        <p className="text-slate-200 text-[11.5px] leading-relaxed">
                          {latestScaffolding.actionable_drills}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-500 text-xs space-y-2">
                    <Activity size={32} className="mx-auto text-slate-600 opacity-60" />
                    <p className="font-bold text-slate-400">No Spoken Turns Yet</p>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      Speak or send a response to Dr. Marcus Vance to trigger real-time SLA functional intelligibility and articulatory feedback.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 3D VOCAL TRACT ARTICULATOR MODEL */}
        {activeTab === "vocal_tract" && (
          <div className="space-y-6">
            <VocalTractArticulatorVisualizer
              targetSound={selectedSegmentalSound?.target_sound || "/θ/"}
              producedSound={selectedSegmentalSound?.produced_sound || "[s]"}
              soundLocation={selectedSegmentalSound?.location || "thought"}
              articulatoryCorrection={
                selectedSegmentalSound?.articulatory_correction ||
                "Rest the tip of your tongue lightly between the upper and lower incisors without contacting the alveolar ridge."
              }
              visualCueDescription={latestScaffolding?.visual_cue_description}
            />
          </div>
        )}

        {/* TAB 3: PROSODY & PITCH CONTOURS */}
        {activeTab === "prosody" && (
          <div className="space-y-6">
            <PitchIntonationVisualizer
              suprasegmentals={
                latestEvaluation?.suprasegmental_feedback || {
                  pitch_and_intonation:
                    "Demonstrates clause-level pitch emphasis on strategic keywords with a decisive falling terminal tone on declarative assertions.",
                  rhythm_and_timing:
                    "Natural stress-timed delivery (~138 WPM) with appropriate vowel compression on unstressed prepositions and articles.",
                  prosodic_gaming_detected: "false - Authentic human prosody with natural variation.",
                }
              }
              transcript={latestUserMessage?.text || "We achieve sub-second latency without risking state inconsistency."}
              wpm={latestUserMessage?.wpm || 138}
            />
          </div>
        )}

        {/* TAB 4: SLA JSON SCHEMA EXPORT */}
        {activeTab === "json_export" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Download size={18} className="text-teal-400" />
                <h3 className="text-sm font-black text-white">
                  NextGen SLA Engine JSON Response Output
                </h3>
              </div>
              <span className="text-xs text-slate-400">Strict Schema Compliant</span>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[420px]">
              <pre>
                {JSON.stringify(
                  {
                    conversational_response:
                      messages.find((m) => m.sender === "interlocutor" && m.evaluation)?.text ||
                      activeScenario.interlocutorOpeningLine,
                    evaluation: latestEvaluation || {
                      functional_intelligibility_score: "8.5/10 - High Comprehensibility",
                      spontaneous_grammar_and_syntax:
                        "Spontaneous clause chaining successfully communicated architectural guarantees under pressure.",
                      segmental_feedback: [
                        {
                          target_sound: "/θ/",
                          produced_sound: "[s]",
                          location: "thought",
                          articulatory_correction:
                            "Place the tongue tip lightly between the incisors rather than contacting the alveolar ridge.",
                        },
                      ],
                      suprasegmental_feedback: {
                        pitch_and_intonation:
                          "Clear pitch modulation on contrastive architectural units.",
                        rhythm_and_timing:
                          "Consistent stress-timed cadence with appropriate reduction of unstressed syllables.",
                        prosodic_gaming_detected: "false",
                      },
                    },
                    pedagogical_scaffolding: latestScaffolding || {
                      actionable_drills:
                        "Re-state the architectural tradeoff using a nuclear pitch fall on *latency*.",
                      visual_cue_description:
                        "Elevate tongue tip toward the dental margin with 15-degree jaw drop.",
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
