import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { useEffect } from "react";
import { Platform } from "react-native";

export const TrackingIOSProvider = () => {
  useEffect(() => {
    const requestTrackingPermission = async () => {
      if (Platform.OS === 'ios') {
        // const { status } = await requestTrackingPermissionsAsync();
        await requestTrackingPermissionsAsync();
        // status can be: 'granted' | 'denied' | 'unavailable'
        // No blocking action based on status, continue in all cases
      }
    };

    requestTrackingPermission();
  }, []);

  return null;
}