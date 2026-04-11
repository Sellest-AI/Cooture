import { useAccount } from "@/lib/convex/auth";
import { env } from "env";
import { ReactNode, useEffect } from "react";
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

type Props = {
  children: ReactNode;
}

export const RevenueCatProvider = ({ children }: Props) => {
  const { userId, isAuthenticated, isAuthLoading } = useAccount();

  // 1. Initialize RevenueCat Once
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    // Platform-specific API keys
    const iosApiKey = env.PUBLIC_NODE_ENV === "development" ? 'test_UvCsJtKTRGDKqiCASJcYybMWRlf' : "appl_MdStxwKMtKdnCrysZwhecyMSRKb";
    const androidApiKey = env.PUBLIC_NODE_ENV === "development" ? 'test_UvCsJtKTRGDKqiCASJcYybMWRlf' : "goog_jELoduJWahCqezyLonDiNfiKFRu";

    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: iosApiKey });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: androidApiKey });
    }
  }, []);

  // 2. Sync RevenueCat with Convex Authentication
  useEffect(() => {
    const syncRevenueCat = async () => {
      // Wait until Convex auth has finished initializing on the device
      if (isAuthLoading) return;

      // If authenticated but the user document is still fetching, wait
      if (isAuthenticated && !userId) return;

      try {
        const isAnonymous = await Purchases.isAnonymous();

        if (userId) {
          // Identify user in RevenueCat with their Convex userId if not already set
          const currentRcUserId = await Purchases.getAppUserID();
          if (currentRcUserId !== userId) {
            await Purchases.logIn(userId);
          }
        } else {
          // If logged out and not already anonymous, log out of RevenueCat
          if (!isAnonymous) {
            await Purchases.logOut();
          }
        }
      } catch (error) {
        console.error("Failed to sync auth with RevenueCat:", error);
      }
    };

    syncRevenueCat();
  }, [userId, isAuthLoading, isAuthenticated]);

  return (
    children
  )
}