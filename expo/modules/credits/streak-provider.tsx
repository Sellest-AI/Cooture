import { useAccount } from "@/lib/convex/auth";
import * as Notifications from 'expo-notifications';
import { router, usePathname } from "expo-router";
import { atom, useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { ROUTES } from "routes";

export const claimedAtom = atom(false);

function useStreakNotification() {
  const claimed = useAtomValue(claimedAtom);
  const { wallet } = useAccount.Wallet();
  const { isInWaitlist } = useAccount();

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (isInWaitlist) return;
    if (!wallet?.nextClaimAt) return;
    if (!wallet.canClaimNow) return;
    if (claimed) return;

    const secondsUntilNextClaim = Math.floor((wallet.nextClaimAt - Date.now()) / 1000);
    if (secondsUntilNextClaim <= 0) return;

    Notifications.scheduleNotificationAsync({
      identifier: "streak-reminder",
      content: {
        title: "Don't break your streak 🔥",
        body: "Open the app and get your daily credits!",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntilNextClaim,
        repeats: false,
        channelId: "streak",
      },
    });
  }, [claimed, isInWaitlist, wallet]);
}

export const StreakProvider = ({ children }: { children: React.ReactNode }) => {
  const path = usePathname();
  const { wallet } = useAccount.Wallet();
  const claimed = useAtomValue(claimedAtom);
  const { isInWaitlist } = useAccount();

  // If the user just created their account, consider them as having claimed the streak for today to avoid showing the modal immediately
  const isFirstDay = (Date.now() - (wallet?._creationTime ?? 0) < 24 * 60 * 60 * 1000);

  // Show the daily streak notification if the user hasn't claimed their streak yet
  useStreakNotification();

  const pushed = useRef(false);

  useEffect(() => {
    if (isInWaitlist) return;
    if (claimed) return;
    if (!wallet) return;
    if (path.startsWith(ROUTES.MODALS.DAILY_STREAK)) return;
    if (path.startsWith('/welcome')) return;

    // If it's the first day only show the modal on the collection page
    if (isFirstDay && !path.startsWith(ROUTES.COLLECTION.PATH)) return;

    const claimDay = wallet?.canClaimNow;
    if (claimDay && !pushed.current) {
      pushed.current = true;
      setTimeout(() => { router.push(ROUTES.MODALS.DAILY_STREAK); pushed.current = false; }, 3000);
    }
  }, [claimed, isFirstDay, isInWaitlist, path, wallet])

  return (children)
}