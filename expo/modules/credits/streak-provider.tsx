import { useAccount } from "@/lib/convex/auth";
import { router, usePathname } from "expo-router";
import { atom, useAtomValue } from "jotai";
import { useEffect } from "react";
import { ROUTES } from "routes";

export const claimedAtom = atom(false);

export const StreakProvider = ({ children }: { children: React.ReactNode }) => {
  const path = usePathname();
  const { wallet } = useAccount.Wallet();
  const claimed = useAtomValue(claimedAtom);

  useEffect(() => {
    if (claimed) return;
    if (!wallet) return;
    if (path.startsWith(ROUTES.MODALS.DAILY_STREAK)) return;
    const claimDay = wallet?.canClaimNow;
    if (claimDay) router.push(ROUTES.MODALS.DAILY_STREAK);
  }, [claimed, path, wallet])

  return (children)
}