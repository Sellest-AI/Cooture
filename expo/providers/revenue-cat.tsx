import { useAccount } from "@/lib/convex/auth";
import { removeUndefinedKeys } from "@utils/convex-allowed";
import { env } from "env";
import { ReactNode, useEffect } from "react";
import { Platform } from "react-native";
import { AppEventsLogger } from 'react-native-fbsdk-next';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const linkRevenueCatToMeta = async () => {
  try {
    const fbAnonId = await AppEventsLogger.getAnonymousID();
    if (fbAnonId) {
      await Purchases.setFBAnonymousID(fbAnonId);
    }
  } catch (e: any) {
    // If RevenueCat says it cannot be modified, it means it's already successfully set!
    const errorMessage = e?.message || String(e);
    if (errorMessage.includes('cannot be modified') || errorMessage.includes('IDFV')) {
      return;
    }
    // Ne pas bloquer l'app en cas d'erreur
    console.warn('Meta/RevenueCat link failed:', e);
  }
};

type Props = {
  children: ReactNode;
}

export const RevenueCatProvider = ({ children }: Props) => {
  const { user, isAuthenticated, isAuthenticating } = useAccount();

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

    linkRevenueCatToMeta();
  }, []);

  // 2. Sync RevenueCat with Convex Authentication
  useEffect(() => {
    const syncRevenueCat = async () => {
      const userId = user?._id;

      // Wait until Convex auth has finished initializing on the device
      if (isAuthenticating) return;

      // If authenticated but the user document is still fetching, wait
      if (isAuthenticated && !userId) return;

      try {
        if (userId) {
          // Identify user in RevenueCat with their Convex userId if not already set
          const currentRcUserId = await Purchases.getAppUserID();

          // Only log in if the current RevenueCat user ID doesn't match the Convex user ID to avoid unnecessary logins
          if (currentRcUserId === userId) return;

          await Purchases.logIn(userId);
          if (user.name) await Purchases.setDisplayName(user.name);
          if (user.email) await Purchases.setEmail(user.email);
          if (user.phone) await Purchases.setPhoneNumber(user.phone);
          await Purchases.setAttributes(removeUndefinedKeys({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
          }))
          linkRevenueCatToMeta();
        } else {
          // If logged out and not already anonymous, log out of RevenueCat
          const isAnonymous = await Purchases.isAnonymous();
          if (!isAnonymous) {
            await Purchases.logOut();
            linkRevenueCatToMeta(); // Link new anonymous user to Meta
          }
        }
      } catch (error) {
        console.error("Failed to sync auth with RevenueCat:", error);
      }
    };

    syncRevenueCat();
  }, [user, isAuthenticating, isAuthenticated]);

  return (
    children
  )
}