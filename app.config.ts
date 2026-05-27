import { env } from 'env';
import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const isProd = env.NODE_ENV === 'production';

  return {
    ...config,
    name: config.name || "Cooture",
    slug: config.slug || "cooture",
    plugins: [
      ...((config.plugins || []).filter(
        (plugin) => plugin !== "react-native-fbsdk-next" && plugin !== "expo-tracking-transparency"
      )),
      [
        "react-native-fbsdk-next",
        {
          appID: isProd ? env.PUBLIC_FACEBOOK_APP_ID : undefined,
          clientToken: isProd ? env.PUBLIC_FACEBOOK_CLIENT_TOKEN : undefined,
          advertiserIDCollectionEnabled: isProd,
          autoLogAppEventsEnabled: isProd,
          isAutoInitEnabled: isProd,
          displayName: "Cooture",
          iosUserTrackingPermission: "Allow Cooture to track your activity to help our small team grow our community and reach people who'd love the app."
        }
      ],
      [
        "expo-tracking-transparency",
        {
          userTrackingPermission: "Allow Cooture to track your activity to help our small team grow our community and reach people who'd love the app."
        }
      ],
    ],
  };
};
