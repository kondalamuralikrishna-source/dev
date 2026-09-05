import React, { useState, useEffect } from "react";
import {
  Briefcase,
  TrendingUp,
  Zap,
  ShieldAlert,
  Volume2,
  Mic,
  MicOff,
  RefreshCw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  Award,
} from "lucide-react";
import { UserProgress, DomainScenarioData, JargonAuditReport } from "../types";

interface DomainMasteryStudioProps {
  progress: UserProgress;
  onGrantXp: (amount: number, reason: string) => void;
  onLaunchAuditView?: () => void;
}

const DOMAIN_SCENARIOS: DomainScenarioData[] = [
  {
    id: "sc_tech_arch",
    track: "Tech Leadership",
    title: "Enterprise Architecture Defense",
    interlocutor: "Chief Technology Officer & Lead Architect",
    briefing: "You must justify migrating core services to an event-driven microservices architecture while addressing the CTO's concerns over distributed transaction latency and operational headcount.",
    pressureStakes: "High Stakes: Board budget sign-off for next quarter depends on this technical review.",
    domainVocabularyTarget: [
      "event-driven architecture",
      "idempotency",
      "throughput",
      "SLA compliance",
      "horizontal scalability",
      "distributed consensus",
      "amortized latency",
    ],
    frictionLevel: "high",
    initialPrompt: "We reviewed your migration RFC. Frankly, splitting our monolithic database right now seems like unnecessary operational overhead. How do you guarantee sub-50ms latency across distributed transactions?",
  },
  {
    id: "sc_venture_pitch",
    track: "Investor Pitch",
    title: "Series A Lead Investor Due Diligence",
    interlocutor: "General Partner, Tier-1 Venture Fund",
    briefing: "Pitch your customer acquisition dynamics, defensibility moat, and unit economics. Defend against skeptical questions regarding high churn and customer acquisition costs.",
    pressureStakes: "Critical: Securing a $4M term sheet to prevent down-round dilution.",
    domainVocabularyTarget: [
      "net revenue retention",
      "LTV to CAC ratio",
      "payback period",
      "market penetration",
      "gross margins",
      "proprietary data moat",
      "switching costs",
    ],
    frictionLevel: "high",
    initialPrompt: "Your top-line GMV growth looks acceptable, but your blended CAC rose 35% last quarter. Why shouldn't we assume your unit economics will collapse once you saturate early adopters?",
  },
  {
    id: "sc_salary_equity",
    track: "Executive Negotiation",
    title: "VP Promotion & Equity Grant Review",
    interlocutor: "Chief Operating Officer",
    briefing: "Negotiate an expansion into a VP title with accelerated vesting schedule and higher equity percentage, leveraging your measurable P&L contributions over the past year.",
    pressureStakes: "Career Defining: Establishing executive compensation and equity stake.",
    domainVocabularyTarget: [
      "vesting acceleration",
      "fiduciary contribution",
      "P&L stewardship",
      "market compensation benchmark",
      "retention multiplier",
      "enterprise value expansion",
    ],
    frictionLevel: "medium",
    initialPrompt: "We are thrilled with your division's performance, but standard company policy limits equity refreshes to 15% annually. What justifies an exception for your package?",
  },
  {
    id: "sc_crisis_postmortem",
    track: "Crisis & Risk",
    title: "P0 Outage Post-Mortem with Key Enterprise Client",
    interlocutor: "VP of Infrastructure, Enterprise Client",
    briefing: "Address a 4-hour system outage that impacted client trading operations. Explain the root cause transparently while presenting preventative countermeasures to stop contract termination.",
    pressureStakes: "Extreme: Defending a $2.5M enterprise annual contract against breach of SLA.",
    domainVocabularyTarget: [
      "root-cause analysis",
      "failover redundancy",
      "circuit breakers",
      "blast radius",
      "SLA remediation credit",
      "countermeasures",
      "automated rollback",
    ],
    frictionLevel: "extreme",
    initialPrompt: "Our executive committee is prepared to invoke the SLA termination clause. We lost seven figures in trading volume today. Why should we believe this won't happen again next Monday?",
  },
];

