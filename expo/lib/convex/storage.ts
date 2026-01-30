import { env } from "env";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const CONVEX_URL = env.PUBLIC_CONVEX_URL.replace(/(^\w+:|^)\/\//, '').replace(/\./g, '')

// List of keys used by ConvexAuth 
const CONVEX_KEYS = [
  `__convexAuthJWT_${CONVEX_URL}`,
  `__convexAuthRefreshToken_${CONVEX_URL}`
] as const;

const isWeb = Platform.OS === "web";

export const convexAuthStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (isWeb) {
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error getting key "${key}":`, error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (isWeb) {
        localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error setting key "${key}":`, error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (isWeb) {
        localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error deleting key "${key}":`, error);
    }
  },
  clear: async (): Promise<void> => {
    try {
      if (isWeb) {
        CONVEX_KEYS.forEach(key => localStorage.removeItem(key));
        return;
      }
      await Promise.all(CONVEX_KEYS.map(key => SecureStore.deleteItemAsync(key)));
    } catch (error) {
      console.error("Error clearing Convex storage:", error);
    }
  },
};
