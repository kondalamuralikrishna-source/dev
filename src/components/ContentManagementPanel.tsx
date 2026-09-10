import React, { useEffect, useRef, useState } from "react";
import { Mail, Type, Image as ImageIcon, FileText, ShieldCheck, Check, RefreshCw, Upload } from "lucide-react";
import { Skeleton } from "./Skeleton";

interface SiteSettings {
  contactEmail: string;
  salesEmail: string;
  contactPhone?: string;
  platformTagline: string;
  logoUrl?: string;
  termsContent: string;
  privacyContent: string;
  updatedAt: string;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface SectionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  onSave: () => void;
  isSaving: boolean;
  savedMsg: string | null;
  errorMsg: string | null;
}

const SectionCard: React.FC<SectionCardProps> = ({
  icon: Icon,
  title,
  description,
  children,
  onSave,
  isSaving,
  savedMsg,
  errorMsg,
}) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <h3 className="text-sm font-black text-slate-900">{title}</h3>
        <p className="text-[11px] text-slate-500">{description}</p>
      </div>
    </div>

    {children}

    {errorMsg && <p className="text-[11px] font-semibold text-rose-600">{errorMsg}</p>}

    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
      >
        <Check size={13} />
        <span>{isSaving ? "Saving…" : "Save"}</span>
      </button>
      {savedMsg && <span className="text-[11px] font-semibold text-emerald-600">{savedMsg}</span>}
    </div>
  </div>
);

const inputClass =
  "w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-[11px] font-bold text-slate-600 mb-1";

export const ContentManagementPanel: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Draft fields
  const [contactEmail, setContactEmail] = useState("");
  const [salesEmail, setSalesEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [platformTagline, setPlatformTagline] = useState("");
  const [termsContent, setTermsContent] = useState("");
  const [privacyContent, setPrivacyContent] = useState("");

  // Per-section save state
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [sectionError, setSectionError] = useState<Record<string, string | null>>({});

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/site-settings");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load site settings.");
      const s: SiteSettings = json.settings;
      setSettings(s);
      setContactEmail(s.contactEmail);
      setSalesEmail(s.salesEmail);
      setContactPhone(s.contactPhone || "");
      setPlatformTagline(s.platformTagline);
      setTermsContent(s.termsContent);
      setPrivacyContent(s.privacyContent);
    } catch (err: any) {
      setLoadError(err.message || "Something went wrong loading settings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveSection = async (section: string, patch: Record<string, string>) => {
    setSavingSection(section);
    setSavedSection(null);
    setSectionError((prev) => ({ ...prev, [section]: null }));
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save.");
      setSettings(json.settings);
      setSavedSection(section);
      setTimeout(() => setSavedSection((cur) => (cur === section ? null : cur)), 2500);
    } catch (err: any) {
      setSectionError((prev) => ({ ...prev, [section]: err.message || "Something went wrong." }));
    } finally {
      setSavingSection(null);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    setLogoError(null);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return;
    setIsUploadingLogo(true);
    setLogoError(null);
    try {
      const formData = new FormData();
      formData.append("logo", logoFile);
      const res = await fetch("/api/admin/site-settings/logo", {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to upload logo.");
      setSettings(json.settings);
      setLogoFile(null);
      setLogoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setLogoError(err.message || "Something went wrong uploading the logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-3 w-80" />
        </div>
        {[1, 1, 1, 3, 3].map((rows, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded-xl shrink-0" />
              <Skeleton className="h-4 w-40" />
            </div>
            {Array.from({ length: rows }).map((_, j) => (
              <Skeleton key={j} className="h-9 w-full" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Content & Site Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Contact details, branding, and Terms & Privacy Policy -- edited here, shown everywhere.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} />
          <span>Refresh</span>
        </button>
      </div>

      {loadError && (
        <div className="p-3 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 text-xs font-medium">
          {loadError}
        </div>
      )}

      {/* Contact Details */}
      <SectionCard
        icon={Mail}
        title="Contact Details"
        description="Support and sales email addresses shown across the app and legal pages."
        onSave={() => saveSection("contact", { contactEmail, salesEmail, contactPhone })}
        isSaving={savingSection === "contact"}
        savedMsg={savedSection === "contact" ? "Saved" : null}
        errorMsg={sectionError.contact || null}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Support Email</label>
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Sales Email</label>
            <input type="email" value={salesEmail} onChange={(e) => setSalesEmail(e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Contact Phone (optional)</label>
            <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputClass} placeholder="+91 ..." />
          </div>
        </div>
      </SectionCard>

      {/* Tagline */}
      <SectionCard
        icon={Type}
        title="Platform Tagline"
        description="Shown under the logo in the admin sidebar and elsewhere the brand mark appears."
        onSave={() => saveSection("tagline", { platformTagline })}
        isSaving={savingSection === "tagline"}
        savedMsg={savedSection === "tagline" ? "Saved" : null}
        errorMsg={sectionError.tagline || null}
      >
        <input type="text" value={platformTagline} onChange={(e) => setPlatformTagline(e.target.value)} className={inputClass} />
      </SectionCard>

      {/* Logo */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <ImageIcon size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">Logo</h3>
            <p className="text-[11px] text-slate-500">PNG, JPG, SVG, or WEBP, up to 2MB.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
            {logoPreview || settings?.logoUrl ? (
              <img src={logoPreview || settings?.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <ImageIcon size={20} className="text-slate-300" />
            )}
          </div>
          <div className="flex-1 min-w-[200px] space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={handleLogoFileChange}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
            />
            {logoError && <p className="text-[11px] font-semibold text-rose-600">{logoError}</p>}
            <button
              type="button"
              onClick={uploadLogo}
              disabled={!logoFile || isUploadingLogo}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              <Upload size={13} />
              <span>{isUploadingLogo ? "Uploading…" : "Upload Logo"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Terms of Usage */}
      <SectionCard
        icon={FileText}
        title="Terms of Usage"
        description={'Shown in the app\'s Legal modal and at /terms. Use "## Heading" for a section title and "- text" for a bullet.'}
        onSave={() => saveSection("terms", { termsContent })}
        isSaving={savingSection === "terms"}
        savedMsg={savedSection === "terms" ? "Saved" : null}
        errorMsg={sectionError.terms || null}
      >
        <textarea
          value={termsContent}
          onChange={(e) => setTermsContent(e.target.value)}
          rows={12}
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </SectionCard>

      {/* Privacy Policy */}
      <SectionCard
        icon={ShieldCheck}
        title="Privacy Policy"
        description={'Shown in the app\'s Legal modal and at /privacy. Same "## Heading" / "- bullet" convention as Terms.'}
        onSave={() => saveSection("privacy", { privacyContent })}
        isSaving={savingSection === "privacy"}
        savedMsg={savedSection === "privacy" ? "Saved" : null}
        errorMsg={sectionError.privacy || null}
      >
        <textarea
          value={privacyContent}
          onChange={(e) => setPrivacyContent(e.target.value)}
          rows={12}
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </SectionCard>
    </div>
  );
};
