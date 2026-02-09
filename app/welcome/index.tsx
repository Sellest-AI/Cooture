import { Button } from '@ui/button';
import { Image } from '@ui/image';
import { LinearGradient } from '@ui/linear-gradient';
import { Text } from '@ui/text';
import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { ROUTES } from 'routes';
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
      <Image
        source={require('assets/placeholders/home-model.png')}
        contentFit="cover"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: 0.9,
        }}
      />
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.6)', 'transparent']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '50%'
        }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.8)']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '50%'
        }}
      />
    </Animated.View>
  )
}

export default function Screen() {
  return (
    <View
      style={{
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        flex: 1,
      }}>
      <BackgroundImage />
      <View
        style={{ maxWidth: 456, padding: 8 }}
        className="relative w-full"
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
          The Future of Digital Influencers
        </Text.H1>
        <Text.H4
          style={{
            textBalance: true,
            textAlign: 'center',
            color: Colors.neutral[200],
            maxWidth: 280,
            marginInline: 'auto',
            marginBottom: 40,
          }}
        >
          Create your outfits and turn yourself into a professional model.
        </Text.H4>
        <Button
          variant="primary"
          href={ROUTES.WELCOME.STEP_1}
        >
          Discover the future
        </Button>
      </View>
    </View>
  );
}
