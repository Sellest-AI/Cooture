import { api, useQueryCached } from '@/lib/convex/client';
import { EmptyBlock } from '@ui/block.empty';
import { nativeApplicationVersion } from 'expo-application';
import { WEBSITE } from 'global';
import React, { useEffect } from 'react';
import { Linking, Platform, View } from 'react-native';
import { Colors } from 'theme';

// utils/compareVersions.ts
export const compareVersions = (a: string, b: string): number => {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
};

type Status = 'checking' | 'ok' | 'outdated';

export const NativeUpdateProvider = ({
  children,
  onComplete,
}: {
  children?: React.ReactNode;
  onComplete?: () => void;
}) => {
  const { data: config, isPending } = useQueryCached(api.router.admin.config.getConfig.anon);

  const currentVersion = nativeApplicationVersion ?? '0.0.0';
  const requiredVersion = config?.minAppVersion ?? config?.appVersion ?? '999.999.999';

  const status: Status = isPending ? 'checking' : (compareVersions(currentVersion, requiredVersion) >= 0 ? 'ok' : 'outdated');

  const isAllowed = status === 'ok' || Platform.OS === 'web' || __DEV__;

  useEffect(() => {
    if (__DEV__) { onComplete?.(); return; }
    if (Platform.OS === 'web') { onComplete?.(); return; }
    if (status !== 'ok') return;
    onComplete?.();
  }, [onComplete, status])

  if (!isAllowed) {
    return (
      <View style={{
        flex: 1,
        position: 'absolute',
        inset: 0,
        zIndex: 999,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        gap: 12

      }}>
        <EmptyBlock
          title="Update Required"
          description="A new version of the app is available. Please update to continue using the application."
          cta={{
            label: 'Update Now',
            onPress: () => {
              const url = Platform.select({
                ios: WEBSITE.URL_IOS,
                android: WEBSITE.URL_ANDROID,
                default: WEBSITE.URL,
              });
              if (url) { Linking.openURL(url); }
            },
          }}
        />
      </View>
    )
  }

  return <>{children}</>;
};