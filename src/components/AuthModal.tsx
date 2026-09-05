import React from "react";
import { UserAccount } from "../types";
import { LegalTab } from "./LegalModal";
import { AuthAccessHub } from "./AuthAccessHub";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLoginSuccess: (user: UserAccount, targetTab?: string) => void;
  onOpenLegalModal?: (tab?: LegalTab) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onOpenLegalModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md">
        <AuthAccessHub
          onLoginSuccess={(user, targetTab) => {
            onLoginSuccess(user, targetTab);
            onClose();
          }}
          onOpenLegalModal={onOpenLegalModal}
          initialPortal={currentUser?.role === "admin" || currentUser?.role === "owner" ? "admin" : "student"}
          isModalMode={true}
          onCloseModal={onClose}
        />
      </div>
    </div>
  );
};
