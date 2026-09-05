import React, { useState, useEffect } from "react";
import {
  Sparkles,
  BookOpen,
  Target,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle,
  Clock,
  Layers,
  Award,
  Terminal,
  Copy,
  Check,
  Download,
  Building,
  Briefcase,
  Stethoscope,
  Plane,
  ChevronRight,
  RefreshCw,
  Plus,
  Trash2,
  Volume2,
  Mic,
  Activity,
  Lightbulb,
} from "lucide-react";
import {
  AdaptiveCurriculumEnginePayload,
  AdaptiveRemediationAuthoringResult,
  CEFRLevel,
  UserProgress,
} from "../types";

interface AdaptiveCurriculumStudioProps {
  progress?: UserProgress;
  onGrantXp?: (amount: number, reason: string) => void;
}

interface BenchmarkPreset {
  id: string;
  name: string;
  industry: string;
  tag: string;
  description: string;
  payload: AdaptiveCurriculumEnginePayload;
}

const BENCHMARK_PRESETS: BenchmarkPreset[] = [
  {
    id: "bpo-dental-fricative-empathy",
    name: "BPO Tech Support • Dental /θ/ & Flat Prosody",
    industry: "BPO Customer Support",
    tag: "BPO /θ/ Drift",
    description:
      "Agent misarticulates /θ/ → /t/ ('tink' for 'think') and exhibits flat monotone pitch (SD 12.4 Hz). Assigns minimal pair drill & de-escalation roleplay.",
    payload: {
      diagnostic_inputs: {
        acoustic_features: {
          pitch_variation_stdev: 12.4,
          net_wpm: 88,
          hesitation_count: 5,
        },
        phonetic_diagnostics: [
          { target: "θ", realized: "t", error_type: "Substitution" },
        ],
        cefr_metrics: {
          fluency: "B1",
          lexical: "B2",
          grammar: "B2",
          pronunciation: "B1",
        },
      },
      institutional_authoring_parameters: {
        industry_target: "BPO Customer Support",
        target_vocabulary_list: [
          "escalation protocol",
          "root-cause analysis",
          "empathy statement",
          "service level agreement",
          "first-contact resolution",
        ],
        custom_rubric_criteria: [
          {
            name: "De-escalation Empathy",
            description: "Demonstrates active listening, tone mirroring, and supportive cadence",
            weight: 35,
          },
          {
            name: "Technical Accuracy & SOP",
            description: "Correctly outlines cloud outage diagnosis without technical jargon",
            weight: 35,
          },
          {
            name: "Phonetic Clarity & Prosodic Expressiveness",
            description: "Accurate dental fricative production with expressive pitch range",
            weight: 30,
          },
        ],
        simulation_persona: {
          role: "Frustrated SaaS Account Executive",
          tone: "High-urgency, skeptical, demanding prompt credit",
          objective: "Resolve multi-region cloud downtime and get written RCA commitment",
        },
      },
    },
  },
  {
    id: "medical-nursing-handoff",
    name: "Healthcare Nursing • SBAR Handoff & Hesitation",
    industry: "Medical Nursing Intake",
    tag: "Healthcare SBAR",
    description:
      "Nurse exhibits high mid-constituent hesitation (7 pauses) and low net WPM. Assigns shadowing chunking and critical patient handoff rubric.",
    payload: {
      diagnostic_inputs: {
        acoustic_features: {
          pitch_variation_stdev: 24.1,
          net_wpm: 76,
          hesitation_count: 7,
        },
        phonetic_diagnostics: [
          { target: "v", realized: "w", error_type: "Substitution" },
        ],
        cefr_metrics: {
          fluency: "B1",
          lexical: "C1",
          grammar: "B2",
          pronunciation: "B2",
        },
      },
      institutional_authoring_parameters: {
        industry_target: "Medical Nursing & Clinical Triage",
        target_vocabulary_list: [
          "SBAR protocol",
          "hemodynamic instability",
          "tachycardia",
          "stat intervention",
          "contraindication",
        ],
        custom_rubric_criteria: [
          {
            name: "SBAR Clinical Structure",
            description: "Situation, Background, Assessment, Recommendation sequential precision",
            weight: 40,
          },
          {
            name: "Fluency & Cognitive Pause Control",
            description: "Smooth delivery without mid-constituent disfluency under emergency pressure",
            weight: 30,
          },
          {
            name: "Medical Lexicon Accuracy",
            description: "Flawless deployment of clinical dosage and symptom vocabulary",
            weight: 30,
          },
        ],
        simulation_persona: {
          role: "Attending Emergency Physician",
          tone: "Direct, rapid-fire, focused on vital sign anomalies",
          objective: "Receive clinical handoff for deteriorating post-op patient in Bed 4",
        },
      },
    },
  },
  {
    id: "aviation-atc-radiotelephony",
    name: "Aviation ICAO • Radiotelephony Phonetics",
    industry: "Aviation Air Traffic Control",
    tag: "ICAO Radiotelephony",
    description:
      "Pilot exhibits vowel drift (/ɪ/ → /iː/) and non-standard phrasing. Assigns ICAO minimal pair drills and standard phraseology simulation.",
    payload: {
      diagnostic_inputs: {
        acoustic_features: {
          pitch_variation_stdev: 18.0,
          net_wpm: 125,
          hesitation_count: 2,
        },
        phonetic_diagnostics: [
          { target: "ɪ", realized: "iː", error_type: "Vowel Drift" },
        ],
        cefr_metrics: {
          fluency: "B2",
          lexical: "B2",
          grammar: "B2",
          pronunciation: "B1",
        },
      },
      institutional_authoring_parameters: {
        industry_target: "Aviation & Air Traffic Radiotelephony",
        target_vocabulary_list: [
          "readback constraint",
          "flight level three-five-zero",
          "squawk ident",
          "holding pattern",
          "runway visual range",
        ],
        custom_rubric_criteria: [
          {
            name: "ICAO Standard Phraseology",
            description: "Strict adherence to standardized radiotelephony words and numbers",
            weight: 45,
          },
          {
            name: "Acoustic Articulation Precision",
            description: "Unambiguous consonant release and tense/lax vowel differentiation",
            weight: 35,
          },
          {
            name: "Emergency Readback Promptness",
            description: "Immediate, error-free acknowledgment of altitude and vector clearance",
            weight: 20,
          },
        ],
        simulation_persona: {
          role: "Approach Radar Controller (London Sector 4)",
          tone: "Crisp, authoritative, time-critical",
          objective: "Sequence inbound aircraft around severe convective thunderstorm cell",
        },
      },
    },
  },
  {
    id: "corporate-sales-executive",
    name: "Enterprise B2B Sales • Value Pitch & Intonation",
    industry: "Enterprise B2B Tech Sales",
    tag: "B2B Value Pitch",
    description:
      "Sales engineer demonstrates restricted lexical diversity (A2/B1 vocabulary) and monotone pacing. Assigns synonym swaps & ROI value pitch.",
    payload: {
      diagnostic_inputs: {
        acoustic_features: {
          pitch_variation_stdev: 11.8,
          net_wpm: 98,
          hesitation_count: 4,
        },
        phonetic_diagnostics: [],
        cefr_metrics: {
          fluency: "B2",
          lexical: "B1",
          grammar: "B2",
          pronunciation: "B2",
        },
      },
      institutional_authoring_parameters: {
        industry_target: "Enterprise B2B SaaS Sales",
        target_vocabulary_list: [
          "total cost of ownership",
          "operational synergy",
          "frictionless onboarding",
          "quarterly business review",
          "ROI amortization",
        ],
        custom_rubric_criteria: [
          {
            name: "Executive Value Proposition",
            description: "Articulates measurable business outcomes rather than feature checklists",
            weight: 40,
          },
          {
            name: "Lexical Sophistication & Synonym Variance",
            description: "Replaces generic descriptors with precise enterprise terminology",
            weight: 30,
          },
          {
            name: "Persuasive Intonation & Cadence",
            description: "Dynamic pitch modulation to highlight key contractual benefits",
            weight: 30,
          },
        ],
        simulation_persona: {
          role: "Chief Information Officer (Fortune 500 Retailer)",
          tone: "Analytical, risk-averse, ROI-driven",
          objective: "Evaluate competing AI software proposals before board approval",
        },
      },
    },
  },
];

