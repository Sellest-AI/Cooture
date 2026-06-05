import { env } from 'env';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { WEBSITE } from 'global';
import { useEffect } from "react";
import { Settings } from 'react-native-fbsdk-next';

const initializeFacebookSDK = async (isTrackingGranted: boolean) => {
  if (env.PUBLIC_FACEBOOK_APP_ID)
    Settings.setAppID(env.PUBLIC_FACEBOOK_APP_ID);
  if (env.PUBLIC_FACEBOOK_CLIENT_TOKEN)
    Settings.setClientToken(env.PUBLIC_FACEBOOK_CLIENT_TOKEN);

  Settings.setAppName(WEBSITE.NAME);

  Settings.setAdvertiserIDCollectionEnabled(isTrackingGranted);
  Settings.setAutoLogAppEventsEnabled(isTrackingGranted);
  await Settings.setAdvertiserTrackingEnabled(isTrackingGranted).catch(() => { })

  Settings.initializeSDK();
}

export const TrackingIOSProvider = () => {
  useEffect(() => {
    const requestTrackingPermission = async () => {
      const { status } = await requestTrackingPermissionsAsync();
      await initializeFacebookSDK(status === 'granted');
    };

    if (env.PUBLIC_NODE_ENV === 'production')
      requestTrackingPermission();
  }, []);

  return null;
}