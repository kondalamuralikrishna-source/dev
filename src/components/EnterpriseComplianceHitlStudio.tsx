import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  UserCheck,
  FileCheck,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Download,
  Scale,
  Building2,
  Sliders,
  Award,
  Terminal,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Shield,
  Eye,
  Radio,
  FileText,
  UserX,
  Volume2,
} from "lucide-react";
import {
  EnterpriseComplianceHitlPayload,
  EnterpriseComplianceHitlResult,
  CEFRLevel,
  JurisdictionCode,
  EducatorActionFlag,
  UserProgress,
} from "../types";

interface EnterpriseComplianceHitlStudioProps {
  progress?: UserProgress;
  onGrantXp?: (amount: number, reason: string) => void;
}

interface BenchmarkScenario {
  id: string;
  name: string;
  category: "PRIVACY_BLOCK" | "PROCTORING_FRAUD" | "HITL_OVERRIDE" | "GDPR_PURGE";
  description: string;
  tag: string;
  payload: EnterpriseComplianceHitlPayload;
}

const BENCHMARK_SCENARIOS: BenchmarkScenario[] = [
  {
    id: "dpdp-minor-blocked",
    name: "India DPDP Act 2023 Minor Consent Gate",
    category: "PRIVACY_BLOCK",
    tag: "DPDP Sec 9",
    description:
      "A 15-year-old candidate in India takes an assessment without verified parental consent. Strict compliance engine triggers DPDP_CONSENT_MISSING block.",
    payload: {
      proctoring_telemetry: {
        browser_focus_lost_count: 0,
        secondary_voice_detected: false,
        audio_input_device_switch_count: 0,
        identity_match_confidence: 0.96,
      },
      candidate_privacy_metadata: {
        candidate_age: 15,
        jurisdiction_code: "IN",
        parental_consent_verified: false,
        voice_retention_opt_in: false,
        candidate_id: "IN-KID-8802",
        candidate_name: "Aarav Sharma",
      },
      assessment_hitl_action: {
        automated_cefr_metric: "B1",
        raw_score: 64.0,
        educator_action_flag: "NONE",
      },
    },
  },
  {
    id: "proctoring-multi-speaker-fraud",
    name: "Proctoring Integrity Breach: Multi-Speaker & Focus Hijack",
    category: "PROCTORING_FRAUD",
    tag: "Risk 0.92 (VOID)",
    description:
      "Secondary voice detected in background, 7 window switches, and face-match confidence drops to 0.61. Assessment voided and account locked.",
    payload: {
      proctoring_telemetry: {
        browser_focus_lost_count: 7,
        secondary_voice_detected: true,
        audio_input_device_switch_count: 3,
        identity_match_confidence: 0.61,
      },
      candidate_privacy_metadata: {
        candidate_age: 24,
        jurisdiction_code: "GLOBAL",
        parental_consent_verified: "N/A",
        voice_retention_opt_in: true,
        candidate_id: "GL-CAND-4091",
        candidate_name: "Elena Rostova",
      },
      assessment_hitl_action: {
        automated_cefr_metric: "C1",
        raw_score: 88.0,
        educator_action_flag: "NONE",
      },
    },
  },
  {
    id: "hitl-teacher-score-override",
    name: "HITL Human Override: Mic Glitch Correction",
    category: "HITL_OVERRIDE",
    tag: "Teacher Override",
    description:
      "Automated engine under-scored candidate to B1 due to mic clipping. Senior Academic Auditor manually reviews recording and elevates score to B2 (78.0).",
    payload: {
      proctoring_telemetry: {
        browser_focus_lost_count: 1,
        secondary_voice_detected: false,
        audio_input_device_switch_count: 1,
        identity_match_confidence: 0.94,
      },
      candidate_privacy_metadata: {
        candidate_age: 21,
        jurisdiction_code: "US",
        parental_consent_verified: true,
        voice_retention_opt_in: false,
        candidate_id: "US-UNIV-9120",
        candidate_name: "Marcus Chen",
      },
      assessment_hitl_action: {
        automated_cefr_metric: "B1",
        raw_score: 61.5,
        educator_action_flag: "OVERRIDE_SUBMITTED",
        educator_annotation_data: {
          override_score: 78.0,
          override_cefr: "B2",
          reason_code: "ACOUSTIC_HARDWARE_DEFECT",
          reviewer_notes:
            "Verified candidate speech recording manually. Low-grade microphone clipping caused false-positive disfluency scoring. Real articulation is strong B2.",
          overseer_id: "AUDITOR-PROF-WILLIAMS-88",
        },
      },
    },
  },
  {
    id: "gdpr-eu-zero-retention",
    name: "GDPR EU Zero-Retention Audio Purge",
    category: "GDPR_PURGE",
    tag: "GDPR Zero-Ret",
    description:
      "EU candidate under GDPR Article 17 (Right to Erasure) with Voice Retention Opt-Out. Immediate cryptographic deletion deadline scheduled.",
    payload: {
      proctoring_telemetry: {
        browser_focus_lost_count: 0,
        secondary_voice_detected: false,
        audio_input_device_switch_count: 0,
        identity_match_confidence: 0.98,
      },
      candidate_privacy_metadata: {
        candidate_age: 29,
        jurisdiction_code: "EU",
        parental_consent_verified: true,
        voice_retention_opt_in: false,
        candidate_id: "EU-CORP-3319",
        candidate_name: "Claire Dubois",
      },
      assessment_hitl_action: {
        automated_cefr_metric: "C1",
        raw_score: 86.5,
        educator_action_flag: "NONE",
      },
    },
  },
];