export const AdaptiveCurriculumStudio: React.FC<AdaptiveCurriculumStudioProps> = ({
  onGrantXp,
}) => {
  // Diagnostic state
  const [pitchStdev, setPitchStdev] = useState<number>(12.4);
  const [netWpm, setNetWpm] = useState<number>(88);
  const [hesitationCount, setHesitationCount] = useState<number>(5);
  const [targetPhoneme, setTargetPhoneme] = useState<string>("θ");
  const [realizedPhoneme, setRealizedPhoneme] = useState<string>("t");
  const [errorType, setErrorType] = useState<string>("Substitution");

  const [cefrFluency, setCefrFluency] = useState<CEFRLevel>("B1");
  const [cefrLexical, setCefrLexical] = useState<CEFRLevel>("B2");
  const [cefrGrammar, setCefrGrammar] = useState<CEFRLevel>("B2");
  const [cefrPronunciation, setCefrPronunciation] = useState<CEFRLevel>("B1");

  // Institutional authoring state
  const [industryTarget, setIndustryTarget] = useState<string>("BPO Customer Support");
  const [targetVocab, setTargetVocab] = useState<string>(
    "escalation protocol, root-cause analysis, empathy statement, service level agreement, first-contact resolution"
  );
  const [personaRole, setPersonaRole] = useState<string>("Frustrated SaaS Account Executive");
  const [personaTone, setPersonaTone] = useState<string>("High-urgency, skeptical, demanding prompt credit");
  const [personaObjective, setPersonaObjective] = useState<string>(
    "Resolve multi-region cloud downtime and get written RCA commitment"
  );

  // Result state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [curriculumResult, setCurriculumResult] = useState<AdaptiveRemediationAuthoringResult | null>(null);
  const [activeTab, setActiveTab] = useState<"remediation_plan" | "simulation_blueprint" | "scoring_rubric" | "raw_json">("remediation_plan");
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Active micro-lesson preview
  const [activeLessonIdx, setActiveLessonIdx] = useState<number>(0);

  // Load benchmark scenario
  const handleLoadPreset = (preset: BenchmarkPreset) => {
    const d = preset.payload.diagnostic_inputs;
    const a = preset.payload.institutional_authoring_parameters;

    setPitchStdev(d.acoustic_features.pitch_variation_stdev);
    setNetWpm(d.acoustic_features.net_wpm);
    setHesitationCount(d.acoustic_features.hesitation_count);

    if (d.phonetic_diagnostics.length > 0) {
      setTargetPhoneme(d.phonetic_diagnostics[0].target);
      setRealizedPhoneme(d.phonetic_diagnostics[0].realized);
      setErrorType(d.phonetic_diagnostics[0].error_type);
    } else {
      setTargetPhoneme("");
      setRealizedPhoneme("");
      setErrorType("None");
    }

    setCefrFluency(d.cefr_metrics.fluency);
    setCefrLexical(d.cefr_metrics.lexical);
    setCefrGrammar(d.cefr_metrics.grammar);
    setCefrPronunciation(d.cefr_metrics.pronunciation);

    setIndustryTarget(a.industry_target);
    setTargetVocab(a.target_vocabulary_list.join(", "));
    setPersonaRole(a.simulation_persona.role);
    setPersonaTone(a.simulation_persona.tone);
    setPersonaObjective(a.simulation_persona.objective);
  };

  // Run curriculum generator
  const handleGenerateCurriculum = async () => {
    setIsGenerating(true);
    const vocabArray = targetVocab
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload: AdaptiveCurriculumEnginePayload = {
      diagnostic_inputs: {
        acoustic_features: {
          pitch_variation_stdev: pitchStdev,
          net_wpm: netWpm,
          hesitation_count: hesitationCount,
        },
        phonetic_diagnostics: targetPhoneme
          ? [{ target: targetPhoneme, realized: realizedPhoneme, error_type: errorType }]
          : [],
        cefr_metrics: {
          fluency: cefrFluency,
          lexical: cefrLexical,
          grammar: cefrGrammar,
          pronunciation: cefrPronunciation,
        },
      },
      institutional_authoring_parameters: {
        industry_target: industryTarget,
        target_vocabulary_list: vocabArray,
        custom_rubric_criteria: [
          {
            name: "Domain Vocabulary Fluency",
            description: `Accurate contextual use of ${industryTarget} terminology`,
            weight: 40,
          },
          {
            name: "Acoustic Expressiveness & Cadence",
            description: "Dynamic pitch variation and steady WPM without mid-clause pauses",
            weight: 30,
          },
          {
            name: "Procedural Scenario Mastery",
            description: `Achieves simulation objective under ${personaTone} conditions`,
            weight: 30,
          },
        ],
        simulation_persona: {
          role: personaRole,
          tone: personaTone,
          objective: personaObjective,
        },
      },
    };

    try {
      const response = await fetch("/api/curriculum/adaptive-remediation-authoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Curriculum API failed: ${response.statusText}`);
      }

      const data: AdaptiveRemediationAuthoringResult = await response.json();
      setCurriculumResult(data);
      setActiveLessonIdx(0);

      if (onGrantXp) {
        onGrantXp(40, "Generated Adaptive Remediation & Custom Role-Play Blueprint");
      }
    } catch (err) {
      console.warn("Using local fallback curriculum engine:", err);

      let focusArea: "Acoustic Prosody" | "Phonemic Precision" | "Lexical Diversity" | "Syntactic Structure" = "Acoustic Prosody";
      const assignedLessons = [];

      if (targetPhoneme && (errorType === "Substitution" || errorType === "Deletion" || errorType === "Vowel Drift")) {
        focusArea = "Phonemic Precision";
        assignedLessons.push({
          lesson_id: "MICRO-PHON-01",
          title: `Phonemic Contrast Drill: /${targetPhoneme}/ vs /${realizedPhoneme}/`,
          target_gap: `Target misarticulation: /${targetPhoneme}/ substituted by /${realizedPhoneme}/.`,
          format: "Minimal Pair Drill" as const,
          estimated_duration_minutes: 2,
          exercise_content: {
            instructions: `Formulate correct dental or vocal tract aperture for /${targetPhoneme}/. Contrast immediately with /${realizedPhoneme}/.`,
            practice_prompts: [
              `Target: /${targetPhoneme}/ in initial position (e.g., Think, Thought)`,
              `Medial contrast (e.g., Method vs. Metted)`,
              `Final release (e.g., Path vs. Pat)`,
              "Contextual sentence: 'The team thought through the three critical points.'",
            ],
          },
        });
      } else if (pitchStdev < 20) {
        focusArea = "Acoustic Prosody";
        assignedLessons.push({
          lesson_id: "MICRO-PROS-01",
          title: "Pitch-Range & Emphatic Cadence Calibration",
          target_gap: "Flat, robotic F0 pitch variation (SD < 20 Hz).",
          format: "Pitch Contour Matching" as const,
          estimated_duration_minutes: 3,
          exercise_content: {
            instructions: "Elevate your voice pitch on key content words. Avoid monotone terminal falls.",
            practice_prompts: [
              "We are COMPLETELY dedicated to your account resolution.",
              "I UNDERSTAND how frustrating this server outage has been.",
              "Let me IMMEDIATELY escalate this ticket to senior engineering.",
            ],
          },
        });
      } else {
        focusArea = "Syntactic Structure";
        assignedLessons.push({
          lesson_id: "MICRO-FLUID-01",
          title: "Syntactic Chunking & Breath Group Shadowing",
          target_gap: `${hesitationCount} mid-constituent hesitation pauses detected.`,
          format: "Shadowing Practice" as const,
          estimated_duration_minutes: 2,
          exercise_content: {
            instructions: "Shadow the audio model. Pause strictly at major clause boundaries.",
            practice_prompts: [
              "[Following standard protocol] [I have credited the billing discrepancy] [to your master invoice].",
              "[Our principal objective] [is to safeguard system uptime] [under our enterprise SLA].",
            ],
          },
        });
      }

      setCurriculumResult({
        remediation_plan: {
          priority_focus_area: focusArea,
          assigned_microlessons: assignedLessons,
        },
        custom_authoring_execution: {
          scenario_profile: {
            industry: industryTarget,
            simulation_title: `${industryTarget} Immersive Diagnostic Roleplay`,
            persona_prompt: `You are a ${personaRole} acting with a ${personaTone} disposition. Your objective is: ${personaObjective}.`,
            learning_objectives: [
              `Seamlessly integrate ${vocabArray.length} industry-specific terms during spontaneous speech.`,
              "Eliminate targeted articulatory drift while managing conversational time pressure.",
              "Demonstrate empathy, de-escalation, and strict procedural adherence.",
            ],
          },
          domain_vocabulary_integration: vocabArray.map((term) => ({
            term,
            expected_context: `Used accurately in ${industryTarget} discourse.`,
            mastery_trigger: `Candidate naturally deploys '${term}' during the simulation response.`,
          })),
          custom_scoring_rubric: [
            {
              criterion_name: "Industry Lexicon Fluency",
              weight_percentage: 40,
              performance_descriptors: {
                exceeds: `Naturally deploys all ${vocabArray.length} key domain phrases without pausing.`,
                meets: "Deploys at least 70% of domain keywords accurately in context.",
                needs_improvement: "Omits key terms or relies on overly generic lay terminology.",
              },
            },
            {
              criterion_name: "Prosodic & Articulatory Precision",
              weight_percentage: 30,
              performance_descriptors: {
                exceeds: "Expressive pitch modulation with zero phoneme substitution errors.",
                meets: "Minor phonetic drift that does not impede mutual intelligibility.",
                needs_improvement: "Monotone speech or recurrent misarticulations.",
              },
            },
            {
              criterion_name: "Scenario Objective Resolution",
              weight_percentage: 30,
              performance_descriptors: {
                exceeds: "Fully resolves persona objective with proactive clarity and reassurance.",
                meets: "Satisfies primary objective but requires minor follow-up prompts.",
                needs_improvement: "Fails to de-escalate situation or misses core requirement.",
              },
            },
          ],
        },
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    handleGenerateCurriculum();
  }, []);

  const handleCopyJson = () => {
    if (!curriculumResult) return;
    navigator.clipboard.writeText(JSON.stringify(curriculumResult, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleExportJson = () => {
    if (!curriculumResult) return;
    const blob = new Blob([JSON.stringify(curriculumResult, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `adaptive_curriculum_${industryTarget.replace(/\s+/g, "_").toLowerCase()}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-cyan-950 to-slate-900 rounded-2xl p-6 border border-cyan-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="bg-cyan-500/20 text-cyan-300 text-xs font-bold px-2.5 py-1 rounded-full border border-cyan-400/30 flex items-center gap-1">
                <Sparkles size={13} />
                ADAPTIVE REMEDIATION & AUTHORING ENGINE
              </span>
              <span className="bg-teal-500/20 text-teal-300 text-xs font-bold px-2 py-0.5 rounded-full border border-teal-400/30">
                1-3 MINUTE MICRO-LESSONS
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                INSTITUTIONAL BLUEPRINTS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <BookOpen className="text-cyan-400" />
              Dynamic Remediation & Custom Role-Play Studio
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Translate raw acoustic errors and phonetic diagnostic vectors into targeted micro-drills, while authoring tailored enterprise role-play simulations, domain vocabularies, and weighted evaluation rubrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-generate-curriculum"
              type="button"
              onClick={handleGenerateCurriculum}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-black text-sm rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={16} className={isGenerating ? "animate-spin" : ""} />
              <span>{isGenerating ? "Synthesizing Curriculum..." : "Generate Remediation & Simulation"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Benchmark Presets */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-cyan-700" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Institutional Benchmark Scenarios
            </h2>
          </div>
          <span className="text-xs text-slate-500">Preset diagnostic profiles & enterprise role-play blueprints</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {BENCHMARK_PRESETS.map((preset) => (
            <button
              key={preset.id}
              id={`btn-preset-${preset.id}`}
              type="button"
              onClick={() => {
                handleLoadPreset(preset);
                setTimeout(handleGenerateCurriculum, 100);
              }}
              className="text-left p-3.5 rounded-xl border border-slate-200 hover:border-cyan-400 bg-slate-50/70 hover:bg-cyan-50/50 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-900">
                    {preset.tag}
                  </span>
                  <ChevronRight size={14} className="text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs line-clamp-1">{preset.name}</h3>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Diagnostic Inputs & Institutional Authoring (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Module 1: Raw Diagnostic Inputs */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="text-cyan-700" size={18} />
                <h3 className="font-black text-slate-800 text-sm">1. Candidate Diagnostic Inputs</h3>
              </div>
              <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded">
                Acoustic & Phonetic
              </span>
            </div>

            {/* Pitch Variation SD */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>F0 Pitch Variation (SD in Hz)</span>
                <span className={`font-mono px-2 py-0.2 rounded ${pitchStdev < 18 ? "bg-amber-100 text-amber-900 font-bold" : "bg-slate-100 text-slate-700"}`}>
                  {pitchStdev.toFixed(1)} Hz {pitchStdev < 18 ? "(Monotone)" : "(Expressive)"}
                </span>
              </div>
              <input
                id="slider-pitch-stdev"
                type="range"
                min="5"
                max="45"
                step="0.5"
                value={pitchStdev}
                onChange={(e) => setPitchStdev(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>5 Hz (Flat Robot)</span>
                <span>Threshold: &lt;20 Hz assigns Pitch Matching</span>
                <span>45 Hz (Highly Expressive)</span>
              </div>
            </div>

            {/* Net Articulation WPM & Hesitations */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Net Articulation WPM</label>
                <input
                  id="input-net-wpm"
                  type="number"
                  min="40"
                  max="180"
                  value={netWpm}
                  onChange={(e) => setNetWpm(parseInt(e.target.value) || 80)}
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hesitation Count</label>
                <input
                  id="input-hesitation-count"
                  type="number"
                  min="0"
                  max="15"
                  value={hesitationCount}
                  onChange={(e) => setHesitationCount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Phonetic Diagnostic Vector */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-800 block">Phonetic Articulation Error</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Target IPA</label>
                  <input
                    id="input-target-phoneme"
                    type="text"
                    value={targetPhoneme}
                    onChange={(e) => setTargetPhoneme(e.target.value)}
                    placeholder="e.g. θ"
                    className="w-full px-2 py-1.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Realized IPA</label>
                  <input
                    id="input-realized-phoneme"
                    type="text"
                    value={realizedPhoneme}
                    onChange={(e) => setRealizedPhoneme(e.target.value)}
                    placeholder="e.g. t"
                    className="w-full px-2 py-1.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg text-center text-rose-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Shift Type</label>
                  <select
                    id="select-error-type"
                    value={errorType}
                    onChange={(e) => setErrorType(e.target.value)}
                    className="w-full px-2 py-1.5 text-[11px] font-bold bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="Substitution">Substitution</option>
                    <option value="Deletion">Deletion</option>
                    <option value="Insertion">Insertion</option>
                    <option value="Vowel Drift">Vowel Drift</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CEFR Diagnostic Metrics */}
            <div>
              <span className="text-[11px] font-bold text-slate-800 mb-1.5 block">CEFR Multi-Skill Vector</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: "Fluency", val: cefrFluency, set: setCefrFluency },
                  { label: "Lexical", val: cefrLexical, set: setCefrLexical },
                  { label: "Grammar", val: cefrGrammar, set: setCefrGrammar },
                  { label: "Pron.", val: cefrPronunciation, set: setCefrPronunciation },
                ].map((item) => (
                  <div key={item.label} className="text-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">{item.label}</span>
                    <select
                      value={item.val}
                      onChange={(e) => item.set(e.target.value as CEFRLevel)}
                      className="w-full mt-1 text-xs font-black bg-white border border-slate-200 rounded p-1 text-center"
                    >
                      {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Module 2: Institutional Blueprint & Custom Authoring Parameters */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="text-indigo-600" size={18} />
                <h3 className="font-black text-slate-800 text-sm">2. Institutional Authoring Parameters</h3>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                Custom Blueprint
              </span>
            </div>

            {/* Target Industry */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Industry Target</label>
              <input
                id="input-industry-target"
                type="text"
                value={industryTarget}
                onChange={(e) => setIndustryTarget(e.target.value)}
                placeholder="e.g. BPO Customer Service, Aviation ATC, Medical Nursing"
                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Domain Vocabulary List */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Vocabulary List (Comma-separated)
              </label>
              <textarea
                id="textarea-target-vocab"
                rows={2}
                value={targetVocab}
                onChange={(e) => setTargetVocab(e.target.value)}
                placeholder="term1, term2, term3"
                className="w-full p-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Simulation Persona Blueprint */}
            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2.5">
              <span className="text-xs font-bold text-indigo-950 block flex items-center gap-1.5">
                <Briefcase size={14} className="text-indigo-600" />
                AI Simulation Persona Blueprint
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-indigo-900 mb-0.5">Persona Role</label>
                  <input
                    id="input-persona-role"
                    type="text"
                    value={personaRole}
                    onChange={(e) => setPersonaRole(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs font-semibold bg-white border border-indigo-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-indigo-900 mb-0.5">Disposition / Tone</label>
                  <input
                    id="input-persona-tone"
                    type="text"
                    value={personaTone}
                    onChange={(e) => setPersonaTone(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs font-semibold bg-white border border-indigo-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-indigo-900 mb-0.5">Simulation Objective</label>
                <input
                  id="input-persona-objective"
                  type="text"
                  value={personaObjective}
                  onChange={(e) => setPersonaObjective(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs font-semibold bg-white border border-indigo-200 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output Showcase & Interactive Microlessons (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Result Tabs Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            {[
              { id: "remediation_plan", label: "Remedial Micro-Lessons", icon: BookOpen },
              { id: "simulation_blueprint", label: "Role-Play Blueprint", icon: Briefcase },
              { id: "scoring_rubric", label: "Custom Rubric", icon: Sliders },
              { id: "raw_json", label: "Standardized JSON", icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`tab-curriculum-${tab.id}`}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-teal-600 to-cyan-700 text-white shadow-md shadow-teal-600/20"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Remediation Micro-Lessons */}
          {activeTab === "remediation_plan" && curriculumResult && (
            <div className="space-y-4">
              {/* Priority Focus Header */}
              <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-emerald-50 rounded-2xl p-4 border border-cyan-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-800 tracking-wider block">
                    Diagnostic Remediation Focus
                  </span>
                  <h3 className="text-base font-black text-cyan-950 flex items-center gap-2">
                    <Target size={18} className="text-cyan-700" />
                    {curriculumResult.remediation_plan.priority_focus_area}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-600">Assigned Modules</span>
                  <span className="block font-black text-sm text-cyan-900">
                    {curriculumResult.remediation_plan.assigned_microlessons.length} Micro-Lessons
                  </span>
                </div>
              </div>

              {/* Lesson List / Selector */}
              <div className="grid grid-cols-1 gap-3">
                {curriculumResult.remediation_plan.assigned_microlessons.map((lesson, idx) => (
                  <div
                    key={lesson.lesson_id}
                    className={`rounded-2xl p-4 border transition-all ${
                      activeLessonIdx === idx
                        ? "bg-white border-cyan-500 shadow-md ring-1 ring-cyan-400"
                        : "bg-slate-50 border-slate-200 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-cyan-100 text-cyan-900 font-mono text-[10px] font-black px-2 py-0.5 rounded">
                          {lesson.lesson_id}
                        </span>
                        <span className="bg-teal-100 text-teal-900 text-[10px] font-black px-2 py-0.5 rounded">
                          {lesson.format}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Clock size={13} />
                        {lesson.estimated_duration_minutes} min drill
                      </span>
                    </div>

                    <h4 className="font-black text-slate-900 text-sm mb-1">{lesson.title}</h4>
                    <p className="text-xs text-slate-600 mb-3">
                      <strong className="text-slate-800">Target Gap:</strong> {lesson.target_gap}
                    </p>

                    {/* Exercise Content Box */}
                    <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                          <Lightbulb size={14} />
                          Instructions & Mouth Placement
                        </span>
                        <span className="text-[10px] text-slate-400">Interactive Drill</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {lesson.exercise_content.instructions}
                      </p>

                      <div className="pt-2 border-t border-slate-800">
                        <span className="text-[11px] font-bold text-cyan-300 block mb-1.5">
                          Practice Prompts & Repetitions:
                        </span>
                        <div className="space-y-1.5">
                          {lesson.exercise_content.practice_prompts.map((prompt, pIdx) => (
                            <div
                              key={pIdx}
                              className="p-2 bg-slate-800/90 rounded-lg text-xs font-mono text-emerald-300 border border-slate-700 flex items-center justify-between"
                            >
                              <span>{prompt}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if ("speechSynthesis" in window) {
                                    const u = new SpeechSynthesisUtterance(prompt);
                                    u.rate = 0.9;
                                    window.speechSynthesis.speak(u);
                                  }
                                }}
                                className="text-slate-400 hover:text-cyan-300 transition-colors p-1"
                                title="Listen to acoustic reference"
                              >
                                <Volume2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Custom Role-Play Simulation Blueprint */}
          {activeTab === "simulation_blueprint" && curriculumResult && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                    {curriculumResult.custom_authoring_execution.scenario_profile.industry}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">
                    {curriculumResult.custom_authoring_execution.scenario_profile.simulation_title}
                  </h3>
                </div>

                <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200">
                  <span className="text-xs font-bold text-indigo-950 block mb-1">
                    Persona System Instructions:
                  </span>
                  <p className="text-xs text-indigo-900 leading-relaxed italic">
                    "{curriculumResult.custom_authoring_execution.scenario_profile.persona_prompt}"
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                    Learning Objectives
                  </h4>
                  <ul className="space-y-1.5">
                    {curriculumResult.custom_authoring_execution.scenario_profile.learning_objectives.map(
                      (obj, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                          <CheckCircle size={15} className="text-teal-600 mt-0.5 shrink-0" />
                          <span>{obj}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                    Domain Vocabulary & Mastery Triggers
                  </h4>
                  <div className="space-y-2">
                    {curriculumResult.custom_authoring_execution.domain_vocabulary_integration.map(
                      (item, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-indigo-700">{item.term}</span>
                            <span className="text-[10px] text-slate-500 font-mono">Integration Criterion</span>
                          </div>
                          <p className="text-slate-600">
                            <strong>Expected Context:</strong> {item.expected_context}
                          </p>
                          <p className="text-emerald-700 mt-0.5">
                            <strong>Mastery Trigger:</strong> {item.mastery_trigger}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Custom Scoring Rubric */}
          {activeTab === "scoring_rubric" && curriculumResult && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Sliders size={16} className="text-cyan-700" />
                  Weighted Institutional Assessment Rubric
                </h3>
                <span className="text-xs text-slate-500">100% Total Weight Allocation</span>
              </div>

              <div className="space-y-3">
                {curriculumResult.custom_authoring_execution.custom_scoring_rubric.map((rubric, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-800 text-xs">{rubric.criterion_name}</h4>
                      <span className="bg-cyan-100 text-cyan-950 font-black text-xs px-2.5 py-0.5 rounded-full">
                        {rubric.weight_percentage}% Weight
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2">
                      <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                        <span className="text-[10px] font-black text-emerald-900 block mb-0.5">
                          Exceeds Expectations
                        </span>
                        <p className="text-[11px] text-emerald-800 leading-tight">
                          {rubric.performance_descriptors.exceeds}
                        </p>
                      </div>

                      <div className="p-2.5 bg-cyan-50 rounded-lg border border-cyan-200">
                        <span className="text-[10px] font-black text-cyan-900 block mb-0.5">
                          Meets Standard
                        </span>
                        <p className="text-[11px] text-cyan-800 leading-tight">
                          {rubric.performance_descriptors.meets}
                        </p>
                      </div>

                      <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200">
                        <span className="text-[10px] font-black text-rose-900 block mb-0.5">
                          Needs Improvement
                        </span>
                        <p className="text-[11px] text-rose-800 leading-tight">
                          {rubric.performance_descriptors.needs_improvement}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Standardized Output JSON */}
          {activeTab === "raw_json" && curriculumResult && (
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal size={16} className="text-cyan-400" />
                  <span className="text-xs font-mono font-bold text-slate-300">
                    adaptive_curriculum_payload.json
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                  >
                    {copiedJson ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedJson ? "Copied" : "Copy JSON"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Download size={13} />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <pre className="p-3 bg-slate-950 rounded-xl overflow-x-auto text-[11px] font-mono text-cyan-300 max-h-96">
                {JSON.stringify(curriculumResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
