import { ROUTES } from '@/hooks';
import { useAuthActions } from '@/lib/convex/auth';
import { useConfig } from '@/modules/config/_hooks';
import { Button } from '@ui/button';
import { Image } from '@ui/image';
import { LinearGradient } from '@ui/linear-gradient';
import { Pressable } from '@ui/pressable';
import { SafeAreaView } from '@ui/safe-area-view';
import { Text } from '@ui/text';
import { VideoView } from '@ui/video-view';
import { removeUndefinedKeys } from '@utils/convex-allowed';
import { env } from 'env';
import { AppleAuthenticationButton, AppleAuthenticationButtonStyle, AppleAuthenticationButtonType } from "expo-apple-authentication";
import * as WebBrowser from 'expo-web-browser';
import { WEBSITE } from 'global';
import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, View } from 'react-native';
import { Colors } from 'theme';

const BackgroundImage = () => {
  const fadeAnim = useRef(new Animated.Value(0.6));

  useEffect(() => {
    Animated.timing(fadeAnim.current, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        top: 0,
        left: 0,
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: fadeAnim.current,
      }}
    >
      <View style={{ paddingBottom: 24, height: '100%', position: 'relative' }}>
        <View style={{ width: '100%', height: '100%', position: 'relative' }}>
          <VideoView
            source={require('assets/backgrounds/main_video.mp4')}
            contentFit="cover"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: 0.9,
            }}
          />
          <LinearGradient
            colors={['transparent', Colors.background]}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 72
            }}
          />
        </View>
      </View>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.8)', 'transparent']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '30%'
        }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.8)']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '65%'
        }}
      />
    </Animated.View>
  )
}

const LoginButtons = () => {
  const [init, setInit] = useState(false);
  useEffect(() => { setTimeout(() => setInit(true), 500) }, [])

  const { isUpcomingVersion } = useConfig();

  const { isLoading, signInGoogle, signInApple, signInTester } = useAuthActions();
  const [innerLoading, setInnerLoading] = useState<"google" | "apple" | null>(null);

  const disableRuntime = isLoading || innerLoading !== null;

  const list: ("google" | "apple")[]
    = Platform.OS === "ios" ? ["apple", "google"] : ["google"];

  const showTestAccount = (env.PUBLIC_NODE_ENV !== 'production' || isUpcomingVersion);

  return (
    <>
      {list.map(((item, i) => {
        if (item === "apple")
          return (
            <AppleAuthenticationButton
              key={item}
              buttonType={AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={18}
              style={{
                width: '100%',
                height: 56,
                alignSelf: 'stretch',
              }}
              onPress={async () => {
                setInnerLoading(item);
                const success = await signInApple(ROUTES.WELCOME.INDEX);
                if (!success) setInnerLoading(null);
              }}
            />
          )

        const isGoogle = item === "google";

        return (
          <Button
            key={item}
            isLoading={innerLoading === item}
            disabled={disableRuntime || !init}
            style={{
              alignSelf: 'stretch',
              backgroundColor: isGoogle ? undefined : "white",
              marginTop: i > 0 ? 8 : 0
            }}
            variant={isGoogle ? "primary" : "ghost"}
            onPress={async () => {
              setInnerLoading(item);
              const success = await signInGoogle(ROUTES.WELCOME.INDEX);
              if (!success) setInnerLoading(null);
            }}
            startContent={
              <Image
                style={{ width: 20, height: 20 }}
                contentFit='contain'
                // source={item === "apple" ? require('assets/logos/apple.webp') : require('assets/logos/google.webp')}
                source={require('assets/logos/google.webp')}
              />
            }
          >
            <Text.Base style={removeUndefinedKeys({
              color: "black",
              fontSize: Platform.OS === 'ios' ? 20 : undefined,
              lineHeight: Platform.OS === 'ios' ? 24 : undefined,
              letterSpacing: Platform.OS === 'ios' ? 0.18 : undefined,
            })} weight={600}>
              Sign in with {item.slice(0, 1).toUpperCase() + item.slice(1)}
            </Text.Base>
          </Button>
        )
      }))}
      {showTestAccount && (
        <Pressable
          style={{ marginTop: 24 }}
          onLongPress={() => signInTester()}
          delayLongPress={5000}
        >
          <Text.Lg color={Colors.neutral[400]}>
            Sign in with test account
          </Text.Lg>
        </Pressable>
      )}
    </>
  )
}

export default function Screen() {
  return (
    <View style={{ flex: 1 }}>
      <BackgroundImage />
      <SafeAreaView
        edges={{ bottom: 'off' }}
        style={{
          alignItems: 'center',
          marginTop: 24,
        }}
      >
        <View>
          <Text.Max
            style={{ color: Colors.primary[700], position: 'absolute', marginTop: 4 }}
          >
            Cooture
          </Text.Max>
          <Text.Max style={{ color: Colors.primary[500], position: 'relative' }}>
            Cooture
          </Text.Max>
        </View>
      </SafeAreaView>
      <SafeAreaView
        edges={{ top: 'off', bottom: 'android' }}
        className="relative w-full"
        style={{
          maxWidth: 456,
          padding: 8,
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          flex: 1,
        }}
      >
        <Text.H1
          style={{
            marginInline: 'auto',
            textBalance: true,
            textAlign: 'center',
            color: Colors.foreground,
            marginBottom: 24,
            maxWidth: 280
          }}
        >
          A new version of you, everyday
        </Text.H1>
        <Text.H4
          style={{
            textBalance: true,
            textAlign: 'center',
            color: Colors.neutral[400],
            maxWidth: 280,
            marginInline: 'auto',
            marginBottom: 40,
          }}
        >
          Try infinite looks and see what feels like you.
        </Text.H4>
        <LoginButtons />
        <View style={{ marginHorizontal: 24, marginTop: 20 }}>
          <Text.Sm style={{ textAlign: 'center', color: Colors.neutral[400] }}>
            By continuing, you fully agree to our Terms of Use and Privacy Policy.
            We have zero tolerance for objectionable content, any kind of abuse, or harassment.
          </Text.Sm>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 12 }}>
            <Pressable onPress={() => WebBrowser.openBrowserAsync(WEBSITE.TERMS_OF_USE)}>
              <Text.Sm color={Colors.neutral[400]} style={{ textDecorationLine: 'underline' }}>
                Terms of use
              </Text.Sm>
            </Pressable>
            <Pressable onPress={() => WebBrowser.openBrowserAsync(WEBSITE.PRIVACY_POLICY)}>
              <Text.Sm color={Colors.neutral[400]} style={{ textDecorationLine: 'underline' }}>
                Privacy Policy
              </Text.Sm>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
