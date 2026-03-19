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
  useEffect(() => { setTimeout(() => setInit(true), 300) }, [])
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

  const WAITLIST_PATHS_ALLOWED = ["/welcome/", "/avatar/"]

  if (isInWaitlist) {
    if (!WAITLIST_PATHS_ALLOWED.some(path => pathname.startsWith(path)))
      return <Redirect href={ROUTES.WELCOME.WAIT_LIST} />
    else return null;
  }

  if (!isInWaitlist && !user.username) return <Redirect href={ROUTES.EXTRA.AVATAR.PROFILE} />

  if (!isInWaitlist && pathname.startsWith(ROUTES.WELCOME.WAIT_LIST)) return <Redirect href={ROUTES.TABS.FEED} />

  if (pathname.startsWith(ROUTES.AUTH)) return <Redirect href={ROUTES.TABS.DISCOVER} />

  if (pathname.length <= 1) return <Redirect href={ROUTES.TABS.FEED} />

  return null;
}

const UnauthenticatedGate = () => {
  const pathname = usePathname();

  if (pathname.startsWith(ROUTES.AUTH)) return null;

  return <Redirect href={ROUTES.AUTH} />
}

export const AuthProvider = ({ children }: Props) => {
  const { isAuthenticating } = useAccount.Authenticated();

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
    {isAuthenticating && <LoadingView />}
  </>;
}