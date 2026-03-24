import { Image } from '@ui/image';
import { SafeAreaView } from "@ui/safe-area-view";
import { Stepper } from "@ui/stepper";
import { Text } from "@ui/text";
import { Stack, usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Platform, View, ViewStyle } from "react-native";
import { Colors } from "theme";

const AnimatedScaleView = ({ children, show, style }: { children: React.ReactNode; show: boolean, style: ViewStyle }) => {
  const opacity = useRef(new Animated.Value(0));
  const scale = useRef(new Animated.Value(0.8));

  useEffect(() => {
    if (show) {
      Animated.timing(opacity.current, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      Animated.timing(scale.current, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    } else {
      Animated.timing(opacity.current, { toValue: 0, duration: 400, useNativeDriver: true }).start();
      Animated.timing(scale.current, { toValue: 0.8, duration: 400, useNativeDriver: true }).start();
    }
  }, [show, opacity, scale]);

  return (
    <Animated.View
      pointerEvents={show ? 'auto' : 'none'}
      style={[
        style,
        {
          opacity: opacity.current,
          transform: [{ scale: scale.current }]
        }
      ]}
    >
      {children}
    </Animated.View>
  )
}


export default function WelcomeLayout() {
  const pathname = usePathname();
  const currentStep =
    pathname.includes('step-3') ? 3 :
      pathname.includes('step-2') ? 2 :
        pathname.includes('step-1') ? 1 : 0;

  return (
    <SafeAreaView
      edges={{ top: 'off', bottom: 'android' }}
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        paddingBottom: Platform.OS === 'ios' ? 12 : 0,
      }}
    >
      <Image
        source={require('assets/backgrounds/dark-gradient.png')}
        contentFit="cover"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: 0.1,
        }}
      />

      {/* Pages animate underneath */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.background,
            width: '100%',
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="step-1" />
        <Stack.Screen name="step-2" />
        <Stack.Screen name="step-3" />
      </Stack>

      {/* Static header that stays in place */}
      <SafeAreaView
        edges={{ bottom: 'off' }}
        className="absolute overflow-visible"
        style={{
          zIndex: 10,
          alignItems: 'center',
          left: 0,
          right: 0,
          top: 24
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
        <AnimatedScaleView
          show={currentStep > 0 && currentStep < 3}
          style={{
            width: '100%',
            maxWidth: 280,
            marginInline: 'auto',
            marginTop: 24,
          }}
        >
          <View />
          <Stepper value={currentStep} />
        </AnimatedScaleView>
      </SafeAreaView>
    </SafeAreaView>
  )
}