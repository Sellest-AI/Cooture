import { convexAuthStorage } from '@/lib/convex/storage';
import { env } from 'env';
import { useEffect } from 'react';

type Props = {
  onComplete?: () => void;
}

export const AuthProvider = ({ onComplete }: Props) => {
  useEffect(() => {
    (async () => {
      const key = `__convexAuthJWT_${env.PUBLIC_CONVEX_URL.replace(/(^\w+:|^)\/\//, '').replace(/\./g, '')}`;
      await convexAuthStorage.getItem(key);
      onComplete?.();
    })();
  }, [onComplete]);

  return null;
}