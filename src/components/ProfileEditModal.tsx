import React, { useRef, useState } from "react";
import { X, User, Check, Loader2, Camera } from "lucide-react";
import { UserAccount } from "../types";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onProfileUpdated: (updatedUser: UserAccount) => void;
}

function defaultAvatarFor(name: string) {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB raw file cap, before resizing
const AVATAR_DIMENSION = 256; // resized square output -- keeps the stored data URI small

// Resizes/crops the image to a small square JPEG data URI client-side, so the uploaded photo
// never needs its own file-storage backend (which wouldn't survive a Render redeploy anyway --
// see the anonymous-attempts-telemetry lesson) and stays well under MongoDB's document size limit.
function resizeImageToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That file doesn't look like a valid image."));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = AVATAR_DIMENSION;
        canvas.height = AVATAR_DIMENSION;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Couldn't process that image."));

        // Center-crop to a square before scaling, so non-square photos don't get squished.
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_DIMENSION, AVATAR_DIMENSION);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || defaultAvatarFor(currentUser.name));
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please choose an image file.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setErrorMsg("That image is too large -- please choose one under 5MB.");
      return;
    }

    setErrorMsg(null);
    setIsProcessingImage(true);
    try {
      const dataUri = await resizeImageToDataUri(file);
      setAvatarUrl(dataUri);
    } catch (err: any) {
      setErrorMsg(err.message || "Couldn't process that image.");
    } finally {
      setIsProcessingImage(false);
    }
  };

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
        body: JSON.stringify({ name: cleanName, avatarUrl, phone: phone.trim() }),
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

        {/* Photo upload */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group"
            title="Change photo"
          >
            <img
              src={avatarUrl}
              alt="Profile photo"
              className="w-24 h-24 rounded-full border border-slate-200 object-cover bg-slate-50"
            />
            <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all">
              {isProcessingImage ? (
                <Loader2 size={20} className="text-white animate-spin" />
              ) : (
                <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelected}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingImage}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            <Camera size={13} /> {isProcessingImage ? "Processing..." : "Upload Photo"}
          </button>
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
          disabled={isSaving || isProcessingImage}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
        </button>
      </div>
    </div>
  );
};
