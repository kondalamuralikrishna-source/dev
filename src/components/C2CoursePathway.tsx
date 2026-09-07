import React, { useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Flame,
  GraduationCap,
  Layers,
  Lock,
  Mic,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Zap,
  Clock,
  ArrowRight,
  HelpCircle,
  BarChart2,
  Volume2,
} from "lucide-react";
import { CEFRLevel, PersonalizedC2Course, C2CourseMilestone, UserProgress } from "../types";
import { LinguaFlowLogo } from "./LinguaFlowLogo";
import { ModuleHeaderGuide } from "./ModuleHeaderGuide";
import { AutoText, useAutoText } from "./AutoText";
import { useTranslation } from "../context/TranslationContext";

interface C2CoursePathwayProps {
  course?: PersonalizedC2Course | null;
  progress: UserProgress;
  onSelectLesson?: (lessonId: string) => void;
  onStartSpokenDrill?: (drill: any) => void;
  onTakeBenchmark?: (level: CEFRLevel) => void;
  onRetakeAssessment?: () => void;
  onUpdateLevel?: (level: CEFRLevel) => void;
}

export const C2CoursePathway: React.FC<C2CoursePathwayProps> = ({
  course,
  progress,
  onSelectLesson,
  onStartSpokenDrill,
  onTakeBenchmark,
  onRetakeAssessment,
  onUpdateLevel,
}) => {
  const { t } = useTranslation();
  const diagnosedLevel: CEFRLevel = course?.diagnosedBand || progress.selectedLevel || "B1";
  const [selectedMilestoneLevel, setSelectedMilestoneLevel] = useState<CEFRLevel>(diagnosedLevel);
  const [isGeneratingCustomDrill, setIsGeneratingCustomDrill] = useState(false);
  const [customDrillResult, setCustomDrillResult] = useState<any | null>(null);

  // Default fallback course if not yet evaluated
  const defaultMilestones: C2CourseMilestone[] = [
    {
      level: "A1",
      levelName: "A1: Breakthrough Foundations",
      tagline: "Core sentence mechanics, phonetic vowels, and daily survival exchanges.",
      status: diagnosedLevel === "A1" ? "current" : "completed",
      estimatedHours: 40,
      readinessPercentage: diagnosedLevel === "A1" ? 45 : 100,
      keyGrammarFocus: ["Subject-Verb Agreement", "Simple Present & Past", "Articles & Determiners"],
      keyVocabularyFocus: ["Daily routines", "Numbers & time markers", "Polite social greetings"],
      spokenDrills: [
        { id: "a1_d1", title: "Daily Routine 60-Second Monologue", type: "spoken_drill", durationMinutes: 8, description: "Narrate waking up, commute, and daily work activities without long pauses." },
        { id: "a1_d2", title: "Café & Grocery Transaction Roleplay", type: "spoken_drill", durationMinutes: 10, description: "Order meals, clarify prices, and use polite request modals." }
      ],
      benchmarkExamRequirement: "Pass A1 Foundation Benchmark with ≥ 80% accuracy",
    },
    {
      level: "A2",
      levelName: "A2: Waystage & Chronological Fluency",
      tagline: "Past continuous narratives, comparative structures, and social travel dialogue.",
      status: diagnosedLevel === "A2" ? "current" : ["B1", "B2", "C1", "C2"].includes(diagnosedLevel) ? "completed" : "next_target",
      estimatedHours: 50,
      readinessPercentage: diagnosedLevel === "A2" ? 60 : ["B1", "B2", "C1", "C2"].includes(diagnosedLevel) ? 100 : 0,
      keyGrammarFocus: ["Past Simple vs Past Continuous", "Comparatives & Superlatives", "Future Intentions"],
      keyVocabularyFocus: ["Travel & directions", "Workplace roles", "Emotional states"],
      spokenDrills: [
        { id: "a2_d1", title: "Interrupted Past Narrative Drill", type: "spoken_drill", durationMinutes: 10, description: "Explain what you were doing when an unexpected event occurred." },
        { id: "a2_d2", title: "Airport Logistics & Hotel Check-in", type: "spoken_drill", durationMinutes: 12, description: "Handle schedule changes, baggage inquiries, and directions." }
      ],
      benchmarkExamRequirement: "Pass A2 Waystage Benchmark with ≥ 80% accuracy",
    },
    {
      level: "B1",
      levelName: "B1: Threshold & Workplace Independence",
      tagline: "Hypothetical conditionals, opinion hedging, and fluid workplace standups.",
      status: diagnosedLevel === "B1" ? "current" : ["B2", "C1", "C2"].includes(diagnosedLevel) ? "completed" : "next_target",
      estimatedHours: 60,
      readinessPercentage: diagnosedLevel === "B1" ? 70 : ["B2", "C1", "C2"].includes(diagnosedLevel) ? 100 : 0,
      keyGrammarFocus: ["Second & Third Conditionals", "Modal Verbs of Deduction", "Relative Clauses"],
      keyVocabularyFocus: ["Project status updates", "Constructive debate & disagreement", "High-frequency phrasal verbs"],
      spokenDrills: [
        { id: "b1_d1", title: "Standup Meeting 90-Second Sprint Pitch", type: "spoken_drill", durationMinutes: 12, description: "Deliver clear blocker resolution updates with smooth transition phrases." },
        { id: "b1_d2", title: "Hypothetical Scenario Defense", type: "spoken_drill", durationMinutes: 14, description: "Defend strategic decisions using 'If we were to...' constructions." }
      ],
      benchmarkExamRequirement: "Pass B1 Threshold Benchmark with ≥ 80% accuracy",
    },
    {
      level: "B2",
      levelName: "B2: Vantage & Executive Fluency",
      tagline: "Passive transformations, crisis mediation, idiomatic precision, and complex arguments.",
      status: diagnosedLevel === "B2" ? "current" : ["C1", "C2"].includes(diagnosedLevel) ? "completed" : "next_target",
      estimatedHours: 75,
      readinessPercentage: diagnosedLevel === "B2" ? 75 : ["C1", "C2"].includes(diagnosedLevel) ? 100 : 0,
      keyGrammarFocus: ["Active to Passive Voice Transformations", "Mixed Conditionals & Regrets", "Hedging & Stance Adverbs"],
      keyVocabularyFocus: ["Executive leadership collocations", "Crisis containment & negotiation terms", "Nuanced idioms"],
      spokenDrills: [
        { id: "b2_d1", title: "Crisis Management & Stakeholder Briefing", type: "pressure_simulation", durationMinutes: 15, description: "Respond to aggressive stakeholder pushback under a strict 45-second timer." },
        { id: "b2_d2", title: "Full-Duplex Dialect-Agnostic Conversation", type: "full_duplex", durationMinutes: 16, description: "Low-latency debate simulation with dynamic conversational friction." }
      ],
      benchmarkExamRequirement: "Pass B2 Vantage Benchmark with ≥ 82% accuracy",
    },
    {
      level: "C1",
      levelName: "C1: Effective Operational Proficiency",
      tagline: "Negative inversions, cleft framing, subtle rhetorical irony, and keynote oratory.",
      status: diagnosedLevel === "C1" ? "current" : diagnosedLevel === "C2" ? "completed" : "mastery_goal",
      estimatedHours: 85,
      readinessPercentage: diagnosedLevel === "C1" ? 65 : diagnosedLevel === "C2" ? 100 : 0,
      keyGrammarFocus: ["Negative Inversions ('Seldom have we...')", "Cleft Sentences & Focus Framing", "Subjunctive Formal Mood"],
      keyVocabularyFocus: ["Academic & epistemological precision", "Diplomatic ambiguity & strategic nuance", "Advanced rhetorical idioms"],
      spokenDrills: [
        { id: "c1_d1", title: "Executive Boardroom Rhetorical Synthesis", type: "spoken_drill", durationMinutes: 18, description: "Synthesize conflicting multi-departmental data into a compelling executive narrative." },
        { id: "c1_d2", title: "High-Stakes Hostile Media Press Conference", type: "pressure_simulation", durationMinutes: 20, description: "Neutralize rapid-fire confrontational questions using sophisticated cleft framing." }
      ],
      benchmarkExamRequirement: "Pass C1 Advanced Proficiency Benchmark with ≥ 85% accuracy",
    },
    {
      level: "C2",
      levelName: "C2: Mastery & Oratorical Eminence",
      tagline: "Effortless spontaneous nuance, native-level sociolinguistic pragmatics, and master oratory.",
      status: diagnosedLevel === "C2" ? "current" : "mastery_goal",
      estimatedHours: 95,
      readinessPercentage: diagnosedLevel === "C2" ? 95 : 0,
      keyGrammarFocus: ["Total Syntactic Elasticity & Ellipsis", "Advanced Register Shifts & Archaic Rhetoric", "Spontaneous Discourse Synthesis"],
      keyVocabularyFocus: ["Near-native idioms & cultural subtext", "Epistemic stance markers", "Precise figurative metaphors"],
      spokenDrills: [
        { id: "c2_d1", title: "Impromptu 3-Minute Keynote Address", type: "spoken_drill", durationMinutes: 20, description: "Deliver a spontaneous keynote on complex abstract themes with oratorical cadence." },
        { id: "c2_d2", title: "Extreme Full-Duplex Dialectical Challenge", type: "full_duplex", durationMinutes: 25, description: "Engage in hostile, high-friction debate with rapid turn-taking (< 300ms latency)." }
      ],
      benchmarkExamRequirement: "Complete C2 Master Oratorical Defense & Comprehensive Viva",
    },
  ];

  const milestones: C2CourseMilestone[] = course?.milestones?.length ? course.milestones : defaultMilestones;
  const activeMilestone = milestones.find((m) => m.level === selectedMilestoneLevel) || milestones[0];
  const translatedSummaryPitch = useAutoText(
    course?.summaryPitch ||
      `Based on your spoken oral proficiency diagnostic, your structured curriculum adapts step-by-step from ${diagnosedLevel} until you achieve effortless C2 native-level oratorical precision.`,
    "c2_summary_pitch"
  );
  const translatedLevelName = useAutoText(activeMilestone.levelName, "c2_level_name");
  const translatedTagline = useAutoText(activeMilestone.tagline, "c2_tagline");
  const translatedBenchmarkRequirement = useAutoText(activeMilestone.benchmarkExamRequirement, "c2_benchmark_requirement");
  const translatedCustomDrillPitch = useAutoText(customDrillResult?.summaryPitch, "c2_custom_drill_pitch");

  // Overall path calculation
  const levelsOrder: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const currentLevelIndex = levelsOrder.indexOf(diagnosedLevel);
  const totalLevels = levelsOrder.length;
  const overallC2Progress = Math.round(((currentLevelIndex + (activeMilestone.readinessPercentage / 100)) / totalLevels) * 100);

  const handleGenerateCustomAIModule = async () => {
    setIsGeneratingCustomDrill(true);
    try {
      const response = await fetch("/api/gemini/generate-c2-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentLevel: diagnosedLevel,
          targetLevel: "C2",
          learnerFocus: `${selectedMilestoneLevel} Spoken Fluency & Syntax`,
        }),
      });
      const data = await response.json();
      setCustomDrillResult(data);
    } catch (err) {
      console.error("Failed to generate custom C2 drill:", err);
    } finally {
      setIsGeneratingCustomDrill(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Trophy size={14} /> {t("c2.roadmap_badge", "CEFR C2 Roadmap")}
              </span>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 rounded-full text-xs font-semibold">
                {t("c2.current_level", "Current Level:")} <strong className="text-white font-extrabold">{diagnosedLevel}</strong>
              </span>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-semibold flex items-center gap-1">
                <Target size={13} /> {t("c2.target_label", "Target:")} <strong className="text-white font-extrabold">{t("c2.c2_mastery", "C2 Mastery")}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              {t("c2.hero_title_prefix", "Personalized Pathway to")} <span className="text-teal-400">{t("c2.hero_title_highlight", "CEFR C2 Mastery")}</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {translatedSummaryPitch}
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex flex-row md:flex-col gap-3 bg-white/5 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 shrink-0">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">{t("c2.overall_readiness", "Overall C2 Readiness")}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-teal-400">{overallC2Progress}%</span>
                <span className="text-xs text-slate-400">{t("c2.to_c2_mastery", "to C2 Mastery")}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-400 to-indigo-400 h-full transition-all duration-700"
                  style={{ width: `${overallC2Progress}%` }}
                />
              </div>
            </div>

            {onRetakeAssessment && (
              <button
                type="button"
                onClick={onRetakeAssessment}
                className="mt-2 w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <RotateCcw size={14} />
                <span>{t("c2.retake_diagnostic", "Retake Diagnostic")}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Level Pathway Stepper */}
      <ModuleHeaderGuide
        moduleTitle="Personalized C2 Mastery Pathway"
        moduleCategory="Mastery Milestones"
        estimatedTime="40–95 hrs per CEFR Tier"
        difficulty="A1 &rarr; C2 Structured"
        themeColor="teal"
        steps={[
          {
            title: "Inspect Active Milestone Tier",
            instruction: "Select any CEFR level pill (A1 through C2) to view its specific grammar focus, core lexicon, and spoken drills.",
            tip: "Your diagnosed level is automatically highlighted with active progress.",
          },
          {
            title: "Launch Targeted Spoken Drills",
            instruction: "Click 'Launch Spoken Drill' or 'Live Voice Session' to practice the oral communication goals for that tier.",
            tip: "Drills focus directly on syntax and vocabulary expected at that CEFR grade.",
          },
          {
            title: "Generate Custom AI Scenarios",
            instruction: "Use 'Generate Dynamic AI Practice Module' to tailor specialized roleplays tailored to your target profession.",
            tip: "Custom modules adapt to medical, tech, legal, or executive contexts.",
          },
          {
            title: "Pass Benchmark & Advance",
            instruction: "Complete the milestone requirements and take the level advancement benchmark exam to unlock the next tier.",
            tip: "Achieve ≥80% on the benchmark exam to graduate to the next CEFR milestone.",
          },
        ]}
        completionGoal="Complete all key spoken drills and achieve ≥80% on the milestone benchmark exam to unlock the next level."
        xpReward={200}
      />

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-sm uppercase font-bold text-slate-500 tracking-wider mb-4 flex items-center justify-between">
          <span>{t("c2.progression_stepper", "6-Tier CEFR Progression Stepper")}</span>
          <span className="text-xs font-normal text-slate-400">{t("c2.click_tier_hint", "Click any tier to view focused curriculum")}</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {milestones.map((m, idx) => {
            const isSelected = m.level === selectedMilestoneLevel;
            const isUserCurrent = m.level === diagnosedLevel;
            const isPassed = levelsOrder.indexOf(m.level) < levelsOrder.indexOf(diagnosedLevel);

            return (
              <button
                key={m.level}
                type="button"
                onClick={() => {
                  setSelectedMilestoneLevel(m.level);
                  if (onUpdateLevel) onUpdateLevel(m.level);
                }}
                className={`relative p-4 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between min-h-[110px] ${
                  isSelected
                    ? "bg-indigo-50 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                    : isPassed
                    ? "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                {/* Level Tag & Status Icon */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-black px-2 py-0.5 rounded-md ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : isPassed
                        ? "bg-emerald-100 text-emerald-800"
                        : isUserCurrent
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {m.level}
                  </span>
                  {isPassed ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : isUserCurrent ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  ) : (
                    <Lock size={14} className="text-slate-400" />
                  )}
                </div>

                {/* Level Title */}
                <div>
                  <p className="text-xs font-bold text-slate-900 truncate mt-2">
                    {m.level === "A1"
                      ? t("c2.tier_a1", "Foundations")
                      : m.level === "A2"
                      ? t("c2.tier_a2", "Waystage")
                      : m.level === "B1"
                      ? t("c2.tier_b1", "Threshold")
                      : m.level === "B2"
                      ? t("c2.tier_b2", "Vantage")
                      : m.level === "C1"
                      ? t("c2.tier_c1", "Operational")
                      : t("c2.tier_c2", "Mastery")}
                  </p>
                  <p className="text-[10px] text-slate-500">{m.estimatedHours} {t("c2.hrs", "hrs")}</p>
                </div>

                {/* Readiness mini bar */}
                <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full ${isPassed ? "bg-emerald-500" : isSelected ? "bg-indigo-600" : "bg-slate-400"}`}
                    style={{ width: `${m.readinessPercentage}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Tier Deep-Dive Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tier Overview, Grammar Masterclasses, Vocabulary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Tier Header */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-black rounded-lg">
                  {t("common.level", "Level")} {activeMilestone.level}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{translatedLevelName}</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1">
                <Clock size={13} /> {t("c2.est_hours_of_training", "Est.")} {activeMilestone.estimatedHours} {t("c2.hours_of_training", "Hours of Training")}
              </span>
            </div>
            <p className="text-sm text-slate-600">{translatedTagline}</p>

            {/* Benchmark Goal Callout */}
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-start gap-3">
              <Award className="text-teal-700 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-bold text-teal-900">{t("c2.milestone_unlock_requirement", "Milestone Unlock Requirement")}</p>
                <p className="text-xs text-teal-700 mt-0.5">{translatedBenchmarkRequirement}</p>
              </div>
            </div>
          </div>

          {/* Targeted Grammar & Syntax Mastery */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-600" />
                {t("c2.targeted_grammar_modules", "Targeted Grammar & Syntax Modules")}
              </h4>
              <span className="text-xs text-slate-400">{t("c2.high_leverage_structures", "High-leverage structures")}</span>
            </div>

            <div className="space-y-3">
              {activeMilestone.keyGrammarFocus.map((grammarTitle, i) => (
                <div
                  key={i}
                  className="p-3.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all flex items-center justify-between gap-3 group cursor-pointer"
                  onClick={() => onSelectLesson && onSelectLesson(`grammar_${activeMilestone.level.toLowerCase()}_${i + 1}`)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-700">
                      <AutoText as="span" text={grammarTitle} context="c2_grammar_focus" />
                    </span>
                  </div>
                  <button
                    type="button"
                    className="px-2.5 py-1 bg-white group-hover:bg-indigo-600 text-slate-700 group-hover:text-white border border-slate-200 group-hover:border-indigo-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <span>{t("c2.practice", "Practice")}</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Lexical Resource & C2 Idiomatic Collocations */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <GraduationCap size={16} className="text-teal-600" />
                {t("c2.lexical_resource_themes", "Lexical Resource & Collocation Themes")}
              </h4>
              <span className="text-xs text-slate-400">CEFR {activeMilestone.level} {t("c2.lexicon", "Lexicon")}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activeMilestone.keyVocabularyFocus.map((vocabTheme, i) => (
                <div key={i} className="p-3 bg-teal-50/50 border border-teal-100 rounded-xl">
                  <p className="text-xs font-bold text-teal-900"><AutoText as="span" text={vocabTheme} context="c2_vocab_theme" /></p>
                  <p className="text-[11px] text-teal-700 mt-1">{t("c2.high_frequency_vocab", "High-frequency")} {activeMilestone.level} {t("c2.vocab_and_phrases", "vocabulary & phrases")}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Spoken Drills & Benchmark Challenges */}
        <div className="space-y-6">
          {/* Spoken Drills Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Mic size={16} className="text-rose-600" />
              {t("c2.interactive_spoken_drills", "Interactive Spoken Drills")}
            </h4>

            <div className="space-y-3">
              {activeMilestone.spokenDrills.map((drill) => (
                <div
                  key={drill.id}
                  className="p-4 bg-slate-50 hover:bg-rose-50/40 border border-slate-200 hover:border-rose-200 rounded-xl transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase rounded">
                      {drill.type.replace("_", " ")}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Clock size={12} /> {drill.durationMinutes} {t("c2.mins", "mins")}
                    </span>
                  </div>
                  <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                    <AutoText as="span" text={drill.title} context="c2_drill_title" />
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <AutoText as="span" text={drill.description} context="c2_drill_description" />
                  </p>
                  <button
                    type="button"
                    onClick={() => onStartSpokenDrill && onStartSpokenDrill(drill)}
                    className="w-full mt-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Play size={13} className="fill-white" />
                    <span>{t("c2.launch_spoken_drill", "Launch Spoken Drill")}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Benchmark Assessment CTA */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Trophy size={20} />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              {t("c2.take_level_benchmark_prefix", "Take")} {activeMilestone.level} {t("c2.take_level_benchmark_suffix", "Level Benchmark Exam")}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t("c2.benchmark_cta_desc", "Verify your oral fluency, grammar accuracy, and vocabulary depth to unlock the next milestone towards C2.")}
            </p>
            <button
              type="button"
              onClick={() => onTakeBenchmark && onTakeBenchmark(activeMilestone.level)}
              className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Award size={15} />
              <span>{t("c2.start_benchmark_prefix", "Start")} {activeMilestone.level} {t("c2.start_benchmark_suffix", "Benchmark Test")}</span>
            </button>
          </div>

          {/* AI Custom Drill Generator */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <Sparkles size={16} />
              <span>{t("c2.ai_dynamic_generator", "AI Dynamic Module Generator")}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t("c2.ai_generator_desc", "Have Gemini craft a personalized, high-intensity C2 drill tailored directly to your recent speaking weaknesses.")}
            </p>
            <button
              type="button"
              disabled={isGeneratingCustomDrill}
              onClick={handleGenerateCustomAIModule}
              className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGeneratingCustomDrill ? (
                <>
                  <Sparkles size={14} className="animate-spin text-indigo-600" />
                  <span>{t("c2.synthesizing_blueprint", "Synthesizing C2 Blueprint...")}</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-indigo-600" />
                  <span>{t("c2.generate_custom_drill", "Generate Custom AI Drill")}</span>
                </>
              )}
            </button>

            {/* Display generated dynamic AI content */}
            {customDrillResult && (
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2 mt-3 animate-in fade-in">
                <p className="text-xs font-bold text-indigo-900">{t("c2.custom_drill_ready", "Custom Dynamic C2 Drill Ready:")}</p>
                <p className="text-xs text-indigo-800">{translatedCustomDrillPitch}</p>
                {customDrillResult.phases && (
                  <div className="space-y-1.5 pt-1">
                    {customDrillResult.phases.slice(0, 2).map((phase: any, pIdx: number) => (
                      <div key={pIdx} className="text-[11px] text-slate-700 bg-white/80 p-2 rounded-lg border border-indigo-100">
                        <strong><AutoText as="span" text={phase.phaseTitle} context="c2_phase_title" />:</strong>{" "}
                        <AutoText as="span" text={phase.coreMilestone} context="c2_phase_milestone" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
