import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { ImageGeneration } from '@ui/cards';
import { HeartIcon } from '@ui/icons';
import { useSafeAreaInsets } from '@ui/safe-area-view';
import { Carousel } from '@ui/screen-carousel';
import { Text } from '@ui/text';
import { View } from 'react-native';
import { ROUTES } from 'routes';
import { Colors } from 'theme';

const BottomComponent = ({ likes, cta }: { likes: number; cta: string }) => {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}>
        <HeartIcon size={20} color={Colors.secondary[500]} weight='fill' />
        <Text.Base
          color={Colors.neutral[50]}
          weight={600}
        >
          {likes > 1000 ? `+${(likes / 1000).toFixed(1)}K` : likes}
        </Text.Base>
      </View>
      <View style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: Colors.blur.dark, borderRadius: 99 }}>
        <Text.Base color={Colors.neutral[50]}>{cta}</Text.Base>
      </View>
    </View>
  )
}

const CarouselComponent = () => {
  return (
    <View style={{
      width: '100%',
      flex: 1,
    }}
    >
      <Carousel
        scaleAnimation={true}
        itemHeight={460}
        items={[1, 2, 3].map((_, i) => {
          if (i === 0)
            return (
              <View key={i}>
                <ImageGeneration
                  style={{ flex: 0, marginBottom: 16 }}
                  source={require('assets/placeholders/onboarding/posts/outfit/outfit.webp')}
                  disabled
                />
                <Badge
                  source={require('assets/placeholders/onboarding/posts/outfit/avatar.webp')}
                  contentFit="cover"
                  style={{ width: 48, height: 48, position: 'absolute', top: 16, left: 16 }}
                />
                <View style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  flexDirection: 'row',
                }}>
                  <Badge
                    source={require('assets/placeholders/onboarding/posts/outfit/pants.webp')}
                    contentFit="contain"
                    style={{ width: 48, height: 48 }}
                  />
                  <Badge
                    source={require('assets/placeholders/onboarding/posts/outfit/blazer.webp')}
                    contentFit="contain"
                    style={{ marginLeft: -20, width: 48, height: 48 }}
                  />
                </View>
                <BottomComponent
                  likes={1300}
                  cta="Try on"
                />
              </View>
            )

          if (i === 1)
            return (
              <View key={i}>
                <ImageGeneration
                  style={{ flex: 0, marginBottom: 16 }}
                  source={require('assets/placeholders/onboarding/posts/duo/photoshoot.webp')}
                  disabled
                />
                <View style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  flexDirection: 'row',
                }}>
                  <Badge
                    source={require('assets/placeholders/onboarding/posts/duo/avatar2.webp')}
                    contentFit="cover"
                    style={{ width: 48, height: 48 }}
                  />
                  <Badge
                    source={require('assets/placeholders/onboarding/posts/duo/avatar1.webp')}
                    contentFit="cover"
                    style={{ marginLeft: -20, width: 48, height: 48 }}
                  />
                </View>
                <BottomComponent
                  likes={2100}
                  cta="Recreate"
                />
              </View>
            )

          if (i === 2)
            return (
              <View key={i}>
                <ImageGeneration
                  style={{ flex: 0, marginBottom: 16 }}
                  source={require('assets/placeholders/onboarding/posts/neon-coffee/photoshootXavatar.webp')}
                  disabled
                />
                <Badge
                  source={require('assets/placeholders/onboarding/posts/neon-coffee/photoshootXavatar.webp')}
                  contentFit="cover"
                  style={{ width: 48, height: 48, position: 'absolute', top: 16, left: 16 }}
                />
                <View style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  flexDirection: 'row',
                }}>
                  <Badge
                    source={require('assets/placeholders/onboarding/posts/neon-coffee/jacket.webp')}
                    contentFit="contain"
                    style={{ width: 48, height: 48 }}
                  />
                  <Badge
                    source={require('assets/placeholders/onboarding/posts/neon-coffee/pants.webp')}
                    contentFit="contain"
                    style={{ marginLeft: -20, width: 48, height: 48 }}
                  />
                </View>
                <BottomComponent
                  likes={813}
                  cta="Recreate"
                />
              </View>
            )
        })}
      />
    </View>
  )
}

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
        overflow: 'hidden'
      }}
    >
      <View
        style={{
          maxWidth: 456,
          paddingHorizontal: 8,
        }}
      >
        <Text.H3
          style={{
            marginInline: 'auto',
            textBalance: true,
            textAlign: 'center',
            color: Colors.foreground,
            marginBottom: 16,
            maxWidth: 224
          }}
        >
          Where are you?
        </Text.H3>
        <Text.Lg
          style={{
            textBalance: true,
            textAlign: 'center',
            color: Colors.neutral[400],
            maxWidth: 320,
            marginInline: 'auto',
            marginBottom: 24,
          }}
        >
          Recreate any look. Make it yours. Post it.
        </Text.Lg>
      </View>
      <View style={{ flex: 1, width: '100%', marginBottom: 24 }}>
        <CarouselComponent />
      </View>
      <View
        style={{ paddingHorizontal: 8, paddingBottom: 8, width: '100%' }}
      >
        <Button
          style={{ alignSelf: 'stretch' }}
          variant="primary"
          href={ROUTES.WELCOME.STEP_3}
        >
          Next
        </Button>
      </View>
    </View>
  );
}
