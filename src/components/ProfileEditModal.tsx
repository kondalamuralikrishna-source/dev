import React, { useState } from "react";
import { X, User, Check, Loader2, RefreshCw } from "lucide-react";
import { UserAccount } from "../types";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onProfileUpdated: (updatedUser: UserAccount) => void;
}

// A fixed set of preset avatar seeds so "pick an avatar" doesn't require file upload
// infrastructure -- consistent with the dicebear-based placeholder avatars already used
// everywhere else in the app (new signups, admin lists, activity feed, etc.).
const AVATAR_PRESETS = [
  "Explorer", "Scholar", "Voyager", "Aurora", "Nova", "Atlas", "Comet", "Willow",
];

function avatarUrlFor(seed: string) {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || "");
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(
    currentUser.avatarUrl || avatarUrlFor(currentUser.name)
  );
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg("Name can't be empty.");
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSaving(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: cleanName,
          avatarUrl: customAvatarUrl.trim() || selectedAvatarUrl,
          phone: phone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile.");

      const updatedUser: UserAccount = { ...currentUser, ...data.user };
      localStorage.setItem("linguaflow_user_session", JSON.stringify(updatedUser));
      onProfileUpdated(updatedUser);
      setSuccessMsg("Profile updated!");
      setTimeout(() => onClose(), 900);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  const activeAvatar = customAvatarUrl.trim() || selectedAvatarUrl;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full my-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <User size={18} />
            </div>
            <h2 className="text-lg font-black text-slate-900">Edit Profile</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-xs font-medium">{errorMsg}</div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <Check size={14} /> {successMsg}
          </div>
        )}

        {/* Avatar preview + presets */}
        <div className="flex flex-col items-center gap-3">
          <img src={activeAvatar} alt="Avatar preview" className="w-20 h-20 rounded-2xl border border-slate-200 object-cover bg-slate-50" />
          <div className="grid grid-cols-4 gap-2 w-full">
            {AVATAR_PRESETS.map((seed) => {
              const url = avatarUrlFor(seed);
              const isSelected = !customAvatarUrl.trim() && selectedAvatarUrl === url;
              return (
                <button
                  key={seed}
                  type="button"
                  onClick={() => {
                    setSelectedAvatarUrl(url);
                    setCustomAvatarUrl("");
                  }}
                  className={`p-1 rounded-xl border-2 transition-all ${
                    isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <img src={url} alt={seed} className="w-full aspect-square rounded-lg" />
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedAvatarUrl(avatarUrlFor(`${Date.now()}`));
              setCustomAvatarUrl("");
            }}
            className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-800"
          >
            <RefreshCw size={12} /> Shuffle for more options
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Custom Avatar URL (optional)</label>
          <input
            type="url"
            value={customAvatarUrl}
            onChange={(e) => setCustomAvatarUrl(e.target.value)}
            placeholder="https://example.com/my-photo.jpg"
            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Phone (optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">Email (not editable)</label>
          <div className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center">
            {currentUser.email || "—"}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
        </button>
      </div>
    </div>
  );
};
