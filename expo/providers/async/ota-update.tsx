import { fetchUpdateAsync, reloadAsync } from 'expo-updates';
import React, { useEffect } from 'react';

export const OTAUpdateProvider = ({ children, onComplete, }: {
  children?: React.ReactNode;
  onComplete?: () => void;
}) => {
  useEffect(() => {
    if (__DEV__) {
      onComplete?.();
      return;
    }

    fetchUpdateAsync().then((u) => {
      // app will restart, onComplete never needed
      if (u.isNew) reloadAsync();
      else onComplete?.();
    }).catch(() => onComplete?.());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount only

  return <>{children}</>;
};