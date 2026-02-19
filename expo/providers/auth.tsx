import { useAccount } from '@/lib/convex/auth';
import { LogoLoading } from '@ui/icons';
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react';
import { Redirect, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ROUTES } from 'routes';
import { Colors } from 'theme';

const LoadingView = () => {
  const [init, setInit] = useState(false);
  useEffect(() => { setTimeout(() => setInit(true), 500) }, [])
  return (<View style={{
    backgroundColor: Colors.background,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    inset: 0,
    flex: 1,
  }}>
    {init && <LogoLoading size={120} />}
  </View>)
}

type Props = {
  children: React.ReactNode
}

const AuthenticationGate = () => {
  const { user, isInWaitlist } = useAccount();
  const pathname = usePathname();

  if (!user) return <LoadingView />;

  if (isInWaitlist) {
    if (!pathname.startsWith('/welcome/')) return <Redirect href={ROUTES.WELCOME.WAIT_LIST} />
    else return null;
  }

  if (pathname.startsWith('/auth/')) return <Redirect href={ROUTES.TABS.DISCOVER} />

  if (pathname.length <= 1) return <Redirect href={ROUTES.TABS.FEED} />

  return null;
}

const UnauthenticatedGate = () => {
  const pathname = usePathname();

  if (pathname.startsWith('/auth/')) return null;

  return <Redirect href={ROUTES.AUTH} />
}

export const AuthProvider = ({ children }: Props) => {
  return <>
    {children}
    <AuthLoading>
      <LoadingView />
    </AuthLoading>
    <Authenticated>
      <AuthenticationGate />
    </Authenticated>
    <Unauthenticated>
      <UnauthenticatedGate />
    </Unauthenticated>
  </>;
}