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

  // If the user just created their account, consider them as having claimed the streak for today to avoid showing the modal immediately
  const isFirstDay = (Date.now() - (wallet?._creationTime ?? 0) < 24 * 60 * 60 * 1000);

  useEffect(() => {
    if (claimed) return;
    if (!wallet) return;
    if (path.startsWith(ROUTES.MODALS.DAILY_STREAK)) return;

    // If it's the first day only show the modal on the collection page
    if (isFirstDay && !path.startsWith(ROUTES.COLLECTION.PATH)) return;

    const claimDay = wallet?.canClaimNow;
    if (claimDay) router.push(ROUTES.MODALS.DAILY_STREAK);
  }, [claimed, isFirstDay, path, wallet])

  return (children)
}