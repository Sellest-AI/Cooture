import { useAccount } from "@/lib/convex/auth";
import { env } from "env";
import { ReactNode, useEffect } from "react";
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

type Props = {
  children: ReactNode;
}

export const RevenueCatProvider = ({ children }: Props) => {
  const { user } = useAccount();

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
      try {
        const isAnonymous = await Purchases.isAnonymous();

        if (user?.userId) {
          // Identify user in RevenueCat with their Convex userId if not already set
          const currentRcUserId = await Purchases.getAppUserID();
          if (currentRcUserId !== user.userId) {
            await Purchases.logIn(user.userId);
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
  }, [user?.userId]);

  return (
    children
  )
}