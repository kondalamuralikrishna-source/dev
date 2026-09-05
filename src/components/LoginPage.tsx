import React from "react";
import { UserAccount } from "../types";
import { LegalTab } from "./LegalModal";
import { AuthAccessHub } from "./AuthAccessHub";

interface LoginPageProps {
  onLoginSuccess: (user: UserAccount, targetTab?: string) => void;
  onOpenLegalModal?: (tab?: LegalTab) => void;
  initialPortal?: "student" | "admin";
  onGuestBypass?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onOpenLegalModal,
  initialPortal,
  onGuestBypass,
}) => {
  return (
    <AuthAccessHub
      onLoginSuccess={onLoginSuccess}
      onOpenLegalModal={onOpenLegalModal}
      initialPortal={initialPortal}
      onGuestBypass={onGuestBypass}
      isModalMode={false}
    />
  );
};