export const EnterpriseComplianceHitlStudio: React.FC<EnterpriseComplianceHitlStudioProps> = ({
  onGrantXp,
}) => {
  // State for proctoring telemetry
  const [focusLostCount, setFocusLostCount] = useState<number>(0);
  const [secondaryVoice, setSecondaryVoice] = useState<boolean>(false);
  const [deviceSwitches, setDeviceSwitches] = useState<number>(0);
  const [identityMatch, setIdentityMatch] = useState<number>(0.95);

  // State for privacy metadata
  const [candidateAge, setCandidateAge] = useState<number>(22);
  const [jurisdiction, setJurisdiction] = useState<JurisdictionCode>("IN");
  const [parentalConsent, setParentalConsent] = useState<boolean>(false);
  const [voiceRetentionOptIn, setVoiceRetentionOptIn] = useState<boolean>(false);
  const [candidateId, setCandidateId] = useState<string>("IN-CAND-7721");
  const [candidateName, setCandidateName] = useState<string>("Priya Patel");

  // State for HITL and scoring
  const [automatedCefr, setAutomatedCefr] = useState<CEFRLevel>("B2");
  const [rawScore, setRawScore] = useState<number>(72.0);
  const [educatorFlag, setEducatorFlag] = useState<EducatorActionFlag>("NONE");
  const [overrideScore, setOverrideScore] = useState<number>(82.0);
  const [overrideCefr, setOverrideCefr] = useState<CEFRLevel>("C1");
  const [reasonCode, setReasonCode] = useState<string>("DIALECT_VARIATION_PROTECTION");
  const [reviewerNotes, setReviewerNotes] = useState<string>(
    "Educator evaluated regional L1 phonetic variant. Candidate demonstrates full professional communicative competence."
  );
  const [overseerId, setOverseerId] = useState<string>("COMPLIANCE-OFFICER-409");

  // Audit evaluation state
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<EnterpriseComplianceHitlResult | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"audit_dashboard" | "telemetry_logs" | "privacy_pipeline" | "hitl_reconciler" | "raw_json">("audit_dashboard");

  // Load benchmark scenario
  const handleLoadScenario = (scenario: BenchmarkScenario) => {
    setFocusLostCount(scenario.payload.proctoring_telemetry.browser_focus_lost_count);
    setSecondaryVoice(scenario.payload.proctoring_telemetry.secondary_voice_detected);
    setDeviceSwitches(scenario.payload.proctoring_telemetry.audio_input_device_switch_count);
    setIdentityMatch(scenario.payload.proctoring_telemetry.identity_match_confidence);

    setCandidateAge(scenario.payload.candidate_privacy_metadata.candidate_age);
    setJurisdiction(scenario.payload.candidate_privacy_metadata.jurisdiction_code);
    setParentalConsent(scenario.payload.candidate_privacy_metadata.parental_consent_verified === true);
    setVoiceRetentionOptIn(scenario.payload.candidate_privacy_metadata.voice_retention_opt_in);
    setCandidateId(scenario.payload.candidate_privacy_metadata.candidate_id || "CAND-001");
    setCandidateName(scenario.payload.candidate_privacy_metadata.candidate_name || "Candidate");

    setAutomatedCefr(scenario.payload.assessment_hitl_action.automated_cefr_metric);
    setRawScore(scenario.payload.assessment_hitl_action.raw_score ?? 70.0);
    setEducatorFlag(scenario.payload.assessment_hitl_action.educator_action_flag);

    if (scenario.payload.assessment_hitl_action.educator_annotation_data) {
      setOverrideScore(scenario.payload.assessment_hitl_action.educator_annotation_data.override_score);
      setOverrideCefr(scenario.payload.assessment_hitl_action.educator_annotation_data.override_cefr || "B2");
      setReasonCode(scenario.payload.assessment_hitl_action.educator_annotation_data.reason_code);
      setReviewerNotes(scenario.payload.assessment_hitl_action.educator_annotation_data.reviewer_notes || "");
      setOverseerId(scenario.payload.assessment_hitl_action.educator_annotation_data.overseer_id || "OFFICER-01");
    }
  };

  // Run audit engine
  const handleRunAudit = async () => {
    setIsEvaluating(true);
    const payload: EnterpriseComplianceHitlPayload = {
      proctoring_telemetry: {
        browser_focus_lost_count: focusLostCount,
        secondary_voice_detected: secondaryVoice,
        audio_input_device_switch_count: deviceSwitches,
        identity_match_confidence: identityMatch,
      },
      candidate_privacy_metadata: {
        candidate_age: candidateAge,
        jurisdiction_code: jurisdiction,
        parental_consent_verified: parentalConsent,
        voice_retention_opt_in: voiceRetentionOptIn,
        candidate_id: candidateId,
        candidate_name: candidateName,
      },
      assessment_hitl_action: {
        automated_cefr_metric: automatedCefr,
        raw_score: rawScore,
        educator_action_flag: educatorFlag,
        educator_annotation_data:
          educatorFlag === "OVERRIDE_SUBMITTED"
            ? {
                override_score: overrideScore,
                override_cefr: overrideCefr,
                reason_code: reasonCode,
                reviewer_notes: reviewerNotes,
                overseer_id: overseerId,
              }
            : undefined,
      },
    };

    try {
      const response = await fetch("/api/compliance/enterprise-audit-hitl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Audit API failed: ${response.statusText}`);
      }

      const data: EnterpriseComplianceHitlResult = await response.json();
      setAuditResult(data);

      if (onGrantXp) {
        onGrantXp(40, "Completed Enterprise Assessment Security & Compliance Audit");
      }
    } catch (err) {
      console.warn("Using local compliance engine fallback:", err);
      // Fallback
      let risk = 0.05;
      const violations: string[] = [];
      if (focusLostCount > 3) {
        risk += 0.35;
        violations.push(`Frequent browser focus shifts (${focusLostCount} occurrences).`);
      }
      if (secondaryVoice) {
        risk += 0.45;
        violations.push("Secondary speaker voice detected in acoustic background.");
      }
      if (deviceSwitches > 1) {
        risk += 0.20;
        violations.push(`Multiple audio device swaps detected (${deviceSwitches} switches).`);
      }
      if (identityMatch < 0.85) {
        risk += 0.40;
        violations.push(`Biometric identity confidence (${(identityMatch * 100).toFixed(0)}%) below threshold.`);
      }

      let framework: "GDPR" | "FERPA" | "DPDP_2023" | "GENERIC" = "GENERIC";
      let consentOk = true;

      if (jurisdiction === "IN") {
        framework = "DPDP_2023";
        if (candidateAge < 18 && !parentalConsent) {
          consentOk = false;
          risk = 1.0;
          violations.push("DPDP_CONSENT_MISSING: Verifiable parental consent mandatory under DPDP Act 2023 Section 9 for minors under 18.");
        }
      } else if (jurisdiction === "EU") {
        framework = "GDPR";
        if (candidateAge < 16 && !parentalConsent) {
          consentOk = false;
          violations.push("GDPR_ARTICLE_8_VIOLATION: Parental consent missing for minor candidate under 16.");
        }
      } else if (jurisdiction === "US") {
        framework = "FERPA";
        if (candidateAge < 18 && !parentalConsent) {
          consentOk = false;
        }
      }

      const clampedRisk = Math.min(1.0, Math.max(0.0, Number(risk.toFixed(2))));
      const validity: "VALID" | "FLAGGED" | "VOID" = clampedRisk > 0.8 || !consentOk ? "VOID" : clampedRisk > 0.4 ? "FLAGGED" : "VALID";

      const hitlApplied = educatorFlag === "OVERRIDE_SUBMITTED";
      const finalScore = hitlApplied ? overrideScore : rawScore;
      const finalCefrLevel = hitlApplied ? overrideCefr : automatedCefr;
      const drift = hitlApplied ? Number((overrideScore - rawScore).toFixed(2)) : 0.0;

      setAuditResult({
        proctoring_audit: {
          integrity_risk_index: clampedRisk,
          assessment_validity: validity,
          detected_violations: violations,
        },
        privacy_compliance_status: {
          regulatory_framework: framework,
          minor_status_handled: true,
          consent_verified: consentOk,
          voice_deletion_scheduled: !voiceRetentionOptIn,
          deletion_deadline_timestamp: !voiceRetentionOptIn ? new Date(Date.now() + 3600000).toISOString() : null,
        },
        scoring_and_hitl_reconciliation: {
          final_reported_cefr: finalCefrLevel,
          raw_llm_score: rawScore,
          effective_score: finalScore,
          hitl_override_applied: hitlApplied,
          human_reviewer_notes: hitlApplied ? reviewerNotes : null,
          drift_delta: drift,
        },
        system_actions: {
          lock_candidate_progress: validity === "VOID" || clampedRisk > 0.65,
          notify_administrator: validity !== "VALID" || hitlApplied,
          purge_audio_payload_immediately: !voiceRetentionOptIn,
        },
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    handleRunAudit();
  }, []);

  const handleCopyJson = () => {
    if (!auditResult) return;
    navigator.clipboard.writeText(JSON.stringify(auditResult, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleExportJson = () => {
    if (!auditResult) return;
    const blob = new Blob([JSON.stringify(auditResult, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance_audit_${candidateId}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 border border-indigo-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-400/30 flex items-center gap-1">
                <ShieldCheck size={13} />
                ENTERPRISE COMPLIANCE & PROCTORING
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                GDPR • FERPA • DPDP ACT 2023
              </span>
              <span className="bg-cyan-500/20 text-cyan-300 text-xs font-bold px-2 py-0.5 rounded-full border border-cyan-400/30">
                HITL HUMAN OVERRIDE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <Scale className="text-indigo-400" />
              Proctoring Telemetry, Privacy & HITL Controller
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Execute high-stakes assessment security audits, multi-jurisdiction data privacy governance (India DPDP 2023 minor gates, GDPR Right-to-Erasure, FERPA), and authoritative Human-in-the-Loop score override reconciliations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-run-compliance-audit"
              type="button"
              onClick={handleRunAudit}
              disabled={isEvaluating}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={16} className={isEvaluating ? "animate-spin" : ""} />
              <span>{isEvaluating ? "Auditing Pipeline..." : "Execute Audit Engine"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Benchmark Calibration Scenarios */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Regulatory Benchmark Scenarios
            </h2>
          </div>
          <span className="text-xs text-slate-500">Quickly calibrate real-world compliance edge-cases</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {BENCHMARK_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              id={`btn-scenario-${scenario.id}`}
              type="button"
              onClick={() => {
                handleLoadScenario(scenario);
                setTimeout(handleRunAudit, 100);
              }}
              className="text-left p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/50 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      scenario.category === "PRIVACY_BLOCK"
                        ? "bg-rose-100 text-rose-800"
                        : scenario.category === "PROCTORING_FRAUD"
                        ? "bg-amber-100 text-amber-900"
                        : scenario.category === "HITL_OVERRIDE"
                        ? "bg-indigo-100 text-indigo-900"
                        : "bg-emerald-100 text-emerald-900"
                    }`}
                  >
                    {scenario.tag}
                  </span>
                  <ChevronRight size={14} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs line-clamp-1">{scenario.name}</h3>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {scenario.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Controls & Live Audit Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Simulation & Policy Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Section 1: Real-Time Proctoring Telemetry */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="text-amber-600" size={18} />
                <h3 className="font-black text-slate-800 text-sm">1. Proctoring Telemetry Inputs</h3>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Live Sensor Feed
              </span>
            </div>

            {/* Browser Focus Lost Count */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Browser Focus Shifts / Tab Switches</span>
                <span className={`px-2 py-0.2 rounded font-mono ${focusLostCount > 3 ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-700"}`}>
                  {focusLostCount} shifts
                </span>
              </div>
              <input
                id="slider-focus-lost"
                type="range"
                min="0"
                max="10"
                step="1"
                value={focusLostCount}
                onChange={(e) => setFocusLostCount(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0 (Locked)</span>
                <span>Threshold: &gt;3 triggers breach</span>
                <span>10 (Severe)</span>
              </div>
            </div>

            {/* Secondary Voice Acoustic Detector */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2.5">
                <Volume2 className={secondaryVoice ? "text-rose-600" : "text-slate-400"} size={18} />
                <div>
                  <div className="text-xs font-bold text-slate-800">Secondary Speaker Detected</div>
                  <div className="text-[10px] text-slate-500">Multi-speaker diarization acoustic signature</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="toggle-secondary-voice"
                  type="checkbox"
                  checked={secondaryVoice}
                  onChange={(e) => setSecondaryVoice(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {/* Audio Device Switch Count */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Audio Device Swaps (Virtual Loopback)</span>
                <span className="font-mono bg-slate-100 px-2 py-0.2 rounded text-slate-700">
                  {deviceSwitches} switches
                </span>
              </div>
              <input
                id="slider-device-switches"
                type="range"
                min="0"
                max="5"
                step="1"
                value={deviceSwitches}
                onChange={(e) => setDeviceSwitches(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Biometric Identity Match Confidence */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Biometric Identity Match Confidence</span>
                <span className={`font-mono px-2 py-0.2 rounded ${identityMatch < 0.85 ? "bg-rose-100 text-rose-800 font-bold" : "bg-emerald-100 text-emerald-800"}`}>
                  {(identityMatch * 100).toFixed(0)}% Match
                </span>
              </div>
              <input
                id="slider-identity-match"
                type="range"
                min="0.40"
                max="1.00"
                step="0.01"
                value={identityMatch}
                onChange={(e) => setIdentityMatch(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>40% (Spoof / Mismatch)</span>
                <span>Threshold: 85%</span>
                <span>100% (Verified)</span>
              </div>
            </div>
          </div>

          {/* Section 2: Privacy Metadata & Regulatory Compliance Pipeline */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="text-emerald-600" size={18} />
                <h3 className="font-black text-slate-800 text-sm">2. Multi-Jurisdiction Privacy Pipeline</h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                GDPR • DPDP 2023
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Jurisdiction Code */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jurisdiction Code</label>
                <select
                  id="select-jurisdiction"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value as JurisdictionCode)}
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="IN">IN (India DPDP Act 2023)</option>
                  <option value="EU">EU (GDPR Art. 8 / Art. 17)</option>
                  <option value="US">US (FERPA Student Privacy)</option>
                  <option value="GLOBAL">GLOBAL (Generic Standard)</option>
                </select>
              </div>

              {/* Candidate Age */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Candidate Age</label>
                <div className="flex items-center gap-2">
                  <input
                    id="input-candidate-age"
                    type="number"
                    min="10"
                    max="80"
                    value={candidateAge}
                    onChange={(e) => setCandidateAge(parseInt(e.target.value) || 18)}
                    className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className={`text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap ${candidateAge < 18 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>
                    {candidateAge < 18 ? "Minor" : "Adult"}
                  </span>
                </div>
              </div>
            </div>

            {/* Parental Consent Gate */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <UserCheck size={14} className={parentalConsent ? "text-emerald-600" : "text-slate-400"} />
                  <span>Verifiable Parental Consent</span>
                </div>
                <div className="text-[10px] text-slate-500">Digital signature / OTP guardian approval</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="toggle-parental-consent"
                  type="checkbox"
                  checked={parentalConsent}
                  onChange={(e) => setParentalConsent(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Zero Retention Default & Voice Retention Opt-In */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText size={14} className={voiceRetentionOptIn ? "text-indigo-600" : "text-amber-600"} />
                  <span>Voice Retention Opt-In</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {voiceRetentionOptIn ? "Payload retained for training" : "Strict Zero-Retention: Purge immediately"}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="toggle-voice-retention"
                  type="checkbox"
                  checked={voiceRetentionOptIn}
                  onChange={(e) => setVoiceRetentionOptIn(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          {/* Section 3: Human-in-the-Loop (HITL) Administrator Override */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="text-indigo-600" size={18} />
                <h3 className="font-black text-slate-800 text-sm">3. Human-in-the-Loop (HITL) Override</h3>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                Academic Authority
              </span>
            </div>

            {/* Machine vs Human Action Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Educator Action Flag</label>
              <div className="grid grid-cols-3 gap-2">
                {(["NONE", "REVIEW_REQUESTED", "OVERRIDE_SUBMITTED"] as EducatorActionFlag[]).map((flag) => (
                  <button
                    key={flag}
                    id={`btn-flag-${flag}`}
                    type="button"
                    onClick={() => setEducatorFlag(flag)}
                    className={`py-2 px-2 text-[11px] font-bold rounded-xl border transition-all text-center ${
                      educatorFlag === flag
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {flag === "NONE" ? "Auto-AI Only" : flag === "REVIEW_REQUESTED" ? "Flagged Review" : "HITL Override"}
                  </button>
                ))}
              </div>
            </div>

            {/* Automated Raw Score Reference */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 block">Automated AI CEFR</span>
                <span className="font-black text-sm text-slate-800">{automatedCefr} ({rawScore.toFixed(1)} / 100)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Overseer ID</span>
                <span className="font-mono text-xs font-bold text-indigo-700 truncate block">{overseerId}</span>
              </div>
            </div>

            {/* Override Controls (Conditional if OVERRIDE_SUBMITTED) */}
            {educatorFlag === "OVERRIDE_SUBMITTED" && (
              <div className="space-y-3 p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-950 mb-1">
                      Override Score ({overrideScore} / 100)
                    </label>
                    <input
                      id="slider-override-score"
                      type="range"
                      min="30"
                      max="100"
                      step="0.5"
                      value={overrideScore}
                      onChange={(e) => setOverrideScore(parseFloat(e.target.value))}
                      className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-950 mb-1">Override CEFR Level</label>
                    <select
                      id="select-override-cefr"
                      value={overrideCefr}
                      onChange={(e) => setOverrideCefr(e.target.value as CEFRLevel)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-indigo-950 mb-1">Audit Justification Code</label>
                  <select
                    id="select-reason-code"
                    value={reasonCode}
                    onChange={(e) => setReasonCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="DIALECT_VARIATION_PROTECTION">DIALECT_VARIATION_PROTECTION (L1 phonetic shift)</option>
                    <option value="ACOUSTIC_HARDWARE_DEFECT">ACOUSTIC_HARDWARE_DEFECT (Mic clipping / noise floor)</option>
                    <option value="FALSE_POSITIVE_SECONDARY_VOICE">FALSE_POSITIVE_SECONDARY_VOICE (Ambient TV / family)</option>
                    <option value="CANDIDATE_APPEAL_SUSTAINED">CANDIDATE_APPEAL_SUSTAINED (Academic re-grading)</option>
                    <option value="MALICIOUS_PROMPT_INJECTION_CONFIRMED">MALICIOUS_PROMPT_INJECTION_CONFIRMED (Strict 0)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-indigo-950 mb-1">Human Reviewer Notes</label>
                  <textarea
                    id="textarea-reviewer-notes"
                    rows={2}
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    className="w-full p-2 text-xs font-medium bg-white border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Provide mandatory compliance audit justification..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Decision Dashboard & Compliance Outputs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Result Tabs Header */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            {[
              { id: "audit_dashboard", label: "Audit Overview", icon: ShieldCheck },
              { id: "privacy_pipeline", label: "Privacy Governance", icon: Lock },
              { id: "hitl_reconciler", label: "HITL Reconciliation", icon: Sliders },
              { id: "raw_json", label: "Standardized JSON", icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`tab-compliance-${tab.id}`}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Audit Overview & Security Risk Scoring */}
          {activeTab === "audit_dashboard" && (
            <div className="space-y-4">
              {/* Executive Status Card */}
              {auditResult ? (
                <div
                  className={`rounded-2xl p-5 border shadow-sm ${
                    auditResult.proctoring_audit.assessment_validity === "VALID"
                      ? "bg-emerald-50/70 border-emerald-200"
                      : auditResult.proctoring_audit.assessment_validity === "FLAGGED"
                      ? "bg-amber-50/70 border-amber-200"
                      : "bg-rose-50/70 border-rose-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      {auditResult.proctoring_audit.assessment_validity === "VALID" ? (
                        <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/30">
                          <ShieldCheck size={24} />
                        </div>
                      ) : auditResult.proctoring_audit.assessment_validity === "FLAGGED" ? (
                        <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-md shadow-amber-600/30">
                          <AlertTriangle size={24} />
                        </div>
                      ) : (
                        <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-md shadow-rose-600/30">
                          <ShieldAlert size={24} />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 text-base">
                            Assessment Status: {auditResult.proctoring_audit.assessment_validity}
                          </h3>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              auditResult.proctoring_audit.assessment_validity === "VALID"
                                ? "bg-emerald-200 text-emerald-900"
                                : auditResult.proctoring_audit.assessment_validity === "FLAGGED"
                                ? "bg-amber-200 text-amber-900"
                                : "bg-rose-200 text-rose-900"
                            }`}
                          >
                            Risk: {(auditResult.proctoring_audit.integrity_risk_index * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Framework: {auditResult.privacy_compliance_status.regulatory_framework} • Candidate ID: {candidateId}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Final CEFR</span>
                      <span className="text-2xl font-black text-slate-900">
                        {auditResult.scoring_and_hitl_reconciliation.final_reported_cefr}
                      </span>
                    </div>
                  </div>

                  {/* Violations and Flags */}
                  {auditResult.proctoring_audit.detected_violations.length > 0 ? (
                    <div className="mt-3 p-3 bg-white/80 rounded-xl border border-rose-200 space-y-1.5">
                      <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-rose-600" />
                        <span>Security & Compliance Flags Detected ({auditResult.proctoring_audit.detected_violations.length})</span>
                      </div>
                      <ul className="space-y-1 text-xs text-rose-800 list-disc list-inside">
                        {auditResult.proctoring_audit.detected_violations.map((violation, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {violation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="mt-3 p-2.5 bg-emerald-100/60 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
                      <Check size={16} className="text-emerald-600" />
                      <span>Clean proctoring telemetry. Zero security violations detected.</span>
                    </div>
                  )}
                </div>
              ) : null}

              {/* System Actions & Automated Interventions */}
              {auditResult && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio size={14} className="text-indigo-600" />
                    Automated System Interventions
                  </h4>

                  <div className="grid grid-cols-3 gap-3">
                    <div
                      className={`p-3 rounded-xl border flex flex-col justify-between ${
                        auditResult.system_actions.lock_candidate_progress
                          ? "bg-rose-50 border-rose-200 text-rose-900"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">Lock Progress</span>
                        <Lock size={14} className={auditResult.system_actions.lock_candidate_progress ? "text-rose-600" : "text-slate-400"} />
                      </div>
                      <span className="text-[11px] font-black">
                        {auditResult.system_actions.lock_candidate_progress ? "ACTIVE (LOCKED)" : "UNLOCKED"}
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-xl border flex flex-col justify-between ${
                        auditResult.system_actions.notify_administrator
                          ? "bg-amber-50 border-amber-200 text-amber-900"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">Admin Alert</span>
                        <ShieldAlert size={14} className={auditResult.system_actions.notify_administrator ? "text-amber-600" : "text-slate-400"} />
                      </div>
                      <span className="text-[11px] font-black">
                        {auditResult.system_actions.notify_administrator ? "DISPATCHED" : "NORMAL"}
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-xl border flex flex-col justify-between ${
                        auditResult.system_actions.purge_audio_payload_immediately
                          ? "bg-indigo-50 border-indigo-200 text-indigo-900"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">Audio Purge</span>
                        <Clock size={14} className="text-indigo-600" />
                      </div>
                      <span className="text-[11px] font-black">
                        {auditResult.system_actions.purge_audio_payload_immediately ? "SCHEDULED" : "RETAINED"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Three-Pillar Architecture Diagram */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider">
                    Enterprise Trust Architecture
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">SOC2 Type II • ISO 27001</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <Shield className="mx-auto text-indigo-400 mb-1.5" size={20} />
                    <div className="text-xs font-bold text-white">1. Anti-Gaming</div>
                    <div className="text-[10px] text-slate-400 mt-1">Biometric face match & multi-speaker diarization</div>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <Lock className="mx-auto text-emerald-400 mb-1.5" size={20} />
                    <div className="text-xs font-bold text-white">2. Privacy Gate</div>
                    <div className="text-[10px] text-slate-400 mt-1">DPDP 2023 Sec. 9 & GDPR Zero-Retention default</div>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <Sliders className="mx-auto text-cyan-400 mb-1.5" size={20} />
                    <div className="text-xs font-bold text-white">3. HITL Override</div>
                    <div className="text-[10px] text-slate-400 mt-1">Absolute educator authority with drift tuning</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Privacy Governance Pipeline */}
          {activeTab === "privacy_pipeline" && auditResult && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Lock className="text-emerald-600" size={18} />
                  <h3 className="font-black text-slate-800 text-sm">Regulatory Compliance Matrix</h3>
                </div>
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {auditResult.privacy_compliance_status.regulatory_framework}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Minor Candidate Protection Handling</div>
                    <div className="text-[10px] text-slate-500">
                      Age: {candidateAge} • Threshold: {jurisdiction === "IN" ? "18 (DPDP)" : jurisdiction === "EU" ? "16 (GDPR)" : "18 (FERPA)"}
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${auditResult.privacy_compliance_status.minor_status_handled ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                    {auditResult.privacy_compliance_status.minor_status_handled ? "COMPLIANT" : "NON-COMPLIANT"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Verifiable Parental Consent Verification</div>
                    <div className="text-[10px] text-slate-500">
                      {candidateAge < 18 ? "Mandatory for minors in this jurisdiction" : "Adult Candidate (Exempt)"}
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${auditResult.privacy_compliance_status.consent_verified ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                    {auditResult.privacy_compliance_status.consent_verified ? "VERIFIED" : "MISSING"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Zero-Retention Audio Deletion Pipeline</div>
                    <div className="text-[10px] text-slate-500">
                      Deadline: {auditResult.privacy_compliance_status.deletion_deadline_timestamp || "Immediate In-Memory Purge"}
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${auditResult.privacy_compliance_status.voice_deletion_scheduled ? "bg-indigo-100 text-indigo-800" : "bg-slate-200 text-slate-700"}`}>
                    {auditResult.privacy_compliance_status.voice_deletion_scheduled ? "PURGE ACTIVE" : "OPTED-IN"}
                  </span>
                </div>
              </div>

              {/* Legal Reference Citations */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-800">Statutory Citation Summary:</div>
                <p className="leading-relaxed">
                  • <strong>India DPDP Act 2023 Section 9</strong>: Mandates verifiable parental consent before processing personal data of a child (under 18 years). Behavioral tracking and targeted evaluation of minors without consent is strictly prohibited.
                </p>
                <p className="leading-relaxed">
                  • <strong>EU GDPR Article 17</strong>: Right to erasure (Right to be forgotten). Audio waveforms are purged immediately post feature-extraction unless explicit affirmative consent is granted.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: HITL Reconciliation & Inter-Rater Drift */}
          {activeTab === "hitl_reconciler" && auditResult && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sliders className="text-indigo-600" size={18} />
                  <h3 className="font-black text-slate-800 text-sm">Human Authority Reconciliation</h3>
                </div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${auditResult.scoring_and_hitl_reconciliation.hitl_override_applied ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-slate-700"}`}>
                  {auditResult.scoring_and_hitl_reconciliation.hitl_override_applied ? "OVERRIDE ACTIVE" : "MACHINE SCORE APPLIED"}
                </span>
              </div>

              {/* Comparison Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Automated AI Score
                  </span>
                  <div className="text-2xl font-black text-slate-800">
                    {auditResult.scoring_and_hitl_reconciliation.raw_llm_score.toFixed(1)} / 100
                  </div>
                  <span className="text-xs text-slate-500 block">Baseline CEFR: {automatedCefr}</span>
                </div>

                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 space-y-2">
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">
                    Effective Reported Score
                  </span>
                  <div className="text-2xl font-black text-indigo-950">
                    {auditResult.scoring_and_hitl_reconciliation.effective_score.toFixed(1)} / 100
                  </div>
                  <span className="text-xs font-bold text-indigo-700 block">
                    Final CEFR: {auditResult.scoring_and_hitl_reconciliation.final_reported_cefr}
                  </span>
                </div>
              </div>

              {/* Drift Delta Meter */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Inter-Rater Drift Variance (Δ)</span>
                  <span className={`font-mono text-xs px-2 py-0.5 rounded ${auditResult.scoring_and_hitl_reconciliation.drift_delta !== 0 ? "bg-cyan-100 text-cyan-900 font-bold" : "bg-slate-200 text-slate-700"}`}>
                    {auditResult.scoring_and_hitl_reconciliation.drift_delta > 0 ? "+" : ""}
                    {auditResult.scoring_and_hitl_reconciliation.drift_delta.toFixed(2)} pts
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(10, Math.abs(auditResult.scoring_and_hitl_reconciliation.drift_delta) * 5))}%`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-slate-500">
                  Automated calibration loop tracks human-machine variance to fine-tune CEFR cut scores and reduce algorithmic bias.
                </div>
              </div>

              {/* Human Reviewer Notes */}
              {auditResult.scoring_and_hitl_reconciliation.human_reviewer_notes && (
                <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-1">
                  <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <FileCheck size={14} className="text-indigo-600" />
                    <span>Overseer Audit Log & Justification</span>
                  </div>
                  <p className="text-xs text-indigo-900 leading-relaxed italic">
                    "{auditResult.scoring_and_hitl_reconciliation.human_reviewer_notes}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Standardized Output JSON View */}
          {activeTab === "raw_json" && (
            <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 font-bold">
                  <Terminal size={15} />
                  <span>Standardized Decision Payload</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-copy-compliance-json"
                    type="button"
                    onClick={handleCopyJson}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer text-[11px]"
                  >
                    {copiedJson ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedJson ? "Copied" : "Copy"}</span>
                  </button>
                  <button
                    id="btn-export-compliance-json"
                    type="button"
                    onClick={handleExportJson}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1 transition-all cursor-pointer text-[11px]"
                  >
                    <Download size={12} />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <pre className="p-3 bg-slate-950 rounded-xl overflow-x-auto text-[11px] leading-relaxed text-indigo-300">
                {JSON.stringify(auditResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
