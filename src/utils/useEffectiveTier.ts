import { useEffect, useState } from "react";

export type EffectiveTier = "free" | "plus" | "pro" | "sachet";

// Number of scenarios shown unlocked per module for Free-tier learners, per the board doc's
// tier matrix ("5 Starter Scenarios" on Free vs "Full 200+ Scenarios" on every paid tier).
export const FREE_TIER_SCENARIO_LIMIT = 5;

// Mirrors server.ts's getEffectiveTier() -- the server is the actual source of truth (this only
// reads GET /api/subscription/me, never computes tier itself), so this hook can't drift from the
// backend's expiry/status rules. Guests (no auth token) are always treated as "free".
export function useEffectiveTier(): { tier: EffectiveTier; isLoaded: boolean } {
  const [tier, setTier] = useState<EffectiveTier>("free");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setIsLoaded(true);
      return;
    }
    fetch("/api/subscription/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data?.effectiveTier) setTier(data.effectiveTier);
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  return { tier, isLoaded };
}
