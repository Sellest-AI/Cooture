import { Button } from '@ui/button';
import { Plus } from '@ui/icons';
import { Image } from '@ui/image';
import { LinearGradient } from '@ui/linear-gradient';
import { MotiView } from '@ui/motion';
import { useSafeAreaInsets } from '@ui/safe-area-view';
import { Text } from '@ui/text';
import { View } from 'react-native';
import { ROUTES } from 'routes';
import { Colors } from 'theme';

export default function Screen() {
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        marginTop: 172 + top,
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
          See yourself in it
        </Text.H3>
        <Text.Lg
          style={{
            textBalance: true,
            textAlign: 'center',
            color: Colors.neutral[400],
            maxWidth: 320,
            marginInline: 'auto',
          }}
        >
          Pick any outfit. Pick any world. See it on you before you wear it.
        </Text.Lg>
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            flex: 1,
            marginHorizontal: 40,
            paddingBottom: 48,
            paddingTop: 32,
            justifyContent: 'center',
            width: 320,
          }}
        >
          <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            aspectRatio: 5 / 7,
            marginHorizontal: 'auto',
          }}>
            <View style={{ width: '100%', height: '100%', borderRadius: 28, overflow: 'hidden' }}>
              <Image
                source={require('assets/placeholders/onboarding/photoshoot.webp')}
                contentFit="cover"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                }}
              />
              <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'transparent']}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  height: 156
                }}
              />
            </View>
            <View style={{
              position: 'absolute',
              top: -16,
              left: '50%',
              transform: [{ translateX: -96 }],
              alignItems: 'center',
              justifyContent: 'center',
              width: 192,
            }}>
              <Image
                source={require('assets/placeholders/onboarding/preset.jpg')}
                contentFit="cover"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 99
                }}
              />
              <Text.Base
                color={Colors.neutral[400]}
                style={{
                  textBalance: true,
                  marginTop: 8
                }}
              >
                Style
              </Text.Base>
              <Text.Lg
                color={Colors.neutral[50]}
                style={{
                  textBalance: true,
                }}
              >
                Old Money
              </Text.Lg>
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: -24,
                left: '50%',
                transform: [{ translateX: -96 }],
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                width: 192,
                gap: 12
              }}>
              <Image
                source={require('assets/placeholders/onboarding/selfie.webp')}
                contentFit="cover"
                style={{
                  width: 76,
                  height: 104,
                  borderRadius: 8
                }}
              />
              <Image
                source={require('assets/placeholders/onboarding/outfit.webp')}
                contentFit="cover"
                style={{
                  width: 76,
                  height: 104,
                  borderRadius: 8
                }}
              />
              <View style={{
                padding: 10,
                backgroundColor: Colors.primary[200],
                borderBottomWidth: 2,
                borderColor: Colors.primary[500],
                borderRadius: 99,
                position: 'absolute',
              }}>
                <Plus color={Colors.primary[900]} size={24} />
              </View>
            </View>
          </View>
        </MotiView>
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
