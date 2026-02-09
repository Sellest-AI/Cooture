import { Button } from '@ui/button';
import { Image } from '@ui/image';
import { Text } from '@ui/text';
import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { ROUTES } from 'routes';
import { Colors } from 'theme';

export default function Screen() {
  const fadeAnim = useRef(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim.current, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View
      style={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        marginTop: 196,
        padding: 8,
      }}
    >
      <View
        style={{ maxWidth: 456, flex: 1 }}
      >
        <Text.H3
          style={{
            marginInline: 'auto',
            textBalance: true,
            textAlign: 'center',
            color: Colors.foreground,
            marginBottom: 16,
            maxWidth: 282
          }}
        >
          Create your dream wardrobe
        </Text.H3>
        <Text.Lg
          style={{
            textBalance: true,
            textAlign: 'center',
            color: Colors.neutral[400],
            maxWidth: 320,
            marginInline: 'auto',
            marginBottom: 28,
          }}
        >
          Snap clothes while shopping or at home, and build your dream outfits.
        </Text.Lg>
        <Animated.View
          style={{
            flex: 1,
            marginHorizontal: 32,
            marginBottom: 40,
            opacity: fadeAnim.current,
          }}
        >
          <Image
            source={require('assets/placeholders/full-outfit.png')}
            contentFit="contain"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: 0.9,
            }}
          />
        </Animated.View>
      </View>
      <Button
        style={{ alignSelf: 'stretch' }}
        variant="primary"
        href={ROUTES.WELCOME.STEP_2}
      >
        Next
      </Button>
    </View>
  );
}