export const DomainMasteryStudio: React.FC<DomainMasteryStudioProps> = ({
  progress,
  onGrantXp,
  onLaunchAuditView,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<DomainScenarioData>(DOMAIN_SCENARIOS[0]);
  const [dialogueHistory, setDialogueHistory] = useState<Array<{ role: "ai" | "user"; content: string; jargonReport?: any }>>([]);
  const [userSpeech, setUserSpeech] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [frictionEnabled, setFrictionEnabled] = useState<boolean>(true);
  const [latestJargonAudit, setLatestJargonAudit] = useState<JargonAuditReport | null>(null);

  // Initialize dialogue with initial prompt
  useEffect(() => {
    setDialogueHistory([
      {
        role: "ai",
        content: selectedScenario.initialPrompt,
      },
    ]);
    setLatestJargonAudit(null);
  }, [selectedScenario]);

  const handleSpeakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = progress.speechSpeed || 0.95;
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
      alert("Speech recognition is not supported in this browser. You can type your response.");
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
      setUserSpeech(transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  const handleSendTurn = async () => {
    if (!userSpeech.trim() || isSending) return;

    const userMessage = userSpeech.trim();
    setUserSpeech("");
    const newHistory = [...dialogueHistory, { role: "user" as const, content: userMessage }];
    setDialogueHistory(newHistory);
    setIsSending(true);

    try {
      const res = await fetch("/api/gemini/domain-scenario-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: selectedScenario,
          userMessage,
          turnIndex: newHistory.length,
          history: newHistory,
          frictionEnabled,
        }),
      });

      const data = await res.json();

      setLatestJargonAudit(data.jargonAudit || null);
      setDialogueHistory([
        ...newHistory,
        {
          role: "ai",
          content: data.reply,
          jargonReport: data.jargonAudit,
        },
      ]);

      if (data.reply) {
        setTimeout(() => handleSpeakText(data.reply), 300);
      }

      onGrantXp(30, "Domain Dialogue & Jargon Practice");
    } catch (e) {
      console.error("Error in domain turn:", e);
      setDialogueHistory([
        ...newHistory,
        {
          role: "ai",
          content: "Understood. But how do you plan to handle the associated transition risk without compromising our uptime commitment?",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <Briefcase size={13} className="text-blue-400" />
              MARKET DIFFERENTIATOR 4 & 5
            </span>
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <ShieldAlert size={13} /> Domain Jargon Density & Conversational Friction
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white mb-2">
            Goal & Domain-Specific Friction Simulator
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Practice in high-stakes domain arenas: Tech Architecture, Investor Due Diligence, VP Salary
            Negotiation, and Crisis Post-Mortems. Evaluates your real-time executive jargon density
            and simulates real-world friction like interruptions and fast cadence.
          </p>

          {/* Friction Toggle & Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={frictionEnabled}
                  onChange={(e) => setFrictionEnabled(e.target.checked)}
                  className="rounded border-slate-700 text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Zap size={14} className={frictionEnabled ? "text-amber-400" : "text-slate-500"} />
                  Conversational Friction & Pushback Mode
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Target Stakes:</span>
              <span className="text-xs font-bold text-amber-300 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                {selectedScenario.pressureStakes}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {DOMAIN_SCENARIOS.map((sc) => (
          <button
            key={sc.id}
            type="button"
            onClick={() => setSelectedScenario(sc)}
            className={`p-4 rounded-2xl text-left border transition-all ${
              selectedScenario.id === sc.id
                ? "bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                : "bg-white hover:bg-slate-50 border-slate-200"
            }`}
          >
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider block mb-1">
              {sc.track}
            </span>
            <h3 className="text-xs font-bold text-slate-900 mb-1">{sc.title}</h3>
            <p className="text-[11px] text-slate-500 line-clamp-2">{sc.briefing}</p>
          </button>
        ))}
      </div>

      {/* Main Simulation View & Real-Time Jargon Audit Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dialogue Chat Container (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[560px]">
          {/* Top Scenario Bar */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
            <div>
              <p className="text-xs font-black text-slate-900">{selectedScenario.title}</p>
              <p className="text-[11px] text-slate-500">
                Interlocutor: <strong>{selectedScenario.interlocutor}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDialogueHistory([{ role: "ai", content: selectedScenario.initialPrompt }]);
                setLatestJargonAudit(null);
              }}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg text-xs flex items-center gap-1"
              title="Reset Scenario"
            >
              <RefreshCw size={13} />
              <span>Reset</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {dialogueHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white shadow-xs rounded-br-none"
                      : "bg-slate-100 text-slate-900 border border-slate-200/80 rounded-bl-none"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        msg.role === "user" ? "text-blue-200" : "text-slate-500"
                      }`}
                    >
                      {msg.role === "user" ? "You (Executive Speaker)" : selectedScenario.interlocutor}
                    </span>
                    {msg.role === "ai" && (
                      <button
                        type="button"
                        onClick={() => handleSpeakText(msg.content)}
                        className="p-1 text-slate-500 hover:text-slate-800 rounded"
                      >
                        <Volume2 size={13} />
                      </button>
                    )}
                  </div>
                  <p className="font-medium">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input & Speech Bar */}
          <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl space-y-3">
            <div className="relative">
              <input
                type="text"
                value={userSpeech}
                onChange={(e) => setUserSpeech(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendTurn();
                  }
                }}
                placeholder="Speak using microphone or type your precise domain response..."
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm font-medium text-slate-900"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  isRecording
                    ? "bg-rose-600 text-white animate-pulse shadow-md"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                }`}
              >
                {isRecording ? <MicOff size={15} /> : <Mic size={15} />}
                <span>{isRecording ? "Listening..." : "Speak Response"}</span>
              </button>

              <button
                type="button"
                onClick={handleSendTurn}
                disabled={!userSpeech.trim() || isSending}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                {isSending ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Auditing...</span>
                  </>
                ) : (
                  <>
                    <span>Deliver Argument</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Real-Time Jargon & Terminology Density Auditor (1 col) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={16} className="text-blue-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Real-Time Jargon Density Audit
                </h3>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                LIVE METRICS
              </span>
            </div>

            {latestJargonAudit ? (
              <div className="space-y-4">
                {/* Jargon Density % Metric */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-600">Domain Jargon Density</span>
                    <span className="text-base font-black text-blue-600">
                      {latestJargonAudit.jargonDensityPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.min(100, latestJargonAudit.jargonDensityPercentage * 3)}%` }}
                    />
                  </div>
                  <p className="text-[11px] font-bold text-slate-700">
                    Mastery Rating:{" "}
                    <span className="text-indigo-700">{latestJargonAudit.domainMasteryRating}</span>
                  </p>
                </div>

                {/* Correctly Used Domain Terms */}
                <div className="space-y-2">
                  <p className="text-[11px] font-black uppercase text-emerald-700 tracking-wider">
                    Domain Terms Deployed Correctly:
                  </p>
                  {latestJargonAudit.domainTermsUsedCorrectly?.length > 0 ? (
                    latestJargonAudit.domainTermsUsedCorrectly.map((term, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-slate-800"
                      >
                        <strong className="text-emerald-950 block">{term.term}</strong>
                        <p className="text-slate-600">{term.impact}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No high-precision domain terms detected in latest turn.
                    </p>
                  )}
                </div>

                {/* Missed Opportunities / Fluff Replaced with Executive Jargon */}
                {latestJargonAudit.missedOpportunities?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase text-amber-700 tracking-wider">
                      Elevate Vague Phrasing to Executive Jargon:
                    </p>
                    {latestJargonAudit.missedOpportunities.map((opp, oIdx) => (
                      <div
                        key={oIdx}
                        className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs space-y-1"
                      >
                        <p className="line-through text-rose-700 font-semibold">"{opp.vaguePhrase}"</p>
                        <p className="text-emerald-900 font-bold">➔ "{opp.suggestedExecutiveTerm}"</p>
                        <p className="text-[10px] text-slate-500">{opp.why}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 space-y-3">
                <Briefcase size={36} className="text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                  Deliver your spoken turn in the simulation to trigger an instant Jargon Density &
                  Precision audit.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1">
                  <p className="font-bold text-slate-800">Target Terms to Weave in:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedScenario.domainVocabularyTarget?.map((vocab, vIdx) => (
                      <span
                        key={vIdx}
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-700"
                      >
                        {vocab}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
