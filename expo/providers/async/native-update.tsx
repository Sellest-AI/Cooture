import { useConfig } from '@/modules/config/_hooks';
import { EmptyBlock } from '@ui/block.empty';
import { WEBSITE } from 'global';
import React, { useEffect } from 'react';
import { Linking, Platform, View } from 'react-native';
import { Colors } from 'theme';

type Status = 'checking' | 'ok' | 'outdated';

export const NativeUpdateProvider = ({
  children,
  onComplete,
}: {
  children?: React.ReactNode;
  onComplete?: () => void;
}) => {
  const { isOutdated, isPending } = useConfig();

  const status: Status = isPending ? 'checking' : isOutdated ? 'outdated' : 'ok';

  const isAllowed = status !== 'outdated' || Platform.OS === 'web' || __DEV__;

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
          description="A new version of the app is available. Update now to keep using Cooture and access the latest features and improvements."
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