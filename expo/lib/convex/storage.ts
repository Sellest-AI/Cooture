import * as SecureStore from "expo-secure-store";

// List of keys used by ConvexAuth
const CONVEX_KEYS = [
  "convex-auth:session",
  "convex-auth:state",
  "convex-auth:token",
];

export const convexAuthStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error getting key "${key}":`, error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error setting key "${key}":`, error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error deleting key "${key}":`, error);
    }
  },
  clear: async (): Promise<void> => {
    try {
      await Promise.all(CONVEX_KEYS.map(key => SecureStore.deleteItemAsync(key)));
    } catch (error) {
      console.error("Error clearing Convex storage:", error);
    }
  },
};
