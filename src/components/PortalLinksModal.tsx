import React, { useState } from "react";
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  GraduationCap,
  Crown,
  Shield,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";

interface PortalLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPortal?: (portal: "student" | "admin") => void;
}

export const PortalLinksModal: React.FC<PortalLinksModalProps> = ({
  isOpen,
  onClose,
  onNavigateToPortal,
}) => {
  const [copiedStudent, setCopiedStudent] = useState<boolean>(false);
  const [copiedAdmin, setCopiedAdmin] = useState<boolean>(false);
  const [domainMode, setDomainMode] = useState<"custom" | "current">("custom");
  const [showDnsGuide, setShowDnsGuide] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentOrigin =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}`
      : "https://ais-dev-farzqx66tqusd643jcv4gl-561743232537.asia-southeast1.run.app/";

  const currentClean = currentOrigin.endsWith("/") ? currentOrigin.slice(0, -1) : currentOrigin;
  const customClean = "https://www.fluenxiaapp.com";

  const selectedBase = domainMode === "custom" ? customClean : currentClean;

  const studentPortalUrl = `${selectedBase}/?portal=student`;
  const adminPortalUrl = `${selectedBase}/?portal=admin`;

  const handleCopy = (text: string, type: "student" | "admin") => {
    navigator.clipboard.writeText(text);
    if (type === "student") {
      setCopiedStudent(true);
      setTimeout(() => setCopiedStudent(false), 2500);
    } else {
      setCopiedAdmin(true);
      setTimeout(() => setCopiedAdmin(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 font-bold text-sm w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-50 border border-cyan-200 rounded-full text-cyan-800 text-xs font-black">
            <Link2 size={13} />
            <span>Dedicated Fluenxia Portals</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Direct URLs for Student & Admin Portals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Share the Student URL with learners, or use the Admin URL to access the privileged Owner & Administrator Command Center.
          </p>
        </div>

        {/* Domain Selector */}
        <div className="flex items-center justify-between p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setDomainMode("custom")}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              domainMode === "custom"
                ? "bg-white text-cyan-900 shadow-xs border border-slate-200/80 font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles size={13} className={domainMode === "custom" ? "text-cyan-600" : ""} />
            <span>Custom Domain (www.fluenxiaapp.com)</span>
          </button>

          <button
            type="button"
            onClick={() => setDomainMode("current")}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              domainMode === "current"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers size={13} />
            <span>Active Cloud Run Instance</span>
          </button>
        </div>

        {/* Portals Cards */}
        <div className="space-y-4">
          {/* 1. Student Portal URL Card */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-50/60 to-slate-50 border border-indigo-100 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Student Learning Portal
                  </h3>
                  <span className="text-[11px] font-bold text-indigo-600">
                    For Learners & English Practice
                  </span>
                </div>
              </div>

              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md">
                PUBLIC ACCESS
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Direct access to CEFR grammar lessons, interactive speech drills, vocabulary flashcards, and AI conversational tutoring.
            </p>

            {/* URL Input Box */}
            <div className="flex items-center gap-2 bg-white p-1.5 pl-3 rounded-xl border border-slate-200">
              <span className="text-xs font-mono text-slate-700 font-semibold truncate select-all flex-1">
                {studentPortalUrl}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(studentPortalUrl, "student")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copiedStudent
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                }`}
              >
                {copiedStudent ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedStudent ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToPortal) onNavigateToPortal("student");
                  onClose();
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Switch to Student Portal View</span>
                <ArrowRight size={13} />
              </button>

              <a
                href={studentPortalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <span>Open in new window</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* 2. Admin & Owner Portal URL Card */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50/60 via-slate-50 to-amber-50/30 border border-amber-200/80 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Crown size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Owner & Admin Command Center
                  </h3>
                  <span className="text-[11px] font-bold text-amber-700">
                    For Platform Owner & Administrators
                  </span>
                </div>
              </div>

              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded-md flex items-center gap-1">
                <Shield size={10} />
                <span>RESTRICTED</span>
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Access real-time analytics, user account directory, CEFR distribution charts, bonus XP rewards, and Google Auth telemetry.
            </p>

            {/* URL Input Box */}
            <div className="flex items-center gap-2 bg-white p-1.5 pl-3 rounded-xl border border-slate-200">
              <span className="text-xs font-mono text-slate-700 font-semibold truncate select-all flex-1">
                {adminPortalUrl}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(adminPortalUrl, "admin")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copiedAdmin
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                }`}
              >
                {copiedAdmin ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedAdmin ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToPortal) onNavigateToPortal("admin");
                  onClose();
                }}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Switch to Admin Command Center</span>
                <ArrowRight size={13} />
              </button>

              <a
                href={adminPortalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <span>Open in new window</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>

        {/* Domain Mapping Guide Section */}
        <div className="border border-cyan-100 bg-cyan-50/40 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-cyan-700" />
              <span className="text-xs font-black text-slate-900">Custom Domain Status: www.fluenxiaapp.com</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDnsGuide(!showDnsGuide)}
              className="text-[11px] font-bold text-cyan-700 hover:text-cyan-900 underline cursor-pointer"
            >
              {showDnsGuide ? "Hide DNS Instructions" : "View DNS Instructions"}
            </button>
          </div>

          {showDnsGuide && (
            <div className="space-y-2.5 pt-2 border-t border-cyan-100 text-xs text-slate-600 animate-in fade-in">
              <p className="font-semibold text-slate-800">
                To connect <span className="font-mono text-cyan-800 bg-cyan-100/60 px-1.5 py-0.5 rounded">www.fluenxiaapp.com</span> to your Google Cloud Run deployment:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11px] text-slate-700">
                <li>
                  Open <strong>Google Cloud Console</strong> &gt; <strong>Cloud Run</strong> &gt; <strong>Manage Custom Domains</strong>.
                </li>
                <li>
                  Click <strong>Add Mapping</strong>, select your Cloud Run service, and enter <strong className="font-mono text-slate-900">www.fluenxiaapp.com</strong>.
                </li>
                <li>
                  At your DNS Registrar (GoDaddy, Cloudflare, Namecheap, Route53), add a <strong>CNAME</strong> record:
                  <div className="mt-1 p-2 bg-white rounded-lg border border-slate-200 font-mono text-[10px] text-slate-800 flex justify-between items-center">
                    <span>Host: <strong>www</strong> &nbsp; | &nbsp; Type: <strong>CNAME</strong> &nbsp; | &nbsp; Value: <strong>ghs.googlehosted.com.</strong></span>
                  </div>
                </li>
                <li>
                  For apex domain (<strong className="font-mono">fluenxiaapp.com</strong>), set an <strong>A</strong> record pointing to Google's Cloud Run Anycast IPs.
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Security Note */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2 text-xs text-slate-500">
          <Info size={15} className="text-cyan-700 shrink-0 mt-0.5" />
          <p>
            The Admin URL strictly verifies owner credentials (<strong>reganakasieswaramma@fluenxiaapp.com</strong>). Unauthenticated visitors or students attempting to view the Admin URL will be prompted to sign in with an authorized administrator account.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
